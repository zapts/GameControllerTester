const namedButtons = [
  { idx: 0, name: "A" },
  { idx: 1, name: "B" },
  { idx: 2, name: "X" },
  { idx: 3, name: "Y" },
  { idx: 4, name: "LB" },
  { idx: 5, name: "RB" },
  { idx: 6, name: "LT" },
  { idx: 7, name: "RT" },
  { idx: 8, name: "Select" },
  { idx: 9, name: "Start" },
  { idx: 10, name: "L3" },
  { idx: 11, name: "R3" },
  { idx: 12, name: "D-pad Up" },
  { idx: 13, name: "D-pad Down" },
  { idx: 14, name: "D-pad Left" },
  { idx: 15, name: "D-pad Right" },
  { idx: 16, name: "Home" },
  { idx: 17, name: "Turbo" }
];

const els = {
  connectionState: document.getElementById("connectionState"),
  controllerId: document.getElementById("controllerId"),
  mappingType: document.getElementById("mappingType"),
  calibrateBtn: document.getElementById("calibrateBtn"),
  resetCalibrationBtn: document.getElementById("resetCalibrationBtn"),
  deadzoneRange: document.getElementById("deadzoneRange"),
  deadzoneValue: document.getElementById("deadzoneValue"),
  leftRaw: document.getElementById("leftRaw"),
  leftAdjusted: document.getElementById("leftAdjusted"),
  leftDirection: document.getElementById("leftDirection"),
  rightRaw: document.getElementById("rightRaw"),
  rightAdjusted: document.getElementById("rightAdjusted"),
  rightDirection: document.getElementById("rightDirection"),
  leftStickDot: document.getElementById("leftStickDot"),
  rightStickDot: document.getElementById("rightStickDot"),
  ltValue: document.getElementById("ltValue"),
  rtValue: document.getElementById("rtValue"),
  ltBar: document.getElementById("ltBar"),
  rtBar: document.getElementById("rtBar"),
  dpadState: document.getElementById("dpadState"),
  dpadUp: document.getElementById("dpadUp"),
  dpadDown: document.getElementById("dpadDown"),
  dpadLeft: document.getElementById("dpadLeft"),
  dpadRight: document.getElementById("dpadRight"),
  buttonGrid: document.getElementById("buttonGrid"),
  rawButtonGrid: document.getElementById("rawButtonGrid"),
  axesDump: document.getElementById("axesDump")
};

const calibration = {
  leftX: 0,
  leftY: 0,
  rightX: 0,
  rightY: 0
};

let deadzone = Number(els.deadzoneRange.value);
let selectedPadIndex = null;
const namedButtonCells = new Map();

function fmt3(value) {
  return Number(value || 0).toFixed(3);
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function getActiveGamepad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];

  if (selectedPadIndex !== null && pads[selectedPadIndex] && pads[selectedPadIndex].connected) {
    return pads[selectedPadIndex];
  }

  for (let i = 0; i < pads.length; i += 1) {
    if (pads[i] && pads[i].connected) {
      selectedPadIndex = i;
      return pads[i];
    }
  }

  selectedPadIndex = null;
  return null;
}

function applyDeadzone(raw, center) {
  const adjusted = raw - center;
  if (Math.abs(adjusted) < deadzone) {
    return 0;
  }

  const sign = adjusted < 0 ? -1 : 1;
  const scaled = (Math.abs(adjusted) - deadzone) / (1 - deadzone);
  return clamp(scaled * sign, -1, 1);
}

function axisDirection(value, negativeWord, positiveWord) {
  if (value <= -0.65) {
    return negativeWord;
  }
  if (value < -0.2) {
    return `slight ${negativeWord.toLowerCase()}`;
  }
  if (value >= 0.65) {
    return positiveWord;
  }
  if (value > 0.2) {
    return `slight ${positiveWord.toLowerCase()}`;
  }
  return null;
}

function pairDirection(x, y) {
  const parts = [];
  const xDir = axisDirection(x, "Left", "Right");
  const yDir = axisDirection(y, "Up", "Down");

  if (xDir) parts.push(xDir);
  if (yDir) parts.push(yDir);

  return parts.length ? parts.join(" + ") : "Neutral";
}

function updateStickDot(dot, x, y) {
  const radius = 74;
  const px = clamp(x, -1, 1) * radius;
  const py = clamp(y, -1, 1) * radius;
  dot.style.transform = `translate(${px}px, ${py}px)`;
}

function buildButtonGrid() {
  els.buttonGrid.innerHTML = "";
  namedButtonCells.clear();

  namedButtons.forEach(({ idx, name }) => {
    const cell = document.createElement("div");
    cell.className = "button";
    cell.innerHTML = `<span>${name}</span><span class="mono">#${idx}</span>`;
    els.buttonGrid.appendChild(cell);
    namedButtonCells.set(idx, cell);
  });
}

function updateNamedButtons(pad) {
  namedButtons.forEach(({ idx }) => {
    const cell = namedButtonCells.get(idx);
    if (!cell) return;

    const btn = pad.buttons[idx];
    const pressed = Boolean(btn && btn.pressed);

    cell.classList.toggle("on", pressed);
  });
}

function updateRawButtons(pad) {
  els.rawButtonGrid.innerHTML = "";

  pad.buttons.forEach((btn, index) => {
    const cell = document.createElement("div");
    const pressed = Boolean(btn && btn.pressed);
    const value = btn ? btn.value : 0;

    cell.className = `raw-btn${pressed ? " on" : ""}`;
    cell.innerHTML = `<span>#${index}</span><span class="mono">${fmt3(value)}</span>`;
    els.rawButtonGrid.appendChild(cell);
  });
}

