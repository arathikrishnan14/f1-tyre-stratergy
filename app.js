const circuits = {
  silverstone: { name: "Silverstone", fullName: "British Grand Prix", laps: 52, length: "5.891 km", temp: 24, rain: 12, pitLoss: "22.4", flag: "🇬🇧", time: "1:31:42.3" },
  monza: { name: "Monza", fullName: "Italian Grand Prix", laps: 53, length: "5.793 km", temp: 27, rain: 8, pitLoss: "24.1", flag: "🇮🇹", time: "1:20:18.6" },
  monaco: { name: "Monaco", fullName: "Monaco Grand Prix", laps: 78, length: "3.337 km", temp: 22, rain: 18, pitLoss: "19.8", flag: "🇲🇨", time: "1:47:03.9" },
  spa: { name: "Spa-Francorchamps", fullName: "Belgian Grand Prix", laps: 44, length: "7.004 km", temp: 18, rain: 35, pitLoss: "21.6", flag: "🇧🇪", time: "1:24:51.2" },
  bahrain: { name: "Bahrain", fullName: "Bahrain Grand Prix", laps: 57, length: "5.412 km", temp: 31, rain: 0, pitLoss: "21.2", flag: "🇧🇭", time: "1:33:08.4" }
};

const weatherConditions = {
  dry: { label: "Dry", temp: 0, rain: 0, confidence: 78 },
  hot: { label: "Hot", temp: 8, rain: 0, confidence: 72 },
  mixed: { label: "Changeable", temp: -5, rain: 28, confidence: 64 }
};

const circuitSelect = document.querySelector("#circuit-select");
const driverSelect = document.querySelector("#driver-select");
const seasonSelect = document.querySelector("#season-select");
const weatherSelect = document.querySelector("#weather-select");
const runButton = document.querySelector("#run-button");
const status = document.querySelector("#analysis-status");
const toast = document.querySelector("#toast");
let toastTimer;
let analysisTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateContext() {
  const circuit = circuits[circuitSelect.value];
  const conditions = weatherConditions[weatherSelect.value];
  const firstStint = Math.round(circuit.laps * 0.46);
  const secondStint = circuit.laps - firstStint;
  document.querySelector("#race-subtitle").innerHTML = `${circuit.name} Circuit <span>·</span> ${circuit.laps} laps <span>·</span> ${circuit.length}`;
  document.querySelector("#context-circuit").textContent = circuit.name;
  document.querySelector(".flag").textContent = circuit.flag;
  document.querySelector("#track-temp").innerHTML = `${circuit.temp + conditions.temp}°<small>C</small>`;
  document.querySelector("#rain-chance").innerHTML = `${Math.min(100, circuit.rain + conditions.rain)}<small>%</small>`;
  document.querySelector("#pit-loss").innerHTML = `${circuit.pitLoss}<small>s</small>`;
  document.querySelector(".stint-medium .stint-copy small").textContent = `${firstStint} LAPS`;
  document.querySelector(".stint-hard .stint-copy small").textContent = `${secondStint} LAPS`;
  document.querySelector(".pit-marker b").textContent = String(firstStint);
  document.querySelector(".finish-marker b").textContent = String(circuit.laps);
  document.querySelector(".strategy-timeline").setAttribute("aria-label", `Recommended strategy: medium tyre for ${firstStint} laps, then hard tyre for ${secondStint} laps`);
  const pitWindows = [firstStint, Math.round(circuit.laps * 0.53), `${Math.round(circuit.laps * 0.33)} / ${Math.round(circuit.laps * 0.67)}`, `${Math.round(circuit.laps * 0.25)} / ${Math.round(circuit.laps * 0.65)}`];
  document.querySelectorAll("#strategy-rows tr td:nth-child(3)").forEach((cell, index) => {
    cell.textContent = index < 2 ? `Lap ${pitWindows[index]}` : pitWindows[index];
  });
}

