# ZeroDay — Himalayan Disaster Early-Warning Console
> **SIH26192 · Team Nemo**  
> Operational early-warning and disaster-response admin console for Himalayan hill districts (Uttarakhand / Himachal Pradesh). Built for district disaster officers under stress and time pressure in emergency control rooms.

---

## 🏔 Design Identity: "Dawn Over the Valley"

ZeroDay is engineered to feel like a calm, precision instrument (Linear, Arc, Apple Weather, Vercel dashboard) rather than a hackathon template or generic dashboard.

- **Theme Palette**:
  - `Base`: `#0A0F13` (pre-dawn slate)
  - `Surface`: `#10161B`
  - `Raised`: `#161E25`
  - `Borders`: `rgba(255, 255, 255, 0.07)` hairline
  - `Text`: `#EAF0F3` (primary) / `#93A1AC` (muted) / `#5E6C77` (dim)
  - `Accent`: Glacier Teal `#5CC8BE` (primary actions, focus rings, active nav)
- **Strict Severity Semantics**:
  - Saturated color is **strictly reserved for risk states**, never decoration.
  - Normal: `#4CB782`
  - Advisory: `#D9B44A`
  - Warning: `#E8843A`
  - Critical: `#E5484D`
- **Typography**:
  - `Geist Sans` for human labels, titles, and explanations.
  - `Geist Mono` for numbers, coordinates, timestamps, and sensor IDs (tabular nums).
  - Hero numbers: 40px to 56px light weight (`font-light`).
- **The Three Rules**:
  1. **Less on screen**: 1 focal point per screen, max 3 supporting elements at rest. Everything else in drawers or modals.
  2. **Whitespace is a feature**: 24–32px panel padding, 48px+ section margins.
  3. **Calm by default, loud only when it matters**: UI remains tranquil until a sector breaches threshold, activating a 36px Incident Mode top strip and priority queue elevation.

---

## 🖥 Screen Inventory (0 through 9)

| Screen | Title | Focal Point | Key Capabilities |
|---|---|---|---|
| **0** | **Login** | Valley Atmosphere | Full-screen `hero-valley.webp` with Ken Burns drift, dark scrim, 380px panel, Government SSO link, live telemetry status pill. |
| **1** | **Overview** | Full-Bleed Map | `terrain-dark.webp` relief hillshade, top-left headline stat, right priority list (max 5 rows), minimal layer switcher, drawer drill-down, "View as table" mode. |
| **2** | **Region Detail** | River Level Story | Rampur Basin 4B, 7D/30D/90D precipitation chart, 50 mm/hr threshold, animated wave vertical gauge, CCTV weir stream, Sluice Override dialog with typed confirmation. |
| **3** | **Sensor Telemetry** | 3D Enclosure | Interactive 3D MPU-6050 sensor enclosure (Three.js + isometric fallback), axis gizmo, Gyro/Accel/Temp readouts, horizontal displacement velocity bar, "Simulate tremor" trigger. |
| **4** | **AI Risk Engine** | The Decision | Big decision directive ("Mandatory evacuation recommended"), 4-step ladder track with confidence metric, 4-stage pipeline with SHAP contribution bars, scenario stress-test sliders. |
| **5** | **Gateway & Mesh** | Multi-hop Mesh | Dual-tab view: LoRA base station telemetry map & metrics; Offline BLE mesh hop diagram with multi-hop packet broadcast simulation and receipt log. |
| **6** | **Evacuation Planner** | Evacuation Corridor | Marching dashed escape route, 36° steep slope hazard hatch, submerged Rampur Bridge marker, floating single-line route card, shelters drawer, typed `EVACUATE` dispatch modal. |
| **7** | **Alert Control** | Compose Flow | Automatic vs. Manual override modes, 3 understated channel status rows (Push, SMS, Mesh), transmission log table with drawer inspector, 3-step compose modal. |
| **8** | **Community Reports** | Incident Map & Pins | Split map & slim left incident queue, photo previews (`landslide-scar.webp`), right verification drawer with supervisor actions (Verify, Escalate, Dismiss), "+ Add report" dialog. |
| **9** | **Settings & Audit** | Clean Sub-nav | Text-only left sub-nav (7 sections), team roles table, permissions matrix, full English/Hindi UI localization, virtualized audit log with CSV export. |

---

## 🧩 Component Library Architecture

Located in `src/components/ui/` and `src/components/common/`:

