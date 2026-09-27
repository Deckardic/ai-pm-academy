import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Next.js routes live in the root `app/` folder (outside `src/`), so Steiger
      // cannot see that every page and most widgets are referenced from there.
      // With those references invisible, this rule only produces false positives.
      "fsd/insignificant-slice": "off",
    },
  },
]);
