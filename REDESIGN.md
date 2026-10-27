# Black & Gold redesign

What changed:

- New look: black and Purdue gold, Instrument Serif headings, Geist body text
- Twinkling starfield background that drifts slightly as you scroll
- A winding F1 circuit down the page; the car follows your scroll and crosses the finish line at the bottom
- Smooth scrolling for every in-page link, smooth one-time reveals (no blur, no flicker)
- Experience rows with a timeline bar; click a row to expand it
- Project cards with playing-card corners (K♠, A♥, Q♦, J♣ ... by sort order), GitHub and Live site buttons
- Admin portal restyled so it's clearly separate from the public site, with all the same features

## After you deploy: update two fields in the admin panel

Go to **/admin → Profile**:

- **Hero line:** `I’m drawn to analytical pipelines, ML applications and software that holds up on messy, real-world data.`
- **About:** `The Management minor is the other half of how I think: why we build things, and the impact they have.`

Then **/admin → Projects**: add up to 3 links per project and name each button whatever you like.

## One-time setup (unlocks the full admin panel)

The site works without this, and the admin panel shows a banner with this same SQL and a Copy button until it's done.
It unlocks: up to 3 custom-named links per project, project screenshots, the "Visible on site" toggle, the card-corner picker, and editable headline stats.

Supabase → your project → **SQL Editor** → New query → paste → **Run**:

```sql
alter table profile add column if not exists stats jsonb;
alter table projects add column if not exists images text[] default '{}';
alter table projects add column if not exists visible boolean default true;
alter table projects add column if not exists card_rank text;
alter table projects add column if not exists card_suit text;
alter table projects add column if not exists links jsonb default '[]';
```

## Where to change static text

`app/content.ts` holds the few things that aren't in Supabase: the small line above your name, the About quick facts, the default stats, the Leadership entries and the hidden footer easter egg.
