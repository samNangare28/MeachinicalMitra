import "./Loader.css";

function Loader({ fullScreen = true, label = "Loading..." }) {
    return (
        <div className={fullScreen ? "loader-overlay" : "loader-inline"}>
            <div className="loader-spinner" role="status" aria-live="polite" aria-label={label} />
            <span className="loader-label">{label}</span>
        </div>
    );
}

export default Loader;
