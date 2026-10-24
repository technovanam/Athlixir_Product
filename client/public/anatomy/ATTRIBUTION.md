# Lower-limb anatomy model — attribution

The 3D lower-limb model on the Athlixir landing page (`leg.json`, `leg.bin.gz`)
is adapted from **BodyParts3D**.

- **BodyParts3D**, © The Database Center for Life Science (DBCLS), Japan.
  Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
  - Dataset archive: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
  - License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html
  - License terms: https://creativecommons.org/licenses/by/4.0/
- **Publication:** Mitsuhashi N, Fujieda K, Tamura T, Kawamoto S, Takagi T,
  Okubo K (2009). BodyParts3D: 3D structure database for anatomical concepts.
  *Nucleic Acids Research* 37 (Database issue): D782–D785.
  https://doi.org/10.1093/nar/gkn613
- **Packaging source:** Human Atlas by ashemag (MIT License),
  https://github.com/ashemag/human-atlas — its browser-ready BodyParts3D 4.0
  geometry (axes converted to metres/Y-up, simplified with meshoptimizer,
  normals quantized) was the input to our build.

## Adaptations made for Athlixir

Built with `client/scripts/build-anatomy.mjs`:

- Selected only lower-limb and hip structures (bones, muscles, tendons and
  ligaments, arteries, veins); hand, trunk and pelvic-organ structures removed.
- Further simplified with meshoptimizer to about 135,000 triangles in total.
- Positions quantized to 16-bit integers; grouped into five display layers
  with Athlixir colours; packed into one gzip-compressed binary.

BodyParts3D contains no peripheral nerves for the lower limb, so none are
shown. The model is an adult male reference anatomy for education. It is not a
diagnostic or clinical tool.
