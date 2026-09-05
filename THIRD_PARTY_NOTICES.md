# Third-party notices and asset provenance

The project MIT license covers original project contributions. Third-party packages retain their own copyright and license terms. The lockfile records the resolved dependency versions.

| Dependency                   | Purpose                                 | License                   |
| ---------------------------- | --------------------------------------- | ------------------------- |
| React / React DOM            | UI runtime                              | MIT                       |
| Vite / React plugin          | Development and build tooling           | MIT                       |
| Phosphor React icons         | Interface icons                         | MIT                       |
| Noto Sans TC / Noto Serif TC | Locally served Chinese typography       | SIL Open Font License 1.1 |
| Cormorant Garamond           | Locally served Latin display typography | SIL Open Font License 1.1 |

Fontsource packages distribute the font files and their upstream license notices. Inspect the exact license files in installed dependencies when redistributing them. `scripts/prepare-sites-build.mjs` also copies the font and icon licenses into `dist/client/licenses` for hosted builds. The runtime React license is included there as well.

`public/images/pathway.svg` is an original geometric illustration created for this project. It contains only SVG geometry and gradients: no photographs, embedded raster images, external resources, people, company marks, or QR codes. It is released under this project's MIT license. No other external visual assets are bundled.

All planning scenarios, advice text, record identifiers, and sample states are authored demonstration content. There are no attributed testimonials, customer case studies, institutional endorsements, or real contact records.

Tool and package names in technical documentation are factual dependency acknowledgments and do not imply sponsorship.
