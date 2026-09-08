// How many devices can be actively logged in on one account at once.
const MAX_ACTIVE_SESSIONS = 2;

// Decides whether a new session can be issued given the account's current
// active sessions, and returns the updated list if so.
//
// - Expired entries are dropped first, so a session that outlived its JWT
//   frees its slot automatically even if that device never explicitly
//   logged out.
// - Logging in again from a device that already holds a slot replaces
//   that slot's session rather than consuming a new one - so a student
//   refreshing/re-logging on their own phone never gets counted twice.
// - Once genuinely different devices fill every slot, the next login is
//   refused (allowed: false) rather than silently evicting anyone.
function reserveSessionSlot(existingSessions, deviceHash, newSessionId, expiresAt) {
    const now = Date.now();
    let sessions = (existingSessions || []).filter((s) => s.expiresAt > now);

    if (deviceHash) {
        sessions = sessions.filter((s) => s.deviceHash !== deviceHash);
    }

    if (sessions.length >= MAX_ACTIVE_SESSIONS) {
        return { allowed: false, sessions: existingSessions || [] };
    }

    sessions.push({ sessionId: newSessionId, deviceHash: deviceHash || null, expiresAt });
    return { allowed: true, sessions };
}

module.exports = { reserveSessionSlot, MAX_ACTIVE_SESSIONS };