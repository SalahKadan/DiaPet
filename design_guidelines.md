# DiaPet Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Duolingo's gamified learning, Pokemon GO's character-centric UI, and Headspace's friendly accessibility. Focus on immediate visual engagement, clear feedback, and delightful interactions that make diabetes management feel like play, not a chore.

## Core Layout System

**Phone-Frame Container**
- Maximum width: 430px (iPhone Pro Max standard)
- Centered on desktop with subtle drop shadow
- Full viewport on mobile devices
- All content lives within this frame

**Spacing Primitives**
Use Tailwind units: **4, 6, 8, 12, 16** for consistent rhythm
- Screen padding: p-6 (mobile), p-8 (larger devices)
- Component spacing: gap-4 for tight groups, gap-8 for sections
- Touch target minimum: 56px (h-14, w-14 minimum)

## Typography

**Font Stack**
Primary: 'Fredoka' (Google Fonts) - playful, rounded, kid-friendly
Fallback: system-ui, sans-serif

**Hierarchy**
- Page Titles: text-3xl, font-bold (48px equivalent)
- Section Headers: text-2xl, font-semibold (32px)
- Body Text: text-lg, font-medium (20px - larger for kids)
- Button Labels: text-xl, font-bold (24px)
- Small Details: text-base (16px minimum)

## Component Library

**Pet Display Card** (Hero Component)
- Large character illustration (300x300px minimum)
- Animated idle state (gentle bounce)
- Health bars with rounded-full styling
- Stats displayed with icons + large numbers
- Rounded-3xl container with soft shadow

**Action Buttons**
- Pill-shaped (rounded-full)
- Minimum h-16, px-8
- Large icon (w-8 h-8) + text label
- Prominent shadow for depth (shadow-lg)
- Active state: scale-95 transform

**Navigation Bar** (Bottom Fixed)
- 4-5 main actions maximum
- Icon-only or icon + label
- Active state with background fill
- Safe area padding (pb-safe)

**Stats/Progress Cards**
- Grid layout (grid-cols-2 gap-4)
- Large icons (w-12 h-12)
- Bold numbers (text-4xl)
- Rounded-2xl containers

**Educational Popups/Modals**
- Centered overlay with backdrop blur
- Character mascot in corner
- Simple language, large text
- Single primary action button
- Rounded-3xl, max-w-sm

**Input Elements**
- Extra-large touch areas (min-h-14)
- Clear labels above inputs
- Rounded-xl borders
- Focus states with thick borders (border-4)

## Animations

**Bouncy Interactions** (Use Sparingly)
- Pet idle: subtle scale breathing (1.0 → 1.05 → 1.0, 2s loop)
- Button press: spring-based scale-down
- Success moments: confetti burst + bounce
- Page transitions: slide up with bounce ease

**Timing**
- Fast feedback: 150ms
- Character reactions: 300-500ms
- Page transitions: 400ms

## Images Section

**Pet Character Illustrations**
- Style: Colorful, cartoonish, friendly mascots
- Usage: Main screen (300x300px), navigation (40x40px), rewards (120x120px)
- Format: PNG with transparency
- Placement: Center of home screen, profile header, achievement badges

**Background Patterns**
- Subtle texture overlays (clouds, stars, health symbols)
- Low opacity (10-15%) decorative elements
- Placement: Behind main content areas

**Educational Graphics**
- Simple diagrams for diabetes concepts
- Icon-based explanations (food = energy, exercise = activity)
- Size: 200x200px for main teaching moments

**No large hero images** - Character illustrations serve as the hero focal point

## Layout Patterns

**Home Screen**
1. Header: Welcome message + streak counter (h-20)
2. Pet Display: Large character + status (300x300px center)
3. Quick Actions: 2x2 grid of primary tasks (gap-4)
4. Progress Bar: Daily goal visualization
5. Bottom Nav: Fixed navigation (h-20)

**Activity Feed**
- Vertical scroll list
- Card-based entries (rounded-2xl, p-6)
- Icon + timestamp + description
- Celebratory elements for achievements

**Profile/Stats Screen**
- Character at top (smaller, 200x200px)
- Stats grid (2 columns)
- Badges/achievements gallery
- Parent dashboard link (subtle, bottom)

## Kid-Friendly Principles

- **Zero Ambiguity**: Every button shows what it does with icon + text
- **Immediate Feedback**: Every tap gets visual/haptic response
- **Celebration**: Positive reinforcement on every action
- **Forgiveness**: Easy undo/back patterns
- **Chunked Information**: One concept per screen
- **Visual Language**: Icons communicate meaning before text
- **Safety**: Parent controls accessible but not primary flow

**Critical Success Factors**
- Touch targets never smaller than 56x56px
- Text never smaller than 16px
- High contrast ratios (AA minimum)
- Rounded corners everywhere (rounded-2xl minimum)
- Depth through shadows, not flat design
- Playful but never chaotic