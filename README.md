# Dream — Responsive Tailwind UI

This small static UI demonstrates a responsive website layout built with Tailwind CSS (CDN) implementing the requested components: fixed top navigation, Home hero, Member Login/Register screens (desktop two-column, mobile tabs), and Footer.

Files added
- `index.html` — main page with navbar, hero, auth section, and footer.
- `src/app.js` — JS for mobile menu toggle and mobile auth tab behavior.

How to open
1. Open the project folder in your file manager and double-click `index.html` to open in your default browser.
2. Or from PowerShell (Windows) run:

```powershell
start "" "index.html"
```

Notes
- Tailwind CSS is used via the official CDN (no build step). The primary accent color is set to `#5a67d8` (Tailwind `primary`).
- To display the provided logo in the navbar, save your logo file to `assets/logo.png` (relative to `index.html`). The markup references that path already; you can change the path or filename as needed.
- To display the provided logo in the navbar, save your logo file to `assets/logo.png` (relative to `index.html`). The markup references that path already; you can change the path or filename as needed.
- The `index.html` includes the Login/Register forms; form submissions are prevented and show demo alerts. Replace with your backend logic as needed.
- Responsive breakpoints were designed from wide desktop down to ~390px mobile.

Next steps / suggestions
- Replace the Unsplash image with an owned asset (currently hotlinked for demo).
- Hook form submissions to a backend or client-side validation.
- If you prefer Tailwind local build (JIT), convert to a project with PostCSS and tailwind.config.

If you want, I can:
- Add real form validation and example API stubs.
- Convert this to a small React/Vue app or add Tailwind build tooling.
