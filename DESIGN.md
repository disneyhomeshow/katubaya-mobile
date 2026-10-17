# katubaya design guidelines

How the katubaya interface is designed, and how to keep it that way. The rules here are
grounded in Apple's Human Interface Guidelines (HIG), applied as design principles to a web
PWA. Where a rule comes from the HIG, the page is cited as `page.md › Heading`; the pages are
vendored under `.claude/skills/apple-design/references/hig/`.

The interface language is pt-BR with an en locale. This document is in English, like the rest
of `docs/`, so contributors can read it; UI copy examples stay in pt-BR.

## 1. Purpose and thesis

katubaya has one job: a farmer standing in the field logs what was harvested in under 30
seconds, and once a week turns that log into a sellable availability message for WhatsApp.
Everything else (crops, lots, expiry, export) exists to serve those two moments.

- **Thesis.** Fast, offline, one hand. The screen should get out of the way of a muddy thumb.
- **Signature element.** The harvest quantity dial: a large number flanked by two round
  buttons, with quick-add chips below. It is the one place the design is bold; everything
  around it is quiet.
- **Feeling.** Calm competence. Earthy, legible, no decoration that does not carry
  information. Delight comes from speed and from seeing the week's harvest become a message,
  not from ornament (`design-principles.md › Delight`).

Apple's eight principles (`design-principles.md`) are the first filter for any screen:

| Principle | What it means here |
| --- | --- |
| Purpose | Each screen has one job. If a control does not serve it, cut it. |
| Agency | People can skip optional steps, undo mistakes, and never lose data silently. |
| Responsibility | Data stays on the device. Claims in the UI are true (do not say "offline ready" until it is). |
| Familiarity | Bottom navigation, sheets, back buttons and forms behave like the platform. |
| Flexibility | Works at 375 px, at 200 % text size, in light and dark, with a keyboard or a screen reader. |
| Simplicity | Progressive disclosure over density. Lists show a summary; details live one tap away. |
| Craft | Spacing, alignment, wording and animation are finished. No placeholder controls. |
| Delight | One signature moment per flow. Do not mistake delight for decoration. |

## 2. Platform scope

katubaya is a React + Vite + Tailwind + shadcn/radix PWA. The HIG applies as principles and as
foundations (accessibility, color, typography, layout, writing), not as native conventions
(`cross-platform.md`). From the mobile conventions we deliberately adopt:

- Bottom navigation for top-level sections, a center button for the primary action
  (`tab-bars.md › Best practices`: tabs navigate, the button acts).
- Bottom sheets for short tasks and menus, with a grabber and swipe to dismiss
  (`sheets.md › Best practices`).
- Centered dialogs only for small forms; alerts only for destructive confirmation
  (`modality.md`, `alerts.md`).
- Safe areas, 44 pt targets, one-handed reach: primary actions sit mid-screen or lower
  (`designing-for-ios.md › Best practices`, `layout.md › Guides and safe areas`).
- Appearance follows the system. There is no in-app theme switch
  (`dark-mode.md › Best practices`).

Current layouts target the compact width class (phones). Tablet and desktop widths reuse the
same layout centered at `max-w-lg`; a sidebar conversion is future work.

## 3. Color

Colors are semantic tokens defined once in `src/index.css` as HSL triplets and exposed through
Tailwind (`tailwind.config.ts`). Components never use raw palette classes (`amber-500`,
`green-600`), hex values or inline colors.

