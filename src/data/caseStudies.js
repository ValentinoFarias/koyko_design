// ─── Case Studies Data ────────────────────────────────────────────────────────
//
// Each object here is ONE case study shown on the /casestudies page.
// KoykoStudies.jsx reads this array and shows one study at a time.
//
// IMPORTANT — ORDER MATTERS:
//   The order here matches the portfolio's left → center → right layout.
//   This controls what appears in the ← left / right → nav at the bottom
//   of each case study. Keep these in sync with KoykoPortfolio's PROJECTS array.
//
// HOW TO ADD A NEW CASE STUDY:
//   1. Copy one of the objects below.
//   2. Fill in: id, title, services, siteUrl, overview, images.
//   3. Create a folder:  public/assets/images/case-studies/<your-id>/
//   4. Upload 6 images into that folder and update the images array.
//   The component handles everything else automatically.
//
// IMAGE PATHS:
//   Stored in public/ so Next.js serves them from the site root.
//   The component expects exactly 6 images (3 rows × 2 columns).
//   Leave a slot as '' if you haven't uploaded that image yet —
//   the component will skip empty slots gracefully.
//
// ─────────────────────────────────────────────────────────────────────────────

export const CASE_STUDIES = [

  // ── Portfolio position: LEFT ──────────────────────────────────────────────
  {
    id: 'nerdecks',
    title: 'NERDECKS',
    services: [
      'web design',
      'web development',
      'UX design',
    ],
    siteUrl: 'https://nerdeck-981cca01cede.herokuapp.com/',
    overview:
      'A spaced repetition web application that helps users remember information efficiently by reviewing cards at scientifically optimised intervals.',
    // Store images in:  public/assets/images/case-studies/nerdecks/
    images: [
      '/assets/images/case-studies/nerdecks/nerdecks-laptop-mockup-library.webp',
      '/assets/images/case-studies/nerdecks/nerdecks-study-flashcard-ui.webp',
      '/assets/images/case-studies/nerdecks/nerdecks-dashboard-deck-list.webp',
      '/assets/images/case-studies/nerdecks/nerdecks-brand-illustrations.webp',
      
      // Object form unlocks per-slot zoom, crop, and poster frame control.
      // scale:      zoom factor (1 = natural size)
      // position:   CSS object-position — 'x% y%' pans the crop window
      // posterTime: seconds into the video to use as the cover frame before play
      //             Change this number until you find the frame you want.
      { src: '/assets/images/case-studies/nerdecks/nerdecks-app-demo.mp4', scale: 1, position: '50% 50%', posterTime: 1 },
      '/assets/images/case-studies/nerdecks/nerdecks-app-icon.webp',
    ],
  },

  // ── Portfolio position: CENTER ────────────────────────────────────────────
  {
    id: 'kumo-ramen',
    title: 'KUMO RAMEN',
    services: [
      'web design',
      'web development',
      'illustration',
      'brand design',
    ],
    siteUrl: 'https://www.kumoramen.koykodesign.com/',
    overview:
      'Kumo Ramen is a fictional restaurant concept created to demonstrate end-to-end brand and digital design. The project spans identity, motion, menu design, and web — built to the standard of a real premium client brief.',
    // Store images in:  public/assets/images/case-studies/kumo-ramen/
    images: [
      '/assets/images/case-studies/kumo-ramen/fullscreenmockup.webp',
      '/assets/images/case-studies/kumo-ramen/homemockup.webp',
      '/assets/images/case-studies/kumo-ramen/laptopmockup.webp',
      '/assets/images/case-studies/kumo-ramen/laptopmockup2.webp',
      '/assets/images/case-studies/kumo-ramen/phonemockup.webp',
      '/assets/images/case-studies/kumo-ramen/stylesmockpus.webp',
    ],
  },

  // ── Portfolio position: RIGHT ─────────────────────────────────────────────
  {
    id: 'socratic-js',
    title: 'SOCRATIC JS',
    services: [
      'web design',
      'web development',
      'AI integration',
    ],
    siteUrl: 'https://socraticjs-6175a41ed31f.herokuapp.com/',
    overview:
      'A Socratic teacher built to help developers learn JavaScript through guided questions rather than direct answers — making the learning process active and memorable.',
    // Store images in:  public/assets/images/case-studies/socraticJS/
    images: [
      '/assets/images/case-studies/socraticJS/socraticjs-homepage-hero.webp',
      '/assets/images/case-studies/socraticJS/socraticjs-chat-interface.webp',
      '/assets/images/case-studies/socraticJS/socraticjs-laptop-mockup-homepage.webp',
      '/assets/images/case-studies/socraticJS/socraticjs-while-loop-lesson-page.webp',
      '/assets/images/case-studies/socraticJS/socraticjs-iphone-mockup-homepage.webp',
      '/assets/images/case-studies/socraticJS/socraticjs-tutor.png',
    ],
  },

];
