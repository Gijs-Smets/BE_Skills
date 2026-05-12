/**
 * achievements.js — Student Dashboard logic
 * Fetches live data from the FastAPI backend and drives the achievements view.
 */

import {
    fetchAchievements,
    fetchStudentAchievements,
    fetchStudentAchievementCount,
    fetchAchievementCount
} from './api.js';

// ── Session ───────────────────────────────────────────────────────────────────

const currentUser = JSON.parse(localStorage.getItem('unlockd_user') || '{}');

// Show teacher-preview banner when applicable
if (localStorage.getItem('unlockd_teacher_preview') === '1') {
    const banner = document.getElementById('teacher-preview-banner');
    if (banner) banner.style.display = 'flex';
}

// Display username in nav
const navUserEl = document.getElementById('nav-user');
if (navUserEl) navUserEl.textContent = currentUser.name || 'Student';

// ── State ─────────────────────────────────────────────────────────────────────

let allAchievements = [];    // All achievement definitions from backend
let earnedIds = new Set();   // achievement_id values the student has earned
let currentFilter = 'all';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        showLoadingState();

        // Fetch all achievement definitions and the student's earned set in parallel
        const [achievementsRes, studentRes] = await Promise.all([
            fetchAchievements(),
            currentUser.id
                ? fetchStudentAchievements(currentUser.id)
                : Promise.resolve({ achievements: [] })
        ]);

        allAchievements = achievementsRes;

        // Build a Set of earned achievement IDs for O(1) lookup
        earnedIds = new Set((studentRes.achievements || []).map(a => a.achievement_id));

        renderAchievements();
    } catch (err) {
        console.error('Failed to load achievements:', err);
        showErrorState();
    }
}

function showLoadingState() {
    const container = document.getElementById('sections');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:80px 20px;color:var(--slate-lighter);font-weight:700;">
                <div style="font-size:3rem;margin-bottom:16px;animation:spin 1s linear infinite;">⏳</div>
                Achievements laden…
            </div>`;
    }
}

function showErrorState() {
    const container = document.getElementById('sections');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:80px 20px;color:#EF4444;font-weight:700;">
                <div style="font-size:3rem;margin-bottom:16px;">⚠️</div>
                Kon achievements niet laden. Controleer de serververbinding.
            </div>`;
    }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

/**
 * Map a backend achievement to a display-ready object.
 * Since the backend does not track "in-progress" state, achievements are either
 * 'done' (earned) or 'locked'.  Extend this logic when a progress endpoint is added.
 */
function toDisplayAchievement(a) {
    const isDone = earnedIds.has(a.achievement_id);
    return {
        id:       a.achievement_id,
        title:    a.title,
        desc:     a.requirement,
        category: a.category,
        status:   isDone ? 'done' : 'locked',
        icon:     categoryIcon(a.category),
        progress: isDone ? 100 : 0
    };
}

/** Derive a representative emoji from the category string */
function categoryIcon(category) {
    if (!category) return '⭐';
    const cat = category.toLowerCase();
    if (cat.includes('academisch') || cat.includes('academic')) return '📚';
    if (cat.includes('groei') || cat.includes('mindset'))       return '💡';
    if (cat.includes('samenwerk') || cat.includes('team'))      return '🤝';
    if (cat.includes('school') || cat.includes('betrokken'))    return '🏫';
    if (cat.includes('speciaal') || cat.includes('special'))    return '⭐';
    return '🏆';
}

function renderAchievements() {
    const container = document.getElementById('sections');
    if (!container) return;

    const displayItems = allAchievements.map(toDisplayAchievement);

    // Group by category
    const categories = {};
    displayItems.forEach(a => {
        if (!categories[a.category]) categories[a.category] = [];
        categories[a.category].push(a);
    });

    container.innerHTML = '';
    Object.entries(categories).forEach(([cat, items]) => {
        const sec = document.createElement('div');
        sec.className = 'section-block';
        sec.innerHTML = `
            <div class="section-label">
                <h2>${cat}</h2>
                <div class="section-line"></div>
                <span class="section-count">${items.length}</span>
            </div>
            <div class="grid"></div>
        `;
        container.appendChild(sec);
        const grid = sec.querySelector('.grid');
        items.forEach((a, i) => {
            const card = buildCard(a);
            card.style.animationDelay = (i * 0.06) + 's';
            grid.appendChild(card);
        });
    });

    applyFilters();
}

