# Design System: 海枫未来规划院 (HaiFeng Future Planning Institute)

## 1. Visual Theme & Atmosphere

A warm, inviting educational platform with confident asymmetric layouts and fluid spring-physics motion. The atmosphere is **academic yet approachable** — like a well-lit university study hall with warm wood tones and natural light. The design balances professional credibility (for exam preparation) with modern digital-first aesthetics (for Gen-Z university students aged 18-25).

- **Density:** "Daily App Balanced" (5) — Information-rich but never overwhelming. Generous whitespace between sections.
- **Variance:** "Offset Asymmetric" (6) — Hero sections break symmetry. Content cards use varied layouts. Not rigid grid systems.
- **Motion:** "Fluid CSS" (6) — Spring physics on interactions. Staggered reveals. No jarring jumps. Every hover has purposeful feedback.

The warm orange brand identity is the emotional anchor — it communicates energy, optimism, and academic ambition. Blue serves as the functional accent for active states and selections, creating clear visual hierarchy against the orange base.

## 2. Color Palette & Roles

### Primary Brand Colors
- **Brand Orange** (`#F97316`) — Primary CTA buttons, sidebar backgrounds, card top borders, active nav indicators. The signature brand color.
- **Brand Orange Light** (`#FB923C`) — Gradient endpoints, hover state highlights, lighter accents. Always paired with Brand Orange.
- **Brand Orange Dark** (`#EA580C`) — Hover depth on primary elements, pressed states. Provides tactile feedback.
- **Brand Orange Deep** (`#C2410C`) — Active/pressed state for buttons, deepest interaction feedback.

### Secondary & Accent Colors
- **Gold** (`#D4A85A`) — Premium badges, VIP indicators, login card accents. Conveys exclusivity and value.
- **Gold Light** (`#F5A54A`) — Lighter gold variant, avatar borders, secondary highlights.
- **Active Blue** (`#1D4ED8`) — Admin sidebar active states, selection indicators, functional contrast against orange.
- **Active Blue Light** (`#DBEAFE`) — Active item background tint, selected state fills.

### Neutral Palette (Canvas & Text)
- **Canvas Warm** (`#FFF7ED`) — Primary page background. Fixed multi-layer warm gradient canvas.
- **Surface White** (`#FFFFFF`) — Cards, modals, header fill. Clean elevated surfaces.
- **Surface Cream** (`#FAF9F5`) — Admin page background, subtle warm alternative to pure white.
- **Text Primary** (`#1F2937`) — Headings, primary content. High contrast on light backgrounds.
- **Text Secondary** (`#374151`) — Body text, descriptions. Comfortable reading weight.
- **Text Muted** (`#6B7280`) — Captions, metadata, placeholder text.
- **Text Faint** (`#9CA3AF`) — Disabled states, extremely subtle labels.
- **Border Light** (`#E5E7EB`) — Card borders, dividers, structural lines. Subtle and warm-tinted.
- **Border Whisper** (`#F3F4F6`) — Ultra-subtle separators, table row dividers.

### Semantic Colors
- **Success** (`#10B981`) — Correct answers, successful operations, positive feedback.
- **Danger** (`#DC2626`) — Errors, delete actions, critical warnings. Gradient: `linear-gradient(135deg, #ef4444, #f87171)`.
- **Warning** (`#F59E0B`) — Caution states, pending actions, time warnings.

### Gradient Definitions
- **Primary Gradient** (`linear-gradient(135deg, #F97316, #FB923C)`) — CTA buttons, card top borders, primary accents.
- **Horizontal Gradient** (`linear-gradient(90deg, #F97316, #FB923C)`) — Card top accent bars, vertical side indicators.
- **Header Gradient** (`linear-gradient(180deg, #FFF7ED, #FFFFFF)`) — Dialog headers, section intros.
- **Canvas Gradient** — Multi-layer `radial-gradient` on `#FFF7ED` base creating warm orange-to-white fog with amber glow accents. Fixed position.
- **Canvas Grain** — Fixed, `pointer-events: none` pseudo-element covering the viewport: SVG `feTurbulence` fractal noise, `opacity: 0.025–0.035`, `mix-blend-mode: multiply`. Breaks digital flatness. NEVER attached to scrolling containers (fixed layer only).
- **Login Card Gradient** — Glassmorphism: `backdrop-filter: blur(20px)` with layered warm gradients.

