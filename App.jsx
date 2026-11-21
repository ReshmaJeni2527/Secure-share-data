import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import { Landing, Login, Register } from "./pages/AuthPages.jsx";
import { OwnerFiles, OwnerRequests, OwnerUpload } from "./pages/OwnerPages.jsx";
import { UserBrowse, UserProfile, UserRequests } from "./pages/UserPages.jsx";
import { AuthorityAccounts, AuthorityKeys } from "./pages/AuthorityPages.jsx";
import { CloudActivity, CloudDownloads, CloudFiles, CloudReencryption } from "./pages/CloudPages.jsx";

// Only lets a signed-in person of the right role into a section.
function Guard({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/login?role=${role}`} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <Layout role={role} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/owner" element={<Guard role="owner" />}>
        <Route index element={<OwnerUpload />} />
        <Route path="files" element={<OwnerFiles />} />
        <Route path="requests" element={<OwnerRequests />} />
      </Route>

      <Route path="/user" element={<Guard role="user" />}>
        <Route index element={<UserBrowse />} />
        <Route path="requests" element={<UserRequests />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="/authority" element={<Guard role="authority" />}>
        <Route index element={<AuthorityAccounts />} />
        <Route path="keys" element={<AuthorityKeys />} />
      </Route>

      <Route path="/cloud" element={<Guard role="cloud" />}>
        <Route index element={<CloudFiles />} />
        <Route path="reencryption" element={<CloudReencryption />} />
        <Route path="downloads" element={<CloudDownloads />} />
        <Route path="activity" element={<CloudActivity />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