function buildCard(a) {
    const card = document.createElement('div');
    card.className = `card card-${a.status}`;
    card.dataset.status = a.status;
    card.dataset.title  = a.title.toLowerCase();

    const progressHTML = a.status === 'progress' ? `
        <div class="divider"></div>
        <div>
            <div class="prog-meta"><span>Voortgang</span><span>${a.progress}%</span></div>
            <div class="prog-track"><div class="prog-fill" style="width:${a.progress}%"></div></div>
        </div>` : '';

    const badgeLabel = a.status === 'done'
        ? '✅ Behaald'
        : a.status === 'progress'
        ? '🔄 Bezig'
        : '🔒 Vergrendeld';

    card.innerHTML = `
        <div class="card-top">
            <div class="icon-wrap">${a.icon}</div>
            <span class="badge badge-${a.status}">${badgeLabel}</span>
        </div>
        <div class="card-title">${a.title}</div>
        <div class="card-desc">${a.desc}</div>
        ${progressHTML}
    `;
    return card;
}

// ── Filtering & search ────────────────────────────────────────────────────────

window.setFilter = function setFilter(status, el) {
    currentFilter = status;
    document.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
    el.classList.add('active');
    applyFilters();
};

function applyFilters() {
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();
    let done = 0, progress = 0, locked = 0, total = 0;

    document.querySelectorAll('.card').forEach(card => {
        const matchFilter = currentFilter === 'all' || card.dataset.status === currentFilter;
        const matchSearch = !search || card.dataset.title.includes(search);
        const show = matchFilter && matchSearch;
        card.style.display = show ? '' : 'none';
        if (show) {
            if      (card.dataset.status === 'done')     done++;
            else if (card.dataset.status === 'progress') progress++;
            else                                          locked++;
            total++;
        }
    });

    document.getElementById('cnt-done').textContent     = done;
    document.getElementById('cnt-progress').textContent = progress;
    document.getElementById('cnt-locked').textContent   = locked;
    document.getElementById('cnt-total').textContent    = total;
}

// Expose applyFilters for the inline oninput on the search field
window.applyFilters = applyFilters;

// ── Navigation & modals ───────────────────────────────────────────────────────

window.toggleUserMenu = function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('active');
};

document.addEventListener('click', e => {
    if (!e.target.closest('.nav-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('active');
    }
});

window.editProfile = function editProfile(event) {
    event.preventDefault();
    document.getElementById('profile-username').value = currentUser.username || '';
    openModal('profile-modal');
    toggleUserMenu();
};

window.showHelp = function showHelp(event) {
    event.preventDefault();
    alert('📖 Hulp – Unlockd\n\n1. Achievements zijn doelen om te behalen.\n2. Je krijgt badges als je succesvol bent.\n3. Spreek je leerkracht aan voor feedback.\n\nVragen? Mail naar: support@unlockd.nl');
    toggleUserMenu();
};

window.logout = function logout(event) {
    if (event) event.preventDefault();
    if (confirm('⚠️ Weet je zeker dat je wilt uitloggen?')) {
        localStorage.removeItem('unlockd_user');
        localStorage.removeItem('unlockd_teacher_preview');
        window.location.replace('login.html');
    }
};

window.saveProfile = function saveProfile(event) {
    event.preventDefault();
    const fn = document.getElementById('profile-firstname').value;
    const ln = document.getElementById('profile-lastname').value;
    if (fn && ln) { alert(`✅ Profiel opgeslagen: ${fn} ${ln}`); closeModal('profile-modal'); }
    else          { alert('❌ Vul alle velden in.'); }
};

window.exitStudentPreview = function exitStudentPreview() {
    localStorage.removeItem('unlockd_teacher_preview');
    window.location.href = 'teacher.html';
};

// ── Modal helpers ─────────────────────────────────────────────────────────────

window.openModal = function openModal(id) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById(id).style.display = 'flex';
};

window.closeModal = function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
};

window.closeAllModals = function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById('modal-overlay').style.display = 'none';
};
