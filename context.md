# context.md — StockAR

## Qué es esto

App web de seguimiento de cartera de acciones de EE.UU. y CEDEARs argentinos. Solo tracking, no se opera. Para uso personal y un puñado de amigos. El usuario tipo es un joven argentino que invierte, le interesa seguir sus números, pero no vive pegado a los charts todo el día. Quiere abrir la app, ver cómo va, entender su rendimiento real, y cerrar.

---

## Qué son los CEDEARs

Certificados que cotizan en la bolsa argentina (BYMA) y representan fracciones de acciones extranjeras. Cada CEDEAR tiene un ratio de conversión. Ejemplo: AAPL ratio 10:1 → 10 CEDEARs = 1 acción de Apple. Hay ~324 CEDEARs disponibles. El precio de un CEDEAR en pesos refleja el precio de la acción en dólares ajustado por el ratio y por el tipo de cambio implícito (CCL implícito).

Fórmulas fundamentales:
- Valor de 1 CEDEAR en USD = precio acción US / ratio
- Valor total en USD = cantidad de CEDEARs × (precio US / ratio)
- Valor total en ARS = valor total USD × dólar MEP
- CCL implícito = (precio CEDEAR en ARS × ratio) / precio acción en USD

---

## Stack técnico

- **Framework**: Next.js 14+ con App Router. Server Components por defecto.
- **Styling**: Tailwind CSS v4.
- **UI**: shadcn/ui (Radix primitives). Es el design system. Usar siempre que exista un componente.
- **Icons**: Radix Icons primero, Lucide React como fallback.
- **Animaciones**: Framer Motion. Sutil y con propósito, no animar todo.
- **Charts**: Recharts.
- **Auth**: Better Auth (sucesor oficial de NextAuth/Auth.js desde septiembre 2025). Self-hosted, gratis, type-safe. Login con Google y/o magic link por email.
- **Base de datos**: Supabase (PostgreSQL). Usarlo como DB pura vía Drizzle, NO usar Supabase Auth.
- **ORM**: Drizzle ORM (type-safe, liviano).
- **Data fetching**: TanStack Query (React Query) v5. Cachear agresivamente.
- **Cron y background jobs**: Upstash QStash. Pay as you go ($1/100K requests).
- **Rate limiting**: Upstash Redis si es necesario.
- **Emails transaccionales**: Resend. Free tier 100 emails/día.
- **Deploy**: Vercel hobby plan o Cloudflare Pages.

Regla de costo: todo debe ser gratis o prácticamente gratis. No agregar servicios pagos.

---

## APIs externas

### Cotizaciones US
- **Finnhub** (finnhub.io) — fuente principal. API key gratuita, 60 calls/min. Para: quote actual, company profile, earnings calendar, analyst recommendations.
- **Yahoo Finance** (paquete npm `yahoo-finance2`) — para históricos y fundamentals (P/E, market cap, 52w high/low, EPS, dividend yield, etc.). Sin API key. Usar como complemento de Finnhub.

### Dólar y cotizaciones argentinas
- **DolarAPI.com** — open source, sin API key, sin rate limit fuerte.
  - Endpoint MEP: `GET https://dolarapi.com/v1/dolares/bolsa`
  - Todos los dólares: `GET https://dolarapi.com/v1/dolares`
  - Devuelve: moneda, casa, compra, venta, fechaActualizacion.

### Ratios de CEDEARs
No existe API pública. Mantener un archivo JSON estático con la tabla completa de ratios (~324 tickers). Fuente oficial: PDF de BYMA o Banco Comafi. Los ratios cambian ~1-2 veces por año. El JSON debe tener un campo `lastUpdated` para saber cuándo se actualizó por última vez.

### Proxy de APIs
Todas las llamadas a APIs externas deben pasar por API routes de Next.js. Nunca exponer API keys al cliente. React Query consume los endpoints internos.

---

## Base de datos — Diseño

### Filosofía

Las transacciones son la fuente de verdad de todo. Los holdings se calculan/derivan de las transacciones. La base debe permitir calcular cualquier métrica sin lógica compleja en el frontend. Las preferencias del usuario determinan qué ve y cómo lo ve.

### Tablas

#### users
El usuario de la app. Solo info de identidad.
- id (uuid, PK)
- email (unique, not null)
- name
- avatar_url
- created_at
- updated_at

