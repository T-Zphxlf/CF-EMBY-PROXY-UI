import { registerHooks } from "node:module";

// Maps the Workers-only `cloudflare:sockets` builtin to a Node stub so the
// worker ESM sources stay importable under `node --test`.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:sockets")
      return {
        url: new URL("./cloudflare-sockets-stub.js", import.meta.url).href,
        shortCircuit: true,
      };
    return nextResolve(specifier, context);
  },
});
