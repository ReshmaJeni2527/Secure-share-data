import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { KeyIcon } from "./ui.jsx";

const NAV = {
  owner: [
    ["/owner", "Upload file", true],
    ["/owner/files", "My files"],
    ["/owner/requests", "Download requests"],
  ],
  user: [
    ["/user", "Find files", true],
    ["/user/requests", "My requests"],
    ["/user/profile", "Profile"],
  ],
  authority: [
    ["/authority", "Accounts", true],
    ["/authority/keys", "Key release"],
  ],
  cloud: [
    ["/cloud", "Stored files", true],
    ["/cloud/reencryption", "Re-encryption"],
    ["/cloud/downloads", "Downloads"],
    ["/cloud/activity", "Activity"],
  ],
};
const ROLE_LABEL = { owner: "Data owner", user: "Data user", authority: "Authority", cloud: "Cloud server" };

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><KeyIcon /> Secure Cloud Share</div>
        <div className="who">
          <strong>{user.username}</strong>
          <span>{ROLE_LABEL[role]}</span>
        </div>
        <nav aria-label="Main">
          {NAV[role].map(([to, label, end]) => (
            <NavLink key={to} to={to} end={!!end}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="link-btn"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sign out
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