#### user_preferences
Separada de users para no ensuciarla. Toda configuración y personalización va acá.
- id (uuid, PK)
- user_id (FK → users, unique)
- currency_display: moneda por defecto para mostrar valores → 'USD' o 'ARS'
- dollar_type: qué tipo de dólar usar para conversión ARS → 'mep', 'ccl', o 'blue'
- theme: 'light', 'dark', o 'system'
- portfolio_columns: JSON array de strings con los IDs de las columnas activas en la tabla de portfolio. El usuario elige qué columnas ver y el orden. Default razonable para un joven que no quiere 40 columnas.
- dashboard_widgets: JSON con qué cards/widgets muestra en el dashboard y en qué orden (para futuro)
- alert_email: email alternativo para recibir alertas (si difiere del de login)
- weekly_summary_enabled: boolean, default true
- created_at
- updated_at

#### holdings
Una posición en el portfolio. Se recalcula cada vez que se agrega una transacción.
- id (uuid, PK)
- user_id (FK → users)
- ticker (ej: 'TSLA')
- type: 'stock' o 'cedear'
- total_shares: cantidad total actual. Se recalcula sumando buys y restando sells de transactions.
- avg_cost_usd: precio promedio ponderado de compra en USD. Se recalcula con cada transacción.
- total_invested_usd: suma de todas las compras en USD (sin restar ventas — es el capital deployado históricamente)
- realized_pnl_usd: ganancia/pérdida acumulada de todas las ventas parciales o totales
- total_dividends_usd: suma de todos los dividendos cobrados para este holding
- cedear_ratio: texto con el ratio actual, ej: '15:1'. Null para stocks.
- first_buy_date: fecha de la primera compra (para calcular días de tenencia)
- last_transaction_date: fecha de la última compra o venta
- transaction_count: cantidad total de transacciones (para mostrar "hiciste N compras")
- notes: nota libre del usuario sobre la tesis de inversión
- is_active: boolean. False cuando vendió todo (shares = 0). El registro se mantiene para historial y P&L realizado.
- created_at
- updated_at

#### transactions
Cada compra o venta individual. Es la fuente de verdad.
- id (uuid, PK)
- user_id (FK → users)
- holding_id (FK → holdings)
- ticker
- type: 'stock' o 'cedear'
- action: 'buy' o 'sell'
- shares: cantidad de unidades en esta transacción
- price_per_share: precio al que compró/vendió (en la currency indicada)
- price_usd: precio en USD (si operó en ARS, se convierte con el exchange_rate)
- currency: 'USD' o 'ARS'
- exchange_rate: tipo de cambio del dólar al momento de la operación. Para reconstruir valores en ambas monedas históricamente. Se captura automáticamente si la moneda es ARS.
- total_amount: monto total de la operación (shares × price). Redundante pero útil para queries.
- total_amount_usd: monto total en USD. Redundante pero evita recálculos.
- commission: comisión del broker. Nullable. Para el que quiera trackear costos reales.
- date: fecha de la operación (la elige el usuario, puede ser distinta a created_at)
- notes: nota opcional
- created_at

#### dividends
Dividendos recibidos. Clave para calcular rendimiento total real, no solo price return.
- id (uuid, PK)
- user_id (FK → users)
- holding_id (FK → holdings)
- ticker
- amount_per_share: dividendo por acción/CEDEAR (en la moneda de pago)
- total_shares_at_date: cuántas shares tenía al momento del dividendo (snapshot)
- total_amount: monto total recibido
- total_amount_usd: monto en USD
- currency: 'USD' o 'ARS'
- exchange_rate: tipo de cambio al momento
- ex_dividend_date
- payment_date
- is_estimated: boolean. True si el usuario lo estimó, false si lo registró real. Útil para distinguir proyecciones de datos reales.
- notes
- created_at

#### watchlist
Tickers que el usuario sigue sin tenerlos.
- id (uuid, PK)
- user_id (FK → users)
- ticker
- notes: por qué lo sigue, qué espera
- target_buy_price: precio al que compraría (referencia personal)
- added_at

#### alerts
Alertas de precio que disparan email.
- id (uuid, PK)
- user_id (FK → users)
- ticker
- condition: 'above' o 'below'
- target_price
- currency: 'USD' o 'ARS'
- is_active: boolean
- triggered_at: cuándo se disparó (null si no todavía)
- notification_sent: boolean
- created_at

---

## Métricas calculables — Catálogo completo

Todo esto debe poder calcularse combinando data de la DB + cotizaciones live de las APIs. El frontend nunca almacena estas métricas, las computa on-the-fly (o las cachea con React Query).

### Por holding (cada fila de la tabla)

