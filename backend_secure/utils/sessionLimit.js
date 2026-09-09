// How many devices can be actively logged in on one account at once.
const MAX_ACTIVE_SESSIONS = 2;

function hasAvailableSlot(existingSessions, deviceHash) {
    const now = Date.now();
    const sessions = (existingSessions || []).filter((s) => s.expiresAt > now);

    if (deviceHash && sessions.some((s) => s.deviceHash === deviceHash)) {
        return true;
    }

    return sessions.length < MAX_ACTIVE_SESSIONS;
}

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

module.exports = { reserveSessionSlot, hasAvailableSlot, MAX_ACTIVE_SESSIONS };