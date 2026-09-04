import "./Watermark.css";

/**
 * Tiled, semi-transparent watermark carrying the viewer's own identity.
 * This doesn't stop screen recording — nothing client-side can — but it
 * means any recording or screenshot that does leak carries the leaker's
 * name/email, which is a real (if after-the-fact) deterrent.
 */
function Watermark({ label }) {
    if (!label) return null;

    // Repeat the label in a grid so cropping out one instance still leaves
    // others visible.
    const tiles = Array.from({ length: 24 });

    return (
        <div className="watermark-overlay" aria-hidden="true">
            {tiles.map((_, i) => (
                <span className="watermark-tile" key={i}>
                    {label}
                </span>
            ))}
        </div>
    );
}

export default Watermark;
