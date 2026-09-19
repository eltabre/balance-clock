# Balance Clock

A clock based on the 50% rule of Drawabox. 

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
