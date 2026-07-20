# Phương Phương Portfolio

A responsive React/Vite portfolio with a GitHub-backed content studio for editing copy, images, portfolio cards, reel frames, booking labels, SEO, and Comp Card without changing React code.

## Run locally

    npm install
    npm run dev

## Build for production

    npm run build

## CMS workflow

After the one-time OAuth setup below, open:

    https://phuongphuong.vercel.app/admin/

The editor signs in with GitHub, opens Portfolio Phương Phương, edits the desired fields, then clicks Publish. Decap CMS commits the content or uploaded media to the main branch. Vercel sees that commit and automatically builds a new deployment.

The editable source of truth is src/content/site.json. The React site reads it through src/data/portfolio.js, so the original visual layout, motion, responsive behavior, and lightbox remain protected in code.

### What the client can edit

- Name, contact email, social links, navigation labels, footer, and SEO.
- Hero image, copy, CTAs, captions, and year label.
- Statement copy and emphasized phrase.
- Up to eight Selected work cards, including order, category, image, and alt text.
- Editorial cards, image reel, About copy, measurements, and press links.
- Contact labels, project options, form status text, and Comp Card PDF.

### What stays in code

- Typography, colors, spacing, animation, lightbox mechanics, mobile behavior, and section anchor IDs.
- Booking delivery endpoint and all credentials.
- Image optimization behavior for the legacy local images.

New uploads are placed in public/images/uploads and work immediately after the Vercel deployment completes. The CMS limits each upload to 5 MB. They do not require the local Sharp optimization command, so use compressed JPG or WebP files whenever possible; portrait images at least 1600 px tall and horizontal sharing images at least 1200 × 630 px work best.

## First-time CMS setup on Vercel

### 1. Create a GitHub OAuth App

While logged in as the repository owner, open GitHub Settings → Developer settings → OAuth Apps → New OAuth App.

- Application name: Phương Phương Content Studio
- Homepage URL: https://phuongphuong.vercel.app
- Authorization callback URL: https://phuongphuong.vercel.app/api/callback

Copy the generated Client ID and create a Client Secret. The secret is shown only once.

### 2. Add environment variables in Vercel

Open the Vercel project for this repository, then Settings → Environment Variables. Add these values for Production. The CMS is intentionally configured for the stable production domain, not Vercel preview URLs.

    GITHUB_OAUTH_CLIENT_ID=<GitHub OAuth App Client ID>
    GITHUB_OAUTH_CLIENT_SECRET=<GitHub OAuth App Client Secret>
    CMS_OAUTH_CALLBACK_URL=https://phuongphuong.vercel.app/api/callback
    CMS_ALLOWED_ORIGIN=https://phuongphuong.vercel.app
    CMS_STATE_SECRET=<a unique random string of at least 32 bytes>
    CMS_GITHUB_SCOPE=public_repo

Generate the state secret with a password manager or:

    node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

Do not add the OAuth secret with a VITE_ prefix and never commit it to the repository.

This repository is public, so public_repo is the minimum GitHub scope. If the repository is later made private, change both CMS_GITHUB_SCOPE and the auth_scope value in public/admin/config.yml to repo, then redeploy.

### 3. Redeploy and test

Redeploy the Vercel project after saving the variables. Then:

1. Visit /admin/.
2. Click Login with GitHub.
3. Approve the requested access.
4. Edit a small text field, publish it, and wait for Vercel to finish deploying.
5. Confirm the change on the public website.

The OAuth callback domain must exactly match the one registered in GitHub. If the production domain changes, update all three places: the GitHub callback URL, CMS_OAUTH_CALLBACK_URL, and CMS_ALLOWED_ORIGIN; then update public/admin/config.yml and redeploy.

### 4. Give an editor access

Decap CMS writes commits through the logged-in editor's GitHub account. Add the person who will manage content as a collaborator with Write access to Smoothtr/phuongphuong. They can then log in at /admin/ and publish without receiving Vercel or OAuth secrets.

Important: GitHub Write access is repository-wide, not content-only. Give it only to a trusted technical editor. If the client must have a restricted content-only role, use a role-based headless CMS such as Sanity instead of the GitHub-backed workflow in this repository.

## Local CMS development

The Vite development server renders the portfolio and its local JSON content. The GitHub OAuth endpoints are Vercel serverless functions, so the production login flow needs a Vercel deployment (or Vercel CLI development mode) to test.

To edit local content without the CMS, change src/content/site.json and run npm run build.

## Media and Comp Card

The original responsive WebP/JPEG variants are in public/images/optimized. The source images remain in public/images and can be reprocessed with:

    npm run images:optimize

The initial Comp Card is public/comp-card-phuong-phuong.pdf. In CMS, upload a replacement through Contact → Comp card → File PDF.

## Booking form

Set VITE_FORM_ENDPOINT in a local .env file or Vercel environment variable to send booking requests to Formspree, Web3Forms, EmailJS through a proxy, or a custom endpoint. Without it, the form opens the configured booking email in the visitor's email app.

## Relevant references

- Decap CMS GitHub backend: https://decapcms.org/docs/github-backend/
- Decap CMS configuration: https://decapcms.org/docs/configure-decap-cms/
- GitHub OAuth Apps: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- Vercel environment variables: https://vercel.com/docs/environment-variables
