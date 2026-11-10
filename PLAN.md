# PitWall AI — Agentic F1 Race Strategy Engineer

## 1. Project Goal

Build an agentic AI system that recommends the best F1 tyre strategy for a driver and race using historical FastF1 data, machine learning, race simulation, optimization, and LLM-based agents.

The system should answer questions such as:

> "What is the best tyre strategy for Charles Leclerc at Silverstone?"

Core principle:

**ML predicts → Simulator evaluates → Agents investigate → Race Engineer explains/recommends.**

---

## 2. Target Architecture

```text
                         USER
                           |
                           v
                  +-------------------+
                  | Strategy Manager  |
                  |      Agent        |
                  +---------+---------+
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
      Race Data Agent   Tyre Agent   Weather Agent
             |              |              |
             v              v              v
          FastF1        ML Models        FastF1
             |              |              |
             +--------------+--------------+
                            |
                            v
                  +-------------------+
                  | Strategy Simulator|
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Strategy Optimizer|
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Race Engineer     |
                  |      Agent        |
                  +---------+---------+
                            |
                            v
                     RECOMMENDATION
```

MCP should expose the major analytical capabilities as tools that the agents can invoke dynamically.

---

## 3. Technology Stack

### Data
- FastF1
- Pandas
- NumPy

### Machine Learning
- Scikit-learn
- XGBoost or LightGBM

### Agentic AI
- Python
- LLM with structured outputs/tool calling
- MCP

### Simulation
- NumPy
- Monte Carlo simulation
- Custom race/tyre strategy simulator

### UI
- Streamlit

### Engineering
- pytest
- Ruff/Black
- GitHub Actions
- `.env` for secrets

---

# 4. Implementation Phases

## Phase 1 — Repository and Architecture

### Tasks
- [ ] Create GitHub repository: `pitwall-ai`
- [ ] Create Python project using `pyproject.toml`
- [ ] Add `.gitignore`
- [ ] Add `.env.example`
- [ ] Create `src/` package
- [ ] Create `tests/`
- [ ] Create `notebooks/`
- [ ] Create `app/`
- [ ] Create `docs/`
- [ ] Add initial README
- [ ] Document architecture

### Expected structure

```text
pitwall-ai/
├── README.md
├── PLAN.md
├── pyproject.toml
├── .env.example
├── .gitignore
│
├── src/
│   ├── agents/
│   ├── models/
│   ├── simulation/
│   ├── tools/
│   ├── mcp/
│   └── data/
│
├── notebooks/
├── tests/
├── app/
│   └── streamlit_app.py
│
├── docs/
│   └── architecture.md
│
└── .github/
    └── workflows/
        └── tests.yml
```

---

# 5. Phase 2 — FastF1 Data Layer

Start with approximately three seasons of historical races rather than trying to ingest every available season.

### Data to collect

- [ ] Season
- [ ] Race
- [ ] Circuit
- [ ] Driver
- [ ] Team
- [ ] Lap number
- [ ] Lap time
- [ ] Tyre compound
- [ ] Tyre age
- [ ] Stint
- [ ] Pit stops
- [ ] Track temperature
- [ ] Air temperature
- [ ] Weather
- [ ] Track status
- [ ] Position

### Data modules

```text
src/data/
├── ingestion.py
├── preprocessing.py
└── features.py
```

### Required API

```python
race = load_race("2025", "Silverstone")
```

The returned data should be clean enough for downstream ML and simulation.

### Milestone

A complete race can be downloaded, cached, cleaned, and represented as a Pandas DataFrame.

---

# 6. Phase 3 — Exploratory Data Analysis

Create:

```text
notebooks/
├── 01_fastf1_data.ipynb
├── 02_tyre_analysis.ipynb
└── 03_strategy_analysis.ipynb
```

### Investigate

#### Tyre degradation
- [ ] Lap time vs tyre age
- [ ] Compound-specific degradation
- [ ] Circuit-specific degradation
- [ ] Driver/team differences

#### Strategy
- [ ] Number of stops
- [ ] Common tyre sequences
- [ ] Race time by strategy
- [ ] Pit-lane time loss
- [ ] Safety Car impact

### Milestone

Understand the major variables affecting tyre performance and strategy.

---

# 7. Phase 4 — Tyre Degradation ML Model

Build the first predictive model.

### Inputs

```text
driver
team
circuit
compound
tyre_age
lap_number
track_temperature
air_temperature
```

### Output

```text
predicted_lap_time
```

### Development approach

1. [ ] Establish a simple baseline
2. [ ] Build feature engineering
3. [ ] Train XGBoost/LightGBM model
4. [ ] Evaluate with MAE/RMSE
5. [ ] Compare predicted vs actual lap times
6. [ ] Calculate tyre degradation curves
7. [ ] Save model artifact

### Important

Use time-aware/walk-forward validation where appropriate. Avoid random train/test splitting that can leak future race information.

### Milestone

