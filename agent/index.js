/**
 * ==============================================================================
 * ICON-SYNC-AGENT 🔄
 * Agente Local de Sincronización ICG FrontRest ➔ ICONWEBCONECT-CENTRAL (Supabase)
 * ==============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

// 1. CONFIGURACIÓN DESDE .ENV
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const EMPRESA_ID = process.env.EMPRESA_ID || 'goyurt';
const SUCURSAL_ID = process.env.SUCURSAL_ID || 'goyurt-suc-01';
const CAJA_ID = process.env.CAJA_ID || 'caja-goyurt-01-01';

const SYNC_INTERVAL_MS = (parseInt(process.env.SYNC_INTERVAL_SECONDS || '30', 10)) * 1000;
const HEARTBEAT_INTERVAL_MS = (parseInt(process.env.HEARTBEAT_INTERVAL_SECONDS || '60', 10)) * 1000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ [FATAL] SUPABASE_URL y SUPABASE_KEY son requeridos en el archivo .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sqlConfig = {
    server: process.env.ICG_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.ICG_DATABASE || 'FRONTREST',
    user: process.env.ICG_USER || 'sa',
    password: process.env.ICG_PASSWORD || '',
    port: parseInt(process.env.ICG_PORT || '1433', 10),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    connectionTimeout: 10000,
    requestTimeout: 30000
};

const STATE_FILE = path.join(__dirname, 'sync_state.json');

// Obtener IP local
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

// Cargar o inicializar estado de sincronización
async function getWatermark() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = fs.readFileSync(STATE_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (_) {}

    // Si no hay archivo local, consultar a Supabase por el último ticket guardado
    try {
        const { data, error } = await supabase
            .from('ventas_cabecera')
            .select('numero, fecha')
            .eq('empresa_id', EMPRESA_ID)
            .eq('sucursal_id', SUCURSAL_ID)
            .order('numero', { ascending: false })
            .limit(1);

        if (!error && data && data.length > 0) {
            const watermark = { lastNumero: data[0].numero, lastFecha: data[0].fecha };
            saveWatermark(watermark);
            return watermark;
        }
    } catch (_) {}

    const initial = { lastNumero: 0, lastFecha: '2020-01-01' };
    saveWatermark(initial);
    return initial;
}

function saveWatermark(watermark) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(watermark, null, 2), 'utf8');
    } catch (err) {
        console.error('⚠️ Error al guardar estado local:', err.message);
    }
}

// Detección de columnas de ICG para compatibilidad universal
let cachedColumns = null;
async function detectIcgColumns(pool) {
    if (cachedColumns) return cachedColumns;
    try {
        const res = await pool.request().query(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('TIQUETSCAB', 'TIQUETSLIN', 'TIQUETSPAG')
        `);
        const map = { TIQUETSCAB: new Set(), TIQUETSLIN: new Set(), TIQUETSPAG: new Set() };
        for (const row of res.recordset) {
            if (map[row.TABLE_NAME]) map[row.TABLE_NAME].add(row.COLUMN_NAME.toUpperCase());
        }
        cachedColumns = map;
        return map;
    } catch (err) {
        console.warn('⚠️ No se pudieron inspeccionar columnas de ICG, usando defaults:', err.message);
        return {
            TIQUETSCAB: new Set(['TOTAL', 'TOTALNETO', 'TOTALIVA', 'NUMCIERRE', 'CODCLIENTE']),
            TIQUETSLIN: new Set(['NUMLINEA', 'PRECIO', 'PRECIOIVA', 'TOTAL', 'CODARTICULO', 'DESCRIPCION', 'UNIDADES', 'TIPOIVA']),
            TIQUETSPAG: new Set(['LINEA', 'CODFORMAPAGO', 'IMPORTE', 'PROPINA'])
        };
    }
}

// 2. CICLO DE SINCRONIZACIÓN DE VENTAS
async function syncTickets(pool) {
    const watermark = await getWatermark();
    const cols = await detectIcgColumns(pool);

    const hasTotalNeto = cols.TIQUETSCAB.has('TOTALNETO');
    const hasTotalIva = cols.TIQUETSCAB.has('TOTALIVA');
    const selectNeto = hasTotalNeto ? 'ISNULL(C.TOTALNETO, 0) AS TOTALNETO' : 'ISNULL(C.TOTAL, 0) AS TOTALNETO';
    const selectIva = hasTotalIva ? 'ISNULL(C.TOTALIVA, 0) AS TOTALIVA' : '0 AS TOTALIVA';

    // Leer nuevos tickets
    const queryCab = `
        SELECT TOP 100
            C.NUMSERIE,
            C.NUMERO,
            C.FECHA,
            C.HORA,
            C.TOTAL,
            ${selectNeto},
            ${selectIva},
            ISNULL(C.CODCLIENTE, '') AS CODCLIENTE,
            ISNULL(C.NUMCIERRE, 0) AS NUMCIERRE
        FROM TIQUETSCAB C WITH (NOLOCK)
        WHERE C.NUMERO > @lastNumero
        ORDER BY C.NUMERO ASC
    `;

    const request = pool.request();
    request.input('lastNumero', sql.BigInt, watermark.lastNumero);
    const cabResult = await request.query(queryCab);

    if (!cabResult.recordset || cabResult.recordset.length === 0) {
        return 0; // Al día, sin tickets nuevos
    }

    const tickets = cabResult.recordset;
    console.log(`📦 Encontrados ${tickets.length} tickets nuevos en ICG para sincronizar...`);

    for (const t of tickets) {
        const serie = (t.NUMSERIE || '').trim();
        const numero = t.NUMERO;

        // Construir fecha ISO
        let fechaHoraStr = new Date().toISOString();
        let fechaStr = new Date().toISOString().split('T')[0];
        let horaInt = new Date().getHours();

        try {
            if (t.FECHA) {
                const f = new Date(t.FECHA);
                fechaStr = f.toISOString().split('T')[0];
                horaInt = t.HORA ? parseInt(t.HORA.toString().substring(0, 2), 10) || f.getHours() : f.getHours();
                fechaHoraStr = `${fechaStr}T${String(horaInt).padStart(2, '0')}:00:00.000Z`;
            }
        } catch (_) {}

        // 1. Upsert Cabecera en Supabase
        const cabData = {
            empresa_id: EMPRESA_ID,
            sucursal_id: SUCURSAL_ID,
            caja_id: CAJA_ID,
            serie: serie,
            numero: numero,
            fecha_hora: fechaHoraStr,
            fecha: fechaStr,
            hora: horaInt,
            total_neto: parseFloat(t.TOTALNETO) || 0,
            total_iva: parseFloat(t.TOTALIVA) || 0,
            total: parseFloat(t.TOTAL) || 0,
            codcliente: t.CODCLIENTE ? String(t.CODCLIENTE).trim() : null,
            numcierre: parseInt(t.NUMCIERRE, 10) || null,
            origen_icg_id: `${SUCURSAL_ID}-${serie}-${numero}`
        };

        const { data: upsertedCab, error: errCab } = await supabase
            .from('ventas_cabecera')
            .upsert(cabData, { onConflict: 'empresa_id,sucursal_id,serie,numero' })
            .select('id')
            .single();

        if (errCab) {
            console.error(`❌ Error al subir cabecera Ticket ${serie}-${numero}:`, errCab.message);
            break; // Detener para reintentar en el próximo ciclo sin saltear tickets
        }

        const ventaId = upsertedCab.id;

        // 2. Obtener Líneas del Ticket en ICG
        const hasPrecioIva = cols.TIQUETSLIN.has('PRECIOIVA');
        const selectPrecioIva = hasPrecioIva ? 'ISNULL(L.PRECIOIVA, 0) AS PRECIOIVA' : 'ISNULL(L.PRECIO, 0) AS PRECIOIVA';
        const numLineaCol = cols.TIQUETSLIN.has('NUMLINEA') ? 'L.NUMLINEA' : 'L.LINEA';

        const lineasRes = await pool.request()
            .input('serie', sql.NVarChar(20), serie)
            .input('numero', sql.BigInt, numero)
            .query(`
                SELECT 
                    ${numLineaCol} AS NUMLINEA,
                    ISNULL(L.CODARTICULO, '') AS CODARTICULO,
                    ISNULL(L.DESCRIPCION, '') AS DESCRIPCION,
                    ISNULL(L.UNIDADES, 1) AS UNIDADES,
                    ISNULL(L.PRECIO, 0) AS PRECIO,
                    ${selectPrecioIva},
                    ISNULL(L.TOTAL, 0) AS TOTAL,
                    ISNULL(L.TIPOIVA, 0) AS TIPOIVA
                FROM TIQUETSLIN L WITH (NOLOCK)
                WHERE L.NUMSERIE = @serie AND L.NUMERO = @numero
                ORDER BY ${numLineaCol} ASC
            `);

        if (lineasRes.recordset && lineasRes.recordset.length > 0) {
            const lineasData = lineasRes.recordset.map(l => ({
                venta_id: ventaId,
                numlinea: parseInt(l.NUMLINEA, 10) || 1,
                codarticulo: String(l.CODARTICULO).trim(),
                descripcion: String(l.DESCRIPCION).trim(),
                unidades: parseFloat(l.UNIDADES) || 1,
                precio: parseFloat(l.PRECIO) || 0,
                precio_con_iva: parseFloat(l.PRECIOIVA) || 0,
                total_linea: parseFloat(l.TOTAL) || 0,
                tipo_iva: parseFloat(l.TIPOIVA) || 0
            }));

            const { error: errLin } = await supabase
                .from('ventas_detalle')
                .upsert(lineasData, { onConflict: 'venta_id,numlinea' });

            if (errLin) {
                console.warn(`⚠️ Error al sincronizar líneas del ticket ${serie}-${numero}:`, errLin.message);
            }
        }

        // 3. Obtener Pagos del Ticket en ICG
        const numLineaPagoCol = cols.TIQUETSPAG.has('NUMLINEA') ? 'P.NUMLINEA' : 'P.LINEA';
        const hasPropina = cols.TIQUETSPAG.has('PROPINA');
        const selectPropina = hasPropina ? 'ISNULL(P.PROPINA, 0) AS PROPINA' : '0 AS PROPINA';

        const pagosRes = await pool.request()
            .input('serie', sql.NVarChar(20), serie)
            .input('numero', sql.BigInt, numero)
            .query(`
                SELECT 
                    ISNULL(${numLineaPagoCol}, 1) AS NUMLINEA,
                    ISNULL(P.CODFORMAPAGO, '1') AS CODFORMAPAGO,
                    ISNULL(P.IMPORTE, 0) AS IMPORTE,
                    ${selectPropina}
                FROM TIQUETSPAG P WITH (NOLOCK)
                WHERE P.NUMSERIE = @serie AND P.NUMERO = @numero
            `);

        if (pagosRes.recordset && pagosRes.recordset.length > 0) {
            const pagosData = pagosRes.recordset.map((p, idx) => ({
                venta_id: ventaId,
                numlinea: parseInt(p.NUMLINEA, 10) || (idx + 1),
                codformapago: String(p.CODFORMAPAGO).trim(),
                descripcion_pago: String(p.CODFORMAPAGO).trim() === '1' ? 'EFECTIVO' : 'TARJETA / OTRO',
                importe: parseFloat(p.IMPORTE) || 0,
                propina: parseFloat(p.PROPINA) || 0
            }));

            const { error: errPag } = await supabase
                .from('ventas_pagos')
                .upsert(pagosData, { onConflict: 'venta_id,numlinea' });

            if (errPag) {
                console.warn(`⚠️ Error al sincronizar pagos del ticket ${serie}-${numero}:`, errPag.message);
            }
        }

        // Actualizar marca de agua en memoria y disco
        watermark.lastNumero = numero;
        watermark.lastFecha = fechaStr;
        saveWatermark(watermark);
    }

    console.log(`✅ Sincronizados ${tickets.length} tickets. Último número procesado: ${watermark.lastNumero}`);
    return tickets.length;
}

// 3. LATIDO / HEARTBEAT DE CONEXIÓN
async function sendHeartbeat() {
    try {
        const ipLocal = getLocalIp();
        const payload = {
            empresa_id: EMPRESA_ID,
            sucursal_id: SUCURSAL_ID,
            caja_id: CAJA_ID,
            ip_local: ipLocal,
            version_agente: '1.0.0',
            ultimo_ping: new Date().toISOString(),
            estado: 'ONLINE',
            detalles: {
                hostname: os.hostname(),
                platform: os.platform(),
                uptime_horas: (os.uptime() / 3600).toFixed(1)
            }
        };

        const { error } = await supabase
            .from('sucursales_heartbeat')
            .upsert(payload, { onConflict: 'empresa_id,sucursal_id,caja_id' });

        if (error) {
            console.warn('⚠️ Error enviando Heartbeat a Supabase:', error.message);
        } else {
            console.log(`💓 Heartbeat enviado exitosamente [${new Date().toLocaleTimeString()}]`);
        }
    } catch (err) {
        console.warn('⚠️ Excepción en Heartbeat:', err.message);
    }
}

// 4. BUCLE PRINCIPAL
async function main() {
    console.log('========================================================');
    console.log('🚀 INICIANDO ICON-SYNC-AGENT (ICG ➔ SUPABASE)');
    console.log(`🏢 Empresa:  ${EMPRESA_ID}`);
    console.log(`🏬 Sucursal: ${SUCURSAL_ID}`);
    console.log(`🖥️ Caja:     ${CAJA_ID}`);
    console.log(`⏱️ Intervalo: ${SYNC_INTERVAL_MS / 1000}s`);
    console.log('========================================================\n');

    let pool = null;

    // Conectar a SQL Server local
    async function ensureSqlPool() {
        if (pool && pool.connected) return pool;
        try {
            console.log('🔌 Conectando a ICG FrontRest (SQL Server)...');
            pool = await sql.connect(sqlConfig);
            console.log('✅ Conectado a ICG FrontRest.');
            return pool;
        } catch (err) {
            console.error('❌ Error conectando a SQL Server local:', err.message);
            pool = null;
            return null;
        }
    }

    // Primer heartbeat inmediato
    await sendHeartbeat();
    setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Ciclo recurrente de sincronización
    async function runSyncCycle() {
        try {
            const p = await ensureSqlPool();
            if (p) {
                await syncTickets(p);
            }
        } catch (err) {
            console.error('⚠️ Error en ciclo de sincronización:', err.message);
        }
    }

    // Ejecutar de inmediato y luego a intervalos
    await runSyncCycle();
    setInterval(runSyncCycle, SYNC_INTERVAL_MS);
}

main().catch(err => {
    console.error('❌ Error fatal en ICON-SYNC-AGENT:', err);
});