### Tokens

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `background` | Page surface | `45 30% 97%` `#faf8f5` | `140 25% 10%` `#132017` |
| `card` | Grouped content, header, nav | `45 25% 95%` `#f5f4ef` | `140 20% 14%` `#1d2b21` |
| `foreground` | Primary text | `140 30% 15%` `#1b3222` | `45 30% 95%` `#f6f4ee` |
| `muted-foreground` | Secondary text | `140 15% 37%` `#506d5a` | `45 15% 60%` `#a8a18a` |
| `primary` | Brand green: primary actions, selected tab, favorites | `140 45% 31%` `#2b7343` | `80 50% 55%` `#9fc653` |
| `secondary` | Quiet filled controls, neutral badges | `45 40% 88%` | `140 20% 20%` |
| `muted` | Row backgrounds, skeletons | `45 20% 90%` | `140 15% 18%` |
| `accent` | Hover surface for ghost/outline controls only | `80 40% 90%` | `80 20% 22%` |
| `destructive` | Destructive actions and their confirmation | `0 70% 45%` `#c32222` | `0 65% 69%` `#e37d7d` (label `140 30% 10%`) |
| `border` | Card and separator lines | `140 20% 85%` | `140 15% 22%` |
| `input` | Form field borders, switch track | `140 12% 53%` | `140 12% 39%` |
| `harvest-success` | Status: fresh | `140 60% 28%` `#1d7239` | `140 50% 50%` `#40bf6a` |
| `harvest-warning` | Status: expiring soon, stale list | `40 90% 28%` `#885d07` | `40 80% 55%` `#e8ab30` |
| `harvest-expired` | Status: expired | `0 70% 45%` `#c32222` | `0 65% 69%` `#e37d7d` |
| `whatsapp` | The message preview bubble, nowhere else | `94 78% 87%` | `169 100% 18%` |

### Contrast (computed, WCAG ratio)

Text up to 17 pt needs 4.5:1; 18 pt or bold needs 3:1 (`accessibility.md › Vision`). Every
text token below clears 4.5:1 on `card`, and status text also clears it on its own 10 % tint
(`bg-harvest-*/10` over `card`), which is where badges actually render.

| Pair | Light | Dark |
| --- | --- | --- |
| `foreground` on `background` | 13.1:1 | 15.4:1 |
| `muted-foreground` on `card` / on `muted/50` row | 5.2:1 / 5.0:1 | 5.7:1 / 5.4:1 |
| `primary` text on `card` / on `primary/10` chip | 5.3:1 / 4.6:1 | 8.6:1 / n.a. |
| `primary-foreground` on `primary` (button label) | 5.5:1 | 8.5:1 |
| `destructive` text on `card` / label on `destructive` | 5.3:1 / 5.6:1 | 5.3:1 / 6.0:1 |
| `harvest-success` text on its 10 % tint | 4.7:1 | 5.3:1 |
| `harvest-warning` text on its 10 % tint | 4.6:1 | 6.0:1 |
| `harvest-expired` text on its 10 % tint | 4.6:1 | 4.6:1 |
| `input` border on `background` (non-text, 3:1 target) | 3.1:1 | 3.1:1 |

Recompute whenever a token changes. A tiny script that does it lives in the review log at the
end of this file.

### Rules

- **One color, one meaning** (`color.md › Best practices`). `harvest-warning` is only for
  time-based status (expiring, stale). Favorites use `primary`. `destructive` is only for
  delete and its confirmation. Never reuse the warning amber for emphasis.
- **Status is never color alone** (`color.md › Inclusive color`). Every status chip carries
  text ("Vence em 3 dias") or an icon.
- **Brand color is spent sparingly** (`branding.md › Best practices`): the primary button of a
  screen, the selected tab, the favorite star, the quantity in the dial. Not on card titles,
  not on decoration.
- **Tints** use the token with alpha: `bg-harvest-warning/10`, `border-primary/20`. Never a
  lighter palette step.
- Both appearances are first-class. Dark tokens are not inversions; `primary` shifts from deep
  green to lime and `destructive` to a light red, both carrying a dark label, so filled buttons
  and plain text both read on dark surfaces (`dark-mode.md › Dark Mode colors`).
- **Never dim a container that holds text or controls** (`opacity-60` on a row drops its text
  under 4.5:1). Show excluded or expired state with a muted background, a strikethrough and the
  status badge; dim only decorative elements.

## 4. Typography

