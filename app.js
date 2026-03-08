/* ==========================================
   SKYFALL — Campus Explorer | app.js
   Full game logic, state, and UI
   ========================================== */

'use strict';

// ==========================================
// CAMPUS BLOCKS CONFIG
// ==========================================
const BLOCKS = [
    { id: 'A', name: 'Admin block', icon: '🏛️', xpReward: 50 },
    { id: 'B', name: 'Humanities block', icon: '📚', xpReward: 50 },
    { id: 'C', name: 'Main block', icon: '🏫', xpReward: 50 },
    { id: 'D', name: 'Green park', icon: '🌳', xpReward: 50 },
    { id: 'E', name: 'Chavra Square', icon: '⛲', xpReward: 50 },
];

const XP_PER_LEVEL = 400; // total XP for full bar
const ADMIN_PASSWORD = 'skyfall';
const STORAGE_KEY = 'skyfall_state';

// ==========================================
// STATE
// ==========================================
let state = {
    playerEmail: '',
    isAdmin: false,
    xp: 0,
    venues: {}, // id -> { visited, completed, task }
};

// ==========================================
// API BASE URL
// ==========================================
// Calculate backend URL
const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname === '';
const API_BASE = isLocal
    ? `http://${hostname || 'localhost'}:3000`
    : 'https://skyfall-backend.onrender.com';

function loadState() {
    // Make sure all venues exist in state
    BLOCKS.forEach(b => {
        if (!state.venues[b.id]) {
            state.venues[b.id] = { visited: false, completed: false, task: '' };
        }
    });

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            state = { ...state, ...parsed };
            // Auto-migrate old 'playerName' to 'playerEmail' if available to fix login caching issues
            if (parsed.playerName && !parsed.playerEmail) {
                state.playerEmail = parsed.playerName + "@student.edu";
            }
        }
    } catch (e) { }
}

