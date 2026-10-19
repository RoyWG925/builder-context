<!-- Generated from RoyWG925/builder-context. Edit canonical JSON, not this file. Revision: e8121c1a10d35f8c937b3f63d37373e437887bd1db771494811e025f3eab1773 -->
# Roy Identity OS - shared agent context

Source: https://github.com/RoyWG925/builder-context
Revision: e8121c1a10d35f8c937b3f63d37373e437887bd1db771494811e025f3eab1773

## Read this first
- Public canonical facts live in profile/, projects/, competitions/, and evidence/.
- published-baseline = migrated existing public material; owner-confirmed = a legacy personally merged fact proposal. owner-attested = a minimal explicit statement supplied by Roy, with a public statement receipt. These are different evidence levels.
- Never infer employment, proficiency, individual contribution, submission, acceptance, awards, production usage, or business results from repository ownership.
- Unknown means unknown. Keep limitations attached to numbers and research conclusions.
- Private material belongs in the separate private repository. Do not quote, copy, or link private repository names into public proposals.
- New evidence stays in candidates/ and is excluded from generated public views. PRs are optional. Roy can approve exact changes in chat; the interactive agent records a scoped receipt and publishes only those fields.
- Never invent an owner approval or treat login as approval. Unattended cloud/local agents collect evidence only. Follow scripts/chat-confirm.mjs for actual chat-confirmed publication; do not require a second GitHub click.
- LinkedIn outputs are drafts. No publishing, messaging, scraping, browser actions, or account mutation is authorized by this file.

## Profile
Yuyang (Roy) Wang (���y��)
AI Engineer & Product Builder
Building AI-native consumer products, agents and interactive experiences.
Taipei, Taiwan; Open to Work.

Graduated from National Taiwan Normal University (B.S., Learning Sciences, 2026). My HCI background shapes how I approach the interaction between people and complex systems.

I build AI-powered tools and interactive experiences across agent systems, full-stack interfaces, creative technology and applied NLP research.

My direction is AI-native consumer products: I want to build products people use, return to, and choose to pay for. This is a product goal, not a claim of current users or revenue.

