# Balance Clock

A chess-clock-style timer with two modes, Study and Leisure, instead of two
players. Time in Study adds to a balance; time in Leisure subtracts from it.
The balance is capped at ±3 hours.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Deploy

Pushes to `main` build and deploy to GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). Enable Pages
for the repo (Settings → Pages → Source: GitHub Actions) and set
`base` in [vite.config.ts](vite.config.ts) to match the repo name.
