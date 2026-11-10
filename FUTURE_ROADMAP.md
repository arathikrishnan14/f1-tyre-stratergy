# PitWall AI — Future Enhancement Roadmap

This roadmap turns the project plan into a practical sequence of releases. It is
ordered by dependency, not by calendar date. Each phase should meet its exit
checks before the next phase is treated as production-ready.

## Current state

The current deliverable is a responsive browser-based strategy dashboard with
illustrative sample data and local interactions. It is not yet connected to
FastF1, a trained model, an actual race simulator, an LLM, or an MCP server.
Strategy times, probabilities, and confidence values must not be presented as
real predictions until the corresponding data and evaluation work is complete.

## Roadmap at a glance

| Priority | Enhancement | Outcome | Depends on |
|---|---|---|---|
| P0 | Real race data foundation | Cached, normalized historical race data | — |
| P1 | Tyre pace model | Reproducible lap-time and degradation estimates | P0 |
| P2 | Strategy simulator and optimizer | Feasible strategies ranked on race-time and risk | P0, P1 |
| P3 | Uncertainty and evaluation | Calibrated distributions and historical backtests | P1, P2 |
| P4 | Agent and MCP orchestration | Tool-grounded, structured strategy explanations | P2, P3 |
| P5 | Productize and operate | Tested app/API, deployment, monitoring, documentation | P0–P4 |
| Later | Live-race updates | Re-plan using live timing, weather, and race control | P0–P5 |

## P0 — Establish a trustworthy data foundation

**Build**

- Add a Python package, dependency manifest, configuration, and environment
  example.
- Ingest a deliberately small, documented set of historical seasons with
  FastF1; cache downloads to avoid repeated network access.
- Normalize race, driver, lap, compound, stint, weather, and track-status data.
- Record data provenance, missingness, and session load failures explicitly.
- Keep secrets out of the repository and keep the sample dashboard usable
  without external credentials.

**Exit checks**

- A documented command can load a selected race from cache or fetch it.
- The normalized output has stable columns and validated units.
- Tests cover preprocessing and missing/invalid data cases.

## P1 — Train and validate the first tyre pace model

**Build**

- Establish a simple, interpretable baseline before trying boosted trees.
- Create features for compound, tyre age, circuit, driver/team, and conditions.
- Split evaluation by time/race (walk-forward); prevent laps from the same
  future session leaking into training.
- Compare predicted vs. observed pace and report MAE/RMSE by compound and
  circuit; persist model metadata alongside the artifact.

**Exit checks**

- A reproducible training/evaluation command produces a report and model.
- Baseline and candidate metrics are compared on held-out races.
- The app labels predictions as unavailable when no validated model is loaded.

## P2 — Build race simulation and strategy optimization

**Build**

- Implement race-rule-aware candidate generation using available compounds,
  stint bounds, mandatory compound rules, and stop limits.
- Simulate stint pace, degradation, pit-lane loss, and strategy transitions.
- Rank strategies using expected race time plus explicit risk/stop penalties;
  show the components rather than hiding them in a single score.
- Keep model and simulator interfaces independent of the UI.

**Exit checks**

- Unit tests cover feasibility, lap accounting, pit stops, and edge cases.
- Every generated strategy completes the race distance and obeys configured
  rules.
- Given fixed inputs and seed, results are deterministic and comparable.

## P3 — Quantify uncertainty and backtest recommendations

**Build**

- Add seeded Monte Carlo sampling for pace/degradation uncertainty and selected
  Safety Car and weather scenarios.
- Report distributions and useful quantiles alongside average time; only expose
  podium/top-five probabilities when a defensible field model exists.
- Backtest against held-out historical races and compare strategy rankings,
  race-time error, and probability calibration.
- Surface model/data coverage and uncertainty when evidence is sparse.

**Exit checks**

- Runs are reproducible from a recorded seed and scenario.
- Evaluation includes calibration, not just point-estimate error.
- The UI distinguishes historical observations, model estimates, and unknowns.

## P4 — Add tool-grounded agent and MCP workflows

**Build**

- Expose narrow, typed tools for race context, weather, degradation, strategy
  generation, simulation, and comparison.
- Have the orchestration layer call analytical tools; do not ask the LLM to
  invent numeric predictions.
- Return validated structured recommendations containing strategy, pit window,
  supporting evidence, uncertainty, and caveats.
- Log tool success/failure and show user-facing analysis status without exposing
  private chain-of-thought.

**Exit checks**

- Tool schemas and failure cases have automated tests.
- Recommendation values are traceable to simulator outputs.
- Missing data, tool errors, and invalid model output are shown explicitly.

## P5 — Productize the application

**Build**

- Replace the static demo-only interaction with a backend API and connect the
  dashboard to real scenario results.
- Add loading, empty, stale-data, validation, and error states.
- Add responsive and accessibility checks, unit/integration tests, and CI.
- Document local setup, data/model limitations, and deployment.
- Add lightweight operational monitoring for API errors and data freshness.

**Exit checks**

- A clean install can run the app and its tests from documented commands.
- Core user flow works without relying on hard-coded sample predictions.
- Deployment health and data/model version are visible to maintainers.

## Later — Live race strategy updates

Only start after historical recommendations have been backtested. Add live
timing and weather ingestion, race-control/Safety Car events, incremental state
updates, and a human-confirmed re-plan workflow. Handle delayed or missing feeds
gracefully and preserve the last reliable recommendation with a clear stale-data
indicator.

## Immediate next sprint

1. Scaffold the Python project and tests around the existing dashboard.
2. Load one race weekend from FastF1 and cache it locally.
3. Normalize and test lap, stint, compound, and weather fields.
4. Replace one static race-context panel with sourced data and show its season,
   session, and freshness.
5. Keep strategy predictions visibly marked as demo until P1–P3 exit checks pass.