function adjustedRaceTime(baseTime, adjustment = 0) {
  const [hours, minutes, seconds] = baseTime.split(":").map(Number);
  const totalTenths = Math.round((hours * 3600 + minutes * 60 + seconds) * 10 + adjustment * 10);
  const adjustedHours = Math.floor(totalTenths / 36000);
  const adjustedMinutes = Math.floor((totalTenths % 36000) / 600);
  const adjustedSeconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${adjustedHours}:${String(adjustedMinutes).padStart(2, "0")}:${String(adjustedSeconds).padStart(2, "0")}.${tenths}`;
}

function renderStrategyTimes(circuit, adjustment) {
  const deltas = [0, 4.5, 7.8, 15.3];
  document.querySelectorAll("#strategy-rows .table-time").forEach((cell, index) => {
    cell.textContent = adjustedRaceTime(circuit.time, adjustment + deltas[index]);
  });
  const [mainTime, tenths] = adjustedRaceTime(circuit.time, adjustment).split(".");
  document.querySelector("#race-time").innerHTML = `${mainTime}<span>.${tenths}</span>`;
}

function markScenarioChanged() {
  updateContext();
  if (analysisTimer) {
    window.clearTimeout(analysisTimer);
    analysisTimer = undefined;
    runButton.disabled = false;
    runButton.querySelector("span:nth-child(2)").textContent = "Run analysis";
    finishPipeline();
  }
  status.classList.remove("is-running");
  status.querySelector("span:last-child").textContent = "SCENARIO CHANGED";
}

function setPipelineRunning() {
  const steps = [...document.querySelectorAll(".agent-step")];
  steps.forEach((step, index) => {
    step.classList.remove("complete");
    step.querySelector("i").textContent = index === 0 ? "…" : "·";
  });
  document.querySelector(".agent-steps").dataset.running = "true";
  document.querySelector(".agent-steps").querySelectorAll(".agent-step")[0].classList.add("complete");
  document.querySelector(".agent-steps").querySelectorAll(".agent-step")[0].querySelector("i").textContent = "✓";
}

function finishPipeline() {
  document.querySelectorAll(".agent-step").forEach(step => {
    step.classList.add("complete");
    step.querySelector("i").textContent = "✓";
  });
  document.querySelector(".agent-steps").dataset.running = "false";
}

function runAnalysis() {
  const circuit = circuits[circuitSelect.value];
  const conditions = weatherConditions[weatherSelect.value];
  const driverOffset = ["leclerc", "hamilton", "sainz", "norris", "verstappen"].indexOf(driverSelect.value);
  const seasonOffset = 2025 - Number(seasonSelect.value);
  const timeAdjustment = (conditions.temp > 0 ? 2.8 : conditions.rain > 0 ? 5.2 : 0) + driverOffset * 0.3 + seasonOffset * 0.6;

  runButton.disabled = true;
  runButton.querySelector("span:nth-child(2)").textContent = "Simulating…";
  status.classList.add("is-running");
  status.querySelector("span:last-child").textContent = "SIMULATION RUNNING";
  setPipelineRunning();

  analysisTimer = window.setTimeout(() => {
    analysisTimer = undefined;
    renderStrategyTimes(circuit, timeAdjustment);
    document.querySelector("#confidence").innerHTML = `${Math.max(50, conditions.confidence - seasonOffset * 4)}<span class="unit">%</span>`;
    document.querySelector("#agent-steps").querySelectorAll(".agent-step")[2].innerHTML = "<i>✓</i> 3,200 scenarios run";
    finishPipeline();
    runButton.disabled = false;
    runButton.querySelector("span:nth-child(2)").textContent = "Run analysis";
    status.classList.remove("is-running");
    status.querySelector("span:last-child").textContent = "ANALYSIS COMPLETE";
    showToast(`Demo analysis complete for ${driverSelect.options[driverSelect.selectedIndex].text}.`);
  }, 900);
}

circuitSelect.addEventListener("change", markScenarioChanged);
driverSelect.addEventListener("change", markScenarioChanged);
seasonSelect.addEventListener("change", markScenarioChanged);
weatherSelect.addEventListener("change", markScenarioChanged);
runButton.addEventListener("click", runAnalysis);
document.querySelector("#reset-button").addEventListener("click", () => {
  circuitSelect.value = "silverstone";
  driverSelect.value = "leclerc";
  seasonSelect.value = "2025";
  weatherSelect.value = "dry";
  if (analysisTimer) {
    window.clearTimeout(analysisTimer);
    analysisTimer = undefined;
  }
  runButton.disabled = false;
  runButton.querySelector("span:nth-child(2)").textContent = "Run analysis";
  updateContext();
  renderStrategyTimes(circuits.silverstone, 0);
  document.querySelector("#confidence").innerHTML = "78<span class=\"unit\">%</span>";
  status.classList.remove("is-running");
  status.querySelector("span:last-child").textContent = "ANALYSIS READY";
  finishPipeline();
  showToast("Scenario reset to the Silverstone baseline.");
});
document.querySelector("#details-button").addEventListener("click", () => {
  document.querySelector("#comparison").scrollIntoView({ behavior: "smooth", block: "center" });
  showToast("Showing the ranked strategy comparison.");
});
document.querySelector("#all-strategies").addEventListener("click", () => showToast("All four candidate strategies are shown."));
document.querySelector("#sort-button").addEventListener("click", () => showToast("Strategies are ranked by expected time, adjusted for risk."));
document.querySelectorAll(".row-arrow").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("#strategy-rows tr").forEach(row => row.classList.remove("recommended-row"));
    document.querySelectorAll(".row-arrow").forEach(arrow => arrow.classList.remove("selected-arrow"));
    const row = button.closest("tr");
    row.classList.add("recommended-row");
    button.classList.add("selected-arrow");
    showToast(`Selected strategy ${row.querySelector(".table-strategy").innerText.replace(/\s+/g, " ").trim()}.`);
  });
});

updateContext();
