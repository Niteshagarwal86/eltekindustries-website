# eltekindustries.in

Static, mobile-first marketing website for **Eltek Industries**, a PVC electrical conduit manufacturer at SIDCUL Pantnagar, Uttarakhand.

It's plain HTML, Tailwind CSS and one small vanilla JS file. There's no framework and no backend. `npm run build` writes a ready-to-deploy `dist/` folder.

---

## Run locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # build + serve dist/ at http://localhost:8080
```

`npm run serve` serves the existing `dist/` without rebuilding (set `PORT=…` to change the port).

## Build

```bash
npm run build      # → dist/
npm run validate   # HTML validation of every page in dist/
```

The build (`scripts/build.js`):

1. Renders `src/pages/**.html` through `src/layouts/base.html`. The header, footer and mobile action bar are written once in `src/partials/`.
2. Generates one page per product from `data/products.json` and `src/templates/product.html`.
3. Converts any photos you add into responsive WebP. Wherever there is no photo, it uses the SVG illustrations.
4. Writes `sitemap.xml`, `robots.txt`, favicons, `site.webmanifest`, the Open Graph image, JSON-LD and canonical URLs.
5. Runs Tailwind (`src/css/input.css`) → `dist/assets/css/style.css`.

### Where things live

| What | File |
|---|---|
| Company facts: phone, WhatsApp, email, **address**, founder, hours, stats, Formspree ID | `data/site.json` |
| Products, sizes, features, applications, colours, pack info | `data/products.json` |
| Pages | `src/pages/` (`about.html` → `/about/`, `products/index.html` → `/products/`) |
| Product page template | `src/templates/product.html` |
| Header / footer / mobile bar | `src/partials/` |
| Styles and colour tokens (light + dark mode) | `src/css/input.css`, `tailwind.config.js` |
| Behaviour (menu, Homes/Industry toggle, animations, forms) | `src/js/main.js` |
| Product and scene illustrations | `scripts/lib/product-art.js`, `scripts/lib/scene-art.js` |

**Adding a size:** add a row to that product's `sizes` in `data/products.json` and rebuild. Product cards, size tables, the catalogue, the quote form's product list and the schema markup all update from that one file.

---

## Deploy

### Netlify (recommended: the forms work with no extra setup)

1. Push this folder to a Git repository.
2. Netlify → **Add new site → Import from Git**.
3. Build command: `npm run build` · Publish directory: `dist`
4. Deploy. Netlify picks up `404.html` and the `_headers` file automatically.

To deploy by drag and drop instead, run `npm run build` and drop the `dist/` folder onto app.netlify.com/drop.

### Cloudflare Pages

Workers & Pages → Create → Pages → Connect to Git. Framework preset: *None*. Build command: `npm run build`. Output directory: `dist`.

### GitHub Pages

Add `.github/workflows/pages.yml`:

```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

Then go to Settings → Pages → Source: **GitHub Actions**. The build already writes `dist/CNAME` with `eltekindustries.in`.

### Point eltekindustries.in at the site

At your domain registrar (GoDaddy, Hostinger, BigRock, etc.):

| Host | Records |
|---|---|
| **Netlify** | Add the domain in *Domain management*. Then either switch the nameservers to Netlify DNS, or add `A @ 75.2.60.5` and `CNAME www <your-site>.netlify.app` |
| **Cloudflare Pages** | *Custom domains → Set up a domain*. If the domain's DNS is on Cloudflare, it adds the records for you |
| **GitHub Pages** | `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and `CNAME www <user>.github.io` |

HTTPS is issued automatically by all three hosts. Use `https://eltekindustries.in` (no www) as the primary domain, because the canonical URLs and sitemap use it.

---

## Forms (quote and dealer)

The forms send by AJAX and show a success or error message on the page.

- **Formspree:** create a form at formspree.io and put its ID in `data/site.json` → `"formspreeId": "abcdwxyz"`. Rebuild. Submissions are then emailed to you.
- **Netlify Forms fallback:** while `formspreeId` is still `FORMSPREE_ID`, the forms post to Netlify Forms. Both forms already carry `data-netlify="true"` and a honeypot field. Turn on form notifications in Netlify → Forms.

Links such as `/contact/?product=PVC%20Bend` pre-fill the product and message fields. Every product page uses these links.

---

## Images

### Real product photos (recommended)

Shoot the real products, drop the photos into `src/images/raw/`, then run `npm run watermark`.

`npm run watermark` resizes each photo (max 1600 px), converts it to WebP and stamps a subtle semi-transparent ELTEK logo in the corner. The output goes to `src/images/products/`.

**Name each photo after the product slug** and the next build uses it in place of the illustration everywhere:

`conduit-pipe` · `casing-capping` · `bend` · `flexible-pipe` · `accessories` · `junction-box` · `saddle` · `round-sheet` · `fan-sheet` · `surface-box`

### Scene / lifestyle photos

Use only Unsplash or Pexels photos. See `src/images/CREDITS.md` for the file names (`home.jpg`, `factory.jpg`, `residential.jpg`, `industrial.jpg`, `about-hero.jpg`). Put them in `src/images/stock/` and record the credit.

### Other photos

| Photo | Put it at |
|---|---|
| Manufacturing gallery (About page) | `src/images/gallery/` (file names become captions, e.g. `01-extrusion-line.jpg` → "Extrusion line"). It currently holds six representative Pexels photos; swap in real plant photos and update `CREDITS.md`. |

The logo mark in `src/images/brand/eltek-mark.svg` was traced from the supplied logo. Replace it with the original vector file if you have one.

---

## Content to fill in

Every placeholder appears on the site in square brackets so it's easy to spot.

| Placeholder | Where to change it |
|---|---|
| `FORMSPREE_ID` | `data/site.json` → `formspreeId` |
| `[Business hours — …]` | `data/site.json` → `businessHours` |
| `[Pack info]` × 20, `[Coil length]` × 5 | `data/products.json` → each size's `pack` |
| `[Colours — default: …]` × 5 | `data/products.json` → each product's `colours` |
| `[Founder's quote — …]` | `src/pages/index.html` → founder section |
| `[Packing details — bundle sizes, labels]` | `src/pages/quality.html` → Packing & dispatch |

### Please confirm

- **Founder title.** The site uses *"Founder & Managing Director"* for Mr. Sachin Agarwal (`data/site.json` → `founderTitle`).
- **Address.** *Plot No. 96, Sector IIOC, SIDCUL, Pantnagar, Uttarakhand – 263153* (`data/site.json` → `address`).
- **Which products carry the ISI mark.** Only **PVC Conduit Pipe** is shown as ISI marked (IS 9537). If other products are also certified, set `"isi": true` for them in `data/products.json`.
- **"Typical use" guidance** in the size tables. These are general suggestions; review them with your technical team.
- **Copy written for you:** Vision & Mission, founder narrative, core values and dealer benefits (About and Dealer pages). All of it is qualitative, with no invented figures, awards or dates.
