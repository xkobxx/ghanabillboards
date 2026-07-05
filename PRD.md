# Product Requirements Document (PRD)
## Project: VANTAGE POINT — Unified Out-of-Home (OOH) Advertising Terminal

---

## 1. Executive Summary & Vision

### 1.1. Context & Opportunity
The Out-of-Home (OOH) advertising sector in Sub-Saharan Africa is a rapidly growing $1.2B market, yet it remains one of the most operationally fragmented and analog-heavy advertising mediums. Traditional campaigns require brand managers and media agencies to spend upwards of 18 days manually contacting separate inventory operators, haggling over unstructured pricing, verifying availability via email, and relying on unverified static traffic counts.

### 1.2. The Mission
**Vantage Point** is the digital operating framework and programmatic marketplace designed to unify this fragmented supply. By introducing a Map-First Discovery Engine, instant transaction scheduling, and real-time mobility telemetry, Vantage Point slashes the OOH campaign lifecycle from **18 days to 4.5 minutes**. 

The platform bridges three critical pillars of the advertising value chain:
1. **The Buyer (Demand-Side)**: Agencies and brands seeking rapid discoverability, transparent traffic metrics, and friction-free booking.
2. **The Publisher (Supply-Side)**: Media owners looking to maximize occupancy, track live inventory health, and automate invoicing.
3. **The Platform Admin (Gateway Operator)**: Operational staff monitoring system latencies, payload safety, API usage, and market-clearing operations.

---

## 2. Core User Roles & Personas

### 2.1. The Buyer (Demand-Side)
*   **User Goal**: Quickly deploy a localized, multi-city ad campaign without dealing with multiple fragmented operators.
*   **Key Pain Points**: No transparent view of billboard availability; lacks verifiable transit analytics; opaque and slow billing processes.
*   **Behavior in Platform**: Searches the interactive marketplace, filters inventory by format and traffic level, specifies flight dates, calculates campaign cost, and places immediate, secure bookings.

### 2.2. The Publisher (Supply-Side Partner)
*   **User Goal**: Keep static and digital billboards at maximum occupancy while minimizing administrative overhead.
*   **Key Pain Points**: Manual invoicing delays; high empty-calendar rate; lack of tools to easily broadcast slot availability.
*   **Behavior in Platform**: Reviews incoming booking requests, manages inventory parameters (dimensions, daily rates, formats), toggles operational status (Available, Maintenance), and monitors gross billing.

### 2.3. The Administrator (Gateway Control)
*   **User Goal**: Ensure continuous gateway performance, analyze transactional system health, adjust network parameters, and resolve disputes.
*   **Key Pain Points**: API abuse/rate-limit overruns, complex database lockouts during high-volume bookings, and payload inspection latency.
*   **Behavior in Platform**: Monitors live gateway telemetry logs (latencies, status codes, modules), inspects JSON payloads, configures global gateway variables (rate limits, DB pool sizing), and manages role privileges.

---

## 3. Product Architecture & Bounded Contexts

Vantage Point is designed around a **Modular Monolith** structure. This design isolates key operational domains into independent bounded contexts, ensuring that the platform can eventually scale and transition into distinct microservices (e.g., Auth, Catalog, Bookings, Core Payments, Telemetry) without requiring a complete rewrite.

```
                    +------------------------------------+
                    |         Client Browser / SPA       |
                    | (React 18, Tailwind, Lucide Icons) |
                    +------------------------------------+
                                      |
                                      | HTTPS (JSON)
                                      v
                    +------------------------------------+
                    |        Unified API Gateway         |
                    |     (Auth & Rate-Limit Guard)      |
                    +------------------------------------+
                                      |
       +------------------------------+------------------------------+
       |                              |                              |
       v                              v                              v
+---------------+              +---------------+              +---------------+
| Billboards MC |              |  Bookings MC  |              | Telemetry MC  |
| - Geo/Listings|              | - Scheduling  |              | - Gateway Logs|
| - Inventory   |              | - Invoicing   |              | - Rate Limits |
+---------------+              +---------------+              +---------------+
```

---

## 4. Functional Specifications

