# Crop of Now — cropofnow.com

Satirical peanut brand site. Plain static HTML/CSS/JS, no build step. Hosted on Jake's netcup VPS (Caddy); DNS at Cloudflare.

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: hero, mission, stats, links to shop / pantry / reserve |
| `about.html` | "Leadership" interview (the original Peanuts/Almond Butter Q&A) + values memo |
| `faq.html` | Original FAQ, as "Investor Relations" |
| `shop.html` | Merch (print-on-demand) |
| `pantry.html` | "Approved Pantry": peanut butter picks with Amazon affiliate links |
| `reserve.html` | Crop of Now Reserve: Valencia peanuts roasted in Pottsville (coming soon) |
| `blog.html` | "Field Reports" blog index |
| `valencia-peanuts.html` | SEO article: why Valencias are the top-tier peanut (keep facts sourced) |
| `home.html`, `about-us.html` | Redirects from the old Google Sites URLs |
| `404.html` | Not-found page |

Header, ticker and footer are rendered by `assets/site.js` (edit `NAV` / `TICKER` there).

## Making money: the two settings
Both live at the top of `assets/site.js`:
- `amazonTag`: your Amazon Associates tracking ID. Every Amazon link on the site gets it automatically.
- `storeUrl`: the merch store base URL. Each shop button links to `storeUrl/products/<data-product>`, so give
  products in the store the same handles as the `data-product` values in `shop.html`. Blank = "Coming soon".
  Live since 2026-11-13: `https://emhp40-tp.myshopify.com` (Shopify store "Crop of Now", Printful fulfills).

## Brand assets
- `assets/favicon.svg`: the peanut mark. **Original artwork.** The old Google Sites favicon was a third-party
  icon and must not be reused.
- `assets/mock/*.svg`: shop mockups; the slogans double as the starting point for print files.
- `assets/img/*.jpg`: stock photos carried over from the Google Sites version.
- Do not use anything from the *Peanuts* comic strip (characters, logo, lettering). It's trademarked.

## Preview locally
```
python -m http.server 8765
```
Then open http://localhost:8765

## Hosting & DNS
- Served by Caddy on the netcup VPS (`bobweaver-vps`, 159.195.19.131) from a checkout at `/opt/cropofnow`. A systemd timer (`cropofnow-pull.timer`) pulls `main` every minute, so **pushing to `main` still deploys** (live within ~1 min). Caddy issues the HTTPS cert itself and redirects `www` and `http://` to `https://cropofnow.com`. `/docs`, `/ops` and dotfiles are not served.
- DNS is at **Cloudflare** (DNS only, grey cloud; nameservers `cora`/`isaac.ns.cloudflare.com`, switched 2026-09-29). The domain is still *registered* at Squarespace (auto-renew on). Mail records (Mailgun MX/SPF/DKIM/DMARC for Squarespace email forwarding) live in Cloudflare too.
- GitHub Pages is still enabled as a fallback; the `CNAME` file is for it. Rollback = in Cloudflare, point `A @` back at GitHub Pages (185.199.108-111.153) and delete the `AAAA @` record.
- Pre-cutover records and rollback steps: `docs/dns-before-cutover.md`.
- The old Google Sites version still exists at sites.google.com/view/wwwcropofnowcom (not linked to the domain any more).

## If it breaks

**What runs:** no AI and no build. On the VPS, `cropofnow-pull.timer` (systemd, 1 min after boot and then every
minute) runs `cropofnow-pull.service` as user `bobweaver`: `git -C /opt/cropofnow pull -q --ff-only`. Caddy serves
`/opt/cropofnow` as static files for `cropofnow.com` (block in `/etc/caddy/Caddyfile`; `www.cropofnow.com`
redirects).

**Where to look first (on the VPS, `ssh bobweaver-vps`)**
```
systemctl status cropofnow-pull.timer caddy
journalctl -u cropofnow-pull.service -n 20      # pull errors
journalctl -u caddy -n 50                       # TLS / config errors
sudo -u bobweaver git -C /opt/cropofnow log -1  # what is live
```
Run git in `/opt/cropofnow` **as `bobweaver`**. Run as root, git refuses ("dubious ownership").

| Symptom | Likely cause | Fix |
|---|---|---|
| Push didn't show up | Pull failing: the checkout has local edits or diverged history (`--ff-only` refuses) | `sudo -u bobweaver git -C /opt/cropofnow status`; never edit files on the server; `git reset --hard origin/main` as bobweaver if needed |
| Site down, certificate error | Caddy stopped, or the Let's Encrypt renewal failed (DNS or port 80 blocked) | `systemctl restart caddy`; check DNS still points at the VPS (Cloudflare, grey cloud) |
| Domain doesn't resolve at all | Registration lapsed at Squarespace, or the Cloudflare nameservers were changed | Check renewal at Squarespace and the NS records |
| "Buy now" goes to a 404 or a password page | Product handle in Shopify no longer matches `data-product` in `shop.html`, or Shopify private mode got turned back on | Match the handle (Shopify Admin > product > Search engine listing > URL handle); Online Store > Preferences > Private mode off |
| Emergency | VPS is down | Roll back to GitHub Pages (see Hosting & DNS above) |

**Re-deploy by hand:** `sudo systemctl start cropofnow-pull.service` (or just push to `main`). **Restart:**
`sudo systemctl restart caddy` (`caddy validate --config /etc/caddy/Caddyfile` first if you edited it).

**Don'ts:** this repo is public, so never commit secrets, server passwords or anything from `docs/` that shouldn't be
public. Every push to `main` is live within a minute. Follow the VPS's own rules in `/opt/bobweaver-netcup-setup`
(Caddy is the only public entry; check `PORTS.md` before adding services).