### Shadow System (Orange-Tinted)
- **Shadow Card** — `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)` — Subtle resting state.
- **Shadow Card Hover** — `0 8px 25px rgba(232,114,42,0.12)` — Warm orange glow on hover.
- **Shadow Brand** — `0 4px 14px rgba(232,114,42,0.25)` — Primary button glow, active brand elements.
- **Shadow Gold** — `0 4px 15px rgba(191,138,48,0.4)` — Premium/VIP elements.
- **Shadow Blue** — `0 4px 14px rgba(30,136,229,0.25)` — Admin active states.

## 3. Typography Rules

### Font Stacks
- **Display/Headlines:** `Geist`, `Inter`, `system-ui`, `sans-serif` — Track-tight, weight-driven hierarchy. Headlines use `font-bold (700)` for authority, not massive sizes.
- **Body:** `Geist`, `Inter`, `system-ui`, `sans-serif` — Relaxed leading (`line-height: 1.6-1.8`), max 65 characters per line for comfortable reading.
- **Mono:** `Geist Mono`, `ui-monospace`, `monospace` — Code snippets, timestamps, numerical data, exam scores.

### Type Scale
- **Hero Title:** `clamp(1.5rem, 1rem + 2vw, 3rem)` — Bold, orange-gradient text. Never pure black.
- **Section Heading:** `text-3xl (30px)` / `text-2xl (24px)` — Semibold, primary text color.
- **Card Title:** `text-lg (18px)` / `text-base (16px)` — Bold, primary text.
- **Body Text:** `text-sm (14px)` / `text-base (16px)` — Normal weight, secondary text color.
- **Small/Labels:** `text-xs (12px)` — Medium weight, muted color. Tags, metadata, timestamps.
- **Nav Links:** `clamp(0.875rem, 0.75rem + 0.35vw, 1.125rem)` — Fluid scaling with viewport.

### Font Weights
- **Bold (700):** Headings, nav links, sidebar level-1 items, card titles.
- **Semibold (600):** Buttons, active states, user names, form submit actions.
- **Medium (500):** Secondary text, tags, sidebar level-2 items.
- **Normal (400):** Body text, sidebar level-3 items, descriptions.

### Anti-Patterns
- **BANNED:** `Inter` font is banned for premium/creative contexts. Use `Geist` exclusively.
- **BANNED:** Generic serif fonts (`Times New Roman`, `Georgia`) for any UI context.
- **BANNED:** Font sizes below `12px` / `0.75rem` for readable content.

## 4. Component Stylings

### Anti-Plasticity Rules (质感红线 — read this FIRST)

1. **Strokes are the last resort.** Every hard border makes the UI flatter and more "plastic". Preference order: tonal surfaces > warm-tinted shadow > spacing > hairline > full border.
2. **Uniformity is the enemy.** Never give every card the same border + same top accent bar. Most cards stay borderless; reserve accents for 1–2 highlighted elements per page.
3. **Depth via layering, not lines.** Warm-tinted shadows (`rgba(232,114,42,*)`), Double-Bezel shells, slight overlap in hero zones. Pure black/gray shadows and hard 3px accent bars on everything are banned.
4. **Grain over flat gradient.** A flat gradient canvas reads as digital plastic. The page canvas must carry the 0.03-opacity noise layer (see Gradient Definitions → Canvas Grain).

### Buttons

**Primary CTA (`btn-brand`):**
- Background: `linear-gradient(135deg, #F97316, #FB923C)`
- Text: white, `font-semibold`, `rounded-full`
- Padding: `px-6 py-2.5`
- Shadow: `0 4px 14px rgba(232,114,42,0.25)`
- Hover: `translateY(-1px)`, deeper shadow `0 6px 20px rgba(232,114,42,0.3)`
- Active: `translateY(0)`, shadow reduces
- Focus: `ring-2 ring-brand-orange ring-offset-2`

**Secondary Button (`btn-secondary`):**
- Background: white
- Border: `1px solid #E5E7EB`
- Hover: orange border + orange text + light orange shadow
- Rounded: `rounded-full`

**Pill/Tag Buttons:**
- `rounded-full px-4 py-1.5 text-sm`
- Active: orange gradient background, white text
- Inactive: `orange-50` background, orange text

**Gold Premium Button:**
- Background: `linear-gradient(135deg, #D4A85A, #BF8A30, #A67C28, #BF8A30, #D4A85A)`
- Animated `background-position` shift
- Shadow: `0 4px 15px rgba(191,138,48,0.4)`

### Cards

**Standard Card (borderless by default):**
- Background: white
- Border-radius: `rounded-xl (12px)`
- Border: **none by default.** Surface separation comes from background tone + shadow + spacing, NOT strokes.
- Hairline (optional, ONLY when the card sits on a busy/colored canvas and truly needs separation): `1px solid rgba(249,115,22,0.12)` — never darker than this.
- Top accent bar: **removed as a default.** The 3px gradient top bar (`#F97316 → #FB923C`) is reserved for at most 1–2 hero/feature cards per page. NEVER apply it to entire card grids/lists.
- Shadow: `shadow-card` (subtle resting)
- Hover: `shadow-card-hover`, `translateY(-6px)`, deeper orange shadow
- Transition: `all 0.3s ease-out`