### 4.1. Interactive Discovery Engine (Marketplace)
*   **Geospatial Visualization**: Displays an interactive map or grid interface indicating node distribution.
*     *   **Traffic Volume**: Mega, Very High, High.
    *   **Price Range**: Slide controls reflecting daily rate bounds.
*   **Rich Asset Cards**: Each card details:
    *   High-resolution contextual imagery.
    *   Precise dimensions, monthly impressions, and local transit routing attributes.
    *   Live availability status badge (Available, Fully Booked, Maintenance).

### 4.2. Campaign Booking & Transaction Scheduler
*   **Dynamic Valuation**: Evaluates total investment instantly based on daily rate multiplied by the duration in days.
*   **Campaign Scope Definition**: Requires inputs for:
    *   **Campaign Name** (e.g., "Neo-Banking Launch Q3").
    *   **Client / Agency Identification**.
    *   **Creative Campaign Slogan / Copy** (for initial preview validation).
    *   **Flight Dates** (Start & End dates).
*   **Real-time Escrow Initialization**: Commits the booking state to "Pending Approved" and schedules calendar locks.

### 4.3. Publisher Inventory Dashboard (Supply Hub)
*   **Operational Inventory List**: Lists assets assigned to the publisher, including performance stats.
*   **Interactive Status Toggles**: Allows publishers to mark nodes under "Maintenance" or set active availability with live updates.
*   **Financial Summary**: Tracks total gross revenue accumulated across "Approved" or "Live" campaign bookings.
*   **Parameter Customization**: Enables direct updates to pricing structure, daily rates, and format settings.

### 4.4. Developer Telemetry Control (Admin Gateway)
*   **API Log Stream**: Interactive, high-density logging table capturing server-side gateway traffic, complete with:
    *   Request Method (GET, POST, etc.) and full API endpoint path.
    *   Latency trackers in milliseconds.
    *   HTTP status code indicators (color-coded).
    *   Module categorization tags (Auth, Billboards, Payments).
*   **Payload Inspector**: Clicking a log item reveals the exact raw JSON request payload (headers, filters, limit, currency keys).
*   **Gateway Rule Injector**: Real-time adjustable sliders for:
    *   Max API Gateway Rate Limits (requests per minute).
    *   Database connection pool bounds.
    *   Redis caching time-to-live (TTL).

