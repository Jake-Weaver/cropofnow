# DNS before the GitHub Pages cutover (captured 2026-09-23 from Squarespace)

Nameservers: ns-cloud-b1..b4.googledomains.com (Squarespace Domains, ex-Google Domains)

| Section | Type | Name | TTL | Data |
|---|---|---|---|---|
| Squarespace Domain Connect | CNAME | _domainconnect | 1 hr | _domainconnect.domains.squarespace.com |
| Squarespace Domain Forwarding (apex -> www) | A | @ | 4 hrs | 198.185.159.144 |
| Custom | CNAME | 5jy6cafwy5kj | 4 hrs | gv-54twoo7gnbh5kv.dv.googlehosted.com |
| Custom | CNAME | o3x67lrvfu77 | 4 hrs | gv-o4tsnuw7o5iry7.dv.googlehosted.com |
| Custom | CNAME | www | 4 hrs | ghs.googlehosted.com |

To roll back to Google Sites: set `www` CNAME back to ghs.googlehosted.com, delete the four GitHub A records,
and re-add the Domain Forwarding rule cropofnow.com -> www.cropofnow.com.