Given a driver, circuit, compound, tyre age, and race conditions, the model can estimate expected lap time.

---

# 8. Phase 5 — Race Strategy Simulator

Build a simulator around the ML model.

### Candidate strategies

```text
S → M → H
M → H
H → M
M → M → H
M → H → M
```

The exact candidates should depend on the available compounds and race rules.

### Simulator inputs

```text
starting tyre
stint lengths
pit stops
tyre compounds
weather
track conditions
```

### Simulator outputs

```text
expected_race_time
pit_stop_count
pit_lane_loss
total_degradation
strategy_score
```

### Milestone

The simulator can compare multiple candidate strategies for the same race.

---

# 9. Phase 6 — Strategy Optimization

Create:

```text
src/models/strategy_optimizer.py
```

The optimizer should search over feasible tyre strategies.

Example output:

```text
Strategy       Expected Time    Risk
--------------------------------------
M → H          91:42.3          Low
H → M          91:45.8          Medium
M → M → H      91:48.1          Medium
M → H → M      91:50.7          High
```

### Objective

Do not optimize only for fastest theoretical time.

Use a risk-aware score such as:

```text
strategy_score =
    expected_race_time
    + risk_penalty
    + pit_stop_penalty
```

### Milestone

The optimizer can rank strategies and identify the best risk/reward option.

---

# 10. Phase 7 — Monte Carlo Race Simulation

Add uncertainty to the simulator.

For each strategy:

- [ ] Sample lap-time uncertainty
- [ ] Sample degradation uncertainty
- [ ] Simulate Safety Car scenarios
- [ ] Simulate weather variation
- [ ] Run thousands of scenarios
- [ ] Calculate probability distributions

Example:

```text
M → H

Average race time:       91:42
Top 5 probability:       67%
Podium probability:      31%
Strategy failure risk:    8%
```

### Milestone

The system should provide probabilities and uncertainty rather than a single deterministic prediction.

---

# 11. Phase 8 — Agentic AI Layer

Create four lightweight agents.

## 11.1 Strategy Manager Agent

Responsibilities:

- Understand user request
- Identify required information
- Decide which tools to call
- Coordinate the other agents
- Produce final task context

Example:

```text
User:
"What is the best strategy for Leclerc at Silverstone?"

Agent determines:
- race data required
- tyre degradation required
- weather required
- strategy simulation required
```

---

## 11.2 Race Data Agent

Tools:

```python
get_race_data()
get_driver_data()
get_weather()
get_historical_strategies()
```

Responsibilities:

- Retrieve race context
- Retrieve historical evidence
- Provide structured data to the strategy system

---

## 11.3 Tyre Strategy Agent

Tools:

```python
predict_lap_time()
predict_degradation()
generate_strategies()
simulate_strategy()
```

Responsibilities:

- Analyze tyre behavior
- Generate candidate strategies
- Run simulations
- Compare expected outcomes

---

## 11.4 Race Engineer Agent

Responsibilities:

- Consume simulation results
- Select the strongest recommendation
- Explain the recommendation using available evidence
- Clearly state uncertainty and risks

Example output:

```text
Recommended strategy:
MEDIUM → HARD

Pit window:
Lap 23–26

Expected race time:
91:42.3

Confidence:
78%

Reason:
Medium degradation remains manageable until the
pit window, while Hard provides stronger late-stint
consistency.

Risk:
A late Safety Car could make a two-stop strategy
more attractive.
```

---

# 12. Phase 9 — MCP Server

Create:

```text
src/mcp/server.py
```

Expose analytical capabilities as MCP tools.

### Tools

```text
get_race_data
get_driver_telemetry
get_tyre_stints
get_weather
get_historical_strategy
predict_tyre_degradation
predict_lap_time
simulate_strategy
compare_strategies
```

### Example agent flow

```text
Strategy Manager
       |
       v
MCP: get_race_data()
       |
       v
MCP: predict_tyre_degradation()
       |
       v
MCP: simulate_strategy()
       |
       v
MCP: compare_strategies()
       |
       v
Race Engineer Agent
```

### Milestone

The agent should dynamically choose and invoke MCP tools instead of having all analysis hard-coded into a single prompt.

---

# 13. Phase 10 — Evaluation

Evaluation is a major part of the project.

## ML evaluation

Measure:

- [ ] MAE
- [ ] RMSE
- [ ] Degradation prediction error

## Strategy evaluation

Compare:

```text
predicted strategy
        vs
actual historical strategy
```

Measure:

- [ ] Strategy ranking accuracy
- [ ] Predicted vs actual race time
- [ ] Top-N strategy recall
- [ ] Simulation calibration

## Agent evaluation

Measure:

- [ ] Tool selection accuracy
- [ ] Tool-call success rate
- [ ] Recommendation groundedness
- [ ] Whether recommendations are supported by simulation results
- [ ] Structured output validity

### Milestone

A reproducible evaluation report exists in the repository.

---