### 4.5. Venture / Growth Pitch Deck Carousel
An embedded, high-fidelity slide deck tailored for investor review:
*   **Slide 1**: Executive Pitch (Value prop of standardizing SSA's OOH landscape).
*   **Slide 2**: The Fragmented Problem (Lack of standardization, unverified traffic metrics).
*   **Slide 3**: The Solution (Modular map-first system).
*   **Slide 4**: TAM, SAM, and SOM metrics (Sub-Saharan Africa projections).
*   **Slide 5**: Marketplace commission & SaaS subscription monetization model.
*   **Slide 6**: System Architecture (The path from modular monolith to microservices).

---

## 5. UI/UX & Styling Guidelines

### 5.1. The "Cosmic Charcoal / Cinematic Dark" Theme
The visual identity of Vantage Point rejects standard "cookie-cutter" dashboards. It is styled to resemble an elite investment command terminal:
*   **Canvas Background**: High-density rich black (`#09090b` / `#0c0c0c`).
*   **Accent Boundaries**: Custom borders with translucent white values (`border-white/10` or `border-zinc-800`).
*   **Visual Highlights**: Subtle emerald-green overlays for high-performance nodes and high-contrast gold/white highlights for premium items.
*   **Negative Space**: Minimum 24px-32px margins inside all dashboard panels to prevent sensory clutter.

### 5.2. Typography Framework
*   **Primary Display Typography**: `Space Grotesk` or `Inter` (sans-serif) for high-impact titles, conveying technological forwardness and modern layout structures.
*   **System/Data Typography**: `JetBrains Mono` or `Fira Code` (monospace) for telemetry parameters, daily costs, impression counts, latencies, and log details.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

---

## 6. Information Architecture & Data Schemas

### 6.1. Billboard Schema (`Billboard`)
| Attribute | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique resource identifier (e.g., `lag-01`) |
| `title` | String | High-visibility name of the advertising board |
| `location` | String | Street or highway intersection name |
| `city` | String | Local operational node center (e.g., `Lagos`) |
| `country` | String | Operational region identifier (e.g., `Nigeria`) |
| `dailyRate` | Number | Numeric valuation per calendar day (USD / Local) |
| `format` | Enum | `Digital LED` \| `Static Mega` \| `Spectacular Bridge` \| `Portrait Pillar` |
| `dimensions`| String | Physical footprint measurements |
| `monthlyImpressions`| String | Verified local traffic impression estimates |
| `trafficVolume` | Enum | `Mega` \| `Very High` \| `High` |
| `status` | Enum | `Available` \| `Fully Booked` \| `Maintenance` |
| `lat` / `lng` | Number | Map layout coordinates |
| `imageUrl` | String | Contextual layout photo |
| `description`| String | Regional marketing details and commuter demographic summary |

### 6.2. Booking Schema (`Booking`)
| Attribute | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique receipt identifier |
| `billboardId`| String | Target billboard foreign key reference |
| `startDate` | String | Launch date (YYYY-MM-DD) |
| `endDate` | String | Campaign finish date (YYYY-MM-DD) |
| `campaignName`| String | Name of active advertising campaign |
| `clientName` | String | Client or creative agency moniker |
| `totalCost` | Number | Consolidated price lock (Daily Rate * Duration) |
| `status` | Enum | `Pending Approved` \| `Live` \| `Completed` |
| `slogan` | String | Campaign copy (optional) |

### 6.3. API Telemetry Schema (`GatewayLog`)
| Attribute | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique log entry hash |
| `timestamp` | String | Standard time tracking value |
| `method` | Enum | `GET` \| `POST` \| `PUT` \| `DELETE` |
| `endpoint` | String | Target routing path on the API gateway |
| `module` | Enum | `Auth` \| `Billboards` \| `Bookings` \| `Payments` \| `Analytics` |
| `status` | Number | Standard HTTP response code (e.g., `200`, `201`, `429`) |
| `latencyMs` | Number | Round-trip request processing time |
| `payload` | String | Raw JSON request structure string |

---

## 7. Operational & Technical Strategy

### 7.1. Database Strategy
*   **Core Transactions**: Relational engines (e.g., PostgreSQL via Cloud SQL) are preferred to manage calendar flight date schedules, avoiding double-bookings through strict ACID transactional constraints.
*   **Scale-to-Zero Capability**: In sandbox environments, deployment configs default to scale-to-zero settings to minimize idle costs.

### 7.2. High-Performance API Gateway
*   **Mock Traffic Layer**: The platform includes a modular mock API traffic generator that streams synthetic logs to the Admin Dashboard. This enables operators to test real-world scenarios, inspect simulated payload violations, and analyze latency curves.
*   **Programmatic Client Integrations**: An upcoming SDK will allow agencies to stream programmatic triggers directly to digital LEDs based on live local event triggers (e.g., showing a rain-gear ad on Lekki Toll Gate LED when localized weather APIs indicate heavy rain).

---

## 8. Scalability & Future Roadmap

```
Phase 1: Unified Terminal  -->  Phase 2: Live IoT Telemetry  -->  Phase 3: Programmatic RTB
(Static & Digital Maps)         (Direct Screen Player logs)       (Real-Time Bidding API)
```

### 8.1. Phase 1: Interactive Unified Terminal (Current Status)
*   Deploy a cohesive interface displaying inventory, tracking simulated campaign bookings, providing multi-persona views, and displaying basic API gateway telemetry.

### 8.2. Phase 2: Live IoT & Playback Telemetry (Short-term)
*   Integrate direct screen media player logging (Proof-of-Play logs).
*   Incorporate real-time mobility foot-traffic tracking through cellular triangulation and vehicle telemetry datasets.

### 8.3. Phase 3: Programmatic Real-Time Bidding (Long-term)
*   Expose standard SSP (Supply-Side Platform) APIs for integration with Demand-Side Platforms (DSPs).
*   Support dynamic, automated ad insertions matching live localized traffic surges.
