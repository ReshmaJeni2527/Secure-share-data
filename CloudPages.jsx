import { api } from "../api.js";
import { Badge, LoadState, PageHead, Stepper, fmtDate, fmtSize, useAction, useLoad } from "../components/ui.jsx";

export function CloudFiles() {
  const { data, error } = useLoad("/cloud/files");
  return (
    <>
      <PageHead title="Stored files">
        This is all the cloud can see: metadata and the first bytes of each encrypted file.
      </PageHead>
      <LoadState data={data} error={error} empty="Nothing has been uploaded yet.">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Owner</th><th>Size</th><th>Uploaded</th><th>Stored bytes (hex)</th></tr></thead>
            <tbody>
              {(data || []).map((f) => (
                <tr key={f.id}>
                  <td>{f.keyword}<br /><span className="muted">{f.filename}</span></td>
                  <td>{f.owner_name}</td><td>{fmtSize(f.size)}</td><td>{fmtDate(f.created_at)}</td>
                  <td className="mono small-mono">{f.cipher_preview}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </>
  );
}

export function CloudReencryption() {
  const { data, error, reload } = useLoad("/cloud/reencryption");
  const run = useAction(reload);
  return (
    <>
      <PageHead title="Re-encryption requests">Approve a request so the authority can release keys for it.</PageHead>
      <LoadState data={data} error={error} empty="No re-encryption request has arrived.">
        <div className="cards">
          {(data || []).map((r) => (
            <article className="panel req" key={r.id}>
              <div className="req-top">
                <div>
                  <h3>{r.keyword}</h3>
                  <p className="muted">owner {r.owner_name} → user {r.user_name} · {fmtDate(r.created_at)}</p>
                </div>
                <div className="actions">
                  {r.reenc_status === "Requested" ? (
                    <button className="btn btn-primary" onClick={() => run(() => api(`/cloud/reencryption/${r.id}/approve`, { method: "POST" }), "Re-encryption approved")}>Approve</button>
                  ) : (
                    <Badge tone="good">Approved</Badge>
                  )}
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

export function CloudDownloads() {
  const { data, error } = useLoad("/cloud/downloads");
  return (
    <>
      <PageHead title="Downloads" />
      <LoadState data={data} error={error} empty="No file has been downloaded yet.">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>File name</th><th>Owner</th><th>Downloaded by</th><th>Requested</th></tr></thead>
            <tbody>
              {(data || []).map((r) => (
                <tr key={r.id}><td>{r.keyword}</td><td>{r.file_name}</td><td>{r.owner_name}</td><td>{r.user_name}</td><td>{fmtDate(r.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </>
  );
}

function Bars({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="panel chart">
      <h3>{title}</h3>
      {rows.length === 0 && <p className="empty">No data yet.</p>}
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="bar-value">{r.value}</span>
        </div>
      ))}
    </section>
  );
}

const STAGE_LABEL = {
  owner_approval: "Waiting for owner", reencryption_request: "Owner to request re-encryption",
  cloud_approval: "Waiting for cloud", key_release: "Waiting for keys", download: "Keys sent",
  delivered: "Downloaded", rejected: "Rejected",
};

export function CloudActivity() {
  const { data, error } = useLoad("/cloud/stats");
  return (
    <>
      <PageHead title="Activity" />
      {error && <p className="note note-bad">{error}</p>}
      {data && (
        <>
          <dl className="panel details inline">
            <div><dt>Owners</dt><dd>{data.owners}</dd></div>
            <div><dt>Users</dt><dd>{data.users}</dd></div>
            <div><dt>Files</dt><dd>{data.files}</dd></div>
            <div><dt>Requests</dt><dd>{data.requests}</dd></div>
          </dl>
          <div className="grid-charts">
            <Bars title="Requests by progress" rows={Object.entries(data.stages).map(([k, v]) => ({ label: STAGE_LABEL[k] || k, value: v }))} />
            <Bars title="Uploads per owner" rows={data.uploads_per_owner} />
            <Bars title="Requests per file" rows={data.requests_per_file} />
          </div>
        </>
      )}
    </>
  );
}
