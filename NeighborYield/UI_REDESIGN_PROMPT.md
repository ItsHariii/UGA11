# NeighborYield UI Redesign

## Color Palette Update

Replace the current bright green theme with a richer, more earthy palette:

### Abundance Mode (Online)
- **Background:** Warm beige/off-white `#F5F0E8` (primary), `#FAF7F2` (secondary)
- **Cards:** Cream white `#FFFDF8` with subtle warm shadows
- **Primary accent:** Deep forest green `#2D5A3D` (buttons, links, active states)
- **Secondary accent:** Sage green `#6B8F71` (badges, icons)
- **Text primary:** Dark charcoal `#2C2C2C`
- **Text secondary:** Warm gray `#6B6560`
- **Text muted:** `#A09A93`
- **Borders:** Soft tan `#E5DDD3`
- **Danger:** Muted terracotta `#C75B3F`
- **Warning:** Warm amber `#D4943A`
- **Success:** Olive green `#5A8A5E`

### Survival Mode (Offline)
- Keep the current dark theme but swap the neon green accents for a cooler mint `#4AEDC4`
- Background: `#0D1210`
- Cards: `#161E1A`
- Borders: `#2A3A30`

## Border Radius

Increase all border radii for a softer, more modern feel:
- **Cards:** `20px` (was 16px)
- **Buttons:** `14px` (was 8px)
- **Badges:** `10px` (was 6px)
- **Category icon bubbles:** `14px` (was 10px)
- **Interest button:** `14px` rounded pill shape

## Floating Bottom Tab Bar

Remove the current top tab bar (Feed / Share / Settings) and replace with a floating bottom navigation island:

### Design
- Position: `absolute`, bottom `24px`, centered horizontally
- Width: ~70% of screen width, auto-sized to content
- Background: semi-transparent with blur — `rgba(45, 90, 61, 0.92)` in abundance, `rgba(13, 18, 16, 0.95)` in survival
- Border radius: `28px` (full pill shape)
- Shadow: `0 8px 32px rgba(0,0,0,0.15)`
- Padding: `8px` vertical, `6px` horizontal
- Use lucide-react-native icons for each tab:
  - Feed: `Newspaper` icon
  - Share: `PlusCircle` icon
  - Settings: `Settings` icon
- Active tab: white icon + small dot indicator below
- Inactive tab: semi-transparent white icon (`opacity: 0.6`)
- No text labels — icons only for a clean look
- Add a subtle scale animation on press

### Implementation
- In `App.tsx`, remove the `<View style={styles.tabs}>` section
- Create the floating bar as an absolutely positioned View at the bottom of the SafeAreaView
- Ensure the main content area has `paddingBottom: 90` so content doesn't hide behind the tab bar

## Files to Update

1. `src/theme/tokens.ts` — Update `abundanceTokens` and `survivalTokens` color values
2. `src/components/feed/DualModeFeedCard.tsx` — Update border radius to 20px
3. `src/components/feed/InterestedButton.tsx` — Update border radius to 14px, use new green
4. `App.tsx` — Remove top tabs, add floating bottom tab bar, update header colors
5. `src/components/connectivity/DynamicIsland.tsx` — Update to use new color tokens
6. `src/components/interest/InterestNotificationCard.tsx` — Update border radius and colors

## Vibe

Think: Aesop meets a farmers market app. Warm, organic, trustworthy. The kind of app that feels like it was designed by someone who actually gardens.