# 14. Phase 11 — Streamlit UI

Create:

```text
app/streamlit_app.py
```

### Inputs

```text
Season
Circuit
Driver
Race conditions
```

### Output

```text
🏆 RECOMMENDED STRATEGY

MEDIUM ───────────── HARD
          LAP 24

Expected race time
91:42.3

Podium probability
31%

Confidence
78%
```

Then show:

```text
Why?

• Medium degradation remains manageable
• Hard performs better in the final stint
• One-stop minimizes pit-lane loss
```

### Strategy comparison

Show:

```text
Strategy       Time       Podium %
------------------------------------
M → H          91:42       31%
H → M          91:46       27%
M → M → H      91:48       24%
```

### Agent activity

Show tool activity, not private chain-of-thought:

```text
✓ Loaded race data
✓ Analysed tyre degradation
✓ Generated candidate strategies
✓ Simulated 10,000 scenarios
✓ Compared strategy risk
✓ Generated recommendation
```

---

# 15. Phase 12 — Testing and Engineering

Add unit tests for:

```text
tests/
├── test_data.py
├── test_features.py
├── test_tyre_model.py
├── test_simulator.py
├── test_optimizer.py
├── test_mcp_tools.py
└── test_agents.py
```

Test:

- [ ] Data preprocessing
- [ ] Feature calculations
- [ ] Model predictions
- [ ] Strategy generation
- [ ] Simulation
- [ ] Optimization
- [ ] MCP tool schemas
- [ ] Agent structured outputs

Add GitHub Actions for automated tests.

---

# 16. Final GitHub Demo

The final demo should show this flow:

```text
User:
"Find the best strategy for Leclerc at Silverstone."

                    ↓

            Strategy Manager
                    ↓
          ┌─────────┴─────────┐
          ↓                   ↓
      FastF1 data          ML model
          ↓                   ↓
          └─────────┬─────────┘
                    ↓
          Generate strategies
                    ↓
            10,000 simulations
                    ↓
          Compare risk/reward
                    ↓
          Race Engineer Agent
                    ↓

        MEDIUM → HARD
        Pit: Lap 24
        Confidence: 78%
```

---

# 17. Recommended Build Order

Do **not** build everything simultaneously.

```text
1. Repository
       ↓
2. FastF1 ingestion
       ↓
3. Data preprocessing
       ↓
4. EDA
       ↓
5. Tyre degradation model
       ↓
6. Strategy simulator
       ↓
7. Strategy optimizer
       ↓
8. Monte Carlo simulation
       ↓
9. Agent layer
       ↓
10. MCP server
       ↓
11. Evaluation
       ↓
12. Streamlit UI
       ↓
13. Tests + GitHub Actions
       ↓
14. README + demo
```

---

# 18. MVP Definition

The **minimum successful version** should be able to:

- [ ] Load historical F1 data with FastF1
- [ ] Predict lap time/tyre degradation
- [ ] Generate at least 3 feasible tyre strategies
- [ ] Simulate each strategy
- [ ] Rank strategies
- [ ] Run Monte Carlo simulations
- [ ] Use an LLM agent to orchestrate the analysis
- [ ] Expose core functions through MCP
- [ ] Produce a structured recommendation
- [ ] Display results in Streamlit
- [ ] Have basic tests and evaluation metrics

---

# 19. Stretch Goals

Only after the MVP works:

- [ ] Live race strategy updates
- [ ] Real-time telemetry
- [ ] Dynamic Safety Car probability
- [ ] Driver-specific pace modeling
- [ ] Traffic modeling
- [ ] Weather forecasting
- [ ] Bayesian strategy updates during a race
- [ ] Multi-agent debate between competing strategies
- [ ] Historical strategy RAG
- [ ] Natural-language strategy queries
- [ ] Strategy recommendation API
- [ ] Docker deployment

---

# 20. Portfolio Positioning

### Project title

**PitWall AI — Agentic F1 Race Strategy Engineer**

### One-line description

> An agentic AI system that combines FastF1 telemetry, tyre-degradation ML, Monte Carlo race simulation, MCP tools, and LLM agents to evaluate and recommend optimal F1 tyre strategies.

### What this demonstrates

```text
Python
  +
Machine Learning
  +
LLMs
  +
Agentic AI
  +
MCP
  +
Simulation
  +
Evaluation
  +
Software Engineering
```

The goal is **not** to claim that the AI can perfectly predict an F1 race.

The goal is to demonstrate an engineering pattern:

> **AI agents can reason over specialized analytical tools, evaluate multiple possibilities, quantify uncertainty, and produce an explainable decision.**

---

# 21. Future Enhancement Roadmap

See [FUTURE_ROADMAP.md](./FUTURE_ROADMAP.md) for a prioritized implementation
sequence, phase exit checks, and immediate next sprint. The browser dashboard is
currently a demo with illustrative data; real predictions depend on completing
the data, model, simulation, and evaluation milestones first.
