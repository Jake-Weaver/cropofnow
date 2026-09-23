// Crop of Now — shared header, ticker, footer and money settings.
// ===== The only settings you should need to touch =====
const CONFIG = {
  // Amazon Associates tracking ID (e.g. "cropofnow-20"). Blank = links still work, no commission.
  amazonTag: "cropofnow-20",
  // Merch store base URL once Printful/Shopify is live (e.g. "https://shop.cropofnow.com").
  // Blank = shop buttons read "Coming soon".
  storeUrl: "",
};
// ======================================================

const NAV = [
  ["index.html", "Home"],
  ["about.html", "Leadership"],
  ["shop.html", "Shareholder Merch"],
  ["pantry.html", "Approved Pantry"],
  ["reserve.html", "Reserve"],
  ["faq.html", "FAQ"],
];

const TICKER = [
  ["PNUT", "▲ 3.2 GAL/OZ", "up"],
  ["ALMD", "▼ 28.7 GAL/OZ", "down"],
  ["LEGUME IDX", "▲ ALL-TIME HIGH", "up"],
  ["GRAND CANYON COVERAGE", "▲ 100%", "up"],
  ["CREAMY/CRUNCHY SPREAD", "EAST ▲ / WEST ▲", "up"],
  ["ALMOND BUTTER", "▼ STILL NO", "down"],
  ["PB&J PER ACRE", "▲ 35,000", "up"],
  ["LONGEST THROW", "124.4 FT", "up"],
  ["MIN. PEANUT CONTENT", "90% BY LAW", "up"],
];

function here() {
  const p = location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
}

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const links = NAV.map(([href, label]) =>
    `<a href="${href}"${href === here() ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const tick = TICKER.map(([k, v, c]) => `<span><b>${k}</b><span class="${c}">${v}</span></span>`).join("");
  el.outerHTML = `
    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="index.html"><img src="assets/favicon.svg" alt="" width="30" height="30">
          <span>Crop of Now<small>AN AGRICULTURAL CONCERN</small></span></a>
        <nav class="nav" aria-label="Main">${links}</nav>
      </div>
    </header>
    <div class="ticker" aria-label="Market data (satirical)"><div class="ticker-track">${tick}${tick}</div></div>`;
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  const year = new Date().getFullYear();
  el.outerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="cols">
          <div>
            <a class="brand" href="index.html"><img src="assets/favicon.svg" alt="" width="30" height="30"><span>Crop of Now</span></a>
            <p style="margin-top:14px">Peanuts are the crop of now.<br>They were also the crop of then. We checked.</p>
          </div>
          <div><h4>The Company</h4><ul>
            <li><a href="about.html">Leadership</a></li><li><a href="faq.html">Investor FAQ</a></li><li><a href="reserve.html">Crop of Now Reserve</a></li></ul></div>
          <div><h4>Commerce</h4><ul>
            <li><a href="shop.html">Shareholder Merchandise</a></li><li><a href="pantry.html">The Approved Pantry</a></li></ul></div>
        </div>
        <div class="legal">
          <p>© ${year} Crop of Now. Crop of Now is a work of satire. We are not affiliated with the National Peanut Board, any peanut
          butter brand, any comic strip, or any almond. No almonds were consulted in the making of this website.</p>
          <p>As an Amazon Associate we earn from qualifying purchases. Links on this site may earn us a commission at no cost to you.</p>
        </div>
      </div>
    </footer>`;
}

function applyMoneySettings() {
  // Tag every Amazon link with our Associates ID.
  if (CONFIG.amazonTag) {
    document.querySelectorAll('a[href*="amazon.com"]').forEach(a => {
      const u = new URL(a.href);
      u.searchParams.set("tag", CONFIG.amazonTag);
      a.href = u.toString();
    });
  }
  document.querySelectorAll('a[href*="amazon.com"]').forEach(a => {
    a.rel = "sponsored noopener";
    a.target = "_blank";
  });
  // Shop buttons: live link when the store exists, otherwise "Coming soon".
  document.querySelectorAll("[data-product]").forEach(btn => {
    if (CONFIG.storeUrl) {
      btn.href = CONFIG.storeUrl.replace(/\/$/, "") + "/products/" + btn.dataset.product;
      btn.textContent = "Buy now";
    } else {
      btn.removeAttribute("href");
      btn.setAttribute("aria-disabled", "true");
      btn.textContent = "Coming soon";
    }
  });
}

renderHeader();
renderFooter();
applyMoneySettings();
