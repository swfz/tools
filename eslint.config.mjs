import { fixupConfigRules } from "@eslint/compat";
import nextConfig from "eslint-config-next/core-web-vitals";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";
import prettierConfig from "eslint-config-prettier";
import * as espree from "espree";

export default [
  {
    ignores: ["**/*.config.js"],
  },
  ...fixupConfigRules(nextConfig),
  // Override parser for plain JS files: the babel-based parser bundled in
  // eslint-config-next returns a scope manager incompatible with ESLint v10
  // (missing `addGlobals`). Using espree (ESLint's default parser) resolves this.
  {
    files: ["**/*.js", "**/*.mjs", "**/*.jsx"],
    languageOptions: {
      parser: espree,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  ...fixupConfigRules(tailwindcssPlugin.configs["flat/recommended"]),
  prettierConfig,
  {
    settings: {
      "import/resolver": "typescript",
    },
  },
  {
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];
