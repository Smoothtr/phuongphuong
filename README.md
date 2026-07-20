# Phương Phương Portfolio

A responsive React/Vite portfolio rebuilt from the supplied research and the legacy Canva site.

## Run locally

    npm install
    npm run dev

## Build for production

    npm run build

## Media and comp card

    npm run images:optimize

Responsive WebP/JPEG variants live in public/images/optimized/. The source images remain in public/images/ so they can be replaced and reprocessed when the client supplies final photography.

The generated Comp Card for the site is public/comp-card-phuong-phuong.pdf. Regenerate it with scripts/generate_comp_card.py from a Python environment that has ReportLab installed.

## Replacing temporary assets

All temporary images are stored in `public/images/`. The page content and asset references are centralized in `src/data/portfolio.js`, so final client imagery can be replaced without changing layout components.

Set VITE_FORM_ENDPOINT in a local .env file to send booking requests to Formspree, Web3Forms, EmailJS via a proxy, or a serverless endpoint. Without it, the form preserves a mailto fallback.
