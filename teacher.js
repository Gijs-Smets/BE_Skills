/**
 * teacher.js — Teacher Dashboard logic
 * Fetches live data from the FastAPI backend and drives the teacher management view.
 */

import {
    fetchAchievements,
    fetchAchievementCount,
    fetchStudentCount,
    fetchStudentAchievements,
    fetchStudentAchievementCount,
    fetchTotalAwardedCount,
    awardAchievement,
    createAchievement
} from './api.js';

// ── Session ───────────────────────────────────────────────────────────────────

const currentUser = JSON.parse(localStorage.getItem('unlockd_user') || '{}');
const navUserEl = document.getElementById('nav-user');
if (navUserEl) navUserEl.textContent = '👩‍🏫 ' + (currentUser.name || 'Leerkracht');

// ── State ─────────────────────────────────────────────────────────────────────

let achievementsData = [];  // loaded from backend
let students = [];          // loaded from backend (student list via /students/achievements/count per student)

// Known student IDs — in a real system these would come from a /students endpoint.
// For now we derive them from the login credentials defined in login.js.
const KNOWN_STUDENT_IDS = [1, 2, 3, 4, 5];
const STUDENT_NAMES = {
    1: 'Anna de Vries',
    2: 'Bob de Jong',
    3: 'Celine Patel',
    4: 'David Kim',
    5: 'Emma Smits'
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadStudents(),
            loadAchievements()
        ]);
    } catch (err) {
        console.error('Init error:', err);
    }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

async function loadDashboardStats() {
    try {
        const [studentCountRes, totalAwardedRes, achievementCountRes] = await Promise.all([
            fetchStudentCount(),
            fetchTotalAwardedCount(),
            fetchAchievementCount()
        ]);

        const statStudents = document.getElementById('stat-students');
        const statAwarded  = document.getElementById('stat-awarded');
        const statAchs     = document.getElementById('stat-achievements');

        if (statStudents) statStudents.textContent = studentCountRes.total_students ?? '–';
        if (statAwarded)  statAwarded.textContent  = totalAwardedRes.total_awarded_achievements ?? '–';
        if (statAchs)     statAchs.textContent     = achievementCountRes.total_achievements ?? '–';
    } catch (err) {
        console.error('Could not load dashboard stats:', err);
    }
}

// ── Students ──────────────────────────────────────────────────────────────────

async function loadStudents() {
    try {
        // Fetch achievement counts for every known student in parallel
        const results = await Promise.all(
            KNOWN_STUDENT_IDS.map(id =>
                fetchStudentAchievementCount(id)
                    .then(res => ({ id, done: res.achievement_count, name: STUDENT_NAMES[id] || `Student ${id}` }))
                    .catch(() => ({ id, done: 0, name: STUDENT_NAMES[id] || `Student ${id}` }))
            )
        );

        // We don't have a total-achievements endpoint here, use achievements length
        const totalAchs = achievementsData.length || 25;

        students = results.map(r => {
            const pct = totalAchs > 0 ? Math.round((r.done / totalAchs) * 100) : 0;
            return {
                id:       r.id,
                name:     r.name,
                done:     r.done,
                progress: 0,    // extend when a progress endpoint is available
                total:    totalAchs,
                pct,
                level:    pct >= 80 ? 'Uitstekend' : pct >= 60 ? 'Gevorderd' : pct >= 40 ? 'Gemiddeld' : 'Beginner'
            };
        });

        renderStudentTable();
        populateGrantStudentSelect();
    } catch (err) {
        console.error('Could not load students:', err);
    }
}

