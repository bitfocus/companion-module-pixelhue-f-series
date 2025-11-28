# companion-module-pixelhue-fseries-switcher

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

This module will allow you to control the following Pixelhue products: F8, F4, F4 Lite.

**Supported Device Versions:**

- F4: V2.4.2.0.STD
- F8: V2.4.2.0.STD
- F4 Lite: V3.2.4.0.STD

## File Structure

```
.
├── companion
│   ├── HELP.md                'Help' document for user, used within Companion.
│   └── manifest.json          Provides information to Companion about this module.
├── doc
│   └── ControlProtocol.md     Device Control Protocol
├── LICENSE
├── package.json               Standard node.js file
├── README.md
└── src                      - Module Source Code
    ├── actions.js             the "commands" being executed button pushed.
    ├── main.js                The main execution script for this module
    └── presets.js             Description of ready-made buttons

```

## Changelog

### V1.0.0

- **Device Support**: F4, F4 Lite, and F8 switcher devices
- **Basic Operations**: Take and Cut switching
- **Advanced Features**: FTB (Fade to Black), Freeze, and Preset management (up to 240 presets)
- **Preset Destination**: Load presets to PVW (Preview) or PGM (Program)
- **Feedbacks**: FTB status, Freeze status, and PGM destination detection
- **Network**: TCP (port 5400) and UDP (port 3800) communication with auto-reconnect
- **Heartbeat**: Automatic connection monitoring every 10 seconds
- **Presets**: Auto-generated preset buttons based on device model
- **UI**: IP address validation and connection status display
