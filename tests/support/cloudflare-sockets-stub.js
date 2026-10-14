// Node stand-in for the Workers-only `cloudflare:sockets` builtin. Tests set
// globalThis.__CF_EMBY_TEST_TCP_CONNECT__ to simulate a TCP handshake; without
// it the probe reports no connection.
export function connect(...args) {
  const override = globalThis.__CF_EMBY_TEST_TCP_CONNECT__;
  if (typeof override === "function") return override(...args);
  throw new Error("cloudflare:sockets is only available in the Workers runtime");
}
