/**
 * TypeScript 6 raises TS2882 for a side-effect import with no module or type
 * declaration behind it. TypeScript 5 accepted `import "./globals.css"`
 * silently, so `next-env.d.ts` alone is no longer sufficient.
 *
 * Next.js does the actual bundling, and nothing in the app reads a value back
 * out of a stylesheet — `app/layout.tsx` imports globals.css purely for its
 * side effect. The declaration therefore has no shape on purpose: it tells the
 * compiler the module exists without inventing an export surface that would
 * then be wrong.
 *
 * CSS Modules would need a typed default export instead. None are used here;
 * add that separately if any ever are.
 */
declare module "*.css";
