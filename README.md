# Cross Stitch Studio

A modern, mobile-first cross stitch design app. Set fabric size in inches, add margins, draw patterns on realistic Aida fabric, and see finished dimensions in inches and centimetres.

## Features

- Draw stitches on Aida fabric canvas (tap or drag)
- Fabric size in inches (single or double digit, e.g. 5", 12", 24")
- Border margins with visible margin zone on canvas
- Fabric count selection (11–32 ct)
- Fabric and thread colour pickers
- Stitch, eraser, and fill tools
- Templates: heart, star, border
- Fit pattern view and zoom
- Export pattern as PNG
- Light and dark mode
- Settings saved in browser local storage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to Netlify, Vercel, or GitHub Pages.

## Deploy

1. Push this repo to GitHub
2. Connect to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Output directory: `dist`

## Project structure

```
src/
  components/   # UI components and design studio
  constants/    # Fabric counts and colours
  hooks/        # State and persistence
  types/        # TypeScript types
  utils/        # Rendering, calculations, export
```

## Licence

MIT
