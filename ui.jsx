import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

/* ---------- toasts ---------- */
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, tone = "good") => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && <div className={`toast toast-${toast.tone}`}>{toast.message}</div>}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

/* ---------- data loading ---------- */
export function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = useCallback(
    () =>
      api(path)
        .then((d) => {
          setData(d);
          setError("");
        })
        .catch((e) => setError(e.message)),
    [path]
  );
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, error, reload };
}

// Runs an API action, shows a toast, then refreshes the list.
export function useAction(reload) {
  const notify = useToast();
  return useCallback(
    async (fn, okMessage) => {
      try {
        const result = await fn();
        if (okMessage) notify(okMessage);
        if (reload) await reload();
        return result;
      } catch (e) {
        notify(e.message, "bad");
        return null;
      }
    },
    [notify, reload]
  );
}

/* ---------- formatting ---------- */
export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : "");
export function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------- small components ---------- */
export function PageHead({ title, children }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

export function Badge({ tone = "neutral", children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}

export function LoadState({ data, error, empty, children }) {
  if (error) return <p className="note note-bad">{error}</p>;
  if (data === null) return <p className="empty">Loading…</p>;
  if (Array.isArray(data) && data.length === 0) return <Empty>{empty}</Empty>;
  return children;
}

const STEPS = ["Owner approval", "Re-encryption request", "Cloud approval", "Key release", "Download"];
const STAGE_INDEX = {
  owner_approval: 0,
  reencryption_request: 1,
  cloud_approval: 2,
  key_release: 3,
  download: 4,
  delivered: 5,
};

// The journey of one download request. Done steps are filled, the current step is outlined.
export function Stepper({ stage }) {
  if (stage === "rejected") return <Badge tone="bad">Rejected by owner</Badge>;
  const at = STAGE_INDEX[stage];
  return (
    <ol className="steps" aria-label="Request progress">
      {STEPS.map((label, i) => (
        <li key={label} style={{ "--i": i }} className={i < at ? "done" : i === at ? "now" : ""}>
          <span className="dot" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ol>
  );
}
export { STEPS };

export function KeyIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="12" r="4.5" />
      <path d="M12 12h9M18 12v4M15 12v3" />
    </svg>
  );
}