**Identidad:**
- Ticker + nombre de empresa
- Tipo: Stock o CEDEAR (chip visual)
- Cantidad de shares/CEDEARs
- Equivalencia en acciones reales (solo CEDEARs)

**Precio y valor:**
- Precio actual USD
- Precio actual ARS (× dólar MEP)
- Valor total de la posición USD
- Valor total de la posición ARS
- Peso en el portfolio (% del valor total)

**Costo y compra:**
- Precio promedio de compra USD
- Precio promedio de compra ARS (reconstruido con exchange rates históricos)
- Total invertido USD y ARS
- Cantidad de compras realizadas

**Rendimiento:**
- P&L no realizado en $ (USD y ARS): (precio actual - avg cost) × shares
- P&L no realizado en %: ((precio actual / avg cost) - 1) × 100
- P&L realizado en $ (de ventas cerradas)
- P&L total (realizado + no realizado)
- Variación del día ($ y %)
- Variación de la semana (%)
- Variación del mes (%)
- Variación YTD (%)

**Tiempo:**
- Fecha de primera compra
- Fecha de última transacción
- Días de tenencia (desde primera compra)

**Dividendos:**
- Dividendos totales recibidos USD
- Dividend yield actual (%): dividendo anual / precio actual
- Yield on cost (%): dividendo anual / avg cost de compra
- Próxima fecha de dividendo

**CEDEAR-específicas:**
- Ratio de conversión
- CCL implícito
- Equivalencia en acciones reales

**Datos de mercado (de la API, no de la DB):**
- Pre-market / after-hours price
- All-time high + distancia desde ATH (%)
- 52-week high / low
- P/E ratio y EPS
- Market cap
- Volumen del día
- Próxima fecha de earnings
- Analyst consensus + price target promedio

### Métricas globales del portfolio (dashboard)

- Balance total USD y ARS
- Total invertido USD y ARS
- P&L no realizado ($ y %)
- P&L realizado total
- P&L combinado (realizado + no realizado)
- Rendimiento total (%): (valor actual + dividendos + P&L realizado - total invertido) / total invertido
- Variación del día / semana / mes / YTD
- Dividendos totales cobrados histórico
- Dividendos proyectados próximos 12 meses
- Cantidad de posiciones activas
- Top gainer del día (ticker + %)
- Top loser del día (ticker + %)
- Distribución por sector
- Distribución por tipo (stocks vs CEDEARs)
- Comparación vs S&P 500 (si hubieras metido la misma plata en SPY)

---

## Columnas configurables de la tabla

El usuario elige qué columnas ver desde un dropdown de checkboxes. La selección se persiste en user_preferences.portfolio_columns.

**Columnas default (se muestran al inicio):**
1. Ticker + nombre
2. Tipo (chip Stock/CEDEAR)
3. Cantidad
4. Precio actual
5. Valor total
6. Var. día (%)
7. P&L no realizado (%)
8. Peso en portfolio (%)

**Columnas opcionales activables:**
- Precio promedio de compra
- Total invertido
- P&L no realizado ($)
- P&L realizado
- P&L total
- Var. semana / mes / YTD
- Días de tenencia
- Fecha primera compra
- Dividendos recibidos
- Dividend yield
- Yield on cost
- 52w high/low
- Distancia desde ATH
- Pre/after market
- P/E ratio
- Cantidad de compras
- CCL implícito (CEDEARs)
- Notas

---

## Páginas

### Login
Minimalista. Logo, nombre, botón de Google y/o email para magic link. Nada más.

### Dashboard
Vista de 3 segundos. El usuario abre y entiende cómo va:
- Balance total grande animado (USD, ARS debajo)
- Variación del día en $ y %
- Chart de evolución de la cartera (1S, 1M, 3M, 6M, 1A, MAX)
- Top gainer y top loser del día
- Allocation chart (donut por acción o por sector)
- Comparación vs S&P 500 en el chart
- Dólar MEP siempre visible en topbar

### Portfolio
Tabla de holdings con columnas configurables. Toggle USD/ARS. Botón "Cargar compra" → dialog con formulario. El formulario autodetecta si un ticker es CEDEAR y captura el dólar MEP si la moneda es ARS. Al guardar, se recalcula el holding.

### Watchlist
Lista de tickers seguidos. Precio, variación, notas personales, precio objetivo. Acciones: agregar al portfolio, crear alerta, eliminar.

