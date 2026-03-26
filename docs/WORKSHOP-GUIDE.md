# AdiOS Use Case Builder — Workshop Facilitator Guide

Offline and air-gapped mode. No internet required after initial setup.

## Pre-Workshop Setup

```bash
git clone https://github.com/adios-platform/adios-use-case-builder.git
cd adios-use-case-builder
npm install
npm run build
npm start
```

Opens automatically at http://localhost:3000

## Workshop Agenda (Half-Day 4 Hours)

Welcome and AdiOS context: 0:00 to 0:20 using Slides
Use Case Builder demo via Storylane: 0:20 to 0:40
Identify top 5 business questions on whiteboard: 0:40 to 1:00
Workshop Round 1 populate 2 use cases in local app: 1:00 to 1:30
Break: 1:30 to 1:45
Workshop Round 2 graph canvas and data products: 1:45 to 2:30
Prioritisation matrix in local app: 2:30 to 3:00
Review and export: 3:00 to 3:30 using npm run export
Next steps and AdiOS roadmap: 3:30 to 4:00

## Canvas Panes

Left panel is the Asset Library where you drag data products and AI agents onto the canvas.
Centre panel is the Canvas where you draw the use case graph from business question to data to AI to outcome.
Right panel is Properties where you fill in metadata including domain, value score, effort, and owner.

## Participant Quick-Start

Open http://localhost:3000 then click New Use Case. Enter your business question in the QUESTION node. Drag DATA PRODUCT nodes from the Library. Connect nodes from data to AI agent to outcome. Fill in the Properties panel with value and effort scores. Work is auto-persisted locally.

## Export After Workshop

```bash
npm run export
```

This pushes use cases to adios-gateway and requires VPN access. Alternatively share the file at ~/.adios-ucb/local-store.json with the platform team.

## Troubleshooting

If port 3000 is in use run: UCB_SERVER_PORT=3001 npm start
If browser does not open navigate manually to http://localhost:3000
If session data is lost check ~/.adios-ucb/local-store.json
For fresh seed data delete ~/.adios-ucb/local-store.json and restart

AdiOS Platform Private Limited - contact@adiosplat.io
