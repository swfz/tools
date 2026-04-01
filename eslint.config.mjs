import nextConfig from "eslint-config-next/core-web-vitals";
import tailwindcssPlugin from "eslint-plugin-tailwindcss";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["**/*.config.js"],
  },
  ...nextConfig,
  ...tailwindcssPlugin.configs["flat/recommended"],
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