### Detalle de acción (/stock/[ticker])
Chart de precio histórico con períodos (1D a 5A). Grid de fundamentals. Si tiene el ticker en portfolio, mostrar su posición y P&L. Si es CEDEAR, sección con ratio, CCL, equivalencia. Botones: agregar a portfolio, watchlist, alerta.

### Alertas
Lista activas + historial de disparadas. Crear con: ticker, condición, precio, moneda. Cron QStash cada 5 min en horario de mercado.

### Settings
Moneda default, tipo de dólar, tema, email alertas, toggle resumen semanal, configuración de columnas del portfolio.

---

## Diseño y UI

### Principios
- Dark mode por defecto.
- Minimalismo financiero: datos densos pero legibles.
- shadcn/ui para todo. No inventar si shadcn tiene.
- Inspiración: Linear, Mercury, Arc browser.

### Tipografía
- Body: Geist Sans.
- Números y precios: Geist Mono. Siempre. Todo valor numérico.

### Colores
- Verde (#22c55e) solo para ganancia/positivo.
- Rojo (#ef4444) solo para pérdida/negativo.
- Resto: sistema de shadcn.

### Animaciones (Framer Motion)
- Page transitions: fade + slide sutil.
- Balance counter animado.
- Charts: entrada suave.
- Listas: staggered fade-in.
- No animar botones, inputs, ni cosas triviales.

### Layout
- Sidebar izquierda colapsable: Dashboard, Portfolio, Watchlist, Alertas, Settings. Avatar + logout al fondo.
- Topbar: título de página, badge dólar MEP, toggle USD/ARS global, toggle tema.
- Content: max-width ~1280px, centrado, padding generoso.
- Desktop first. Mobile: sidebar → bottom nav o sheet.

### Formato de moneda
- USD: $230.50 (punto decimal, coma miles: $1,230.50)
- ARS: $1.425,50 (formato argentino: punto miles, coma decimal)
- Siempre 2 decimales para moneda, 1 decimal para porcentajes.

---

## Data fetching

Cache con React Query. staleTime sugeridos:
- Cotizaciones live: 60 segundos
- Dólar MEP: 2 minutos
- Históricos: 5 minutos
- Fundamentals: 1 hora
- Holdings del usuario: 0 (siempre fresh)
- Refetch on window focus: desactivado

Custom hooks: useQuote, useHistorical, useDollar, usePortfolio, useWatchlist, useAlerts. Los componentes nunca hacen fetch directo.

---

## Background jobs (QStash)

- Alertas: cron cada 5 min, lunes a viernes, horario de mercado US. Verifica firma de QStash, busca alertas activas, cotiza tickers, envía email con Resend si se cumple condición.
- Resumen semanal: domingos. Performance de la semana, movers, dividendos, alertas disparadas, earnings que vienen.

---

## Orden de implementación

### Fase 1 — Foundation
1. Setup: Next.js + Tailwind + shadcn + Geist + Framer Motion
2. Tema dark/light
3. Layout: sidebar + topbar
4. Better Auth con Google + Supabase
5. Drizzle: schema + migración
6. React Query: provider + config

### Fase 2 — Core
7. API dólar + hook + badge en topbar
8. API quotes + hook
9. JSON ratios CEDEARs
10. Portfolio: tabla con columnas configurables + toggle moneda
11. Dialog cargar compra/venta
12. Lógica recálculo holdings
13. Dashboard: balance + variación diaria

### Fase 3 — Charts y detalle
14. API históricos + hook
15. Dashboard: chart cartera + allocation
16. /stock/[ticker]: chart + fundamentals
17. Sección CEDEAR
18. Comparación vs S&P 500

### Fase 4 — Secondary
19. Watchlist CRUD
20. Registro de dividendos
21. Alertas + QStash + Resend
22. Settings con user_preferences

### Fase 5 — Polish
23. Skeletons en todo
24. Error states y empty states
25. Animaciones Framer Motion
26. Responsive final
27. PWA

---

## Reglas para el AI

1. Usar shadcn/ui siempre. No crear componentes custom si shadcn tiene uno.
2. Dark mode first.
3. Geist Mono para todo número o valor monetario.
4. React Query para toda data externa. Nunca fetch directo.
5. Server Components por defecto. "use client" solo cuando haya interactividad.
6. API keys nunca en el cliente. Todo por API routes.
7. Formato de moneda correcto para cada currency.
8. TypeScript estricto. No `any`.
9. Verde y rojo solo para ganancia/pérdida.
10. Framer Motion con moderación.
11. No overdesign. Densidad alta pero limpia.
12. Seguir el orden de fases.