**Double-Bezel Card (hero / feature zones only):**
- Outer shell: `bg-[#FFF1E2]` or `rgba(249,115,22,0.07)`, `rounded-[20px]`, padding `p-1.5`–`p-2`, hairline `ring-1 ring-orange-500/10`, warm shadow
- Inner core: white, `rounded-[14px]` (concentric: outer radius − 6px), inset highlight `shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]`
- Optional floating badge overlapping the shell edge (rotate −2° to −5°, hairline gold stroke) for depth
- Use for hero panels, VIP/pricing features, one highlighted stat — max 1–2 per page

**Glassmorphism Card (Login):**
- `backdrop-filter: blur(20px)`
- Multi-gradient background with warm tones
- Border: `1px solid rgba(212,168,90,0.3)`
- `BorderBeam` animated flowing light on edges

**Card Hover Effect:**
```css
.card-hover {
  transition: all 0.3s ease-out;
}
.card-hover:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-0.5rem);
}
```

### Inputs & Forms

- Label above input, helper text optional, error text below
- Focus ring in brand orange color
- Standard gap spacing (`gap-4` or `gap-6`)
- Element Plus form components with orange-themed overrides
- Error states: red border + inline error text below

### Dialogs/Modals

- Border-radius: `16px`
- Accent: **NO hard 3px top/bottom borders.** The header carries the gradient fill alone; a single hairline `1px solid rgba(249,115,22,0.15)` divider under the header is the maximum allowed line.
- Header gradient: `linear-gradient(180deg, #FFF7ED, #FFFFFF)`
- Overlay: `rgba(15,23,42,0.45)` + `backdrop-filter: blur(2px)`
- Primary button: `border-radius: 20px` (pill shape), orange gradient

### Avatars

- Circular (`border-radius: 50%`)
- Orange gradient fallback: `linear-gradient(135deg, #F5A54A, #E8722A)`
- Border: `2px solid #F5A54A`
- Ring: `box-shadow: 0 0 0 2px rgba(245,165,74,0.2)`

### Dropdowns

- White background, `border-radius: 12px`
- Orange-tinted border: `1px solid rgba(245,165,74,0.3)`
- Orange-tinted shadow: `0 4px 24px rgba(232,114,42,0.15)`
- Dividers: `rgba(245,165,74,0.15)` (orange-tinted)
- Hover items: `rgba(245,165,74,0.08)` background + orange text

### Scrollbar

- Width: 6px
- Track: transparent
- Thumb: `#CBD5E1` (slate-300), hover: `#94A3B8` (slate-400)
- Border-radius: 3px

### Skeleton Loaders

- Pulse animation matching exact layout dimensions
- No circular spinners — always match the shape of content being loaded

### Empty States

- Composed, illustrated compositions — not just "No data" text
- Warm orange illustration style
- Clear call-to-action to populate data

## 5. Layout Principles

### User App Structure
```
DefaultLayout
  ├── AppHeader (sticky, glassmorphism blur, z-50)
  │   └── max-width: 2200px centered
  ├── <main> (flex-1)
  │   └── container mx-auto px-6 (max-width: 1280px)
  └── SiteFooter (warm gradient background, 3-column grid)
```

### Admin App Structure
```
el-container (h-screen)
  ├── el-aside (240px / 64px collapsed)
  │   └── Sidebar (white bg, orange L1, blue active)
  └── el-container
      ├── el-header (white bg, border-bottom)
      └── el-main (bg: #F0F2F5, padding: 20px)
```

### Grid & Spacing
- **Container:** `max-width: 2200px` (header), `max-width: 1280px` (content)
- **Section padding:** `py-12 px-6` to `py-24 px-6` depending on importance
- **Card gap:** `gap-6` (24px) standard, `gap-8` (32px) for feature grids
- **Internal card padding:** `p-6` (24px) standard
- **Mobile:** All multi-column layouts collapse to single column below `768px`

### Responsive Breakpoints
- Mobile-first approach
- `sm: 640px` — Small tablets
- `md: 768px` — Tablets, single-column collapse
- `lg: 1024px` — Small desktops
- `xl: 1280px` — Standard desktops
- `2xl: 1700px` — Large screens

