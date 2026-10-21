require('dotenv').config();
const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

async function testConnections() {
    console.log('========================================================');
    console.log('🧪 DIAGNÓSTICO DE CONEXIONES - ICON-SYNC-AGENT');
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
        const { data, error } = await supabase.from('empresas').select('id, nombre').limit(1);
        if (error) {
            console.error('❌ Error en Supabase:', error.message);
        } else {
            console.log('✅ Conexión a Supabase EXITOSA!');
            console.log('   Empresas registradas:', data);
        }
    } catch (err) {
        console.error('❌ Excepción al conectar a Supabase:', err.message);
    }

    // 2. Probar SQL Server Local de ICG
    console.log('\n🖥️ 2. Verificando conexión local a ICG FrontRest (SQL Server)...');
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
        connectionTimeout: 10000
    };

    try {
        const pool = await sql.connect(sqlConfig);
        console.log('✅ Conexión a SQL Server ICG EXITOSA!');
        
        const res = await pool.request().query('SELECT TOP 1 NUMSERIE, NUMERO, TOTAL FROM TIQUETSCAB WITH (NOLOCK) ORDER BY FECHA DESC, HORA DESC');
        console.log('   Último ticket en ICG:', res.recordset[0] || 'Sin tickets en la base de datos');
        await pool.close();
    } catch (err) {
        console.error('⚠️ No se pudo conectar a SQL Server local:', err.message);
        console.log('   (Revisa si el servicio de SQL Server Express está iniciado y las credenciales en .env son correctas).');
    }

    console.log('\n========================================================');
    console.log('Diagnóstico finalizado.');
    console.log('========================================================');
}

testConnections();