function saveState() {
    // Save locally for offline use
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Sync to real SQLite Backend if logged in (not mock admin)
    if (state.playerEmail && !state.isAdmin) {
        fetch(`${API_BASE}/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: state.playerEmail,
                xp: state.xp,
                venues: state.venues
            })
        }).catch(err => console.log('Offline: Sync delayed.'));
    }
}

// ==========================================
// STAR FIELD
// ==========================================
function createStars() {
    const container = document.getElementById('stars');
    const count = 60;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.5 + 0.8;
        star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 60}%;
      left: ${Math.random() * 100}%;
      --dur: ${(Math.random() * 3 + 2).toFixed(1)}s;
      --max-op: ${(Math.random() * 0.55 + 0.25).toFixed(2)};
      animation-delay: ${(Math.random() * 4).toFixed(1)}s;
    `;
        container.appendChild(star);
    }
}

// ==========================================
// HUD UPDATES
// ==========================================
function updateHUD() {
    const pct = Math.min((state.xp / XP_PER_LEVEL) * 100, 100);

    // Display name from email (e.g. "alex@test.com" -> "alex")
    const displayName = state.playerEmail ? state.playerEmail.split('@')[0] : 'Explorer';

    document.getElementById('hud-name').textContent = displayName;
    document.getElementById('xp-bar').style.width = pct + '%';
    document.getElementById('xp-label').textContent = state.xp + ' XP';

    const completed = BLOCKS.filter(b => state.venues[b.id]?.completed).length;
    document.getElementById('badge-count').textContent = `${completed}/${BLOCKS.length}`;

    // Render avatar initial
    const initial = displayName.charAt(0).toUpperCase() || '🧑';
    document.getElementById('hud-avatar').textContent = initial;
}

// ==========================================
// MAP SCREEN
// ==========================================
function renderMap() {
    const map = document.getElementById('campus-map');
    map.innerHTML = '';
    BLOCKS.forEach(venue => {
        const bs = state.venues[venue.id] || {};
        const el = document.createElement('div');
        const cls = bs.completed ? 'completed' : bs.visited ? 'visited' : '';
        el.className = `venue-marker ${cls}`;
        el.id = `marker-${venue.id}`;
        el.innerHTML = `
      <div class="venue-pulse"></div>
      <div class="venue-icon">${venue.icon}</div>
      <div class="venue-name">${venue.name}</div>
      <div class="venue-status-dot"></div>
    `;
        el.addEventListener('click', () => openBlockPanel(venue.id));
        map.appendChild(el);
    });
}

// ==========================================
// PROGRESS SCREEN
// ==========================================
function renderProgress() {
    const grid = document.getElementById('progress-grid');
    const trophies = document.getElementById('trophy-row');
    const totalXp = document.getElementById('total-xp-display');
    const fill = document.getElementById('xp-full-fill');

    grid.innerHTML = '';
    trophies.innerHTML = '';

    BLOCKS.forEach(venue => {
        const bs = state.venues[venue.id] || {};
        const cls = bs.completed ? 'completed' : bs.visited ? 'visited' : '';
        const stateLabel = bs.completed ? 'Completed' : bs.visited ? 'Visited' : 'Not Visited';
        const check = bs.completed ? '✅' : bs.visited ? '👁' : '⬜';
        const card = document.createElement('div');
        card.className = `progress-card ${cls}`;
        card.innerHTML = `
      <div class="pc-top">
        <span class="pc-icon">${venue.icon}</span>
        <span class="pc-check">${check}</span>
      </div>
      <div class="pc-name">${venue.name}</div>
      <div class="pc-state ${cls}">${stateLabel}</div>
    `;
        grid.appendChild(card);

        if (bs.completed) {
            const trophy = document.createElement('span');
            trophy.className = 'trophy-badge';
            trophy.textContent = venue.icon;
            trophies.appendChild(trophy);
        }
    });

    totalXp.textContent = state.xp;
    const pct = Math.min((state.xp / XP_PER_LEVEL) * 100, 100);
    fill.style.width = pct + '%';
}

// ==========================================
// BLOCK DETAIL PANEL
// ==========================================
let currentBlockId = null;

function openBlockPanel(venueId) {
    const venue = BLOCKS.find(b => b.id === venueId);
    if (!venue) return;
    const bs = state.venues[venueId] || {};
    currentBlockId = venueId;

    // Header
    document.getElementById('panel-icon').textContent = venue.icon;
    document.getElementById('panel-name').textContent = venue.name;

    const badge = document.getElementById('panel-badge');
    badge.textContent = bs.completed ? 'Completed' : bs.visited ? 'Visited' : 'Not Visited';
    badge.className = 'panel-status-badge ' + (bs.completed ? 'completed' : bs.visited ? 'visited' : '');

    // Task
    const taskText = bs.task || 'Task will be assigned soon. Stay tuned! 🌅';
    document.getElementById('panel-task').textContent = taskText;

    // XP reward
    document.getElementById('panel-xp-reward').textContent = `+${venue.xpReward} XP`;

    // Check-in status
    document.getElementById('panel-checkin-status').textContent = bs.visited ? 'Yes ✓' : 'No';

    // Buttons
    const btnCheckin = document.getElementById('btn-checkin');
    const btnComplete = document.getElementById('btn-complete');
    const banner = document.getElementById('completed-banner');

    if (bs.completed) {
        btnCheckin.classList.add('hidden');
        btnComplete.classList.add('hidden');
        banner.classList.remove('hidden');
    } else if (bs.visited) {
        btnCheckin.classList.add('hidden');
        btnComplete.classList.remove('hidden');
        banner.classList.add('hidden');
    } else {
        btnCheckin.classList.remove('hidden');
        btnComplete.classList.add('hidden');
        banner.classList.add('hidden');
    }

    // Show panel
    document.getElementById('venue-overlay').classList.remove('hidden');
    document.getElementById('venue-panel').classList.remove('hidden');
}

function closeBlockPanel() {
    document.getElementById('venue-overlay').classList.add('hidden');
    document.getElementById('venue-panel').classList.add('hidden');
    currentBlockId = null;
}

// Check in
document.getElementById('btn-checkin')?.addEventListener('click', () => {
    if (!currentBlockId) return;
    state.venues[currentBlockId].visited = true;
    saveState();

    // Refresh panel
    const venue = BLOCKS.find(b => b.id === currentBlockId);
    const bs = state.venues[currentBlockId];
    const badge = document.getElementById('panel-badge');
    badge.textContent = 'Visited';
    badge.className = 'panel-status-badge visited';
    document.getElementById('panel-checkin-status').textContent = 'Yes ✓';
    document.getElementById('btn-checkin').classList.add('hidden');
    document.getElementById('btn-complete').classList.remove('hidden');

    // Update marker
    const marker = document.getElementById(`marker-${currentBlockId}`);
    if (marker) { marker.className = 'venue-marker visited'; }

    updateHUD();
    showToast('📍 Checked In!');
});

// Complete task
document.getElementById('btn-complete')?.addEventListener('click', () => {
    if (!currentBlockId) return;
    const venue = BLOCKS.find(b => b.id === currentBlockId);
    const bs = state.venues[currentBlockId];
    if (!bs.visited) return;

    state.venues[currentBlockId].completed = true;
    state.xp += venue.xpReward;
    saveState();

    // Refresh panel
    const badge = document.getElementById('panel-badge');
    badge.textContent = 'Completed';
    badge.className = 'panel-status-badge completed';
    document.getElementById('btn-complete').classList.add('hidden');
    document.getElementById('completed-banner').classList.remove('hidden');

    // Update marker
    const marker = document.getElementById(`marker-${currentBlockId}`);
    if (marker) { marker.className = 'venue-marker completed'; }

    updateHUD();
    showXpToast(venue.xpReward);
});

// Close panel
document.getElementById('btn-panel-close')?.addEventListener('click', closeBlockPanel);
document.getElementById('venue-overlay')?.addEventListener('click', closeBlockPanel);

// ==========================================
// INLINE SCANNER LOGIC
// ==========================================
let scanning = false;
let scanTimer = null;
const video = document.getElementById('qr-video');
const canvasElement = document.getElementById('qr-canvas');
const canvas = canvasElement.getContext('2d');
const scanResultText = document.getElementById('scan-result-text');
const scanResultContainer = document.getElementById('scan-result');

function startScanner() {
    const btn = document.getElementById('btn-start-scan');
    const hint = document.getElementById('scanner-main-hint');

    if (scanning) return; // already running

    hint.textContent = 'Starting camera…';
    if (btn) btn.classList.add('hidden');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (stream) {
            scanning = true;
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            hint.textContent = 'Point at a venue QR code to unlock your mission!';
            requestAnimationFrame(tick);
        })
        .catch(function (err) {
            console.error('Camera error:', err);
            hint.textContent = '⚠️ Camera access denied. Please allow camera in your browser settings.';
            if (btn) { btn.classList.remove('hidden'); btn.textContent = '📷 Try Again'; }
        });
}

