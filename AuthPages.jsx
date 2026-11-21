import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { CircuitBg, LockIcon, PadlockArt, UserIcon } from "../components/CyberArt.jsx";
import { KeyIcon } from "../components/ui.jsx";

const ROLES = [
  ["owner", "Owner", "Upload files and approve requests"],
  ["user", "User", "Find files and download with your keys"],
  ["authority", "Authority", "Activate accounts and release keys"],
  ["cloud", "Cloud", "Approve re-encryption and watch activity"],
];

const JOURNEY = [
  ["Owner approval", "The data owner accepts or rejects a user's request."],
  ["Re-encryption request", "The owner asks the cloud to prepare the file for that user."],
  ["Cloud approval", "The cloud server approves the request."],
  ["Key release", "The authority creates two one-time keys and e-mails them to the user."],
  ["Download", "The user enters both keys. Only then is the file decrypted."],
];

export function Landing() {
  const lines = ["Share files in", "the cloud without", "handing the cloud", "your keys."];
  return (
    <div className="landing-page">
      <div className="glow g1" aria-hidden="true" />
      <div className="glow g2" aria-hidden="true" />
      <header className="topbar">
        <span className="brand-lg"><KeyIcon size={26} /> Secure Cloud Share</span>
        <nav>
          <Link to="/login">Sign in</Link>
          <Link className="btn btn-sm" to="/register">Create account</Link>
        </nav>
      </header>
      <div className="landing">
        <section className="hero">
          <h1>
            {lines.map((text, i) => (
              <span className="line" key={text} style={{ "--i": i }}>
                <span>{text}</span>
              </span>
            ))}
          </h1>
          <p className="lead">
            Every file is encrypted before it is stored. A download needs a yes from the owner, the cloud and
            the authority, and then two keys that only the requesting user receives.
          </p>
          <div className="role-grid">
            {ROLES.map(([role, label, blurb], i) => (
              <Link key={role} className="role-tile" style={{ "--i": i }} to={`/login?role=${role}`}>
                <span className="role-ic">{label[0]}</span>
                <span className="role-text">
                  <strong>Sign in as {label.toLowerCase()}</strong>
                  <small>{blurb}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="journey" aria-label="How a download request works">
          <h2>What happens to one request</h2>
          <ol>
            {JOURNEY.map(([title, text], i) => (
              <li key={title} style={{ "--i": i }}>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

const REMEMBER_KEY = "scs_remember";

function readRemembered() {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER_KEY)) || {};
  } catch {
    return {};
  }
}

export function Login() {
  const [params] = useSearchParams();
  const [saved] = useState(readRemembered);
  const fromUrl = params.get("role");
  const known = (r) => ROLES.some(([x]) => x === r);
  const [role, setRole] = useState(known(fromUrl) ? fromUrl : known(saved.role) ? saved.role : "owner");
  const [username, setUsername] = useState(saved.username || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!saved.username);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(role, username.trim(), password);
      // only the username is remembered, never the password
      if (remember) localStorage.setItem(REMEMBER_KEY, JSON.stringify({ role, username: username.trim() }));
      else localStorage.removeItem(REMEMBER_KEY);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cy-page">
      <CircuitBg />
      <div className="cy-wrap">
        <form className="cy-card" onSubmit={submit}>
          <h1>LOGIN</h1>
          <p className="cy-sub">Welcome to Secure Cloud Share</p>

          <div className="cy-roles" role="radiogroup" aria-label="Sign in as">
            {ROLES.map(([r, label]) => (
              <button type="button" key={r} role="radio" aria-checked={role === r}
                className={role === r ? "on" : ""} onClick={() => setRole(r)}>
                {label}
              </button>
            ))}
          </div>

          <label className="cy-field">
            <span className="sr-only">Username</span>
            <UserIcon />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
              autoComplete="username" required />
          </label>
          <label className="cy-field">
            <span className="sr-only">Password</span>
            <LockIcon />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              autoComplete="current-password" required />
          </label>

          <div className="cy-row">
            <label className="cy-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="box" aria-hidden="true" />
              Remember
            </label>
            <button type="button" className="cy-link" onClick={() => setShowForgot((v) => !v)}>
              Forgot password?
            </button>
          </div>

          {showForgot && (
            <p className="cy-note">Password reset is not set up in this project yet. Ask the authority to create a new account for you.</p>
          )}
          {error && <p className="cy-error" role="alert">{error}</p>}

          <button className="cy-btn" disabled={busy}>{busy ? "Signing in…" : "Log In"}</button>

          <p className="cy-foot">
            {(role === "owner" || role === "user") && <><Link to="/register">Create account</Link><span aria-hidden="true"> · </span></>}
            <Link to="/">Home</Link>
          </p>
        </form>
        <PadlockArt />
      </div>
    </div>
  );
}

const EMPTY = { role: "owner", username: "", password: "", email: "", dob: "", gender: "female", mobile: "", location: "" };

export function Register() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api("/auth/register", { method: "POST", body: form });
      setDone(res.message);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="panel auth-card wide" onSubmit={submit}>
        <h1>Create an account</h1>
        <div className="seg" role="radiogroup" aria-label="Account type">
          {[["owner", "I own files"], ["user", "I want to download files"]].map(([r, label]) => (
            <button type="button" key={r} role="radio" aria-checked={form.role === r}
              className={form.role === r ? "on" : ""} onClick={() => setForm({ ...form, role: r })}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid2">
          <label>Username<input value={form.username} onChange={set("username")} required minLength={3} /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} required minLength={8} /></label>
          <label>E-mail<input type="email" value={form.email} onChange={set("email")} required /></label>
          <label>Mobile<input value={form.mobile} onChange={set("mobile")} required /></label>
          <label>Date of birth<input type="date" value={form.dob} onChange={set("dob")} required /></label>
          <label>Gender
            <select value={form.gender} onChange={set("gender")}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label>Location<input value={form.location} onChange={set("location")} required /></label>
        {error && <p className="note note-bad">{error}</p>}
        {done && <p className="note note-good">{done}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="small">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
