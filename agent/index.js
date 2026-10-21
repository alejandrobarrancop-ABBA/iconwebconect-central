/**
 * ==============================================================================
 * ICON-SYNC-AGENT 🔄
 * Agente Local de Sincronización ICG FrontRest ➔ ICONWEBCONECT-CENTRAL (Supabase)
 * Compatible con TODAS las versiones de ICG FrontRest (2015-Actual)
 * ==============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

let sql;
try {
    sql = require('mssql');
} catch (_) {
    try {
        sql = require('c:/GRUPOVEV/Proyectos/ICG SUPPORT/ICONWEBCONECT/backend/node_modules/mssql');
    } catch (e) {
        console.error('No se pudo cargar el módulo mssql:', e.message);
        process.exit(1);
    }
}

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
    server: process.env.ICG_SERVER || 'PC-GRUPOVEV',
    database: process.env.ICG_DATABASE || 'MEZEGREEK2018',
    user: process.env.ICG_USER || 'sa',
    password: process.env.ICG_PASSWORD || 'masterkey',
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

    // Consultar a Supabase por el último ticket guardado
    try {
        const { data, error } = await supabase
            .from('ventas_cabecera')
            .select('numero, fecha')
            .eq('empresa_id', EMPRESA_ID)
            .eq('sucursal_id', SUCURSAL_ID)
            .order('numero', { ascending: false })
            .limit(1);

        if (!error && data && data.length > 0) {
            const watermark = { lastNumero: Number(data[0].numero), lastFecha: data[0].fecha };
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

// Detección de columnas de ICG para compatibilidad con todas las versiones
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
        console.warn('⚠️ No se pudieron inspeccionar columnas de ICG:', err.message);
        return {
            TIQUETSCAB: new Set(['SERIE', 'NUMERO', 'FECHA', 'TOTALBRUTO', 'TOTALNETO', 'Z', 'CODCLIENTE']),
            TIQUETSLIN: new Set(['SERIE', 'NUMERO', 'NUMLINEA', 'PRECIO', 'PRECIOIVA', 'TOTAL', 'CODARTICULO', 'DESCRIPCION', 'UNIDADES']),
            TIQUETSPAG: new Set(['SERIE', 'NUMERO', 'NUMLINEA', 'CODFORMAPAGO', 'IMPORTE', 'PROPINA'])
        };
    }
}

// 2. CICLO DE SINCRONIZACIÓN DE VENTAS
async function syncTickets(pool) {
    const watermark = await getWatermark();
    const cols = await detectIcgColumns(pool);

    const colsCab = cols.TIQUETSCAB;
    const colSerie = colsCab.has('SERIE') ? 'C.SERIE' : 'C.NUMSERIE';
    const colTotal = colsCab.has('TOTALBRUTO') ? 'ISNULL(C.TOTALBRUTO, C.TOTALNETO)' : (colsCab.has('TOTAL') ? 'ISNULL(C.TOTAL, 0)' : 'ISNULL(C.TOTALNETO, 0)');
    const colNeto = colsCab.has('TOTALNETO') ? 'ISNULL(C.TOTALNETO, 0)' : colTotal;
    const colHora = colsCab.has('HORAFIN') ? 'C.HORAFIN' : (colsCab.has('HORAINI') ? 'C.HORAINI' : (colsCab.has('HORA') ? 'C.HORA' : 'NULL'));
    const colZ = colsCab.has('Z') ? 'ISNULL(C.Z, 0)' : (colsCab.has('NUMCIERRE') ? 'ISNULL(C.NUMCIERRE, 0)' : '0');
    const colCliente = colsCab.has('CODCLIENTE') ? "ISNULL(C.CODCLIENTE, '')" : "''";

    // Leer nuevos tickets
    const queryCab = `
        SELECT TOP 50
            ${colSerie} AS NUMSERIE,
            C.NUMERO,
            C.FECHA,
            ${colHora} AS HORA,
            ${colTotal} AS TOTAL,
            ${colNeto} AS TOTALNETO,
            (${colTotal} - ${colNeto}) AS TOTALIVA,
            ${colCliente} AS CODCLIENTE,
            ${colZ} AS NUMCIERRE
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
    console.log(`📦 Encontrados ${tickets.length} tickets en ICG para sincronizar...`);

    for (const t of tickets) {
        const serie = (t.NUMSERIE || '').trim();
        const numero = t.NUMERO;

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
            break;
        }

        const ventaId = upsertedCab.id;

        // 2. Obtener Líneas del Ticket en ICG
        const colsLin = cols.TIQUETSLIN;
        const colSerieLin = colsLin.has('SERIE') ? 'L.SERIE' : 'L.NUMSERIE';
        const colNumLinea = colsLin.has('NUMLINEA') ? 'L.NUMLINEA' : 'L.LINEA';
        const colPrecioIva = colsLin.has('PRECIOIVA') ? 'ISNULL(L.PRECIOIVA, 0)' : 'ISNULL(L.PRECIO, 0)';

        const lineasRes = await pool.request()
            .input('serie', sql.NVarChar(20), serie)
            .input('numero', sql.BigInt, numero)
            .query(`
                SELECT 
                    ${colNumLinea} AS NUMLINEA,
                    ISNULL(L.CODARTICULO, '') AS CODARTICULO,
                    ISNULL(L.DESCRIPCION, '') AS DESCRIPCION,
                    ISNULL(L.UNIDADES, 1) AS UNIDADES,
                    ISNULL(L.PRECIO, 0) AS PRECIO,
                    ${colPrecioIva} AS PRECIOIVA,
                    ISNULL(L.TOTAL, 0) AS TOTAL,
                    ISNULL(L.TIPOIVA, 0) AS TIPOIVA
                FROM TIQUETSLIN L WITH (NOLOCK)
                WHERE ${colSerieLin} = @serie AND L.NUMERO = @numero
                ORDER BY ${colNumLinea} ASC
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

            await supabase
                .from('ventas_detalle')
                .upsert(lineasData, { onConflict: 'venta_id,numlinea' });
        }

        // 3. Obtener Pagos del Ticket en ICG
        const colsPag = cols.TIQUETSPAG;
        const colSeriePag = colsPag.has('SERIE') ? 'P.SERIE' : 'P.NUMSERIE';
        const colNumLineaPago = colsPag.has('NUMLINEA') ? 'P.NUMLINEA' : (colsPag.has('LINEA') ? 'P.LINEA' : '1');
        const colPropina = colsPag.has('PROPINA') ? 'ISNULL(P.PROPINA, 0)' : '0';

        const pagosRes = await pool.request()
            .input('serie', sql.NVarChar(20), serie)
            .input('numero', sql.BigInt, numero)
            .query(`
                SELECT 
                    ISNULL(${colNumLineaPago}, 1) AS NUMLINEA,
                    ISNULL(P.CODFORMAPAGO, '1') AS CODFORMAPAGO,
                    ISNULL(P.IMPORTE, 0) AS IMPORTE,
                    ${colPropina} AS PROPINA
                FROM TIQUETSPAG P WITH (NOLOCK)
                WHERE ${colSeriePag} = @serie AND P.NUMERO = @numero
            `);

        if (pagosRes.recordset && pagosRes.recordset.length > 0) {
            const pagosData = pagosRes.recordset.map((p, idx) => ({
                venta_id: ventaId,
                numlinea: parseInt(p.NUMLINEA, 10) || (idx + 1),
                codformapago: String(p.CODFORMAPAGO).trim(),
                descripcion_pago: String(p.CODFORMAPAGO).trim() === '1' ? 'EFECTIVO' : 'TARJETA / DIGITAL',
                importe: parseFloat(p.IMPORTE) || 0,
                propina: parseFloat(p.PROPINA) || 0
            }));

            await supabase
                .from('ventas_pagos')
                .upsert(pagosData, { onConflict: 'venta_id,numlinea' });
        }

        // Actualizar marca de agua en memoria y disco
        watermark.lastNumero = numero;
        watermark.lastFecha = fechaStr;
        saveWatermark(watermark);
    }

    console.log(`✅ Sincronizados ${tickets.length} tickets. Último ticket procesado: ${watermark.lastNumero}`);
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
            console.log(`💓 Heartbeat enviado [${new Date().toLocaleTimeString()}] ➔ Sucursal: ${SUCURSAL_ID}`);
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

    async function ensureSqlPool() {
        if (pool && pool.connected) return pool;
        try {
            console.log(`🔌 Conectando a SQL Server ICG (${sqlConfig.server} / ${sqlConfig.database})...`);
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

    await runSyncCycle();
    setInterval(runSyncCycle, SYNC_INTERVAL_MS);
}

main().catch(err => {
    console.error('❌ Error fatal en ICON-SYNC-AGENT:', err);
});
