# Aurelle Perfumes: Frontend (Next.js)

E-commerce demo for perfumes: search and filters, quick view, wishlist, cart drawer, checkout with
COD or online payment (test mode), order tracking, email-verified login, reviews, admin dashboard,
dark/light mode, responsive layout.

- Live site: https://YOUR-SITE.netlify.app  (backend is on free hosting, the first load can take ~1 minute)
- API repo: https://github.com/YOUR-USERNAME/aurelle-perfumes-api

## Tech
Next.js (App Router), React, TypeScript, Tailwind CSS v4, Motion, lucide-react.
Backend: ASP.NET Core Web API + SQL Server.

## Run locally
```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```
Open http://localhost:3000 (the API must be running, see `NEXT_PUBLIC_API_URL`).

## Environment
| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, no trailing slash. It is baked in at build time, so redeploy after changing it |

## Notes
Demo project. Payments run in test/demo mode only.
