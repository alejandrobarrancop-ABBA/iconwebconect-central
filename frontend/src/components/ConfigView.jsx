import React, { useState } from 'react';
import { Server, Database, Cloud, Shield, CheckCircle2, Copy, Terminal, ExternalLink, HelpCircle } from 'lucide-react';

export default function ConfigView({ branches = [], heartbeats = {} }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const envSucursal1 = `# CONFIGURACIÓN DEL AGENTE PARA SUCURSAL 1
EMPRESA_ID=goyurt
SUCURSAL_ID=goyurt-suc-01
CAJA_ID=caja-goyurt-01-01

# Conexión local a ICG FrontRest
ICG_SERVER=localhost\\SQLEXPRESS
ICG_DATABASE=FRONTREST
ICG_USER=sa
ICG_PASSWORD=masterkey
ICG_PORT=1433

# Nube Supabase
SUPABASE_URL=https://edsdmewyiahhrkyngunp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM
SYNC_INTERVAL_SECONDS=30`;

  const envSucursal2 = `# CONFIGURACIÓN DEL AGENTE PARA SUCURSAL 2
EMPRESA_ID=goyurt
SUCURSAL_ID=goyurt-suc-02
CAJA_ID=caja-goyurt-02-01

# Conexión local a ICG FrontRest
ICG_SERVER=localhost\\SQLEXPRESS
ICG_DATABASE=FRONTREST
ICG_USER=sa
ICG_PASSWORD=masterkey
ICG_PORT=1433

# Nube Supabase
SUPABASE_URL=https://edsdmewyiahhrkyngunp.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM
SYNC_INTERVAL_SECONDS=30`;

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Diagrama de Arquitectura y Estado de Conexión */}
      <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          Arquitectura de Conexión Centralizada (ICG ➔ Nube ➔ Vercel)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Los puntos de venta locales empujan sus ventas vía HTTPS Outbound. No se requiere abrir puertos en los routers ni IP fija.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Sucursales Locales */}
          <div className="bg-[#060d1f] border border-[#1a2d6b] p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <Server className="w-4 h-4" />
              <span>Puntos de Venta (Locales)</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              1. <strong>GOYURT Sucursal 1</strong> (SQL Server Local)
            </p>
            <p className="text-xs text-slate-300 font-medium">
              2. <strong>GOYURT Sucursal 2</strong> (SQL Server Local)
            </p>
            <div className="text-[11px] text-slate-400 bg-blue-950/40 p-2 rounded-lg border border-blue-900/40">
              Ejecutan el servicio ligero <code>icon-sync-agent</code> leyendo tickets con <code>NOLOCK</code>.
            </div>
          </div>

          {/* Flecha Central / Supabase */}
          <div className="bg-[#060d1f] border border-blue-600/40 p-4 rounded-xl space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-xs uppercase">
              <Database className="w-4 h-4" />
              <span>Supabase Cloud (PostgreSQL)</span>
            </div>
            <p className="text-xs text-slate-300">
              Base de Datos Centralizada con esquema unificado de ventas, auditoría y heartbeat en vivo.
            </p>
            <div className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              SSL Cifrado 256-bit
            </div>
          </div>

          {/* Vercel Web Dashboard */}
          <div className="bg-[#060d1f] border border-[#1a2d6b] p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <ExternalLink className="w-4 h-4" />
              <span>Vercel (Dashboard Web)</span>
            </div>
            <p className="text-xs text-slate-300">
              Aplicación analítica multi-sucursal tipo Power BI con actualización en tiempo real para gerencia.
            </p>
            <div className="text-[11px] text-slate-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40">
              Acceso desde cualquier navegador o teléfono sin VPN.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Puntos de Venta Registrados y Configuración .env */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sucursal 1 */}
        <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SUCURSAL 01
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: goyurt-suc-01</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">GOYURT - Sucursal 1 (Local A)</h4>
            <p className="text-xs text-slate-400 mb-4">Caja Principal 1 (Serie T1) • Centro Comercial 1</p>

            <div className="bg-[#060d1f] border border-[#1a2d6b] rounded-xl p-3 font-mono text-[11px] text-slate-300 relative overflow-x-auto max-h-48">
              <pre>{envSucursal1}</pre>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(envSucursal1, 1)}
            className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            {copiedIndex === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedIndex === 1 ? '¡Configuración Copiada!' : 'Copiar archivo .env para Sucursal 1'}</span>
          </button>
        </div>

        {/* Sucursal 2 */}
        <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUCURSAL 02
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: goyurt-suc-02</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">GOYURT - Sucursal 2 (Local B)</h4>
            <p className="text-xs text-slate-400 mb-4">Caja Principal 1 (Serie T1) • Centro Comercial 2</p>

            <div className="bg-[#060d1f] border border-[#1a2d6b] rounded-xl p-3 font-mono text-[11px] text-slate-300 relative overflow-x-auto max-h-48">
              <pre>{envSucursal2}</pre>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(envSucursal2, 2)}
            className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            {copiedIndex === 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedIndex === 2 ? '¡Configuración Copiada!' : 'Copiar archivo .env para Sucursal 2'}</span>
          </button>
        </div>
      </div>

      {/* 3. Guía Paso a Paso de Instalación del Conector Local */}
      <div className="bg-[#0b1530] border border-[#1a2d6b] rounded-2xl p-6 shadow-xl">
        <h4 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <Terminal className="w-5 h-5 text-amber-400" />
          ¿Cómo se instala y conecta el Agente en cada Terminal / Caja?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="bg-[#060d1f] p-4 rounded-xl border border-[#1a2d6b]">
            <div className="text-amber-400 font-bold mb-1">Paso 1: Copiar Carpeta</div>
            <p>Copia la carpeta <code>agent/</code> en el equipo de la caja (ej: <code>C:\ICON-SYNC-AGENT</code>).</p>
          </div>
          <div className="bg-[#060d1f] p-4 rounded-xl border border-[#1a2d6b]">
            <div className="text-amber-400 font-bold mb-1">Paso 2: Crear .env</div>
            <p>Copia el bloque de configuración correspondiente arriba y guárdalo como <code>.env</code>.</p>
          </div>
          <div className="bg-[#060d1f] p-4 rounded-xl border border-[#1a2d6b]">
            <div className="text-amber-400 font-bold mb-1">Paso 3: Probar Conexión</div>
            <p>Ejecuta <code>node test-connection.js</code> para validar SQL Server local y Supabase.</p>
          </div>
          <div className="bg-[#060d1f] p-4 rounded-xl border border-[#1a2d6b]">
            <div className="text-amber-400 font-bold mb-1">Paso 4: Iniciar Servicio</div>
            <p>Ejecuta <code>Iniciar_Agente.bat</code> o instálalo como servicio de arranque en Windows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