function updateDpad(pad) {
  const up = Boolean(pad.buttons[12] && pad.buttons[12].pressed);
  const down = Boolean(pad.buttons[13] && pad.buttons[13].pressed);
  const left = Boolean(pad.buttons[14] && pad.buttons[14].pressed);
  const right = Boolean(pad.buttons[15] && pad.buttons[15].pressed);

  els.dpadUp.classList.toggle("on", up);
  els.dpadDown.classList.toggle("on", down);
  els.dpadLeft.classList.toggle("on", left);
  els.dpadRight.classList.toggle("on", right);

  const labels = [];
  if (up) labels.push("Up");
  if (down) labels.push("Down");
  if (left) labels.push("Left");
  if (right) labels.push("Right");

  els.dpadState.textContent = labels.length ? labels.join(" + ") : "Neutral";
}

function updateAxesDump(pad) {
  const lines = pad.axes.map((v, i) => `Axis ${i}: ${fmt3(v)}`);
  els.axesDump.textContent = lines.join("\n");
}

function updateTriggers(pad) {
  const lt = pad.buttons[6] ? pad.buttons[6].value : 0;
  const rt = pad.buttons[7] ? pad.buttons[7].value : 0;

  els.ltValue.textContent = fmt3(lt);
  els.rtValue.textContent = fmt3(rt);
  els.ltBar.style.width = `${clamp(lt, 0, 1) * 100}%`;
  els.rtBar.style.width = `${clamp(rt, 0, 1) * 100}%`;
}

function resetView() {
  els.connectionState.textContent = "No controller detected";
  els.connectionState.classList.remove("good");
  els.connectionState.classList.add("bad");
  els.controllerId.textContent = "-";
  els.mappingType.textContent = "-";

  els.leftRaw.textContent = "0.000 / 0.000";
  els.leftAdjusted.textContent = "0.000 / 0.000";
  els.leftDirection.textContent = "Neutral";
  updateStickDot(els.leftStickDot, 0, 0);

  els.rightRaw.textContent = "0.000 / 0.000";
  els.rightAdjusted.textContent = "0.000 / 0.000";
  els.rightDirection.textContent = "Neutral";
  updateStickDot(els.rightStickDot, 0, 0);

  els.ltValue.textContent = "0.000";
  els.rtValue.textContent = "0.000";
  els.ltBar.style.width = "0%";
  els.rtBar.style.width = "0%";

  els.dpadState.textContent = "Neutral";
  els.dpadUp.classList.remove("on");
  els.dpadDown.classList.remove("on");
  els.dpadLeft.classList.remove("on");
  els.dpadRight.classList.remove("on");

  namedButtonCells.forEach((cell) => cell.classList.remove("on"));
  els.rawButtonGrid.innerHTML = "";
  els.axesDump.textContent = "";
}

function update() {
  const pad = getActiveGamepad();

  if (!pad) {
    resetView();
    requestAnimationFrame(update);
    return;
  }

  els.connectionState.textContent = `Connected (index ${pad.index})`;
  els.connectionState.classList.remove("bad");
  els.connectionState.classList.add("good");
  els.controllerId.textContent = pad.id || "Unknown";
  els.mappingType.textContent = pad.mapping || "non-standard";

  const lx = pad.axes[0] || 0;
  const ly = pad.axes[1] || 0;
  const rx = pad.axes[2] || 0;
  const ry = pad.axes[3] || 0;

  const leftAdjX = applyDeadzone(lx, calibration.leftX);
  const leftAdjY = applyDeadzone(ly, calibration.leftY);
  const rightAdjX = applyDeadzone(rx, calibration.rightX);
  const rightAdjY = applyDeadzone(ry, calibration.rightY);

  els.leftRaw.textContent = `${fmt3(lx)} / ${fmt3(ly)}`;
  els.leftAdjusted.textContent = `${fmt3(leftAdjX)} / ${fmt3(leftAdjY)}`;
  els.leftDirection.textContent = pairDirection(leftAdjX, leftAdjY);
  updateStickDot(els.leftStickDot, leftAdjX, leftAdjY);

  els.rightRaw.textContent = `${fmt3(rx)} / ${fmt3(ry)}`;
  els.rightAdjusted.textContent = `${fmt3(rightAdjX)} / ${fmt3(rightAdjY)}`;
  els.rightDirection.textContent = pairDirection(rightAdjX, rightAdjY);
  updateStickDot(els.rightStickDot, rightAdjX, rightAdjY);

  updateTriggers(pad);
  updateDpad(pad);
  updateNamedButtons(pad);
  updateRawButtons(pad);
  updateAxesDump(pad);

  requestAnimationFrame(update);
}

els.calibrateBtn.addEventListener("click", () => {
  const pad = getActiveGamepad();
  if (!pad) {
    return;
  }

  calibration.leftX = pad.axes[0] || 0;
  calibration.leftY = pad.axes[1] || 0;
  calibration.rightX = pad.axes[2] || 0;
  calibration.rightY = pad.axes[3] || 0;
});

els.resetCalibrationBtn.addEventListener("click", () => {
  calibration.leftX = 0;
  calibration.leftY = 0;
  calibration.rightX = 0;
  calibration.rightY = 0;
});

els.deadzoneRange.addEventListener("input", (event) => {
  deadzone = Number(event.target.value);
  els.deadzoneValue.textContent = deadzone.toFixed(2);
});

window.addEventListener("gamepadconnected", (event) => {
  selectedPadIndex = event.gamepad.index;
});

window.addEventListener("gamepaddisconnected", (event) => {
  if (selectedPadIndex === event.gamepad.index) {
    selectedPadIndex = null;
  }
});

buildButtonGrid();
update();
