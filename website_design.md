# 📋 Pixel-Perfect Clone Specification(Reference: Cartesia homepage screenshots – provided)(Target: Modern card-style “TexasA&M Professor Comparison” site)---

##0. Global Design Language (Cloned from Reference)

1. Brand&Art Direction Overview • Dark-mode first, ultra-minimal UI resting on a #0F0F0F canvas. • Large, elegant serif/sans headline pairing, wide line-height. • Neon-grain gradient artwork and rainbow-tinted photography as the only pops of color. • Generous negative space, card-based containers with1px #1D1D1D borders and6px radii. • Overall tone: sophisticated tech → re-messaged as “data-driven academic insight” for TexasA&M.

2. | Color Palette (EXACT hex values from reference) | Token                  | HEX                                                            | Usage                       | Notes        |
   | ----------------------------------------------- | ---------------------- | -------------------------------------------------------------- | --------------------------- | ------------ | ------- | --------------- | ----------------------- |
   | Canvas                                          | #0F0F0F                | Global background                                              | Never change                |
   | Card BG                                         | #111111                | Section containers                                             | Same radius/shadow          |
   | UI Border                                       | #1D1D1D                | 1px borders/dividers                                           | Same everywhere             |
   | Body Text                                       | #E6E6E6                | Paragraphs                                                     | 80% white                   |
   | Headline                                        | #FFFFFF                | H1–H3                                                          | Pure white                  |
   | CTA Fill                                        | #FFFFFF                | Primary button                                                 | Black text inside (#0F0F0F) |
   | CTA Hover                                       | rgba(255,255,255,0.08) | Hover overlay                                                  |                             | Accent Green | #35E08F | Gradient sample | Keep for charts/sliders |
   | Accent Blue                                     | #39A8FF                | Gradient sample                                                |                             |
   | Accent Yellow                                   | #FFCF3F                | Gradient sample                                                |                             |
   | Accent Magenta                                  | #FF359F                | Gradient sample                                                |                             |
   | Accent TAMU Maroon (image-only)                 | #500000                | NEW – appears inside gradient assets only, **never** UI chrome |

3. | Typography Scale (clone1:1) | Style             | Font | Size | Weight | Line-height |
   | --------------------------- | ----------------- | ---- | ---- | ------ | ----------- |
   | H1                          | Inter, sans-serif | 48px | 600  | 60px   |
   | H2                          | Inter             | 32px | 600  | 44px   |
   | H3                          | Inter             | 24px | 500  | 32px   |
   | Body-lg                     | Inter             | 18px | 400  | 30px   |
   | Body                        | Inter             | 16px | 400  | 26px   |
   | Caption                     | Inter             | 14px | 400  | 22px   |

4. Spacing&Layout Grid •12-column grid,72px max content gutter,80px section vertical rhythm (desktop). • Cards:40px internal padding,40px top margin between stacked cards. • Mobile breakpoint @<960px → single column,24px side padding,56px section rhythm.5. Visual Effects & Treatments • Grain overlay on all gradients (same intensity). • Card hover: subtle scale1.02 & shadow rgba(0,0,0,0.6)082432px, transition220ms ease. • Button hover: text color fade to #0F0F0F inside white pill.6. Component Styles (clone100%) • Navigation bar (fixed, dark,64px height). • Primary pill button (20px radius,14px/600 text). • Comparison slider (before/after draggable handle). • Data table rows with play icon on hover. • Horizontally scrollable colored testimonial cards with nav chevrons. • Footer split into mission left / mosaic right +4-column link grid.---

##1. Project SummaryHome page for “AggieProf Compare” — a TexasA&M-focused platform that lets students visually compare professors across courses, ratings, and research impact. The page reuses Cartesia’s exact visual shell but all language, images, and sample data are reauthored for the new academic context.

---

##2. Main Page Overview (Route: “/”)Area-by-area replacement while preserving structure:1. Sticky nav bar → AggieProf logo + links (Departments, Courses, Insights, Support) + “Start comparing”.2. Hero card (rainbow equalizer) → Maroon-accent vertical bar artwork, headline “The fastest way to choose the right TexasA&M professor”.3. “Loved by” logo belt → Department shortcut tabs (CSCE, ENGR, MATH…)4. Gradient A/B slider → “Teaching vs Research: drag to compare” maroon vs gold gradient.5. Language table → Course comparison table (flags → course icons).6. Rainbow people carousel → Student testimonials about professors (card coloration unchanged).7. Mission block → Platform mission “Empowering Aggies” + colored mosaic of campus imagery.8. Footer stays identical visually; links re-labeled to academic resource pages.

---

##3. Section-by-Section Specifications###3.1 Top Navigation1. Visual Clone Instructions • Same height, black background,1px #1D1D1D bottom border, Cartesia layout mirrored.2. Content Replacement • Logo text: “AggieProf” (keep same serif). • Nav items (4): “Departments”, “Courses”, “Insights”, “Support”. • CTA button: “Start comparing”.3. Layout & Structure – unchanged grid, right-aligned CTA.4. Component Cloning – dropdown caret & hover underline identical.5. Asset Replacements • Logo symbol:5×5 pixel-matrix “A&M” abstraction in #FFFFFF matching original size.6. Interaction Patterns – identical hover color & active state.

---

