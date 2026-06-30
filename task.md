# NanoPlay Design Overhaul — Task Checklist

## Part 1: Color System Fix
- [x] Replace `--accent-cyan: #7dd3fc` → `#38bdf8` in globals.css
- [x] Update cyan glow/border/shadow tokens
- [x] Rename "Ice Blue" comment → "Cyan"
- [x] Replace `#7dd3fc` in AtmosphereLayer.tsx confetti

## Part 2: Font System Fix
- [x] Remove `@import` URL from globals.css line 1 (duplicate loading)
- [x] Remove Montserrat import from layout.tsx
- [x] Update `--font-heading` to Plus Jakarta Sans
- [x] Update `--font-editorial` to Plus Jakarta Sans
- [x] Remove montserrat.variable from `<html>` className

## Part 3: Matchday Card Redesign
- [x] Replace heroRight matchday board with permanently-glowing card
- [x] Add 1-X-2 score display, streak progress, gold CTA
- [x] Matchday card gets 10% opacity glow (strongest element)

## Part 4: Permanent Ambient Glows
- [x] Update glass-card.module.css — 3% ambient glow on base `.card`
- [x] Add permanent gold shadow to `.btn-premium`
- [x] Add `.glass-card` global class with permanent ambient glow

## Part 5: Hero Background Image
- [x] Generate generic dark stadium image
- [x] Save to public/images/sports/stadium-hero-bg.jpg
- [x] Verify under 150KB (used stadium-depth-bg.webp at 7KB)
- [x] Add CSS background + gradient overlay to .heroSection
- [x] Light mode brightness override

## Part 6: Football Atmosphere
- [x] Add `.section-divider` class to globals.css
- [x] Add `.section-label` class to globals.css
- [x] Add section labels to homepage sections
- [x] Add pitch-line texture at section bottoms

## Part 7: Light/Dark Theme
- [x] Verify existing toggle works
- [x] Add light-mode overrides for new elements
- [x] Ensure atmosphere disabled in light mode

## Part 8: Sectioning & Legibility
- [x] Add generous spacing between homepage sections
- [x] Add section dividers between major sections
- [x] Ensure card padding p-6 minimum

## Part 9: Verification
- [x] npm run lint passes
- [x] npm run build passes
- [x] Screenshots at 375px, 768px, 1440px
- [x] Deploy to Vercelmain branch
