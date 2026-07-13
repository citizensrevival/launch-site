# Discrepancies

Things that don't line up between the sources we were given, and things on the site that
look wrong. Written down so nobody has to rediscover them.

**Sources used, in order of authority:**

1. **The printed flyers** (`Full Weekend.png`, `Saturday Flyer.png`) — these are already
   public, so the site must agree with them.
2. **Tripp's email** (13 July 2026) — newer, but not yet public.
3. **The old site copy** — oldest, and partly out of date.

---

## 🔴 Needs a decision — someone has to answer these

### 1. The promo video has the wrong date on it

The final card of the video reads:

> **AUGUST 29, 29, & 30, 2026**

The first date should be **28**. An earlier card in the same video gets it right
("August 28, 29, & 30"), so the video contradicts itself.

- **What we did:** trimmed the video so it ends *before* the bad card. The version on
  the site never shows the wrong date.
- **What's still needed:** Tripp should fix the master file. The same card is probably in
  anything else cut from this footage.

### 2. Sunday ends at 1pm or 2pm?

| Source | Sunday hours |
| --- | --- |
| Full Weekend flyer | 9:00am – **1:00pm** |
| Tripp's email | 9am – **2pm** |

- **What we did:** used **1:00pm**, because the flyer is already in public hands.
- **What's still needed:** confirm which is right. If it's 2pm, the flyer is wrong too.

---

## ✅ Resolved — no action needed

### 3. The site's configured domain is dead

`thecitizensrevival.com` is the real site. `citizens.fvcsolutions.com` 404s and is no
longer supported.

- **What we did:** confirmed with Jason, then pointed `public/CNAME`, the README and
  `.cursorrules` at `thecitizensrevival.com`.

  Two things this had already broken, both fixed: the `og:`/`twitter:` tags in
  `index.html` pointed at the dead domain, so **every social share showed a broken preview
  image**; and the lead-capture Lambda's CORS allowlist was built from `CNAME`, which
  would have made the browser **block every form submission** from the live site.

  The lesson: `public/CNAME` is not the source of truth. For Pages deploys driven by
  Actions, the custom domain lives in the repo's Pages settings and that is what serves
  traffic — a stale `CNAME` file sits there looking authoritative while being wrong.
  Check with `gh api repos/citizensrevival/launch-site/pages --jq .cname`.
- **What's still needed:** the `citizens.fvcsolutions.com` CNAME record still exists in
  Route53 (zone `fvcsolutions.com`) pointing at `citizensrevival.github.io`. It serves no
  purpose now and can be deleted.

### 4. Friday: Main Street, or the Senior Center?

It looked like the flyer and the email disagreed. They don't:

- The **event** is on **Main Street**.
- The **scavenger hunt starts** at the Aztec Senior Community Center.

Both are true at once. The original site copy was right, and Friday stays on Main Street.

### 5. Sunday: "Community Center" or "Senior Center"?

Not a conflict either. The venue's actual name is the **Aztec Senior Community Center** —
one place, and its name happens to contain both words.

### 6. "Zia Chick's" — a band or a venue?

A **band**. The flyer confirms it: *"The Zia Chicks @ the Stage on Main."* Note it's
plural — **The Zia Chicks**.

---

## 📋 Things the email said that the flyers didn't (now on the site)

- Scavenger hunt has **three routes**: small, medium, large.
- Parking at the Senior Community Center **and** the city complex.
- **20+ businesses** on Friday; **30+ vendors** and **10 food trucks** on Saturday.
- **Prizes at 7:45pm** Friday — inflatable paddle board, ukulele, gift cards, and more.
- Beer garden **last call at 8pm**.
- Live music in **three locations** on Friday.

## 📋 Things the flyers said that the email didn't (now on the site)

- There's a **car show** on Saturday.
- The event is explicitly **FREE**.
- The full Saturday lineup: Vintage Brew 12:30pm, Julie & The Boyz 2:00pm,
  Rio Grand Trio 4:00pm, Hamilton Loomis 7:00pm.

## 🚫 Deliberately left off the site

- **The 4pm Sunday volunteer dinner.** Tripp: *"volunteer dinner is not open to the
  public"* — so it doesn't belong on a public schedule.

---

## 🐛 Pre-existing site bugs (unrelated to this content update)

| Bug | Where | Effect |
| --- | --- | --- |
| "← Back to Home" is invisible on desktop | Sponsors, Vendors, Volunteers, Brought to You By | Renders at `x=0`, underneath the purple sidebar. One layout fix covers all four. |
| Footer says **© 2025** | `Intro.tsx` (`IntroFooter`) | It's 2026, and the event is 2026. |
| Orphaned tracked file | `supabase/.branches/_current_branch` | Left behind when Supabase was removed. |

---

## 📦 Missing assets

- **Photos.** Tripp said he may have some "in a day or two". Friday and Sunday currently
  reuse generic stock shots of Aztec.