function stopScanner() {
    scanning = false;
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }
}

function tick() {
    if (!scanning) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
            if (code) {
                handleScanSuccess(code.data);
                return;
            }
        }
    }
    scanTimer = requestAnimationFrame(tick);
}

function handleScanSuccess(data) {
    if (data.startsWith('SKYFALL_BLOCK_')) {
        const venueId = data.replace('SKYFALL_BLOCK_', '');
        const venue = BLOCKS.find(b => b.id === venueId);
        if (venue) {
            scanning = false;
            scanResultText.textContent = `✅ Found: ${venue.name}!`;
            scanResultContainer.classList.remove('hidden');

            if (!state.venues[venueId].visited) {
                state.venues[venueId].visited = true;
                saveState();
                updateHUD();
                showToast(`📍 Checked into ${venue.name}!`);
            }

            setTimeout(() => {
                scanResultContainer.classList.add('hidden');
                openBlockPanel(venueId);
                // Resume scanning after panel closes
            }, 1500);
            return;
        }
    }
    scanResultText.textContent = '❌ Invalid QR Code. Try another.';
    scanResultContainer.classList.remove('hidden');
    setTimeout(() => {
        scanResultContainer.classList.add('hidden');
        if (scanning) requestAnimationFrame(tick);
    }, 2000);
}

