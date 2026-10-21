require('dotenv').config();
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

async function testConnections() {
    console.log('========================================================');
    console.log('🧪 DIAGNÓSTICO DE CONEXIONES - ICON-SYNC-AGENT');
    console.log(`🏢 Empresa:  ${process.env.EMPRESA_ID || 'goyurt'}`);
    console.log(`🏬 Sucursal: ${process.env.SUCURSAL_ID || 'goyurt-suc-01'}`);
    console.log(`🖥️ Caja:     ${process.env.CAJA_ID || 'caja-goyurt-01-01'}`);
    console.log('========================================================\n');

    // 1. Probar Supabase
    console.log('☁️ 1. Verificando conexión a Supabase...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Falta SUPABASE_URL o SUPABASE_KEY en .env');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        const { data, error } = await supabase.from('sucursales').select('id, nombre, codigo');
        if (error) {
            console.error('❌ Error en Supabase:', error.message);
        } else {
            console.log('✅ Conexión a Supabase EXITOSA!');
            console.log('   Sucursales en la nube:', data.map(s => `${s.codigo} - ${s.nombre}`));
        }
    } catch (err) {
        console.error('❌ Excepción al conectar a Supabase:', err.message);
    }

    // 2. Probar SQL Server Local de ICG
    console.log('\n🖥️ 2. Verificando conexión local a ICG FrontRest (SQL Server)...');
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
        connectionTimeout: 10000
    };

    console.log(`   Intentando conectar a ${sqlConfig.server} [BD: ${sqlConfig.database}] con usuario ${sqlConfig.user}...`);

    try {
        const pool = await sql.connect(sqlConfig);
        console.log('✅ Conexión a SQL Server ICG EXITOSA!');
        
        const res = await pool.request().query('SELECT TOP 1 NUMSERIE, NUMERO, TOTAL, FECHA FROM TIQUETSCAB WITH (NOLOCK) ORDER BY FECHA DESC, HORA DESC');
        console.log('   Último ticket en ICG:', res.recordset[0] || 'Sin tickets en la base de datos');
        await pool.close();
    } catch (err) {
        console.error('⚠️ No se pudo conectar a SQL Server local:', err.message);
        console.log('   (Revisa si el servicio de SQL Server Express está iniciado y las credenciales en .env son correctas).');
    }

    console.log('\n========================================================');
    console.log('Diagnóstico finalizado con éxito.');
    console.log('========================================================');
}

testConnections();
