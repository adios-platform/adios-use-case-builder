# AdiOS Use Case Builder

> **Design. Validate. Activate.** — The sovereign AI use case canvas for the AdiOS Platform.
>
> [![AdiOS Ecosystem](https://img.shields.io/badge/AdiOS-Ecosystem-00c49a?style=flat-square)](https://adiosplat.io)
> [![License](https://img.shields.io/badge/license-proprietary-red?style=flat-square)](./LICENSE)
> [![Mode: Online + Offline](https://img.shields.io/badge/mode-online%20%2B%20offline-blue?style=flat-square)](#modes)
>
> ---
>
> ## What is this?
>
> The **AdiOS Use Case Builder** is a standalone, dual-mode application for designing, validating, and activating AI transformation use cases. It is a first-class citizen of the [AdiOS sovereign AI ecosystem](https://adiosplat.io).
>
> It runs in two modes:
>
> | Mode | How | Who |
> |------|-----|-----|
> | **Online / Portal** | Embedded in `adiosplat.io` via Storylane + portal integration. Calls live `adios-gateway` APIs. | External users, prospects, partners |
> | **Offline / Workshop** | Local Node.js app (`npm start`). Falls back to embedded seed data when APIs are unreachable. | Internal workshops, field sessions, air-gapped environments |
>
> ---
>
> ## AdiOS Ecosystem Integration
>
> This repo sits at the intersection of multiple AdiOS services:
>
> ```
> adios-use-case-builder
>         │
>         ├── adios-gateway       ← Auth (JWT/OIDC), Use Case CRUD, graph persistence
>         ├── adios-catalog       ← Use Case graph model, data product linkage
>         ├── adios-cortex        ← AI recommendations panel (online mode)
>         ├── adios-lineage       ← Upstream/downstream lineage calls from canvas
>         ├── adios-sentinel      ← Authz / role-scoped visibility
>         └── Storylane           ← Guided interactive demo (online embed mode)
> ```
>
> When **online**: all reads/writes go through `adios-gateway` REST/WebSocket endpoints.
> When **offline**: the app loads from `src/data/seed/` JSON fixtures and persists changes to `~/.adios-ucb/local-store.json`.
>
> ---
>
> ## Repository Structure
>
> ```
> adios-use-case-builder/
> ├── src/
> │   ├── app/                    # Main React app entry
> │   │   ├── App.tsx
> │   │   └── router.tsx
> │   ├── features/
> │   │   ├── canvas/             # React Flow graph canvas (nodes, edges, minimap)
> │   │   ├── library/            # Asset library (left panel)
> │   │   ├── properties/         # Properties panel (right panel)
> │   │   ├── portfolio/          # Use case list + prioritisation matrix
> │   │   └── tour/               # Guided tour steps (Storylane embed + local fallback)
> │   ├── services/
> │   │   ├── gateway.ts          # adios-gateway API client (online)
> │   │   ├── local-store.ts      # File-system persistence (offline)
> │   │   └── mode-detector.ts    # Detects online/offline, switches service layer
> │   ├── data/
> │   │   └── seed/               # Offline seed fixtures (use cases, industry templates)
> │   │       ├── use-cases.json
> │   │       ├── industry-templates.json
> │   │       └── data-products.json
> │   ├── components/             # Shared UI components
> │   ├── hooks/                  # Custom React hooks
> │   └── types/                  # TypeScript interfaces (mirrors adios-catalog model)
> ├── server/
> │   └── index.ts                # Express server (offline workshop mode only)
> ├── public/
> │   └── storylane-embed.html    # Storylane iframe host page (online mode)
> ├── scripts/
> │   ├── seed-data.ts            # Populate local seed from gateway export
> │   └── export-workshop.ts      # Export session data back to gateway
> ├── docs/
> │   ├── ARCHITECTURE.md         # How online/offline modes work
> │   ├── WORKSHOP-GUIDE.md       # Facilitator guide for offline sessions
> │   └── STORYLANE-SETUP.md      # How to configure Storylane demos
> ├── .env.example                # Required env vars
> ├── package.json
> ├── vite.config.ts
> └── README.md
> ```
>
> ---
>
> ## Modes
>
> ### Online Mode (Portal / Storylane)
>
> The builder is embedded in the AdiOS portal at `adiosplat.io/builder`. It uses:
> - **Storylane** for the guided interactive demo/tour flow (`app.storylane.io`)
> - - **adios-gateway** for live API calls (auth, use case CRUD, graph, cortex recommendations)
>   - - The portal iframe loads `public/storylane-embed.html` which bootstraps the Storylane widget
>    
>     - To configure Storylane embed:
>     - ```bash
>       VITE_STORYLANE_DEMO_URL=https://app.storylane.io/demo/YOUR_DEMO_ID
>       VITE_GATEWAY_URL=https://api.adiosplat.io
>       VITE_OIDC_CLIENT_ID=your-client-id
>       ```
>
> See [`docs/STORYLANE-SETUP.md`](./docs/STORYLANE-SETUP.md) for full setup.
>
> ### Offline / Workshop Mode
>
> Run the full builder locally — no internet required after initial `npm install`:
>
> ```bash
> # Install dependencies
> npm install
>
> # Optional: pull latest seed data from gateway (requires VPN/auth)
> npm run seed
>
> # Start the offline workshop app
> npm start
> # → Opens at http://localhost:3000
> ```
>
> The app detects connectivity automatically via `mode-detector.ts`. When offline:
> - All API calls fall back to `src/data/seed/` fixtures
> - - Changes are persisted to `~/.adios-ucb/local-store.json`
>   - - At end of workshop, export back with `npm run export`
>    
>     - See [`docs/WORKSHOP-GUIDE.md`](./docs/WORKSHOP-GUIDE.md) for the facilitator runbook.
>    
>     - ---
>
> ## Development
>
> ```bash
> npm install
> cp .env.example .env          # fill in gateway URL + OIDC config
> npm run dev                   # Vite dev server at http://localhost:5173
> npm run build                 # Production build
> npm test                      # Vitest unit tests
> npm run test:e2e              # Playwright E2E (requires running gateway)
> ```
>
> ### Tech Stack
>
> | Layer | Choice | Why |
> |-------|--------|-----|
> | Framework | React + TypeScript | Matches adios-portal standard |
> | Build | Vite | Fast HMR, matches org standard |
> | Canvas | React Flow | Graph-native, matches catalog model |
> | Routing | React Router v6 | Deep link support per portal spec |
> | State | Zustand | Lightweight, offline-friendly |
> | Server (offline) | Express + Node | Minimal, runs anywhere |
> | Testing | Vitest + Playwright | Unit + E2E coverage |
>
> ---
>
> ## Connecting to the Portal (baral50/adios-portal-v3)
>
> The live portal at `adiosplat.io` (repo: `baral50/adios-portal-v3`) references this builder via its **BUILDER** nav item. Integration:
>
> ```html
> <!-- In adios-portal-v3: sidebar BUILDER panel -->
> <iframe
>   src="https://adios-platform.github.io/adios-use-case-builder/"
>   title="AdiOS Use Case Builder"
>   allow="fullscreen"
> ></iframe>
> ```
>
> Or link directly to the Storylane demo for the marketing/tour flow.
>
> ---
>
> ## Roadmap
>
> - [ ] Phase 1: Scaffolding + offline Node app with seed data
> - [ ] - [ ] Phase 2: React Flow canvas with adios-catalog graph model
> - [ ] - [ ] Phase 3: Online gateway integration (auth, CRUD, cortex recommendations)
> - [ ] - [ ] Phase 4: Storylane demo recording + embed configuration
> - [ ] - [ ] Phase 5: Portfolio matrix view + export
> - [ ] - [ ] Phase 6: WCAG 2.1 AA audit + E2E Playwright suite
>
> - [ ] ---
>
> - [ ] ## Part of AdiOS Platform
>
> - [ ] | Repo | Role |
> - [ ] |------|------|
> - [ ] | [adios-platform/adios-portal](https://github.com/adios-platform/adios-portal) | Web shell (Vite+React, full portal) |
> - [ ] | [baral50/adios-portal-v3](https://github.com/baral50/adios-portal-v3) | Live marketing site (adiosplat.io) |
> - [ ] | **adios-platform/adios-use-case-builder** | ← This repo |
> - [ ] | adios-platform/adios-os | Sovereign AI OS |
> - [ ] | adios-platform/adios-platform | Platform monorepo (specs, ADRs) |
>
> - [ ] ---
>
> - [ ] *AdiOS Platform Private Limited · CIN: U58201TS2026PTC211867 · contact@adiosplat.io*
