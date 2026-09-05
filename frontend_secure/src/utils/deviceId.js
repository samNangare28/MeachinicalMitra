// A random ID persisted in this browser's localStorage - separate from
// any login credential. A legitimate owner's own browser accumulates this
// automatically over time; someone who only has the account's email and
// password typed into a brand-new browser will not have it, which is
// exactly the signal the backend uses to decide whether to challenge a
// login with an emailed OTP.
const STORAGE_KEY = "mm_device_id";

export function getDeviceId() {
    let id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
        id = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`) +
            `-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(STORAGE_KEY, id);
    }

    return id;
}