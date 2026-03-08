# Skyfall — Quest App

Skyfall is an interactive campus explorer web application designed to gamify orientation or campus tours. Players head to specific venues on campus, scan QR codes using their device's camera, and unlock missions to earn XP. Administrators can track player progress and issue rewards.

## 🌟 Features

- **QR Code Scanning:** Players can scan physical QR codes placed at venues directly within the app using their device camera (powered by `jsQR`).
- **Gamified Progression:** Visiting venues and completing tasks rewards users with XP, tracking progress via an interactive HUD and progress bar.
- **Interactive Campus Map:** An intuitive block grid lets users see which venues they have visited, completed, or are yet to discover.
- **Admin Dashboard:** Administrators are equipped with a powerful dashboard to:
  - Generate and print printable QR codes for all venues.
  - Set specific tasks/missions for each location.
  - View real-time logs of all registered players, their total XP, and their specific completed venues.
  - Reset all student progress if needed.
- **Secure Authentication & Syncing:** Users create accounts so their progress is securely saved to a backend SQLite database and synced across sessions.
- **PWA Ready:** Includes a `manifest.json` and basic Service Worker layout for progressive web app capabilities.

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Scanning:** [jsQR](https://github.com/cozmo/jsQR) for robust in-browser QR reading.
- **QR Generation:** [qrcodejs](https://davidshimjs.github.io/qrcodejs/) for administrative code generation.
- **Backend:** Node.js with Express
- **Database:** SQLite3 (using `bcrypt` for secure password storage).

## 🛠️ Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd skyfall
   ```

2. **Install dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```
   *(Note: The backend requires `express`, `cors`, `sqlite3`, and `bcrypt`)*

3. **Start the backend server:**
   ```bash
   node server.js
   ```
   The backend will start on `http://localhost:3000` and automatically create the SQLite database (`database.sqlite`).

4. **Launch the frontend:**
   Serve the root folder using a simple static file server. If you have Python installed:
   ```bash
   python -m http.server 8000
   ```
   Or use VS Code Live Server, or NPM `http-server`.

5. **Open in Browser:**
   Navigate to `http://localhost:8000` (or whichever port your static server uses).

## 👑 Administration

To access the Admin Panel, look for the gear icon (⚙️) in the top-right corner of the HUD after the app launches. 



### Sub-tabs in the Admin Panel
1. **Tasks:** Assign descriptive missions to each campus block.
2. **QR Codes:** Print the codes needed to stick onto the physical campus locations.
3. **Users:** A secure log to track the progress of every student, displaying their email, their current XP, and badges showing exactly which venues they have visited.

## 📱 Use Case Scenario

1. **Deployment:** The administrator prints out the QR codes from the Admin Panel and tapes them to specific campus buildings (e.g., Block A, Humanities Block). 
2. **Onboarding:** Students visit the app link on their phones, register an account, and are greeted with a map of locked venues.
3. **Exploration:** Students walk to 'Block A', tap "Scan", allow camera permissions, and pointing their phone at the QR code.
4. **Completion:** The app registers the valid scan, checks them into the venue, and presents them with the mission designed by the administrator. Completing the mission rewards them with XP!
5. **Rewarding:** At the end of the day, administrators log into the "Users" tab to see a complete leaderboard of students and their progress.