###3.2 Hero “Equalizer” Section1. Visual Clone Instructions •1040px-wide center card,80px top margin. • Keep grainy multi-colored bar animation occupying bottom third of card.2. Content Replacement • H1 (56chars): “The fastest way to choose the right TexasA&M professor”. • Subhead (105chars): “Compare teaching quality, research impact, and course workload in one elegant dashboard.” • Primary button: “Start comparing”. Secondary ghost button: “See how it works”. • Replace chat demo panel with static dark subtitle card stating: “Search by course • View grade distributions • Read student insights”.3. Layout & Structure – identical.4. Component Cloning – equalizer stays; chat panel still a560×200px card, only static text.5. Asset Replacements • Gradient bar art prompt: “Vertical neon bars on dark background, maroon (#500000) core hues blending into Aggie gold (#FFCF3F) and TAMU accent greens, sprinkled grain,4K, abstract equalizer style.”6. Interaction Patterns – none altered.

---

###3.3 Department Tab Belt (was client logos)1. Visual Clone Instructions • Horizontal strip with six equal tabs,1px inner borders.2. Content Replacement • Tab labels: CSCE, ECEN, ENGR, MATH, BIOL, HIST. • On hover change text to #FFFFFF, background rgba(255,255,255,0.04).3. Layout – identical dimensions.4. Assets – no images.---

###3.4 Value Proposition Copy + Isometric Icon (left column)1. Visual Clone Instructions •2-column grid: copy left, faint isometric TAMU Academic Building outline right (clone opacity & line style).2. Content Replacement • Paragraph1: “Aggie students love how effortless it is to stack-rank professors by real outcomes—grade distributions, course rigor, and peer reviews.” • Paragraph2: “Our data engine surfaces the most accurate, up-to-date insights to guide your next semester schedule.”5. Asset Replacement • Icon prompt: “Isometric wireframe of TexasA&M Academic Building, single-stroke #3A3A3A lines, no fill,3D outline style.”---

###3.5 Gradient Comparison Slider (Human vs AI → Teaching vs Research)1. Visual Clone Instructions • Same900×220px gradient bar with draggable circular handle.2. Content Replacement • Section H2: “Teaching & research at a glance”. • Subtitle: “Drag to compare a professor’s teaching focus against research intensity.” • Left caption small-caps “Teaching”, right caption “Research”. • Two caption paragraphs underneath clone copy length: – Teaching: “Lecture clarity, engagement & student feedback.” – Research: “Publication record, grants & citations.”5. Asset Replacement • Left gradient prompt: “Smooth vertical gradient, light maroon → deep maroon, metallic grain”. • Right gradient prompt: “Smooth vertical gradient, rose → gold (#FFCF3F), metallic grain”.

---

###3.6 Course Comparison Table (replaces language list)1. Visual Clone Instructions • Same white-bordered left-aligned card,740px width.2. Content Replacement • H2: “Compare courses before you enroll”. • Subtitle: “Credit hours, average GPA, and professor rating—all side by side.” • Button: “Try a sample search”. • Table rows (12): | Flag cell → Course icon | Course | AvgGPA | Workload | Rating | ▶︎ icon | Example first row: | 📐 | “CSCE121” | “3.18” | “Medium” | “4.6 /5” | play |3. Asset Replacements • Course icon prompt: “Flat,2-color line icon of computer monitor, white line on dark background”. Provide12 variants (calculator, beaker, gear, etc.)4. Layout & Structure – identical; include play arrow icon.

---

###3.7 Student Testimonial Carousel (colored cards)1. Visual Clone Instructions •3-card visible viewport,320px each, swipable, rainbow tinted just like reference.2. Content Replacement (same text length) • Card1 (Blue): – Tag: “@Aggie_Engineer” — “Sophomore, CSCE”. – Quote (~225chars): “Using AggieProf, I quickly saw which CSCE221 sections had the lightest curve. Ended up with Prof. Chen and loved every minute.” – Link: “Read the full story”. • Card2 (Pink): similar pattern. • Card3 (Orange): similar pattern.3. Asset Replacements • Portrait prompts (one per card) e.g., “Front-facing student portrait,20-year-old Asian male, neutral expression, heavy pink/magenta duotone, grain overlay, studio lighting”. (Repeat for each color).---

###3.8 Mission & Mosaic Footer Intro1. Visual Clone Instructions • Split card: copy left (40%),5×6 colored mosaic right.2. Content Replacement • H2: “Our mission”. • Body: “We believe every Aggie deserves transparent, data-backed guidance to shape their academic journey.” • Buttons: “Meet the team” & “Careers”.3. Asset Replacement • Mosaic prompt: “30 square tiles, TAMU campus scenes and student life, each tile tinted with random bright duotone (blue, green, yellow, pink), grain overlay.”---

###3.9 Footer1. Visual Clone Instructions – clone full structure, link columns, social icons.2. Content Replacement • Brand blurb: “Real-time, multidimensional professor intelligence for every Aggie.” • Column1 (Features): Rankings, Grade Data, Reviews, Workload. • Column2 (Resources): Pricing, Docs, Blog, API. • Column3 (Company): About, Careers, Contact, Press. • Legal column identical pattern (Privacy, Terms, Acceptable Use).---

## ✅ Clone Fidelity Checklist✓ UI grid, padding, typography, color tokens stay pixel-identical✓ All copy fully rewritten to TexasA&M professor-comparison context✓ Every asset includes a prompt preserving style, size, and grain✓ Component interactions (hover, carousel, slider) cloned1:1✓ No deviation in visual hierarchy, borders, or animation timing---

Deliver this spec to engineering/design to build the production-ready clone with confidence.
