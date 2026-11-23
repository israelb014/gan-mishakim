@echo off
rem Opens "Gan Mishakim" full-screen in Microsoft Edge kiosk mode.
rem Exit kiosk mode with Alt+F4.
set "URL=https://israelb014.github.io/gan-mishakim/"
start "" msedge --kiosk "%URL%" --edge-kiosk-type=fullscreen --no-first-run --autoplay-policy=no-user-gesture-required
