# Crop of Now — cropofnow.com

Satirical peanut brand site. Plain static HTML/CSS/JS, no build step. Hosted on GitHub Pages.

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: hero, mission, stats, links to shop / pantry / reserve |
| `about.html` | "Leadership" interview (the original Peanuts/Almond Butter Q&A) + values memo |
| `faq.html` | Original FAQ, as "Investor Relations" |
| `shop.html` | Merch (print-on-demand) |
| `pantry.html` | "Approved Pantry": peanut butter picks with Amazon affiliate links |
| `reserve.html` | Teaser for the future craft-peanut line |
| `home.html`, `about-us.html` | Redirects from the old Google Sites URLs |
| `404.html` | Not-found page |

Header, ticker and footer are rendered by `assets/site.js` (edit `NAV` / `TICKER` there).

## Making money: the two settings
Both live at the top of `assets/site.js`:
- `amazonTag`: your Amazon Associates tracking ID. Every Amazon link on the site gets it automatically.
- `storeUrl`: the merch store base URL. Each shop button links to `storeUrl/products/<data-product>`, so give
  products in the store the same handles as the `data-product` values in `shop.html`. Blank = "Coming soon".

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
