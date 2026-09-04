export const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isValidPhone = (value) => /^[0-9]{10}$/.test(String(value).trim());

export const isValidName = (value) => /^[a-zA-Z\s.'-]{2,60}$/.test(String(value).trim());

// Mirrors the backend's password policy so the user finds out immediately
// instead of round-tripping to the server first.
export const passwordIssues = (value) => {
    const issues = [];
    if (!value || value.length < 8) issues.push("at least 8 characters");
    if (!/[a-z]/.test(value)) issues.push("a lowercase letter");
    if (!/[A-Z]/.test(value)) issues.push("an uppercase letter");
    if (!/[0-9]/.test(value)) issues.push("a number");
    return issues;
};

export const isStrongPassword = (value) => passwordIssues(value).length === 0;
