# ICONWEBCONECT-CENTRAL 🌐

> **Plataforma Web Centralizada y Dashboard Gerencial Multi-Sucursal (Tipo Power BI)**  
> Conectada a Supabase y sincronizada en tiempo real con puntos de venta **ICG FrontRest**.

---

## 🎯 Objetivo del Sistema

Consolidar en la nube (Vercel + Supabase) la información de ventas, cobros, artículos, cierres de caja y auditoría de múltiples sucursales y terminales locales (ej: **GOYURT**), permitiendo una visión gerencial ejecutiva con capacidad de análisis por negocio global, por sucursal y por caja.

---

## 🏗️ Arquitectura del Ecosistema

```
[ Sucursal 1 (GOYURT Local A) ]          [ Sucursal 2 (GOYURT Local B) ]
  ICG FrontRest (SQL Server)               ICG FrontRest (SQL Server)
            │                                        │
            ▼                                        ▼
   [ ICON-SYNC-AGENT ]                      [ ICON-SYNC-AGENT ]
  (Servicio Windows Local)                 (Servicio Windows Local)
            │                                        │
            └───────────────┐        ┌───────────────┘
                            ▼        ▼
                      (HTTPS Outbound Push)
                            │        │
                            ▼        ▼
               ☁️ SUPABASE (PostgreSQL Cloud)
               - Ventas Cabecera / Detalle / Pagos
               - Catálogos de Artículos y Sucursales
               - Control de Heartbeat (Online / Offline)
               - Roles y Permisos (Supabase Auth)
                            ▲
                            │ (Consultas Analíticas en Tiempo Real)
                            ▼
               🚀 ICONWEBCONECT-CENTRAL (Vercel)
               - Dashboard Ejecutivo tipo Power BI
               - Comparativo de Sucursales y Cajas
               - Horas Pico, Métodos de Pago y Ranking
               - Reportes Exportables (Excel / PDF)
```

---

## 📁 Estructura del Repositorio

- `frontend/`: Aplicación web moderna (React + Vite + Tailwind + Recharts) lista para despliegue en Vercel.
- `agent/`: Agente ligero de sincronización local para Windows (`icon-sync-agent`).
- `supabase/`: Esquema SQL, funciones, vistas analíticas y políticas RLS para la base de datos central.

---

## 🏢 Escenario Inicial: GOYURT

- **Empresa:** GOYURT
- **Sucursal 1:** Local 1 (1 Caja ICG FrontRest)
- **Sucursal 2:** Local 2 (1 Caja ICG FrontRest)
- **Escalabilidad:** Diseñado para soportar múltiples cajas por sucursal y crecimiento a $N$ sucursales sin cambios de arquitectura.
