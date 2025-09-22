# 👤 Founder — Bryson Nyaliti (2025)

Vault5 began in January 2025. The project vision, direction, and stewardship are led by the founder.

Mission:
- Discipline builds freedom. Vault5 exists to automate good money habits so people can allocate, protect, and grow their capital with confidence.

Founder Credit (to be shown in docs and UI):
- Founded by: Bryson Nyaliti
- Role: Founder, Vision & Product Steward
- Year: 2025 (and ongoing)
- Origin: Kenya
- Public links (optional, to be provided by founder):
  - GitHub: https://github.com/nyaliti
  - LinkedIn: (provide)
  - Website: (provide)
  - Email: (provide)

Display Guidelines (Docs & App):
- Always attribute the origin of the project to the founder: “Vault5 was founded by Bryson Nyaliti.”
- Do not add other names as co-founders or credits unless explicitly approved by the founder.
- Public docs and UI must not imply copying or cloning of other products. Comparative references are allowed (see LEGAL-NOTES.md) but Vault5 is original work.

UI: Founder Card Component
- Add a founder card to public-facing pages (Landing or About).
- Recommended placement: near the footer on the Landing page or prominently at the top of the About page.
- Uses TailwindCSS. Ensure fonts load early to avoid layout shifts.

Implementation instructions:
1) Create the component at: frontend/src/components/FounderCard.jsx
2) Use a high-quality portrait at: frontend/public/assets/founder-avatar.jpg
3) Add the following Google Fonts in frontend/public/index.html:
   <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
4) Extend Tailwind fonts in tailwind.config.js:
   theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Poppins', 'Inter'] } } }
5) Import and render in the desired page:
   - import FounderCard from '../components/FounderCard';
   - <FounderCard />

Example usage references:
- Nav/header integration: [NavBar.js](../frontend/src/components/NavBar.js)
- Pages for placement:
  - Landing page: frontend/src/pages/Landing.js (add section near the footer)
  - About page: frontend/src/pages/AboutUs.js (add as a hero component)
- React route registry: [App.js](../frontend/src/App.js)

Suggested founder card content:
- Name, role, mission statement
- Buttons: “View GitHub”, “Contact”
- Footer: © 2025 Vault5

Sample text (can be adapted):
- “Building Vault5 to democratize disciplined, rules-driven finance for communities — born in Nairobi, built for the continent and the world.”

Docs Integration:
- Link this document from the main README: [FOUNDER.md](./FOUNDER.md)
- Add a short blurb in CREDITS.md referencing the founder as sole originator unless otherwise approved.

Branding & Legal Notes:
- Vault5 is not a clone; it is original work by the founder. Comparative references to PayPal and others are allowed for UX analogies only. See [LEGAL-NOTES.md](./LEGAL-NOTES.md).

## Founder Story — “From Discipline to Freedom”

January 2025. I was staring at a spreadsheet at 1:17 AM, the kind of silence where even Nairobi traffic feels like a distant memory. My money wasn’t misbehaving; my habits were. I wanted a simple system that would not negotiate with my impulses — one that would tell my money where to go before feelings woke up. I sketched six vaults on paper: Daily, Emergency, Investment, Long-Term, Fun, Charity. It looked too simple to fail.

The eureka moment didn’t arrive as fireworks; it arrived as friction. The more I tried to manually stick to discipline, the more I realized: discipline is rarely sweet — it’s the heat that separates ore from gold. You don’t “enjoy” smelting; you endure it to wear the gold. That night the vision shifted from a personal tool to a public mission: if this thing can harden my behaviors, it can serve families, businesses, and communities across Africa. I would be selfish to hoard the crucible for myself.

Vault5 became the name — a vault not just for money, but for habits, goals, and community wealth. A system that splits, enforces, and reminds — so you can suffer less from guesswork and enjoy more of the outcome. From that night forward, the burden became clear: turn discipline into a product, so freedom becomes predictable.

Change Log (Founder-specific, 2025):
- 2025-01: Inception and first vault allocation sketch
- 2025-09: Established founder credit policy and UI component guidelines
- 2025-09: Added FOUNDER.md, README links, and public docs conventions

Last updated: 2025