The system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, …`) renders SF
on Apple devices and the platform face elsewhere. One typeface, hierarchy by size and weight
(`typography.md › Conveying hierarchy`).

| Role | Tailwind | Size | Weight | Use |
| --- | --- | --- | --- | --- |
| Screen title | `text-base font-semibold` | 16 px | 600 | `PageHeader` title |
| Section title | `text-lg font-semibold` | 18 px | 600 | Card titles, sheet titles |
| Display number | `text-4xl` / `text-5xl font-bold` | 36 / 48 px | 700 | Quantity dial, summary |
| Stat | `text-3xl font-bold text-primary` | 30 px | 700 | Home counters |
| Body | default | 16 px | 400 | Lists, descriptions, inputs |
| Secondary | `text-sm text-muted-foreground` | 14 px | 400 | Meta lines under a name |
| Caption / badge | `text-xs` (badges `font-semibold`) | 12 px | 400 / 600 | Status chips, hints |

- Minimum size is 12 px (HIG minimum 11 pt). Never use `text-[10px]` or lighter than
  `font-normal` for small text (`typography.md › Ensuring legibility`).
- Sizes are rem-based so browser text scaling works. Containers that hold text use `min-h-*`,
  not fixed `h-*`, so 200 % text does not clip (`typography.md › Supporting Dynamic Type`).
- Do not block zoom: the viewport meta has no `user-scalable=no`.
- Numbers that matter (quantity, price) are the largest thing on their screen; units sit next
  to them in `muted-foreground`.
- Money is formatted with `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

## 5. Layout and spacing

- **Width.** Content is centered at `max-w-lg` (512 px) with `p-4` gutters. One column.
- **Vertical rhythm.** `space-y-4` between cards, `space-y-2` between rows inside a card.
  Card padding is `p-4`; compact info tiles may use `p-3`.
- **Radius.** `--radius: 0.75rem`. Cards `rounded-lg`, chips and pills `rounded-full`,
  bottom sheets `rounded-t-[10px]` (Drawer default).
- **Bottom navigation.** Fixed, `h-16` (4 rem) plus the bottom safe area. Two tabs and the
  center action button. Content above it pads `pb-[calc(5rem+var(--safe-area-bottom))]`.
- **Safe areas** (`layout.md › Guides and safe areas`). `body` does not pad for them; bars pad
  themselves: top bars `pt-[var(--safe-area-top)]`, fixed bottom bars
  `pb-[var(--safe-area-bottom)]`. A fixed action bar above the nav sits at
  `bottom-[calc(4rem+var(--safe-area-bottom))]`. With the iOS status bar style left at
  `default`, the top inset is 0 in a standalone PWA and the padding is inert; it exists for a
  future Capacitor shell, where it is not.
- **The document scrolls**, not `<main>`. A scrolling `<main>` would detach the sticky header.
- **Deliberate deviation.** The primary action button sits in the center of the bottom
  navigation bar. `tab-bars.md` reserves tab bars for navigation; we accept the deviation because
  "log a harvest" is the product's one job and must be reachable with the thumb from every
  screen. It must stay the only action in that bar.
- **Reach.** Primary actions live at the bottom (wizard footer, full-width Save) or in the
  middle (dial). Headers hold only Back, a title and at most one secondary action.
- **Stacking over squeezing.** When a row would wrap awkwardly at 375 px, stack the secondary
  line under the primary one instead of fighting for horizontal space.

## 6. Components

Use the shadcn components in `src/components/ui/` as the vocabulary. Customize with tokens,
never by hard-coding colors inside a page.

| Need | Use | Notes |
| --- | --- | --- |
| Screen chrome | `AppShell` + `PageHeader` | `showBack` for pushed screens; `showNav={false}` inside flows |
| Primary action from anywhere | FAB in `AppShell` → `Drawer` menu | Grabber, swipe to dismiss, first action highlighted |
| Short task, menu, details | `Drawer` (bottom sheet) | Max `85dvh`, inner scroll, safe-area padding at the bottom |
| Small form (≤ 6 fields) | `Dialog` | Floats with 1 rem margins and rounded corners on phones |
| Destructive confirmation | `AlertDialog` | Title as a question ("Excluir cultura?"), Cancel, destructive-styled action. Never `window.confirm` |
| Lists of records | `Card` rows | Name, then one meta line, then status chips; chevron only when it opens something |
| Status | `ExpirationBadge` / `Badge variant="outline"` with a status token | Text always present |
| Filters | Chip buttons (`<button aria-pressed>` styled with `badgeVariants`) | Never a `div` with `onClick` |
| Feedback | `sonner` toasts: `toast.success` / `toast.error` | One sentence; description says the next step ("Cole no WhatsApp para enviar") |
| Loading | Skeleton cards or a spinner inside the content area | Never block the whole screen |
| Empty | Icon, one line, one button for the next step | `writing.md › Provide clear next steps on any blank screens` |

