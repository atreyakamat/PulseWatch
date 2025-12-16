# PulseWatch - Design Guidelines

## Design Approach
**Reference-Based:** Dark dashboard aesthetic inspired by modern monitoring tools (Vercel, Linear, Railway) with a tech/cyberpunk edge. Primary focus on data visibility and real-time status updates.

## Core Design Elements

### Color System
- **Primary Accent:** #46ec13 (vibrant green) - use for active states, operational indicators, CTAs
- **Background:** #142210 (deep dark green-black)
- **Surface/Cards:** #1c2e18 (slightly lighter than background for elevation)
- **Text Primary:** White
- **Text Secondary:** White at 60% opacity (#ffffff99)
- **Text Tertiary:** White at 40% opacity (#ffffff66)
- **Status Colors:**
  - Success/Up: #46ec13 (primary green)
  - Error/Down: Red-500 (#ef4444)
  - Warning: Blue-400/500 for performance metrics
- **Borders:** White at 10% opacity for subtle separation
- **Overlays:** White at 5% opacity for hover states, 10% for interactive elements

### Typography
- **Display Font:** Manrope (200-800 weight range) - headings, navigation, stats
- **Body Font:** Noto Sans (400, 500, 700) - body text, labels
- **Hierarchy:**
  - Page titles: 3xl-4xl, extrabold (800), tight tracking
  - Section headings: lg-xl, bold (700)
  - Card labels: sm-base, medium (500)
  - Body text: sm-base, regular (400)
  - Stat numbers: 4xl, bold, tight tracking
  - Small labels/timestamps: xs, medium

### Layout & Spacing
**Spacing Scale:** Use Tailwind units of 1, 2, 3, 4, 6, 8, 12
- Component padding: p-6 to p-8
- Card gaps: gap-4 to gap-6
- Section spacing: gap-8
- Container max-width: max-w-7xl
- Mobile padding: p-4, desktop p-8 to p-12

**Grid System:**
- Stats grid: 1 column mobile, 2 tablet, 4 desktop
- Main content: 2/3 chart area, 1/3 sidebar on desktop
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

### Border Radius
- Default cards/panels: 2rem (rounded-[2rem])
- Buttons/pills: 9999px (rounded-full)
- Small interactive elements: 1rem (rounded-xl)
- Avatar/icons: rounded-full

### Component Library

#### Sidebar Navigation (Desktop)
- Fixed left, w-72, full height
- Logo with icon (ecg_heart symbol) in colored circle
- Active state: primary/20 background with primary text
- Inactive: white/70 text, hover to white with white/5 background
- Badge indicators for notifications (red-500/20 background)
- Bottom user profile card with avatar

#### Mobile Header
- Sticky top, hamburger menu
- Compact logo presentation
- Border bottom for separation

#### Stat Cards
- 2rem rounded corners, surface-dark background
- Blur effect in corner (size-32 rounded-full with blur-3xl)
- Icon in colored circle (size-10, 20% opacity of accent color)
- Large number (4xl, bold) with optional unit suffix
- Hover state: increased blur opacity (10% → 20%)

#### Charts/Visualizations
- SVG-based with green gradient fills
- Gradient from primary/20 to transparent
- 3px stroke width for lines
- Interactive hover points (circle with primary stroke)
- Time axis labels below in white/30

#### Incident/Log Items
- White/5 background, hover to white/10
- Status dots: 2x2 rounded-full (red for down, green for operational)
- Animate pulse for active incidents
- Timestamp right-aligned in white/40
- Condensed layout with clear hierarchy

#### Buttons
**Primary CTA:**
- rounded-full, h-12, px-6
- Background: primary (#46ec13), hover slightly darker (#3bd60f)
- Text: background-dark color, bold
- Shadow glow: 0 0 20px primary/30
- Icon + text combination

**Secondary/Filter Buttons:**
- Small pills in button group with white/5 background container
- Active: primary background with dark text
- Inactive: white/60 text, hover to white

#### Icons
- Material Symbols Outlined
- Use 'FILL' variation setting for active states (navigation)
- Size: 20px for buttons, default for navigation
- Consistent spacing with text (gap-2 or gap-3)

### Visual Effects
- **Glow Effects:** Blur circles positioned absolutely in card corners
- **Transitions:** All interactive elements get transition-all or transition-colors (200ms)
- **Hover States:** Subtle background opacity changes (5% → 10%)
- **No heavy animations:** Keep interface snappy and data-focused

### Accessibility
- Maintain consistent 60%/40% opacity for text hierarchy
- All interactive elements have clear hover states
- Badge indicators use both color and text
- Status communicated through icons + text, not color alone

### Dashboard-Specific Patterns
- Page header with title, subtitle, date filter, and primary action
- 4-stat overview grid immediately below header
- Main visualization area (2/3 width) paired with incidents panel (1/3 width)
- Scrollable incident list with custom-scrollbar class
- Monitor cards should show status badge, URL, uptime %, response time
- Real-time data emphasis through pulsing indicators and "Now" labels

### Mobile Responsiveness
- Sidebar hidden on mobile, replaced with top header
- Stats grid: 1→2→4 columns
- Chart/incident section stacks vertically
- Maintain generous padding even on mobile (p-4 minimum)
- All text remains readable, reduce sizes minimally

### Images
**No hero images required.** This is a data-dense dashboard application focused on monitoring metrics and real-time status updates. Visual interest comes from glowing effects, charts, and status indicators rather than photography or illustrations.