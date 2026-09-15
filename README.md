# ZeroDay — Flood Telemetry & Emergency Evacuation App

A mobile web application for real-time flood telemetry monitoring, disaster response management, and citizen evacuation routing.

Built with **React + Vite + Tailwind CSS v3**.

## 📱 Features

- **Dual-Mode Presentation**:
  - **Desktop View**: Realistic modern smartphone mockup with hardware buttons, dynamic island, status bar, and top presentation controls.
  - **Mobile View**: Automatically adapts to 100% full-screen native edge-to-edge UI on mobile devices or smaller viewports (`<= 520px`).
- **Home / Regional Telemetry**:
  - Regional overview (14 regions, 42 sensors, 5 active alerts).
  - Severity-graded wards (Rampur Ward, Kosi Nagar, Barauni East, Darbhanga Block, etc.).
- **Rampur Ward Telemetry Detail**:
  - 2x2 live telemetry metric cards (Rainfall, Soil Moisture, River Level, Sensor N-014).
  - Curved SVG Precipitation Telemetry graph with danger threshold line and `7D`, `30D`, `90D` span toggles.
  - Basin Sluice live camera feed with interactive hydraulic override modal.
  - Active sensor nodes and recent alert history.
  - Sticky Telemetry Export & Emergency Siren trigger.
- **Alert Control**:
  - Telemetry sensor threshold auto-trigger indicator.
  - Multi-channel alert dispatch: Internet Push, SMS Broadcast, and Offline BLE Mesh Network (with 12-node status grid).
  - Send Manual Broadcast modal with customizable severity, message, and target channels.
- **Evacuation Route**:
  - Interactive SVG route vector map (Safe Route Active, compass, submerged bridge hazard pin, radar origin at Civil Lines, and route to shelter).
  - Detailed shelter cards (Govt. School Rampur, Community Hall Bhelupur, Panchayat Bhawan, PHC).
  - Emergency hotline integration (1077).
- **Community Reports**:
  - Verified neighborhood citizen advisories with left orange accent stripes.
  - Interactive upvoting, comments, and real-time "+ Add a report" modal.
- **Settings & Profile**:
  - Ward representative verification badge (`Tier 1`).
  - Preferences toggles: Language (Hindi/English), SMS alerts, Offline maps, Siren on emergency.
  - Offline Mesh network status banner and app telemetry metadata.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aman10chandra/ZeroDay.git

# Navigate to directory
cd ZeroDay

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Building for Production

```bash
npm run build
```