// Start scan button
document.getElementById('btn-start-scan')?.addEventListener('click', startScanner);

// Also resume scanning when venue panel closes
document.getElementById('btn-panel-close')?.addEventListener('click', () => {
    closeBlockPanel();
    setTimeout(() => { scanning = true; requestAnimationFrame(tick); }, 300);
});
document.getElementById('venue-overlay')?.addEventListener('click', () => {
    closeBlockPanel();
    setTimeout(() => { scanning = true; requestAnimationFrame(tick); }, 300);
});

// ==========================================
// SCREEN NAVIGATION
// ==========================================
function switchScreen(name) {
    document.getElementById('screen-scan').classList.toggle('hidden', name !== 'scan');
    document.getElementById('screen-progress').classList.toggle('hidden', name !== 'progress');

    document.getElementById('nav-scan-tab').classList.toggle('active', name === 'scan');
    document.getElementById('nav-progress').classList.toggle('active', name === 'progress');

    if (name === 'scan') {
        if (!scanning) startScanner();
    } else {
        stopScanner();
    }
    if (name === 'progress') renderProgress();
}

document.getElementById('nav-scan-tab').addEventListener('click', () => switchScreen('scan'));
document.getElementById('nav-progress').addEventListener('click', () => switchScreen('progress'));

// ==========================================
// ADMIN PANEL
// ==========================================
document.getElementById('btn-admin-open').addEventListener('click', () => {
    document.getElementById('admin-overlay').classList.remove('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');

    // Auto-bypass if user logged in as Admin
    if (state.isAdmin) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-tasks').classList.remove('hidden');
        renderAdminTasks();
    } else {
        // Reset to login view
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('admin-tasks').classList.add('hidden');
        document.getElementById('admin-pass').value = '';
        document.getElementById('admin-error').classList.add('hidden');
    }
});

function closeAdmin() {
    document.getElementById('admin-overlay').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}

document.getElementById('btn-admin-close').addEventListener('click', closeAdmin);
document.getElementById('admin-overlay').addEventListener('click', closeAdmin);

document.getElementById('btn-admin-login').addEventListener('click', () => {
    const pass = document.getElementById('admin-pass').value.trim();
    if (pass === ADMIN_PASSWORD) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-tasks').classList.remove('hidden');
        renderAdminTasks();
    } else {
        document.getElementById('admin-error').classList.remove('hidden');
    }
});

// Allow Enter key for admin login
document.getElementById('admin-pass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-admin-login').click();
});

function renderAdminTasks() {
    const list = document.getElementById('admin-task-list');
    list.innerHTML = '';
    BLOCKS.forEach(venue => {
        const bs = state.venues[venue.id] || {};
        const item = document.createElement('div');
        item.className = 'admin-task-item';
        item.innerHTML = `
      <label><span>${venue.icon}</span> ${venue.name}</label>
      <textarea id="admin-task-${venue.id}" placeholder="Enter task for ${venue.name}…">${bs.task || ''}</textarea>
    `;
        list.appendChild(item);
    });
}

document.getElementById('tab-tasks-btn').addEventListener('click', () => {
    document.getElementById('tab-tasks-btn').classList.add('active');
    document.getElementById('tab-qr-btn').classList.remove('active');
    document.getElementById('tab-users-btn').classList.remove('active');
    document.getElementById('tab-tasks').classList.remove('hidden');
    document.getElementById('tab-qr').classList.add('hidden');
    document.getElementById('tab-users').classList.add('hidden');
});

document.getElementById('tab-qr-btn').addEventListener('click', () => {
    document.getElementById('tab-qr-btn').classList.add('active');
    document.getElementById('tab-tasks-btn').classList.remove('active');
    document.getElementById('tab-users-btn').classList.remove('active');
    document.getElementById('tab-qr').classList.remove('hidden');
    document.getElementById('tab-tasks').classList.add('hidden');
    document.getElementById('tab-users').classList.add('hidden');
    renderQRCodes();
});