## Projects
### VIRAL - One whisper, a living town
Status: deployed; period: 2026; last verified: 2026-10-19; review: owner-attested.
AI-driven town simulation: whisper a sentence to a resident and watch its consequences. Gemma on AMD generates character reactions; a deterministic engine validates actions and records causal events.
Contribution: Roy handled AI Agent testing and iteration; his teammate handled competition materials, interface and visual design. They jointly developed the concept and gameplay.
Technology: TypeScript, Next.js, Gemma, AMD Token Factory
Results: Published a playable experience with validated model actions and an inspectable chain of causes.
Limitations: Live runs depend on model latency. Entertainment claims have not been validated with human playtesters. Roy confirms completion and submission to AMD Developer Hackathon ACT III; results are pending. Division of work is explicitly owner-attested; competition results remain unknown.
Lessons: Separate model-generated decisions from deterministic state changes and make failures observable.
Evidence: [viral-readme](https://github.com/RoyWG925/viral-town/blob/cbab86c5b978cfa522cf2c3307a8bad236e2db49/README.md) �P [chat-roy-20261019-chat-attribution](https://github.com/RoyWG925/builder-context/blob/main/receipts/chat-roy-20261019-chat-attribution.json)

### Market Sentiment x TAIEX
Status: research-completed; period: 2025; last verified: 2026-10-19; review: published-baseline.
Three-person NTNU event study of PTT Stock sentiment and the TAIEX. Fine-tuned multilingual BERT and evaluated sentiment structure around the April 2025 tariff shock.
Contribution: Roy handled BERT training, coding, crawling, and statistical analysis in a three-person NTNU research team, as described in the existing public portfolio.
Technology: Python, PyTorch, Hugging Face Transformers, BERT, SQLite
Results: Implemented a text ingestion, labeling, model training, and event-study workflow.
Limitations: The reported 0.683 macro-F1 used a test set overlapping training and tuning. The repository reports 0.580 on a 45-item consensus-labeled holdout. This is a single-event, same-day association study; it does not establish market prediction.
Lessons: Separate exploratory scores from held-out evaluation and publish corrections when recomputation changes the conclusion.
Evidence: [ptt-readme](https://github.com/RoyWG925/ptt-sentiment-stock-analysis/blob/731cfbb089427efbf47026e3235be029d3c46fb6/README.md) �P [ptt-errata](https://github.com/RoyWG925/ptt-sentiment-stock-analysis/blob/731cfbb089427efbf47026e3235be029d3c46fb6/ERRATA.md) �P [portfolio-existing](https://github.com/RoyWG925/portfolio-astro/blob/14b6f7be999b2dbab116198c97da9e4e13b3313c/src/pages/index.astro)

### Is my major worth it?
Status: prototype; period: 2025; last verified: 2026-10-19; review: published-baseline.
Interactive dashboard comparing Taiwan university admission scores with graduate salaries across 1,787 programs, with field-level salary distributions and methodology notes.
Contribution: NTNU course project authored by Roy Wang, as credited in the public README.
Technology: Python, Streamlit, Plotly, pandas
Results: Joined admission and field-level salary data and built an interactive exploration interface.
Limitations: Salary data are at field level, not individual program outcomes. No public server demo is documented.
Lessons: Make data grain and proxy assumptions visible alongside comparisons.
Evidence: [university-readme](https://github.com/RoyWG925/taiwan-uni-cp-value/blob/5881b1df4347ecf449ae94f946afc4733a2d3afb/README.md)

### NUCLEUS.IO
Status: deployed; period: 2026; last verified: 2026-10-19; review: published-baseline.
Flyable 3D portfolio built with Three.js, custom GLSL post-processing, procedural audio, and interactive project orbs.
Contribution: Roy Wang's developer portfolio, as identified in its public README.
Technology: Three.js, WebGL, GLSL, Vite, Web Audio API
Results: Published an interactive WebGL portfolio with flight, project exploration, and synthesized audio.
Limitations: Requires a browser with WebGL2.
Lessons: Use interaction and motion to make a portfolio explorable.
Evidence: [nucleus-readme](https://github.com/RoyWG925/nucleus-io/blob/072dae5886fef81107f1dc1e6b31f63b527140bc/README.md)

## Competitions
- AMD Developer Hackathon ACT III, Track 4 - Create a New Kind of Experience, 2026-10. Status: submitted. Submitted: true. Result: unknown. VIRAL is completed and submitted, according to Roy's explicit statement on 2026-10-19. Results are pending; no award is claimed. The official submission receipt has not been independently verified.
  Evidence: [viral-readme](https://github.com/RoyWG925/viral-town/blob/cbab86c5b978cfa522cf2c3307a8bad236e2db49/README.md) �P [roy-viral-submitted](https://github.com/RoyWG925/builder-context/blob/01747c61348e3bcced4530737be0b3cf8c57ee08/evidence/owner-statements.json)

## Explicit owner statements
- Development direction: AI-native Consumer Products, AI Agent Engineering, Creative Technology, Interactive Experiences. Building products with usage, return visits and willingness to pay is an aspiration, not a reported outcome. (Roy, 2026-10-19; Explicit owner instruction during Identity OS phase 2)
- VIRAL has been completed and submitted to AMD Developer Hackathon ACT III. Competition results have not been announced. (Roy, 2026-10-19; Explicit owner instruction during Identity OS phase 2)
- Roy independently built BallCrawl and T-MINUS. (Roy, 2026-10-19; Explicit owner statement in the Identity OS conversation)
- VIRAL is a team project. Roy handled AI Agent testing and iteration; the teammate handled competition materials, interface and visual design; concept and gameplay were shared. (Roy, 2026-10-19; Explicit owner statement in the Identity OS conversation)

## Skills already published
Applied NLP: Python, PyTorch, Hugging Face Transformers, BERT fine-tuning, pandas, Jupyter
Full-Stack Apps: React, Astro, Node.js, Firebase, Supabase, Vercel
Interactive UI: Three.js / WebGL, GLSL shaders, Framer Motion, CSS animation
Toolchain: Git / GitHub, Cursor, Claude Code, GitHub Copilot, Godot, Figma, Docker

## Education
National Taiwan Normal University (NTNU); B.S. in Learning Sciences; 2021 - 2026

<!-- Generated from RoyWG925/builder-context. Edit canonical JSON, not this file. Revision: e8121c1a10d35f8c937b3f63d37373e437887bd1db771494811e025f3eab1773 -->
# Introductions by audience

## AI Engineer / Full-stack Engineer
I am Roy Wang, an AI engineer and product builder with a Learning Sciences background. My public projects span model-driven interactive systems, full-stack interfaces and NLP research. I focus on making model behavior observable and connecting it to useful product experiences.

Emphasis: VIRAL: validated model decisions and deterministic simulation; Evidence and limits of NLP evaluation; Full-stack product interfaces

Select only relevant projects from the current public bundle. Project and team attribution limits still apply.

## AI Product Builder / Solo Founder direction
I build AI-powered products and interactive experiences, from a living town simulation to web tools. I am pursuing AI-native consumer products and want to learn from real usage, retention and willingness to pay. Solo founder is a direction; current employment, commercial traction and sole ownership are not asserted.

Emphasis: Product interaction and useful behavior; Shipping and learning from feedback; No unsupported user, retention or revenue claims

Select only relevant projects from the current public bundle. Project and team attribution limits still apply.

## Creative Technologist
I work where AI behavior and interactive interfaces meet. Projects such as VIRAL and Nucleus.io explore how people can experience complex systems through responsive, playful interfaces. My Learning Sciences background informs how I think about interaction and understanding.

Emphasis: VIRAL: emergent narrative and visible causality; Nucleus.io: interactive interface; Game prototypes after ownership and feature review

Select only relevant projects from the current public bundle. Project and team attribution limits still apply.

## Hackathon Applications
I am Roy Wang, an AI product builder interested in agent systems and new interactive experiences. VIRAL combines model-generated character decisions with deterministic simulation. AMD Developer Hackathon ACT III: submitted; results pending (source: owner-attested, 2026-10-19).

Emphasis: Working prototype and traceable technical evidence; Individual and team contribution must be confirmed per application; Submission is not acceptance or an award

Select only relevant projects from the current public bundle. Project and team attribution limits still apply.
