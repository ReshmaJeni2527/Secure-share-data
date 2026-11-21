import { useRef, useState } from "react";
import { api } from "../api.js";
import { Badge, LoadState, PageHead, Stepper, fmtDate, fmtSize, useAction, useLoad, useToast } from "../components/ui.jsx";

export function OwnerUpload() {
  const notify = useToast();
  const [keyword, setKeyword] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const input = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (!file) return notify("Choose a file first", "bad");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("keyword", keyword);
      form.append("file", file);
      const f = await api("/owner/files", { method: "POST", form });
      setSaved(f);
      setKeyword("");
      setFile(null);
      if (input.current) input.current.value = "";
      notify("File encrypted and stored");
    } catch (err) {
      notify(err.message, "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead title="Upload a file">
        The file is encrypted on the server with a new random key before it is saved. You do not need to remember any key.
      </PageHead>
      <form className="panel form" onSubmit={submit}>
        <label>
          Title users will search for
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} required minLength={2} maxLength={100} />
        </label>
        <label>
          File
          <input ref={input} type="file" onChange={(e) => setFile(e.target.files[0] || null)} required />
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Encrypting…" : "Encrypt and upload"}</button>
      </form>
      {saved && (
        <p className="note note-good">
          Stored “{saved.keyword}” ({saved.filename}, {fmtSize(saved.size)}). Users can now find it and request it.
        </p>
      )}
    </>
  );
}

export function OwnerFiles() {
  const { data, error } = useLoad("/owner/files");
  return (
    <>
      <PageHead title="My files" />
      <LoadState data={data} error={error} empty="You have not uploaded any files yet.">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>File name</th><th>Size</th><th>Uploaded</th></tr></thead>
            <tbody>
              {(data || []).map((f) => (
                <tr key={f.id}><td>{f.keyword}</td><td>{f.filename}</td><td>{fmtSize(f.size)}</td><td>{fmtDate(f.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </>
  );
}

export function OwnerRequests() {
  const { data, error, reload } = useLoad("/owner/requests");
  const run = useAction(reload);
  return (
    <>
      <PageHead title="Download requests">
        Accept a request, then ask the cloud to re-encrypt the file for that user.
      </PageHead>
      <LoadState data={data} error={error} empty="No one has requested your files yet.">
        <div className="cards">
          {(data || []).map((r) => (
            <article className="panel req" key={r.id}>
              <div className="req-top">
                <div>
                  <h3>{r.keyword}</h3>
                  <p className="muted">{r.user_name} · {r.user_email} · {fmtDate(r.created_at)}</p>
                </div>
                <div className="actions">
                  {r.stage === "owner_approval" && (
                    <>
                      <button className="btn btn-primary" onClick={() => run(() => api(`/owner/requests/${r.id}/decision`, { method: "POST", body: { accept: true } }), "Request accepted")}>Accept</button>
                      <button className="btn" onClick={() => run(() => api(`/owner/requests/${r.id}/decision`, { method: "POST", body: { accept: false } }), "Request rejected")}>Reject</button>
                    </>
                  )}
                  {r.stage === "reencryption_request" && (
                    <button className="btn btn-primary" onClick={() => run(() => api(`/owner/requests/${r.id}/reencrypt`, { method: "POST" }), "Re-encryption requested")}>Request re-encryption</button>
                  )}
                  {r.stage === "delivered" && <Badge tone="good">Downloaded</Badge>}
                </div>
              </div>
              <Stepper stage={r.stage} />
            </article>
          ))}
        </div>
      </LoadState>
    </>
  );
}
