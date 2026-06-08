---
name: Raíces Café & Vivero
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#434843'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#526349'
  on-secondary: '#ffffff'
  secondary-container: '#d5e9c7'
  on-secondary-container: '#58694f'
  tertiary: '#320800'
  on-tertiary: '#ffffff'
  tertiary-container: '#501a08'
  on-tertiary-container: '#ce7e65'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#d5e9c7'
  secondary-fixed-dim: '#b9ccac'
  on-secondary-fixed: '#101f0b'
  on-secondary-fixed-variant: '#3b4b33'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#733521'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  margin-mobile: 20px
  gutter-mobile: 16px
---

## Brand & Style
The design system is built upon the "Organic Minimalism" philosophy, blending the lush, biodiversity-driven spirit of Costa Rica with modern digital precision. The target audience includes nature enthusiasts, coffee lovers, and urban gardeners seeking a serene, high-quality sanctuary. 

The visual language balances the structured reliability of a premium SaaS product with the tactile, warm textures of an artisan café. It evokes a sense of "digital forest bathing"—calm, breathable, and deeply grounded. 

**Design Principles:**
- **Organic Flow:** Use of generous white space and soft corners to mimic natural forms.
- **Botanical Sophistication:** A palette that feels like a curated garden rather than a raw jungle.
- **Warm Modernity:** Clean layouts paired with earth-toned accents to avoid the coldness of traditional minimalism.

## Colors
The palette is rooted in the "Costa Rican Verdant" spectrum.

- **Primary (Forest Green - #1B3022):** Used for primary headings, navigation bars, and high-emphasis components. Represents depth and sustainability.
- **Secondary (Sage Green - #8DA082):** Used for subtle backgrounds, tags, and secondary interactions. Provides a soft, calming bridge between earth and forest.
- **Tertiary (Soft Terracotta - #A65D46):** Used sparingly for call-to-actions (CTAs) and notifications. It mimics volcanic soil and warmth.
- **Backgrounds (Cream/Beige):** The default background is `Neutral (#F9F6F0)`, with `Accent Cream (#FEFCF8)` used for card surfaces to provide subtle elevation through color contrast.

## Typography
This design system utilizes a "Humanist Contrast" pairing to reflect both literary tradition and modern utility.

- **Literata (Headlines):** A soft, elegant serif that feels authoritative yet welcoming. It is used for all major headers to ground the brand in storytelling and artisanal quality.
- **Hanken Grotesk (Body & UI):** A contemporary sans-serif with geometric roots and high legibility. It provides the "modern" half of the brand personality, ensuring the mobile app feels fast and functional.

**Usage Notes:**
- All headlines use a slightly tighter letter-spacing to enhance visual impact.
- Labels (navigation, buttons) should always use Hanken Grotesk in Medium or SemiBold weight to ensure visibility against organic background colors.

## Layout & Spacing
The layout follows a "Breathing Space" philosophy, prioritizing high margins to prevent visual clutter and evoke the openness of a garden.

- **Base Unit:** 4px. All spacing must be a multiple of this unit.
- **Grid:** A 4-column fluid grid for mobile.
- **Safe Zones:** A 20px horizontal margin is mandatory for all primary content to ensure readability.
- **Rhythm:** Use `lg (24px)` to separate distinct sections and `md (16px)` for internal card elements. 
- **Navigation:** A fixed bottom navigation bar with a height of 72px, providing 5 distinct touch targets.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Lush Shadows** rather than stark borders.

- **Surfaces:** The primary background is `Neutral (#F9F6F0)`. Foreground elements (cards, inputs) use `Accent Cream (#FEFCF8)`.
- **Shadows:** Use extremely soft, long-spread shadows. The shadow color should be tinted with Forest Green (e.g., `rgba(27, 48, 34, 0.08)`) to maintain the organic feel.
- **Z-Index Strategy:** 
    - *Level 0:* Base background.
    - *Level 1:* Content cards (low shadow).
    - *Level 2:* Floating Action Buttons and Bottom Navigation (medium shadow).
    - *Level 3:* Modals and Overlays (high shadow with backdrop blur).

## Shapes
To reinforce the organic and friendly nature of the brand, this design system utilizes **Pill-shaped (3)** geometry.

- **Primary Components:** Buttons, search bars, and tags use a fully rounded (pill) style.
- **Cards & Containers:** Use `rounded-xl (1.5rem)` to create a soft, pebble-like appearance.
- **Selection Controls:** Checkboxes and radio buttons should be slightly rounded (`0.5rem`) to maintain a cohesive language without losing functional familiarity.

## Components
- **Buttons:** Primary buttons use `Forest Green` with white text. They are pill-shaped and utilize a subtle shadow to indicate interactability. Secondary buttons use an outline of `Sage Green`.
- **Input Fields:** Search and form inputs use `Accent Cream` backgrounds with `Sage Green` borders (1px) and `24px` corner radius.
- **Cards:** Cards for Menu items or Nursery plants should have an image-top layout, using `1.5rem` corner radius on the top corners and a soft shadow. Labels should be set in `Hanken Grotesk`.
- **Bottom Navigation:** A fixed 5-section bar (Inicio, Menú, Vivero, Jardín, Perfil). Active states use the `Forest Green` for icons and text, while inactive states use a desaturated `Sage Green`.
- **Chips/Tags:** Used for plant categories (e.g., "Sombra," "Interior"). These are small pill-shaped elements with a `Sage Green` background and `Forest Green` text.
- **Icons:** Use thin-line (1.5px stroke) icons with rounded terminal ends to match the typography. Avoid solid/filled icons unless used for an "active" navigation state.