Component rules:

- **Buttons.** `default` for the one primary action per screen, `outline` for secondary,
  `ghost` for toolbar icons, `destructive` only inside an `AlertDialog` or an explicit delete.
  Icon-only buttons use `size="icon"` and always carry `aria-label`. A global rule gives every
  `button`/`a` a 44 × 44 minimum; do not shrink them with `h-8 w-8`.
- **Inputs.** Every field has a `<Label htmlFor>`. Pick the keyboard: `inputMode="decimal"`
  for quantities and prices, `"numeric"` for day counts, `type="tel"` for phones,
  `type="search"` with `enterKeyHint="search"` for search (`entering-data.md`,
  `virtual-keyboards.md`). Validate as people type and show the error next to the field.
- **Select.** Radix `SelectItem` forbids an empty value. Use a sentinel (`'none'`) for "no
  selection" and map it to `undefined`.
- **Switch.** 28 × 48 (HIG minimum control size); it is excluded from the 44 px rule.
- **Cards are not buttons.** A tappable row is a `<button>` styled like a card, or a card that
  contains the button. Secondary actions inside a row stop propagation.
- **No decorative affordances.** A drag handle that does not drag, a disabled icon with no
  label, a "Ver todos" with no destination: delete them.

## 7. Iconography

- `lucide-react` is the only icon set in UI chrome: `h-4 w-4` inline with text, `h-5 w-5` in
  headers and nav, `h-6 w-6` in the dial buttons. Stroke weight matches the text weight next
  to it (`icons.md`).
- No emoji in chrome. Emoji is content: category icons chosen by the user, the WhatsApp
  message itself, and the per-crop emoji previewed in the availability editor because it is
  what the message will contain. Decorative emoji are `aria-hidden`.
- Selected tab: `text-primary` plus a semibold label and `aria-current="page"`.
- App icon: `public/icon-*.png` are rasterized from `favicon.svg`. They use an emoji on a
  green disc, which is a placeholder, not a finished icon (`app-icons.md`: filled shapes,
  no text or UI replicas). Replacing it is open work.

## 8. Motion

- Motion is brief and purposeful: sheet slide-in, `active:scale-95` on chips, a spinning
  refresh icon while loading. No motion on every tap, no bounces (`motion.md`).
- `prefers-reduced-motion: reduce` collapses all animations and transitions globally
  (`src/index.css`). State changes still happen; only the choreography is removed.

## 9. Writing and i18n

Voice: a knowledgeable neighbor, direct and warm. Portuguese as spoken on a farm, not in a
bank (`writing.md › Getting started`).

- **Every string goes through `t()`**, in both `pt-BR.json` and `en.json`, including
  `aria-label`, placeholders and toast text. The two files must have the same keys (the test
  suite is the place to assert that).
- **Capitalization.** Title Case for screen titles and button labels ("Registrar Colheita",
  "Gerar Lista"); sentence case for body, helper text, empty states and toasts' descriptions.
  Apply per element type, consistently (`writing.md › Best practices`).
- **Buttons say what happens**, with a verb: "Copiar para WhatsApp", not "OK". The name
  survives the flow: "Gerar Lista" produces "Lista gerada".
- **Errors say what to do next**: "Não foi possível salvar a cultura. Tente novamente." Never
  "Oops", never "we".
- **Empty states invite the next action** and include the button for it.
- **Numbers and dates** follow the active locale through `Intl` (`i18n.language`): comma
  decimals and `R$ 6,50/kg` in pt-BR. Date formats are still hard-coded `dd/MM` in a few places;
  route them through one helper when a language selector exists.
- **Plurals** use i18next suffixes and `count`: `t('inventory.expiresIn', { count: days })`
  with `expiresIn_one` / `expiresIn_other` in both locales. Never "1 dias".
- Interpolate, do not concatenate.
- **Claims must be true.** "Pronto para uso offline" was replaced by "Seus dados ficam neste
  aparelho" until a service worker exists (`design-principles.md › Responsibility`).

## 10. Accessibility floor

Every change ships with all of these true (`accessibility.md`):

