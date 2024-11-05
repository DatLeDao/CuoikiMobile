import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },

  // Base ESLint recommended configuration
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Prettier configuration, directly added here instead of using "extends"
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }]
    },
  },
];
