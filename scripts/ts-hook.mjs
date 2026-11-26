// Lets Node load the drawing check's .ts files directly (Node strips the types): adds ".ts" to extensionless relative imports.
// Used by the drawing check test and example scripts: node --import ./scripts/ts-hook.mjs ...
import { registerHooks } from "node:module";

registerHooks({
  resolve(spec, ctx, next) {
    if (/^\.{1,2}\//.test(spec) && !/\.[cm]?[jt]sx?$/.test(spec)) {
      try { return next(spec + ".ts", ctx); } catch { /* not a .ts file */ }
    }
    return next(spec, ctx);
  },
});
