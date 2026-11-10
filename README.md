# PitWall AI

A responsive F1 tyre-strategy dashboard prototype, with a staged roadmap toward
historical data analysis, tyre modelling, strategy simulation, and agent-assisted
race recommendations.

> **Prototype notice:** The dashboard currently uses illustrative sample values.
> It does not yet connect to FastF1, a trained model, an actual race simulator,
> an LLM, or MCP tools. Do not treat its times, probabilities, or recommendations
> as real race predictions.

## Run locally

Requires Python 3. Run this command from the project directory:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://localhost:8000](http://localhost:8000). Stop the server with
`Ctrl+C`.

The current dashboard is plain HTML, CSS, and JavaScript; there are no frontend
packages to install.

## Project files

- `index.html`, `styles.css`, `app.js` — browser dashboard and demo interactions
- `PLAN.md` — full project architecture and implementation plan
- `FUTURE_ROADMAP.md` — prioritized phases, exit checks, and next sprint

## Planned direction

The next step is to scaffold the Python data layer, load and cache one
historical FastF1 race weekend, then normalize and test lap, stint, compound,
and weather fields. The dashboard should remain clearly marked as demo data
until model, simulator, and backtest milestones have been validated.

See [FUTURE_ROADMAP.md](./FUTURE_ROADMAP.md) for phase details.

## License

No license has been selected yet. All rights reserved unless a license is added.
