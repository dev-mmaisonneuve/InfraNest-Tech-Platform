import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * eslint-config-next already exports flat config, so it is spread directly.
 * Bridging it through FlatCompat instead throws a circular-structure error on
 * ESLint 9 — the compat layer is only needed for genuinely legacy configs.
 *
 * These rules cover what typechecking and tests cannot: exhaustive hook
 * dependency arrays, raw <img> where next/image belongs, and the jsx-a11y set.
 */
export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];
