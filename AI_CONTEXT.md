<!-- Generated from RoyWG925/builder-context. Edit canonical JSON, not this file. Revision: 24ebcc124bdd0ff3a11389f6f9c73e73f220d29fac2371fed3a63eb4fc76b068 -->
# Roy Identity OS - shared agent context

Source: https://github.com/RoyWG925/builder-context
Revision: 24ebcc124bdd0ff3a11389f6f9c73e73f220d29fac2371fed3a63eb4fc76b068

## Read this first
- Public canonical facts live in profile/, projects/, competitions/, and evidence/.
- published-baseline = migrated existing public material; owner-confirmed = Roy merged a fact proposal. They are different evidence levels.
- Never infer employment, proficiency, individual contribution, submission, acceptance, awards, production usage, or business results from repository ownership.
- Unknown means unknown. Keep limitations attached to numbers and research conclusions.
- Private material belongs in the separate private repository. Do not quote, copy, or link private repository names into public proposals.
- Propose new project facts through candidates/<id>.json in a PR. Roy reviews and merges. Only an owner merge can promote those candidates.
- LinkedIn outputs are drafts. No publishing, messaging, scraping, browser actions, or account mutation is authorized by this file.

## Profile
Yuyang (Roy) Wang (王語揚)
AI Product Engineer
Product-minded engineer building AI-powered tools and interactive web apps.
Taipei, Taiwan; Open to Work.

Graduated from National Taiwan Normal University (B.S., Learning Sciences, 2026). My HCI background shapes how I approach the interaction between people and complex systems.

I build AI-powered tools and interactive web apps, across applied NLP, full-stack product interfaces, and interactive UI.

I combine Learning Sciences and engineering practice. I care whether the software is useful to a real person, as well as whether a model can produce an answer.

## Projects
### VIRAL - One whisper, a living town
Status: deployed; period: 2026; last verified: 2026-10-19; review: published-baseline.
AI-driven town simulation: whisper a sentence to a resident and watch its consequences. Gemma on AMD generates character reactions; a deterministic engine validates actions and records causal events.
Contribution: Public project in RoyWG925's account. Individual versus team ownership of specific components remains unconfirmed.
Technology: TypeScript, Next.js, Gemma, AMD Token Factory
Results: Published a playable experience with validated model actions and an inspectable chain of causes.
Limitations: Live runs depend on model latency. Entertainment claims have not been validated with human playtesters. Submission, acceptance, awards, and Roy's precise team contribution are not confirmed.
Lessons: Separate model-generated decisions from deterministic state changes and make failures observable.
Evidence: [viral-readme](https://github.com/RoyWG925/viral-town/blob/master/README.md)

### Market Sentiment x TAIEX
Status: research-completed; period: 2025; last verified: 2026-10-19; review: published-baseline.
Three-person NTNU event study of PTT Stock sentiment and the TAIEX. Fine-tuned multilingual BERT and evaluated sentiment structure around the April 2025 tariff shock.
Contribution: Roy handled BERT training, coding, crawling, and statistical analysis in a three-person NTNU research team, as described in the existing public portfolio.
Technology: Python, PyTorch, Hugging Face Transformers, BERT, SQLite
Results: Implemented a text ingestion, labeling, model training, and event-study workflow.
Limitations: The reported 0.683 macro-F1 used a test set overlapping training and tuning. The repository reports 0.580 on a 45-item consensus-labeled holdout. This is a single-event, same-day association study; it does not establish market prediction.
Lessons: Separate exploratory scores from held-out evaluation and publish corrections when recomputation changes the conclusion.
Evidence: [ptt-readme](https://github.com/RoyWG925/ptt-sentiment-stock-analysis/blob/main/README.md) · [ptt-errata](https://github.com/RoyWG925/ptt-sentiment-stock-analysis/blob/main/ERRATA.md) · [portfolio-existing](https://github.com/RoyWG925/portfolio-astro/blob/main/src/pages/index.astro)

### Is my major worth it?
Status: prototype; period: 2025; last verified: 2026-10-19; review: published-baseline.
Interactive dashboard comparing Taiwan university admission scores with graduate salaries across 1,787 programs, with field-level salary distributions and methodology notes.
Contribution: NTNU course project authored by Roy Wang, as credited in the public README.
Technology: Python, Streamlit, Plotly, pandas
Results: Joined admission and field-level salary data and built an interactive exploration interface.
Limitations: Salary data are at field level, not individual program outcomes. No public server demo is documented.
Lessons: Make data grain and proxy assumptions visible alongside comparisons.
Evidence: [university-readme](https://github.com/RoyWG925/taiwan-uni-cp-value/blob/main/README.md)

### NUCLEUS.IO
Status: deployed; period: 2026; last verified: 2026-10-19; review: published-baseline.
Flyable 3D portfolio built with Three.js, custom GLSL post-processing, procedural audio, and interactive project orbs.
Contribution: Roy Wang's developer portfolio, as identified in its public README.
Technology: Three.js, WebGL, GLSL, Vite, Web Audio API
Results: Published an interactive WebGL portfolio with flight, project exploration, and synthesized audio.
Limitations: Requires a browser with WebGL2.
Lessons: Use interaction and motion to make a portfolio explorable.
Evidence: [nucleus-readme](https://github.com/RoyWG925/nucleus-io/blob/main/README.md)

## Competitions
- AMD Developer Hackathon ACT III, Track 4 - Create a New Kind of Experience, 2026-10. Status: project-prepared. Submitted: unknown. Result: unknown. VIRAL's public README identifies this hackathon and track. Official submission and competition results remain unconfirmed.
  Evidence: [viral-readme](https://github.com/RoyWG925/viral-town/blob/master/README.md)

## Skills already published
Applied NLP: Python, PyTorch, Hugging Face Transformers, BERT fine-tuning, pandas, Jupyter
Full-Stack Apps: React, Astro, Node.js, Firebase, Supabase, Vercel
Interactive UI: Three.js / WebGL, GLSL shaders, Framer Motion, CSS animation
Toolchain: Git / GitHub, Cursor, Claude Code, GitHub Copilot, Godot, Figma, Docker

## Education
National Taiwan Normal University (NTNU); B.S. in Learning Sciences; 2021 - 2026
