/**
 * api.js — Unlockd API client
 * Central module for all communication with the FastAPI backend.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API ${res.status}: ${err}`);
    }
    return res.json();
}

// ── Achievements ──────────────────────────────────────────────────────────────

/** GET /achievements — all achievement definitions */
export async function fetchAchievements() {
    return apiFetch('/achievements');
}

/** GET /achievements/count — total number of defined achievements */
export async function fetchAchievementCount() {
    return apiFetch('/achievements/count');
}

/**
 * POST /achievements — create a new achievement
 * @param {{ achievement_id: number, title: string, requirement: string, category_id: number }} data
 */
export async function createAchievement(data) {
    const params = new URLSearchParams(data).toString();
    return apiFetch(`/achievements?${params}`, { method: 'POST' });
}

// ── Students ──────────────────────────────────────────────────────────────────

/** GET /students/count — total number of students */
export async function fetchStudentCount() {
    return apiFetch('/students/count');
}

/**
 * GET /students/achievements — achievements earned by a student
 * @param {number} studentId
 */
export async function fetchStudentAchievements(studentId) {
    return apiFetch(`/students/achievements?student_id=${studentId}`);
}

/**
 * GET /students/achievements/count — number of achievements earned by a student
 * @param {number} studentId
 */
export async function fetchStudentAchievementCount(studentId) {
    return apiFetch(`/students/achievements/count?student_id=${studentId}`);
}

// ── Awards ────────────────────────────────────────────────────────────────────

/** GET /awards/count — total number of awards given across all students */
export async function fetchTotalAwardedCount() {
    return apiFetch('/awards/count');
}

/**
 * POST /awards — grant an achievement to a student
 * @param {{ award_id: number, student_id: number, achievement_id: number, awarded_by: number, date_awarded: string }} data
 */
export async function awardAchievement(data) {
    const params = new URLSearchParams(data).toString();
    return apiFetch(`/awards?${params}`, { method: 'POST' });
}
