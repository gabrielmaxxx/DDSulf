# DDSulf Mobile Operational & PWA Architecture Standards

This document specifies the UX guidelines, responsive grid boundaries, and offline-ready mobile controls applied on field operational layers.

---

## 1. PWA & Caching Policy

1. **Asset Lifecycles**: Application assets (`assets/`, `icons/`, fonts) compile during builds. They cache statically under the custom PWA Service Worker to secure instantaneous boot-times.
2. **Dynamic Checklists**: When a field technician enters remote sites, the active checklist wizards buffer automatically within IndexedDB. Completed wizards sync via the background Outbox queue when a network connection is detected.
3. **No Unsolicited Desktop Components**: Large tables or side-by-side comparison panels must be completely hidden on mobile viewports. Instead, they should be mapped to card layouts or swipeable action lists.

---

## 2. Touch-First Layout Rules

1. **Thumb Incline Zone**: Key interactions (submit buttons, tab bars) must be positioned in the screen's bottom half to support easy one-handed actions.
2. **Min Target Resolution**: Clickable buttons and links must span at least `44px` in width/height. These should feel spacious to avoid misclicks when technicians are in motion.
3. **Immersive Contrast**: Use dark base overlays (`bg-neutral-950`) combined with intense colored signals (emerald green, amber, rose) to remain perfectly clear under bright sunlight.

---

## 3. Gestures & Continuity

1. **Swipe Navigation**: Swiping left/right across page panels must be configured using the `useTouchGestures` hook. This lets users traverse active wizards seamlessly.
2. **Autosave Backups**: Form inputs and step states are captured on every keystroke. This prevents data loss from accidental app closures or incoming phone calls.
