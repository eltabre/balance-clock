# Balance Clock

A clock based on the [50% rule of Drawabox](https://drawabox.com/lesson/0/2/50percent) to help me keep track of not only doing lessons and drills, but to also draw for fun.

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
