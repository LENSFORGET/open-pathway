# Project instructions

Open Pathway is an open-source personal planning app. Its core journey is exploration, action planning, readiness, and reflection.

- Write for someone discovering this project for the first time. Explain what each feature does and how to use it. Keep copy centered on this product's purpose and terminology.
- Use `/workspace` for the planning workspace. Keep the route map aligned with the current product.
- Preserve local processing and preset-choice inputs. Keep credentials and personal information out of source files and sample records.

- Keep the bilingual editorial design: warm paper, forest ink, muted brass, generous spacing, and original geometric illustration.
- Inputs must be preset choices. Session data must pass the allowlist in `src/model.js` before storage.
- Keep source-controlled assets original and text-based; record their provenance in `THIRD_PARTY_NOTICES.md`.
- Clearly label built-in examples and distinguish them from the user's saved plans.
- Preserve the static Sites adapter and its packaging tests.
- Before release run `npm run check`, review `git status`, and verify the main flows at desktop and mobile widths.
- Keep runtime screenshots and temporary inspection scripts outside the source repository.
- Package releases from the reviewed source-file allowlist. Document hosting configuration alongside the project.
