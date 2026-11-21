import { useState } from "react";
import { api } from "../api.js";
import { Badge, LoadState, PageHead, Stepper, fmtDate, useAction, useLoad } from "../components/ui.jsx";

function AccountTable({ role }) {
  const { data, error, reload } = useLoad(`/authority/accounts?role=${role}`);
  const run = useAction(reload);
  return (
    <LoadState data={data} error={error} empty={`No ${role} accounts have registered yet.`}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Username</th><th>E-mail</th><th>Mobile</th><th>Location</th><th>Registered</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {(data || []).map((u) => {
              const active = u.status === "Activated";
              return (
                <tr key={u.id}>
                  <td>{u.username}</td><td>{u.email}</td><td>{u.mobile}</td><td>{u.location}</td><td>{fmtDate(u.created_at)}</td>
                  <td><Badge tone={active ? "good" : "warn"}>{u.status}</Badge></td>
                  <td className="right">
                    <button className={active ? "btn" : "btn btn-primary"}
                      onClick={() => run(() => api(`/authority/accounts/${u.id}/status`, { method: "POST", body: { status: active ? "Deactivated" : "Activated" } }), active ? "Account deactivated" : "Account activated")}>
                      {active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </LoadState>
  );
}

export function AuthorityAccounts() {
  const [role, setRole] = useState("owner");
  return (
    <>
      <PageHead title="Accounts">New accounts cannot sign in until you activate them.</PageHead>
      <div className="seg inline" role="radiogroup" aria-label="Account type">
        {[["owner", "Owners"], ["user", "Users"]].map(([r, label]) => (
          <button key={r} role="radio" aria-checked={role === r} className={role === r ? "on" : ""} onClick={() => setRole(r)}>{label}</button>
        ))}
      </div>
      <AccountTable key={role} role={role} />
    </>
  );
}

export function AuthorityKeys() {
  const { data, error, reload } = useLoad("/authority/requests");
  const run = useAction(reload);
  const [issued, setIssued] = useState({});   // request id -> result of the last send

  async function send(r) {
    const res = await run(() => api(`/authority/requests/${r.id}/send-key`, { method: "POST" }),
      r.key_status === "Sent" ? "New keys created" : "Keys created");
    if (res) setIssued((prev) => ({ ...prev, [r.id]: res }));
  }

  return (
    <>
      <PageHead title="Key release">
        Requests the cloud has approved. Sending creates a fresh pair of keys and e-mails them to the user. Sending again replaces the old keys.
      </PageHead>
      <LoadState data={data} error={error} empty="No request is waiting for keys.">
        <div className="cards">
          {(data || []).map((r) => {
            const res = issued[r.id];
            return (
              <article className="panel req" key={r.id}>
                <div className="req-top">
                  <div>
                    <h3>{r.keyword}</h3>
                    <p className="muted">for {r.user_name} · {r.user_email} · owner {r.owner_name}</p>
                  </div>
                  <div className="actions">
                    {r.stage === "delivered" ? <Badge tone="good">Downloaded</Badge> : (
                      <button className="btn btn-primary" onClick={() => send(r)}>
                        {r.key_status === "Sent" ? "Send new keys" : "Send keys"}
                      </button>
                    )}
                  </div>
                </div>
                <Stepper stage={r.stage} />
                {res && (
                  <div className="keybox">
                    <p>
                      {res.emailed ? `Keys were e-mailed to ${res.sent_to}.` : `E-mail is not set up, so give these keys to ${res.sent_to} yourself.`}
                      {" "}They are shown only now.
                    </p>
                    {res.keys && (
                      <p className="mono">tkey&nbsp;&nbsp;{res.keys.tkey}<br />skey&nbsp;&nbsp;{res.keys.skey}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </LoadState>
    </>
  );
}
