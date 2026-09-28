# Italissimo — restaurant website

Static multipage site (HTML + Tailwind CSS via CDN + vanilla JS). Bilingual: Latvian (default) / English.

## Pages
| File | Page |
|---|---|
| `index.html` | Home (Sākums) |
| `menu.html` | Menu (Ēdienkarte) — tabs, deep links like `menu.html#pizza` |
| `about.html` | About (Par mums) — story, timeline, chef, values |
| `gallery.html` | Gallery (Galerija) — filters + lightbox |
| `reservations.html` | Reservations (Rezervācija) — booking form + FAQ |
| `contact.html` | Contact (Kontakti) — form + Google map |

## How to edit
- **Text / translations:** Latvian is the element's normal content; English is in the `data-en` attribute on the same element. Placeholders use `data-en-ph`.
- **Header, mobile menu, footer:** shared across all pages in `assets/js/layout.js`.
- **Colours & fonts:** `assets/js/tailwind-config.js` and the `:root` variables in `assets/css/style.css`.
- **Contact details** (address, phone +371 2000 0000, e-mail, hours) are placeholders — search and replace them in all files.
- **Images** are Unsplash links for now; replace the `src` URLs with the restaurant's own photos.

## Before going live
- Forms only show a success message; connect them to a backend or a form service (e.g. Formspree) to actually receive bookings.
- The Tailwind Play CDN is fine for previews; for production, compile Tailwind with the CLI for faster loading.