### Key Rules
- **Controlled overlap allowed in hero/feature zones** — floating badges and Double-Bezel shells may slightly overlap their parent container to create depth. Forms, tables, and dense lists always stay strictly separated.
- **No horizontal scroll on mobile** — critical failure
- **Touch targets:** All interactive elements minimum `44px` tap target
- **Full-height sections:** Use `min-h-[100dvh]` — never `h-screen` (iOS Safari jump)
- **Fluid typography:** Headlines scale via `clamp()`

## 6. Motion & Interaction

### Spring Physics
- **Default:** `stiffness: 100, damping: 20` — premium, weighty feel
- **Button hover:** `translateY(-1px)` with `transition: all 0.2s ease`
- **Card hover:** `translateY(-6px)` with `transition: all 0.3s ease-out`

### Transitions
- **Page transitions:** Vue `<transition name="fade">` — 0.2s opacity fade
- **Dropdown:** `opacity + translateY(-8px)`, 0.2s ease
- **Modal entrance:** Scale-in `scale(0.95) -> 1` + fade
- **Staggered reveals:** Cards and list items cascade with delays

### Perpetual Micro-Interactions
- **BorderBeam:** Flowing light beam along card/element borders (orange gradient)
- **Particles:** Interactive canvas particle background on login pages
- **Skeleton pulse:** Loading states with subtle shimmer animation
- **Gradient shift:** Login card background-position animation

### Performance
- Animate exclusively via `transform` and `opacity`
- Never animate `top`, `left`, `width`, `height`
- Use `will-change: transform` for GPU acceleration on frequently animated elements
- Grain/noise filters on fixed pseudo-elements only

## 7. Anti-Patterns (Banned)

### Visual Banned
- **No emojis** anywhere in the UI
- **No `Inter` font** — use Geist exclusively
- **No pure black** (`#000000`) — use Off-Black (`#1F2937`) or Zinc-950
- **No neon/outer glow shadows** — all shadows are orange-tinted and diffused
- **No oversaturated accents** — keep saturation below 80%
- **No generic serif fonts** (`Times New Roman`, `Georgia`, `Garamond`)
- **No purple/blue neon aesthetic** — strictly forbidden
- **No excessive gradient text** on large headers

### Layout Banned
- **No uncontrolled overlap in dense UI** (forms / tables / lists) — overlap is reserved for hero & marketing zones
- **No 3-column equal card layouts** — use asymmetric grids, 2-column zig-zag, or horizontal scroll
- **No centered Hero sections** when variance exceeds 4
- **No flexbox percentage math** — use CSS Grid or Tailwind utilities
- **No horizontal scroll on mobile**

### Content Banned
- **No generic placeholder names** ("John Doe", "Acme", "Nexus")
- **No fake round numbers** (`99.99%`, `50%`)
- **No AI copywriting clichés** ("Elevate", "Seamless", "Unleash", "Next-Gen")
- **No filler UI text** ("Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons)
- **No broken Unsplash links** — use `picsum.photos` or SVG avatars

### Interaction Banned
- **No custom mouse cursors**
- **No circular spinners** for loading — always use skeleton loaders matching layout shape
- **No "No data" text** for empty states — use composed illustrations

## 8. Stitch Prompt Examples

When generating screens with Stitch, use these prompt patterns:

### Home Page Hero
```
Warm educational hero section for Chinese university students. Orange gradient
background fading to warm cream, with a subtle grain overlay for physical texture.
Large bold headline in Geist font. Double-Bezel card (warm outer shell + white
inner core) floating above with exam countdown or quick actions, one small badge
slightly overlapping the shell edge for depth. Asymmetric layout with content on
left, decorative illustration on right. Spring-physics entrance animation.
```

### Exam Practice Screen
```
Clean exam practice interface. White paper-like card on warm cream background.
Left sidebar with question navigation (pill-shaped buttons). Main content area
with serif-style exam text. Orange accent for selected answers. Timer in top-right
with gold gradient. Submit button at bottom with orange gradient and spring hover.
```

### Vocabulary Card
```
Vocabulary learning card component. White borderless rounded card with warm-tinted
shadow (no strokes, no top accent bar). Word in large bold Geist font. Phonetic
transcription in muted gray. Example sentence below. Four option buttons in pill
shape — correct turns green, wrong turns red. Card flips with 3D rotation animation.
```

### Dashboard Stats
```
Admin dashboard stats row. Borderless white cards with warm shadows; ONE card
(highlighted metric) uses the Double-Bezel shell with a 3px gradient top accent.
Large number in bold Geist Mono font. Label in muted gray below. Sparkline chart
in orange. Hover lifts card with warm orange shadow. Responsive: 4 columns desktop,
2 columns tablet, 1 column mobile.
```
