# Game Controller Calibrator (GameSir-Friendly)

A lightweight local web app for testing and calibrating Bluetooth/USB game controllers, with a layout tailored for common GameSir mappings.

## Purpose

This project helps you quickly answer:

- Are my sticks drifting left/right/up/down when untouched?
- Are all buttons and triggers working?
- How are my controller inputs mapped in the browser?

It is useful for controller troubleshooting, calibration checks, and verifying button mapping before using a game or emulator.

## What the App Displays

- Left and right stick raw values
- Calibrated stick values (center offset + deadzone)
- Human-readable stick direction labels (for example: `slight left`, `right + up`)
- D-pad (crosspad) state
- Named buttons: `A`, `B`, `X`, `Y`, `Start`, `Select`, `Home`, `Turbo`, `LB`, `LT`, `RT`, `RB`, plus `L3`/`R3`
- Trigger pressure bars for analog `LT`/`RT`
- Raw button index/value table for non-standard mappings
- Raw axis dump for diagnostics

## Requirements

- Windows, macOS, or Linux
- A modern browser with Gamepad API support (Chrome/Edge recommended)
- Python 3.x to run a local static server

## Quick Start

1. Connect your GameSir controller to your computer first (Bluetooth or USB), before opening the app.
2. Open a terminal in this project folder.
3. Start a local server:

```powershell
python -m http.server 8080
```

4. Open the app in your browser:

[http://localhost:8080](http://localhost:8080)

## How To Use

1. Connect your GameSir controller via Bluetooth or USB.
2. Press any button once to let the browser activate gamepad input.
3. Confirm the app shows `Connected` and your controller ID.
4. Leave both sticks untouched and click **Calibrate Stick Center**.
5. Adjust **Deadzone** until tiny idle movement no longer registers.
6. Press each button and move each control to verify behavior:
   - Sticks: full range + center behavior
   - D-pad: up/down/left/right
   - Face buttons: `A/B/X/Y`
   - Shoulder/trigger inputs: `LB/LT/RT/RB`
   - System buttons: `Start`, `Select`, `Home`, `Turbo`

## Calibration Notes

- Calibrate only when sticks are centered and untouched.
- If drift remains after calibration, raise deadzone slightly.
- If movement feels unresponsive, lower deadzone.

## Mapping Notes

Controller mappings can vary by:

- Browser
- Operating system
- Bluetooth mode vs USB mode
- Controller firmware/profile mode

If a named button does not match what you pressed, use the **Raw Button Indices** panel as the source of truth for your current setup.

## Troubleshooting

### Controller not detected

- Connect/power on the controller before launching the app whenever possible.
- Click inside the app tab, then press any controller button.
- If Bluetooth reconnects but still shows no input, click **Rescan Controller**.
- Reconnect controller and refresh the page if needed.
- Try Chrome/Edge if another browser fails.

### `localhost:8080` does not open

- Make sure the Python server command is still running.
- Confirm Python is installed:

```powershell
python --version
```

- Try a different port:

```powershell
python -m http.server 8090
```

Then open [http://localhost:8090](http://localhost:8090).

## Privacy

This app runs fully locally in your browser. No controller data is sent to a backend service.
