# STORAGE SOLVERS INC.

Shipping-container storefront and quote-request starter built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, Neon Postgres, Cloudinary, Auth.js, and Resend.

## Local development

Requirements: Node.js 20+ and npm.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the services you want to enable.
3. For a database-backed install, create a Neon project and set `DATABASE_URL` to its pooled connection string and `DIRECT_URL` to its direct connection string.
4. Create the schema and seed inventory: `npx prisma migrate dev --name init` then `npx prisma db seed`.
5. Start the storefront: `npm run dev` and open `http://localhost:3000`.

The storefront has a demo inventory fallback when `DATABASE_URL` is unset, so the UI can be explored without external accounts. Quote requests are validated and return a successful demo acknowledgement in that mode, but are only persisted and emailed when the corresponding database and Resend settings are configured. Admin features require Neon, an `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NEXTAUTH_SECRET`; the seed script creates/updates that admin using the environment variables.

## Services and environment

- **Neon:** Create a Postgres project. Use the pooled URL for `DATABASE_URL` and the direct URL for Prisma migrations in `DIRECT_URL`.
- **Cloudinary:** Create a cloud, set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Product uploads are signed by the server and stored below `containers/{slug}/`. Public catalog images use `f_auto,q_auto` URL transforms. Demo listings use a shared Unsplash placeholder until replaced with uploaded product photos.
- **Auth.js:** Generate a long random `NEXTAUTH_SECRET`, set `NEXTAUTH_URL` to the site origin, and set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding. Never commit `.env`.
- **Resend:** Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_EMAIL` (the template uses `storangesolver@gmail.com`). Quote notifications are sent to both `ADMIN_EMAIL` and the public contact email when both are configured. Use `onboarding@resend.dev` for quick testing, then switch `RESEND_FROM_EMAIL` to a verified sender/domain for production.
- **Company content:** Update `lib/config.ts` with the real company name, phone, email, address, and WhatsApp number. Have counsel review the Terms and Privacy templates.

For a Vercel production deployment, add these variables to the **Production** environment and redeploy:

- `DATABASE_URL` and `DIRECT_URL` for the Neon project
- `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` set to the public site URL
- `NEXTAUTH_SECRET` set to a long random secret
- `ADMIN_EMAIL=storangesolver@gmail.com` and a strong `ADMIN_PASSWORD`
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` using a verified Resend sender/domain
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`

After the schema is available, run `npx prisma db seed` once with the production variables to create or update the administrator account. The administrator can update and delete inquiries from `/admin/inquiries`.

## Useful commands

- `npm run dev` - start local development
- `npm run typecheck` - TypeScript validation
- `npm run build` - generate Prisma client and build for production
- `npx prisma migrate dev` - apply local development migrations
- `npx prisma db seed` - seed ten sample listings and the optional initial admin
- `npx prisma studio` - inspect database records
- `npm run db:cleanup-legacy-images` - preview legacy image records in Neon
- `npm run db:cleanup-legacy-images -- --apply` - delete only legacy placeholder/Commons image records and matching Cloudinary assets

## Inventory API

`GET /api/products` returns active inventory. Optional query parameters: `size` (`FT10`, `FT20`, `FT40`, `FT45`, `FT53`), `type`, `condition`, `availability` (`new`, `used`, `all`), `location`, `q`, `minPrice`, `maxPrice`, `sort` (`newest`, `price-asc`, `price-desc`), `page`, and `limit`. Example: `/api/products?size=FT40&availability=used&sort=price-asc`. New includes New and One-Trip. Used includes Cargo Worthy, Wind & Water Tight, and As-Is.

## Deployment to Vercel

Import the repository in Vercel, set production environment variables, and deploy. Run database migrations from a trusted deployment job or locally with `DIRECT_URL`; do not run development migrations as part of the web request lifecycle. Configure the Resend sender domain, Cloudinary account, `NEXTAUTH_URL`, and `NEXT_PUBLIC_SITE_URL` for the production hostname. Product updates are dynamic; ISR revalidation can be added to the admin mutation path if the deployment uses static caching.

## Current scope

Public inventory supports URL-backed search, filters, sorting, pagination, size landing pages, product specs, and Product JSON-LD. Product admin mutations revalidate inventory, detail pages, and sitemap. Quotes support validation, honeypot, an in-process rate limit, optional database persistence, and Resend notifications. The inquiry list stores chosen items in browser local storage. Admin supports credentials login, dashboard counts, product create/edit/quick price-stock-status updates/duplication/deletion, signed Cloudinary uploads, inquiry status/notes, and CSV export. Payment checkout is intentionally not enabled; quote requests are the purchase-intent flow.

Before launch, replace sample prices, sample depot inventory, placeholder photos/testimonial, company details, legal copy, and demo content. Confirm delivery coverage and pricing, add production monitoring and durable distributed rate limiting, and have privacy/security policies reviewed.