function renderStudentTable() {
    const tbody = document.getElementById('student-tbody');
    if (!tbody) return;

    tbody.innerHTML = students.map(s => {
        const levelColor = s.pct >= 80 ? '#10B981' : s.pct >= 60 ? '#F59E0B' : '#EF4444';
        return `
        <tr data-name="${s.name.toLowerCase()}">
            <td><strong>${s.name}</strong></td>
            <td><span style="font-size:0.75rem;font-weight:800;background:rgba(167,139,250,0.12);color:var(--brand-dark);padding:3px 8px;border-radius:99px;">ITF04</span></td>
            <td><strong style="color:var(--green)">${s.done}</strong></td>
            <td><strong style="color:var(--brand)">${s.progress}</strong></td>
            <td style="min-width:140px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div class="progress-bar" style="flex:1"><div class="progress-fill" style="width:${s.pct}%"></div></div>
                    <span style="font-size:0.8rem;font-weight:800;color:var(--slate);min-width:32px;">${s.pct}%</span>
                </div>
            </td>
            <td><span style="font-size:0.75rem;font-weight:800;color:white;background:${levelColor};padding:4px 10px;border-radius:99px;">${s.level}</span></td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn-action" onclick="viewStudentDetail(${s.id})">👁️ Detail</button>
                    <button class="btn-action" onclick="openGrantForStudent(${s.id})">🏆 Award</button>
                </div>
            </td>
        </tr>`;
    }).join('');

    // Student select in the details tab
    const sel = document.getElementById('student-select');
    if (sel) {
        sel.innerHTML = '<option value="">-- Selecteer een student --</option>' +
            students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
}

window.filterStudentRows = function filterStudentRows() {
    const q = document.getElementById('search-student').value.toLowerCase();
    document.querySelectorAll('#student-tbody tr').forEach(row => {
        row.style.display = (!q || row.dataset.name.includes(q)) ? '' : 'none';
    });
};

window.viewStudentDetail = function viewStudentDetail(id) {
    switchTab('students', document.querySelectorAll('.tab-btn')[1]);
    const sel = document.getElementById('student-select');
    if (sel) sel.value = id;
    loadStudentDetail(id);
};

window.loadStudentDetail = async function loadStudentDetail(id) {
    const area = document.getElementById('student-detail-area');
    if (!id) {
        area.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--slate-lighter);font-weight:700;"><div style="font-size:3rem;margin-bottom:12px;">👆</div>Selecteer een student om details te bekijken</div>`;
        return;
    }

    const numId = parseInt(id);
    const s = students.find(x => x.id === numId);
    if (!s) return;

    // Fetch earned achievements for this student
    let earned = [];
    try {
        const res = await fetchStudentAchievements(numId);
        earned = res.achievements || [];
    } catch (e) {
        console.error('Could not load student achievements:', e);
    }

    const locked = s.total - s.done - s.progress;

    area.innerHTML = `
        <div class="student-detail-panel">
            <div class="detail-header">
                <div class="student-avatar">${s.name[0]}</div>
                <div>
                    <h2 style="font-size:1.5rem;font-weight:900;color:var(--slate)">${s.name}</h2>
                    <p style="color:var(--slate-lighter);font-weight:700;font-size:0.875rem;">Klas ITF04 · Schooljaar 2025–26</p>
                </div>
                <div style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="openGrantForStudent(${s.id})">🏆 Award Geven</button>
                </div>
            </div>
            <div class="detail-grid">
                <div class="mini-stat"><span class="mini-stat-icon">✅</span><div><span class="mini-stat-num">${s.done}</span><span class="mini-stat-lbl">Behaald</span></div></div>
                <div class="mini-stat"><span class="mini-stat-icon">🔄</span><div><span class="mini-stat-num">${s.progress}</span><span class="mini-stat-lbl">Bezig</span></div></div>
                <div class="mini-stat"><span class="mini-stat-icon">🔒</span><div><span class="mini-stat-num">${locked}</span><span class="mini-stat-lbl">Vergrendeld</span></div></div>
                <div class="mini-stat"><span class="mini-stat-icon">📈</span><div><span class="mini-stat-num">${s.pct}%</span><span class="mini-stat-lbl">Voortgang</span></div></div>
            </div>
            ${earned.length > 0 ? `
            <div style="padding:16px 24px 24px;">
                <p style="font-size:0.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--slate-lighter);margin-bottom:10px;">Behaalde achievements</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${earned.map(a => `<span style="background:rgba(16,185,129,0.1);color:#065F46;border:1px solid rgba(16,185,129,0.25);padding:4px 10px;border-radius:99px;font-size:0.78rem;font-weight:800;">✅ ${a.title}</span>`).join('')}
                </div>
            </div>` : ''}
        </div>`;
};

// ── Achievements editor ───────────────────────────────────────────────────────

async function loadAchievements() {
    try {
        achievementsData = await fetchAchievements();
        renderAchievementEditor();
        populateGrantAchievementSelect();
    } catch (err) {
        console.error('Could not load achievements:', err);
    }
}

function renderAchievementEditor() {
    const grid = document.getElementById('ach-editor-grid');
    if (!grid) return;

    grid.innerHTML = achievementsData.map(a => `
        <div class="ach-edit-card">
            <span style="font-size:1.8rem;">${categoryIcon(a.category)}</span>
            <div class="ach-edit-info">
                <span class="ach-edit-cat">${a.category || '–'}</span>
                <h4>${a.title}</h4>
                <p>${a.requirement}</p>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
                <button class="btn-tiny" onclick="openEditModal(${a.achievement_id})" title="Bewerken">✏️</button>
            </div>
        </div>`).join('');
}

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

function populateGrantAchievementSelect() {
    const sel = document.getElementById('grant-achievement');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Selecteer achievement --</option>' +
        achievementsData.map(a => `<option value="${a.achievement_id}">${a.title}</option>`).join('');
}

