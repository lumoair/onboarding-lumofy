# onboarding-lumofy

This repository contains a Render-ready web UI prototype for the Lumofy Employee Onboarding Management feature.

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`.

## Deploy on Render

This repository includes `render.yaml` for a Render Blueprint deploy on https://render.com/.

### Option 1: Blueprint

1. Push this repository to GitHub as `onboarding-lumofy`.
2. In Render, create a new Blueprint.
3. Select the repository.
4. Render will detect `render.yaml` and create the web service.

### Option 2: Manual Web Service

- Runtime: Node
- Build Command: `true`
- Start Command: `npm start`
- Health Check Path: `/api/health`

## Included assets

- `public/` static frontend
- `server.js` no-dependency Node server
- `data/sample-data.json` mock onboarding data
- `database/onboarding_schema.sql` starter database schema
- `docs/lumofy-onboarding-mvp-spec.md` implementation spec