- Text contrast ≥ 4.5:1 (≥ 3:1 for 18 px+ or bold) in light and dark; recompute when a token
  changes.
- Controls ≥ 44 × 44 (switches ≥ 28 × 48), with spacing between adjacent controls.
- Every icon-only control has an `aria-label`; toggles expose `aria-pressed`; the selected
  tab exposes `aria-current`.
- Keyboard: everything reachable by Tab, one visible focus ring (global `:focus-visible`).
- Nothing conveyed by color alone; progress (wizard steps) also exists as text.
- Pinch zoom and browser text scaling work; layouts stack instead of clipping.
- Reduce Motion respected.
- Form fields labelled; the right virtual keyboard; errors adjacent and announced
  (`aria-live="polite"`).

## 11. Dark mode

Appearance follows the system through `next-themes` (`attribute="class"`,
`defaultTheme="system"`). There is no in-app toggle (`dark-mode.md › Best practices`). Both
palettes are defined in `src/index.css`; test every screen in both. Whites are softened
(`#f6f4ee`, never pure white), overlays are `bg-black/80`, and the WhatsApp bubble has its own
dark value so the preview still reads like WhatsApp.

## 12. Review checklist for a PR

1. Which of the eight principles does the change serve? If none, why ship it?
2. New colors: are they tokens? Did you recompute contrast? One color, one meaning?
3. New controls: 44 pt, `aria-label`, keyboard focus, real `<button>`?
4. New strings: in both locales, correct case, verb on the button, next step in the error?
5. New layout: safe areas, 375 px, 200 % text, light and dark?
6. One thing to remove: is there an accessory that can go?

## 13. Review log

**2026-10-17, full-codebase review (HIG lenses 1–5).** Rating before: Critical issues.
Fixed: status text contrast (warning 1.9:1 → 4.5:1, success 3.1:1 → 4.6:1, dark expired
3.8:1 → 4.6:1), accent hover surface (2.5:1 label → 11.8:1), input border visibility, pinch
zoom re-enabled, safe areas on header, nav, wizard and action bars, 44 pt rule no longer
distorting switches, global focus ring and Reduce Motion, aria-labels on all icon-only
controls, chips and cards turned into real buttons, `window.confirm` → `AlertDialog`,
Radix `SelectItem value=""` crash, invalid category tint CSS, emoji removed from chrome,
amber palette replaced by status/primary tokens, WhatsApp bubble tokenized, hardcoded strings
moved to i18n, duplicate availability config UI removed, dead controls removed, inventory row
overflow stacked, harvest date timezone bug, Home availability card wired to real data,
Settings farm form wired, PWA icons and theme colors.

A second adversarial pass then caught and fixed: the sticky header defeated by a scrolling
`<main>`, the FAB rendering as an oval, the quick-actions drawer missing its close button and
initial focus, two competing stores for farm name and contact (Settings is now the only one),
plural forms ("1 dias"), status and destructive text that still missed 4.5:1 on their own
tints, rows dimmed with `opacity` over live controls, invalid HTML inside buttons and
headings, a drawer that vanished mid-animation, a future harvest date accepted by the wizard,
and the duplicate-harvest flow losing its unit. Rating after: Good. Verified in the browser at
375 px in both appearances.

Open: a designed app icon; a service worker before claiming offline readiness; a language
selector in Settings (dates still use pt-BR patterns until then); tablet/desktop sidebar
layout; the primary action button inside the navigation bar is a deliberate deviation kept
on purpose (see §5).

Contrast helper (Node): paste the HSL triplets and run.

```js
const hsl=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return[f(0),f(8),f(4)]};
const lum=([r,g,b])=>{const c=x=>x<=0.03928?x/12.92:((x+0.055)/1.055)**2.4;return .2126*c(r)+.7152*c(g)+.0722*c(b)};
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return((x+.05)/(y+.05)).toFixed(2)};
const blend=(fg,a,bg)=>fg.map((c,i)=>c*a+bg[i]*(1-a)); // a 10 % tint over a surface
const card=hsl(45,25,95), warning=hsl(40,90,28);
console.log(ratio(warning, card), ratio(warning, blend(warning,.10,card))); // 5.29, 4.63
```
