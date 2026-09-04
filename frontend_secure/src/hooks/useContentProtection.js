import { useEffect } from "react";

/**
 * IMPORTANT - read this before relying on it for anything:
 * There is no browser API that can reliably block screenshots or screen
 * recording. Every technique below is a light deterrent; none of it stops
 * a determined person, and blocking devtools/keyboard shortcuts (an earlier
 * version of this hook did that) causes more harm than good - it breaks
 * legitimate debugging, browser extensions, and accessibility tools for
 * every visitor, including you. The real protection for paid video content
 * is server-side (signed/expiring URLs, no public download links), which
 * this app already gets from Cloudinary.
 *
 * Only ever call this on the actual lecture player page - never globally.
 */
export default function useContentProtection({ scope = "content" } = {}) {
    useEffect(() => {
        if (scope !== "content") return undefined;

        const root = document.documentElement;

        // When the tab loses focus (e.g. alt-tabbing to a recorder/camera
        // app), blur the video. Purely a soft deterrent - does nothing
        // once recording has started and the tab stays focused, and it
        // never affects the rest of the site.
        const handleBlur = () => root.classList.add("content-protect-blur");
        const handleFocus = () => root.classList.remove("content-protect-blur");
        const handleVisibility = () => {
            if (document.hidden) {
                root.classList.add("content-protect-blur");
            } else {
                root.classList.remove("content-protect-blur");
            }
        };

        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibility);
            root.classList.remove("content-protect-blur");
        };
    }, [scope]);
}