document.getElementById('tab-users-btn').addEventListener('click', () => {
    document.getElementById('tab-users-btn').classList.add('active');
    document.getElementById('tab-tasks-btn').classList.remove('active');
    document.getElementById('tab-qr-btn').classList.remove('active');
    document.getElementById('tab-users').classList.remove('hidden');
    document.getElementById('tab-tasks').classList.add('hidden');
    document.getElementById('tab-qr').classList.add('hidden');
    fetchAdminUsers();
});

document.getElementById('btn-refresh-users').addEventListener('click', fetchAdminUsers);

async function fetchAdminUsers() {
    const list = document.getElementById('admin-users-list');
    list.innerHTML = '<div class="admin-user-loading">Loading players...</div>';

    try {
        const res = await fetch(`${API_BASE}/api/admin/users?pwd=${ADMIN_PASSWORD}`);
        const data = await res.json();

        if (res.ok && data.users) {
            renderAdminUsers(data.users);
        } else {
            list.innerHTML = `<div class="admin-user-loading">Failed to load: ${(data && data.error) || 'Unknown error'}</div>`;
        }
    } catch (err) {
        console.error('Fetch players error:', err);
        list.innerHTML = `<div class="admin-user-loading">Error loading players: ${err.message || 'Network disconnected'}</div>`;
    }
}

function renderAdminUsers(users) {
    const list = document.getElementById('admin-users-list');
    list.innerHTML = '';

    if (users.length === 0) {
        list.innerHTML = '<div class="admin-user-loading">No players found yet.</div>';
        return;
    }

    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'admin-user-item';

        // Map venue IDs to nice names/icons if they have completed venues
        let venueHtml = '';
        if (user.venues && user.venues.length > 0) {
            venueHtml = '<div class="admin-user-venues">';
            user.venues.forEach(vid => {
                const b = BLOCKS.find(block => block.id === vid);
                if (b) venueHtml += `<span class="admin-venue-badge">${b.icon} ${b.name}</span>`;
            });
            venueHtml += '</div>';
        } else {
            venueHtml = '<div class="admin-user-progress">No venues completed</div>';
        }

        item.innerHTML = `
            <div class="admin-user-top">
                <span class="admin-user-email">${user.email}</span>
                <span class="admin-user-xp">${user.xp} XP</span>
            </div>
            ${venueHtml}
        `;
        list.appendChild(item);
    });
}

function renderQRCodes() {
    const grid = document.getElementById('qr-codes-grid');
    if (grid.children.length > 0) return; // Already rendered

    BLOCKS.forEach(venue => {
        const wrap = document.createElement('div');
        wrap.className = 'admin-qr-item';
        wrap.innerHTML = `
            <h4>${venue.icon} ${venue.name}</h4>
            <div id="qrcode-${venue.id}" class="qr-canvas-wrap"></div>
            <p>Code: SKYFALL_BLOCK_${venue.id}</p>
        `;
        grid.appendChild(wrap);

        // Generate QR code
        new QRCode(document.getElementById(`qrcode-${venue.id}`), {
            text: `SKYFALL_BLOCK_${venue.id}`,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });
}

document.getElementById('btn-save-tasks').addEventListener('click', () => {
    BLOCKS.forEach(venue => {
        const el = document.getElementById(`admin-task-${venue.id}`);
        if (el) {
            if (!state.venues[venue.id]) state.venues[venue.id] = { visited: false, completed: false, task: '' };
            state.venues[venue.id].task = el.value.trim();
        }
    });
    saveState();
    showToast('✅ Tasks Saved!');
    closeAdmin();
});

document.getElementById('btn-print-qr').addEventListener('click', () => {
    window.print();
});

document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (!confirm('Reset ALL student progress? This cannot be undone.')) return;
    BLOCKS.forEach(venue => {
        const task = state.venues[venue.id]?.task || '';
        state.venues[venue.id] = { visited: false, completed: false, task };
    });
    state.xp = 0;
    saveState();
    renderMap();
    updateHUD();
    showToast('🔄 Progress Reset!');
    closeAdmin();
});

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
let toastTimer = null;

