/**
 * login.js — Login page logic
 * Handles credential validation and session creation.
 * Authentication is still client-side (no auth endpoint defined in backend).
 * Replace USERS with a real API call when a /auth/login endpoint is available.
 */

const USERS = {
    // — Studenten —
    'student':       { password: 'student123', role: 'student', name: 'Demo Student',     id: 1 },
    'anna':          { password: 'anna123',    role: 'student', name: 'Anna de Vries',    id: 1 },
    'bob':           { password: 'bob123',     role: 'student', name: 'Bob de Jong',      id: 2 },
    'celine':        { password: 'celine123',  role: 'student', name: 'Celine Patel',     id: 3 },
    'david':         { password: 'david123',   role: 'student', name: 'David Kim',        id: 4 },
    'emma':          { password: 'emma123',    role: 'student', name: 'Emma Smits',       id: 5 },

    // — Leerkrachten —
    'leerkracht':    { password: 'teacher123', role: 'teacher', name: 'Demo Leerkracht',  id: 100 },
    'teacher':       { password: 'teacher123', role: 'teacher', name: 'Demo Leerkracht',  id: 100 },
    'mevr.jansen':   { password: 'jansen123',  role: 'teacher', name: 'Mevr. Jansen',    id: 101 },
    'dhr.peters':    { password: 'peters123',  role: 'teacher', name: 'Dhr. Peters',      id: 102 }
};

const PAGE_BY_ROLE = { student: 'achievements.html', teacher: 'teacher.html' };

window.togglePassword = function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
};

window.doLogin = function doLogin(event) {
    if (event) event.preventDefault();

    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('error-msg');
    const btn      = document.getElementById('login-btn');

    errorEl.style.display = 'none';

    if (!username || !password) {
        showError(errorEl, '❌ Vul zowel gebruikersnaam als wachtwoord in.');
        return;
    }

    const user = USERS[username];
    if (!user || user.password !== password) {
        showError(errorEl, '❌ Ongeldige gebruikersnaam of wachtwoord.');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        return;
    }

    const targetPage = PAGE_BY_ROLE[user.role];
    if (!targetPage) {
        showError(errorEl, '❌ Account heeft geen geldige rol toegewezen.');
        return;
    }

    localStorage.setItem('unlockd_user', JSON.stringify({
        username,
        role:    user.role,
        name:    user.name,
        id:      user.id,
        loginAt: new Date().toISOString()
    }));

    btn.disabled    = true;
    btn.textContent = '✓ Inloggen…';
    setTimeout(() => window.location.replace(targetPage), 250);
};

function showError(el, message) {
    el.textContent    = message;
    el.style.display  = 'block';
}