- **`Button.tsx`**: Glacier teal primary, ghost, outline, and destructive variants with 150ms press-down micro-animations.
- **`Panel.tsx`**: 8px radius panel with 1px hairline border, optional header, and generous padding.
- **`Stat.tsx`**: Hero number display with odometer count-up and sentence-case micro-labels.
- **`SeverityDot.tsx`**: 4-step severity dot with animated soft-pulse ring on Critical/Warning.
- **`Drawer.tsx`**: Smooth slide-over drawer from right (300ms spring damping), keyboard `ESC` dismiss, sits cleanly under top bar.
- **`Modal.tsx`**: Accessible Radix/standard modal with backdrop blur and typed confirmation support.
- **`Toast.tsx`**: Non-intrusive alert notification system with 10-second "Undo/Recall" actions.
- **`DataTable.tsx`**: Keyboard-navigable, virtualized tabular data display with sorting and filtering.
- **`Gauge.tsx`**: Animated vertical river datum gauge with wave-fill and danger threshold breach transition.
- **`Sensor3DCanvas.tsx`**: Three.js WebGL canvas with high-precision isometric fallback for headless/low-power environments.

---

## 🔌 Mock-to-Real API Swap Points

All mock data layers are structured behind clean service interfaces and IndexedDB persistence so production backends can be connected without altering UI components:

### 1. Realtime Telemetry WebSocket (`src/services/realtime.ts`)
```typescript
// Replace simulated generator with live WebSocket:
export class ProductionWebSocketClient implements RealtimeService {
  connect(url = 'wss://telemetry.zeroday.gov.in/v1/stream') {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      const packet = JSON.parse(event.data);
      useStore.getState().updateTelemetry(packet);
    };
  }
}
```

### 2. IndexedDB Offline Database (`src/services/db.ts`)
- Database: `zeroday_db` (Version 1)
- Object stores:
  - `wards`: Geographic boundaries, risk levels, and hydrological datums.
  - `sensors`: MPU-6050 inclinometer and weir stream telemetry.
  - `shelters`: Relief shelters with capacity and elevation.
  - `alerts`: Broadcast logs and channel dispatch states.
  - `reports`: Crowdsourced citizen incident reports.
  - `audit`: Append-only log of operator actions.

### 3. Sluice Gate Actuation & Emergency Broadcast
- **Sluice Override**: Swap `handleApplyOverride` in `RegionDetailScreen.tsx` with `POST /api/v1/actuators/sluice/override`.
- **SDRF SMS & Push Broadcast**: Swap `handleSendAlert` in `AlertControlScreen.tsx` with `POST /api/v1/broadcast/dispatch`.
- **BLE Mesh Uplink**: Swap `simulatePacketHop` in `GatewayMeshScreen.tsx` with ESP-NOW/LoRA gateway bridge daemon.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Action / Capability | Super Admin | District Officer | Ward Representative | Viewer |
|---|:---:|:---:|:---:|:---:|
| View Telemetry & Maps | ✅ | ✅ | ✅ | ✅ |
| Search & Command Palette (Cmd+K) | ✅ | ✅ | ✅ | ✅ |
| Run AI Assessment & Stress Tests | ✅ | ✅ | ✅ | ❌ |
| Submit Community Report | ✅ | ✅ | ✅ | ✅ |
| Verify Community Report | ✅ | ✅ | ❌ | ❌ |
| Override Sluice Gates | ✅ | ✅ (Audit logged) | ❌ | ❌ |
| Dispatch Evacuation Corridor | ✅ | ✅ (Typed confirm) | ❌ | ❌ |
| Broadcast Multi-channel Alert | ✅ | ✅ (Typed confirm) | ❌ | ❌ |
| Modify System Settings & Team | ✅ | ❌ | ❌ | ❌ |
| Export Audit Telemetry CSV | ✅ | ✅ | ❌ | ❌ |

---

## 🛠 Local Setup & Run Instructions

### Prerequisites
- Node.js 18.x or 20.x+
- npm 9.x+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Aman10chandra/ZeroDay.git
cd ZeroDay

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Key Shortcuts:
- `⌘K` or `Ctrl+K`: Open Command Palette to jump to any region, sensor, shelter, or operational action.
- `?`: Open Keyboard shortcuts cheat-sheet.
- Direct URL Screen Parameter for Testing: `http://localhost:5173/?screen=risk_engine` (e.g. `overview`, `region_detail`, `sensors_mpu`, `risk_engine`, `gateway_mesh`, `evacuation`, `alerts`, `reports`, `settings`).

### Production Build
```bash
npm run build
```
Build output is saved to `dist/` and can be served statically with Nginx, Cloudflare Pages, or AWS S3/CloudFront.
