# Rules As Written — Design System

Design tokens, component patterns, and conventions for the Rules As Written website.

## Colors

All colors are defined as CSS custom properties in `src/styles/global.css` and mapped to Tailwind in `src/styles/tailwind.css`.

### Core Palette

| Token | Value (Dark) | Tailwind | Usage |
| ----- | ------------ | -------- | ----- |
| `--color-text` | `rgba(255,255,255,0.9)` | `text-text` | Primary text |
| `--color-bg` | `#1A2232` | `bg-bg` | Page background |
| `--color-bg-lighten-10` | `#232B3B` | `bg-bg-light` | Card backgrounds, input backgrounds |
| `--color-bg-lighten-20` | `#2C3648` | `bg-bg-lighter` | Hover states, borders |
| `--color-primary` | `hsl(9, 59%, 46%)` | `bg-primary`, `text-primary` | Primary actions, brand color |
| `--color-primary-lighten-50` | `hsl(9, 59%, 65%)` | `text-primary-muted` | Links, secondary text |
| `--color-primary-lighten-70` | `hsl(9, 59%, 75%)` | `text-primary-faint` | Hover states |
| `--color-secondary` | `hsl(223, 76%, 39%)` | `text-secondary` | Audio visualizer, accents |

### Primary Opacity Scale

For transparent primary overlays (CTA buttons, hover states):

| Token | Value | Usage |
| ----- | ----- | ----- |
| `--color-primary-10` | `hsla(9, 59%, 46%, 0.1)` | Subtle backgrounds |
| `--color-primary-20` | `hsla(9, 59%, 46%, 0.2)` | Hover backgrounds |
| `--color-primary-30` | `hsla(9, 59%, 46%, 0.3)` | Borders, active states |
| `--color-primary-40` | `hsla(9, 59%, 46%, 0.4)` | Stronger borders |

### Semantic State Colors

| Token | Value | Tailwind | Usage |
| ----- | ----- | -------- | ----- |
| `--color-error` | `#ef4444` | `text-error`, `bg-error` | Error messages, destructive actions, debit amounts |
| `--color-success` | `#22c55e` | `text-success`, `bg-success` | Success messages, credit amounts |
| `--color-overlay` | `rgba(0,0,0,0.6)` | `bg-overlay` | Modal/dialog backdrops |

### Currency Colors

| Token | Value | Tailwind | Usage |
| ----- | ----- | -------- | ----- |
| `--color-gold-pp` | `#e5e4e2` | `text-gold-pp` | Platinum |
| `--color-gold-gp` | `#ffd700` | `text-gold-gp` | Gold |
| `--color-gold-ep` | `#a8a060` | `text-gold-ep` | Electrum |
| `--color-gold-sp` | `#c0c0c0` | `text-gold-sp` | Silver |
| `--color-gold-cp` | `#b87333` | `text-gold-cp` | Copper |

### Rarity Colors

| Token | Value | Tailwind | Usage |
| ----- | ----- | -------- | ----- |
| `--color-rarity-common` | `#9ca3af` | `text-rarity-common` | Common items |
| `--color-rarity-uncommon` | `#22c55e` | `text-rarity-uncommon` | Uncommon items |
| `--color-rarity-rare` | `#3b82f6` | `text-rarity-rare` | Rare items |
| `--color-rarity-very-rare` | `#a855f7` | `text-rarity-very-rare` | Very Rare items |
| `--color-rarity-legendary` | `#f97316` | `text-rarity-legendary` | Legendary items |
| `--color-rarity-artifact` | `#ef4444` | `text-rarity-artifact` | Artifact items |

## Typography

| Token | Value | Usage |
| ----- | ----- | ----- |
| `--font-body` | `system-ui, sans-serif` | Body text |
| `--font-heading` | `inherit` | Headings |
| `--font-size-0` – `--font-size-8` | `12px` – `40px` | Font size scale |
| `--font-weight-body` | `300` | Body text weight |
| `--font-weight-heading` | `500` | Heading weight |

## Spacing

Scale from `--space-0` (0) to `--space-14` (128px). Use Tailwind classes: `p-space-4`, `gap-space-2`, etc.

| Token | Value |
| ----- | ----- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-7` | 32px |
| `--space-8` | 40px |

## Component Patterns

### Modals

```html
<div class="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center sm:p-space-4">
  <div class="max-h-[90vh] w-full max-w-lg rounded-t-xl border border-bg-lighter bg-bg shadow-lg sm:rounded-[5px]">
    <!-- Header -->
    <!-- Content -->
    <!-- Footer -->
  </div>
</div>
```

### Buttons

- **Primary**: `bg-primary text-white hover:bg-primary-light`
- **Secondary/Ghost**: `bg-primary/20 text-primary-muted hover:bg-primary/30`
- **Destructive**: `text-error/50 hover:bg-error/10 hover:text-error`
- **Touch target minimum**: 44px (`h-11 w-11`)

### Form Inputs

```html
<input class="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-base text-text outline-none focus:border-primary" style="font-size: 16px" />
```

`font-size: 16px` inline style prevents iOS auto-zoom on focus.

### Toast Notifications

Use the shared `Toast` component (`src/components/Toast.tsx`):
- `variant="success"` — uses `--color-success`
- `variant="error"` — uses `--color-primary` (brand-consistent)
- Auto-closes after 5 seconds
- Centered horizontally, 70px from top

### Section Headings

```html
<h2 class="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
  Section Title
</h2>
```

## Dark Mode

Dark mode is the default. Light mode uses `[data-theme="light"]` selector and overrides core color tokens.

## Border Radius

- Default: `rounded-[5px]` (`--radius-0: 5px`)
- Round: `rounded-full` (`--radius-round: 50%`)

## Z-Index Layers

| Layer | Z-Index | Element |
| ----- | ------- | ------- |
| Player bar | 10 | Fixed audio player |
| Character tabs | 10 | Fixed bottom tab bar |
| Site nav | 20 | Sticky top navigation |
| Mobile menu backdrop | 29 | Semi-transparent overlay |
| Mobile menu panel | 30 | Slide-out menu |
| Modals | 50 | All modal overlays |
