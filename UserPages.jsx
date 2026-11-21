import { useState } from "react";
import { api, downloadFile } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Badge, LoadState, PageHead, Stepper, fmtDate, fmtSize, useAction, useLoad, useToast } from "../components/ui.jsx";

export function UserBrowse() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const { data, error, reload } = useLoad(`/user/files?q=${encodeURIComponent(applied)}`);
  const run = useAction(reload);

  return (
    <>
      <PageHead title="Find files">Search by title or file name, then send a request to the owner.</PageHead>
      <form className="searchbar" onSubmit={(e) => { e.preventDefault(); setApplied(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" aria-label="Search files" />
        <button className="btn btn-primary">Search</button>
      </form>
      <LoadState data={data} error={error} empty={applied ? "No file matches that search." : "No files have been uploaded yet."}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>File name</th><th>Owner</th><th>Size</th><th></th></tr></thead>
            <tbody>
              {(data || []).map((f) => (
                <tr key={f.id}>
                  <td>{f.keyword}</td><td>{f.filename}</td><td>{f.owner_name}</td><td>{fmtSize(f.size)}</td>
                  <td className="right">
                    {f.my_request ? (
                      <Badge tone={f.my_request.stage === "rejected" ? "bad" : "neutral"}>
                        {f.my_request.stage === "rejected" ? "Rejected" : "Requested"}
                      </Badge>
                    ) : (
                      <button className="btn btn-primary" onClick={() => run(() => api("/user/requests", { method: "POST", body: { file_id: f.id } }), "Request sent to the owner")}>
                        Request
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </>
  );
}

function KeyForm({ request, onDone }) {
  const notify = useToast();
  const [tkey, setTkey] = useState("");
  const [skey, setSkey] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await downloadFile(`/user/requests/${request.id}/download`, { tkey, skey }, request.file_name);
      notify("File decrypted and downloaded");
      setTkey("");
      setSkey("");
    } catch (err) {
      notify(err.message, "bad");
    } finally {
      setBusy(false);
      onDone();
    }
  }

  return (
    <form className="keyform" onSubmit={submit}>
      <label>Decryption key (tkey)<input className="mono" value={tkey} onChange={(e) => setTkey(e.target.value)} required autoComplete="off" /></label>
      <label>Secret key (skey)<input className="mono" value={skey} onChange={(e) => setSkey(e.target.value)} required autoComplete="off" /></label>
      <button className="btn btn-primary" disabled={busy}>{busy ? "Decrypting…" : "Decrypt and download"}</button>
      <p className="small">
        Keys expire {fmtDate(request.key_expires_at)}. {request.attempts_left} attempt(s) left.
      </p>
    </form>
  );
}

export function UserRequests() {
  const { data, error, reload } = useLoad("/user/requests");
  return (
    <>
      <PageHead title="My requests">
        When the authority releases your keys they arrive by e-mail. Enter both here to download.
      </PageHead>
      <LoadState data={data} error={error} empty="You have not requested any file yet.">
        <div className="cards">
          {(data || []).map((r) => (
            <article className="panel req" key={r.id}>
              <div className="req-top">
                <div>
                  <h3>{r.keyword}</h3>
                  <p className="muted">{r.file_name} · from {r.owner_name} · {fmtDate(r.created_at)}</p>
                </div>
              </div>
              <Stepper stage={r.stage} />
              {(r.stage === "download" || r.stage === "delivered") && <KeyForm request={r} onDone={reload} />}
            </article>
          ))}
        </div>
      </LoadState>
    </>
  );
}

export function UserProfile() {
  const { user } = useAuth();
  const { data, error } = useLoad("/me");
  const u = data || user;
  const rows = [["Username", u.username], ["E-mail", u.email], ["Mobile", u.mobile], ["Date of birth", u.dob], ["Gender", u.gender], ["Location", u.location], ["Account", u.status]];
  return (
    <>
      <PageHead title="Profile" />
      {error && <p className="note note-bad">{error}</p>}
      <dl className="panel details">
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
    </>
  );
}