function showToast(msg) {
    const el = document.getElementById('xp-toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

function showXpToast(amount) {
    showToast(`+${amount} XP ✨`);
}

// ==========================================
// ONBOARDING (SQLite Backend Auth)
// ==========================================
document.getElementById('btn-start').addEventListener('click', async () => {
    console.log('[DEBUG] Login button clicked');
    const emailInput = document.getElementById('player-email').value.trim();
    const passInput = document.getElementById('player-password').value.trim();
    const btn = document.getElementById('btn-start');

    console.log('[DEBUG] Form values:', { emailInput, passInput });

    if (!emailInput || !passInput) {
        console.log('[DEBUG] Missing input, returning');
        if (!emailInput) {
            document.getElementById('player-email').focus();
            document.getElementById('player-email').style.borderColor = 'rgba(255,94,122,0.8)';
            setTimeout(() => document.getElementById('player-email').style.borderColor = '', 1200);
        } else {
            document.getElementById('player-password').focus();
            document.getElementById('player-password').style.borderColor = 'rgba(255,94,122,0.8)';
            setTimeout(() => document.getElementById('player-password').style.borderColor = '', 1200);
        }
        return;
    }

    // Check for admin credentials
    if (emailInput === 'vigroundq@gmail.com' && passInput === 'skyfall') {
        state.isAdmin = true;
        state.playerEmail = emailInput;
        saveState();
        startApp();
        return;
    } else {
        state.isAdmin = false;
    }

    // Attempt Login or Registration via Backend
    const origText = btn.textContent;
    btn.textContent = 'Connecting...';
    btn.disabled = true;

    try {
        let response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput, password: passInput })
        });

        const data = await response.json();

        if (response.ok) {
            // Login Success
            state.playerEmail = data.user.email;
            state.isAdmin = data.user.isAdmin;
            state.xp = data.user.xp;

            // Merge venues from DB
            if (data.venues) {
                Object.keys(data.venues).forEach(id => {
                    if (state.venues[id]) {
                        state.venues[id] = { ...state.venues[id], ...data.venues[id] };
                    }
                });
            }
            saveState();
            startApp();

        } else if (data.error === 'Account not found') {
            // Auto-Register Sequence
            btn.textContent = 'Registering...';
            let regRes = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput, password: passInput })
            });
            const regData = await regRes.json();

            if (regRes.ok) {
                state.playerEmail = regData.user.email;
                state.isAdmin = false;
                state.xp = 0;
                saveState();
                startApp();
            } else {
                alert(regData.error || 'Failed to register account.');
            }
        } else {
            // Incorrect password or other error
            alert(data.error || 'Authentication Failed');
        }
    } catch (err) {
        console.error(err);
        alert('⏳ Server is waking up (free tier). Please wait 30 seconds and try again!');
    } finally {
        btn.textContent = origText;
        btn.disabled = false;
    }
});

document.getElementById('player-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-start').click();
});

// ==========================================
// APP INIT
// ==========================================
function startApp() {
    const onboard = document.getElementById('screen-onboard');
    const shell = document.getElementById('app-shell');

    onboard.classList.add('fly-up');

    setTimeout(() => {
        shell.classList.remove('hidden');
        shell.classList.add('launch-rise');
        document.body.classList.add('app-launched');
        updateHUD();
        renderProgress(); // pre-render progress data
    }, 550);

    setTimeout(() => {
        onboard.classList.add('hidden');
        // Auto-start scanner after animation
        startScanner();
    }, 950);
}

function init() {
    console.log('[DEBUG] App initialized');
    createStars();
    loadState();

    // Pre-warm the Render backend so it's ready when user logs in
    fetch(`${API_BASE}/api/ping`).catch(() => {
        // Silently warm up — ignore errors
    });

    if (state.playerEmail) {
        console.log('[DEBUG] Skipping onboarding for:', state.playerEmail);
        // Returning user — skip onboarding
        startApp();
    }
    // else show onboarding (default)
}

init();