function populateGrantStudentSelect() {
    const sel = document.getElementById('grant-student');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Selecteer student --</option>' +
        students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

// ── Grant modal ───────────────────────────────────────────────────────────────

window.openGrantForStudent = function openGrantForStudent(studentId) {
    openModal('grant-modal');
    const sel = document.getElementById('grant-student');
    if (sel) sel.value = studentId;
};

window.confirmGrant = async function confirmGrant(event) {
    event.preventDefault();
    const studentId     = parseInt(document.getElementById('grant-student').value);
    const achievementId = parseInt(document.getElementById('grant-achievement').value);
    if (!studentId || !achievementId) {
        alert('❌ Selecteer een student en achievement.');
        return;
    }

    const student     = students.find(s => s.id === studentId);
    const achievement = achievementsData.find(a => a.achievement_id === achievementId);

    try {
        await awardAchievement({
            award_id:       Date.now(),         // simple unique ID for demo
            student_id:     studentId,
            achievement_id: achievementId,
            awarded_by:     currentUser.id || 0,
            date_awarded:   new Date().toISOString().slice(0, 10)
        });
        alert(`🎉 Achievement "${achievement?.title}" succesvol toegekend aan ${student?.name}!`);
        closeModal('grant-modal');
        // Refresh student stats
        await loadStudents();
    } catch (err) {
        console.error('Award failed:', err);
        alert('❌ Award toekennen mislukt. Probeer opnieuw.');
    }
};

// ── New achievement modal ─────────────────────────────────────────────────────

window.createAchievementHandler = async function createAchievementHandler(event) {
    event.preventDefault();
    const title      = document.getElementById('new-name').value.trim();
    const requirement = document.getElementById('new-desc').value.trim();
    const categoryId = parseInt(document.getElementById('new-cat').value) || 1;

    if (!title || !requirement) {
        alert('❌ Vul minstens een naam en beschrijving in.');
        return;
    }

    const newId = (Math.max(0, ...achievementsData.map(a => a.achievement_id)) + 1);

    try {
        await createAchievement({
            achievement_id: newId,
            title,
            requirement,
            category_id: categoryId
        });
        alert('🎉 Nieuw achievement aangemaakt: ' + title);
        closeModal('new-achievement-modal');
        ['new-name', 'new-emoji', 'new-desc'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        // Reload achievements from backend
        await loadAchievements();
    } catch (err) {
        console.error('Create achievement failed:', err);
        alert('❌ Aanmaken mislukt. Probeer opnieuw.');
    }
};

// ── Edit modal (local only — no PUT endpoint yet) ─────────────────────────────

window.openEditModal = function openEditModal(id) {
    const a = achievementsData.find(x => x.achievement_id === id);
    if (!a) return;
    document.getElementById('edit-id').value    = a.achievement_id;
    document.getElementById('edit-name').value  = a.title;
    document.getElementById('edit-emoji').value = categoryIcon(a.category);
    document.getElementById('edit-desc').value  = a.requirement;
    document.getElementById('edit-cat').value   = a.category || '';
    openModal('edit-modal');
};

window.saveEdit = function saveEdit(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const a  = achievementsData.find(x => x.achievement_id === id);
    if (!a) return;
    // Local update only (no PUT/PATCH endpoint defined in backend)
    a.title       = document.getElementById('edit-name').value  || a.title;
    a.requirement = document.getElementById('edit-desc').value  || a.requirement;
    a.category    = document.getElementById('edit-cat').value   || a.category;
    renderAchievementEditor();
    closeModal('edit-modal');
    alert('💾 Achievement opgeslagen (lokaal — voeg een PUT /achievements endpoint toe voor permanente opslag).');
};

// ── Tab navigation ────────────────────────────────────────────────────────────

window.switchTab = function switchTab(name, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('tab-' + name).classList.add('active');
};

// ── Nav & misc ────────────────────────────────────────────────────────────────

window.toggleUserMenu = function toggleUserMenu() {
    document.getElementById('user-dropdown').classList.toggle('active');
};

document.addEventListener('click', e => {
    if (!e.target.closest('.nav-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('active');
    }
});

window.viewAsStudent = function viewAsStudent(event) {
    if (event) event.preventDefault();
    localStorage.setItem('unlockd_teacher_preview', '1');
    window.location.href = 'achievements.html';
};

window.openTeacherProfile = function openTeacherProfile(event) {
    if (event) event.preventDefault();
    alert('👤 Profiel\n\nNaam: ' + (currentUser.name || '–') +
          '\nGebruikersnaam: ' + (currentUser.username || '–') +
          '\nRol: Leerkracht\nKlas: ITF04');
    toggleUserMenu();
};

window.showHelp = function showHelp(event) {
    if (event) event.preventDefault();
    alert('📖 Leerkracht Help\n\n• Award Toekennen: ken een achievement toe aan een student.\n• Nieuw Achievement: maak een nieuw doel aan voor de klas.\n• Bekijk als Student: zie hoe het dashboard er voor studenten uitziet.\n\nVragen? support@unlockd.nl');
    toggleUserMenu();
};

window.exportAll = function exportAll(event) {
    if (event) event.preventDefault();
    // Build a simple CSV from current student data
    const rows = [['Naam', 'Behaald', 'Voortgang%', 'Niveau']];
    students.forEach(s => rows.push([s.name, s.done, s.pct, s.level]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'unlockd-export.csv'; a.click();
    URL.revokeObjectURL(url);
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
