# Secure Cloud Share

React + FastAPI (Python) + MongoDB version of the cloud data-sharing project (owner, user, authority and cloud modules). The Java/JSP/MySQL backend is fully replaced.

## What you need
- Python 3.10+ and Node.js 18+
- MongoDB (easiest: `docker compose up -d` in this folder, or install MongoDB Community locally)

## 1. Backend (Terminal 1)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows      (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # Mac/Linux: cp .env.example .env
python -m app.crypto_service --newkey     # prints a key -> paste it as MASTER_KEY_B64 in .env
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste as JWT_SECRET in .env
uvicorn app.main:app --reload --port 8000
```
Open http://localhost:8000/docs to see every API endpoint.
Run the crypto tests with `python -m pytest tests`.

## 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## 3. Demo walk-through (about 3 minutes)
Built-in accounts (change them in `.env`): `authority / Authority@123` and `cloud / Cloud@12345`.

1. Register one **owner** and one **user** (Register page). Both are *Deactivated* at first.
2. Sign in as **authority** > Accounts > activate both.
3. **Owner**: Upload file. (Stored encrypted. Plain file is never saved.)
4. **User**: Find files > Request.
5. **Owner**: Download requests > Accept > Request re-encryption.
6. **Cloud**: Re-encryption > Approve. (Stored files page shows only ciphertext bytes.)
7. **Authority**: Key release > Send keys. Keys are e-mailed; with `DEV_SHOW_KEYS=true` they are also shown on screen.
8. **User**: My requests > enter tkey + skey > Decrypt and download. Try a wrong key to see it fail.
9. **Cloud**: Downloads and Activity show the result.

To e-mail keys for real, fill the `SMTP_*` values in `.env` (Gmail needs an App Password), then set `DEV_SHOW_KEYS=false`.

## How the keys work
| Step | What happens | Code |
|---|---|---|
| Upload | A new random 256-bit file key encrypts the file (AES-256-GCM). The file key is stored only after being encrypted with the server's master key. | `encrypt_file` |
| Key release | Authority generates `tkey` (16 hex) and `skey` (8 chars) with Python's `secrets`. The file key is re-encrypted under a key derived (scrypt) from tkey + skey. Keys are e-mailed, never stored. | `generate_access_keys`, `rewrap_for_request` |
| Download | The user's tkey + skey are the only way to unlock the file key. Wrong keys fail (limited attempts), keys expire (24 h default). | `decrypt_for_request` |

Same flow as the Java project, but: no hardcoded DES key, no 10,000-value keys, no plain copy of the file, keys are not put in URLs, and each request gets its own keys.

## Old project to new project
| Java project | This project |
|---|---|
| JSP pages | React pages (`frontend/src/pages`) |
| Servlets / JSP logic | FastAPI routes (`backend/app/routes`) |
| MySQL tables `oreg`, `ureg` | MongoDB `users` (role field) |
| `upload` | `files` |
| `urequest`, `porequest` | `requests` (one document per request, with a status for each stage) |
| `CipherHelper`, `AES`, key code in `upload.jsp` | `backend/app/crypto_service.py` |
| `mail.java` | `backend/app/mailer.py` |
| Hardcoded `authority/authority`, `cloud/cloud` | Seeded accounts from `.env` |

## For your viva: be honest about the cryptography
The original Java code does not implement real attribute-based encryption or proxy re-encryption, and this version does not either. Here the "re-encryption" is **envelope encryption with key re-wrapping**: the file key is re-encrypted for one request under keys only that user holds. Describe it as a simulation of proxy re-encryption. If you want a real PRE scheme, look at the `umbral-pre` Python library as a next step.

## Known limits
- No login rate-limiting or HTTPS (use a reverse proxy such as Nginx/Caddy when deploying).
- Uploaded files are kept on the server disk in `backend/storage/` (10 MB limit, change in `.env`). Back up `MASTER_KEY_B64`: without it uploaded files cannot be decrypted.
- Not yet run end-to-end in the environment where it was generated (no MongoDB or npm access there). If anything fails on first run, send the error text.
