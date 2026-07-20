# foodcheck-api

Backend API for the Digital Product Passport Platform. **This is the only
service that communicates with MongoDB** — the admin and public frontends
talk to this API exclusively.

## Status: Milestone 1 — Project Initialization

What exists right now: a working Express server, MongoDB connection,
centralized error handling, environment validation, and two reusable
utilities (JWT sign/verify, prefixed NanoID generation) that the next
milestone (Authentication) will build on.

**Not yet implemented:** auth endpoints, Company/Plant/Product/Batch
modules, analytics. Those are later milestones, built one at a time.

## Folder Structure
```
src/
├── config/       # env validation, MongoDB connection
├── models/       # Mongoose schemas (empty until Authentication milestone)
├── repositories/ # the ONLY layer that queries MongoDB (empty for now)
├── services/     # business logic (empty for now)
├── controllers/  # thin request/response handling
├── routes/       # one file per resource, mounted in routes/index.js
├── middleware/   # errorHandler, notFound (auth middleware arrives with Authentication)
├── validation/   # request validation schemas (empty for now)
├── utils/        # ApiError, asyncHandler, jwt, idGenerator
└── app.js        # Express app assembly
server.js          # entry point
```

## Setup
```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

Visit `http://localhost:5000/api/v1/health` — you should see:
```json
{ "success": true, "data": { "status": "ok", "uptimeSeconds": 0, "db": "connected" }, "error": null }
```

## Environment Variables
See `.env.example` for the full list. `MONGODB_URI`, `JWT_ACCESS_SECRET`,
and `JWT_REFRESH_SECRET` are required — the server refuses to start
without them (see `src/config/env.js`).

## Deployment (Render)
- New Web Service → connect this repo
- Build command: `npm install`
- Start command: `npm start`
- Add all variables from `.env.example` under the Environment tab

## Response Shape
Every endpoint returns one consistent shape:
```json
{ "success": true,  "data": { ... }, "error": null }
{ "success": false, "data": null,    "error": { "code": "SOME_CODE", "message": "..." } }
```
