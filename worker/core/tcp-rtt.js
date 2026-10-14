import { connect } from "cloudflare:sockets";

const DEFAULT_HTTPS_PORT = 443;
const DEFAULT_HTTP_PORT = 80;

function resolveTargetPort(targetUrl) {
  const explicitPort = Number(targetUrl?.port);
  if (Number.isInteger(explicitPort) && explicitPort > 0 && explicitPort <= 65535)
    return explicitPort;
  if (targetUrl?.protocol === "https:") return DEFAULT_HTTPS_PORT;
  if (targetUrl?.protocol === "http:") return DEFAULT_HTTP_PORT;
  return 0;
}

/**
 * Probes a node line over raw TCP and reports the handshake RTT. Used as the
 * 403 fallback: a WAF-rejected HTTP probe no longer proves the node is down,
 * because a completed TCP handshake still shows it accepts connections and
 * this path sends no User-Agent at all.
 *
 * Returns null when the socket cannot be opened inside the timeout.
 *
 * @param {{ targetUrl?: URL }|null} targetRecord
 * @param {number} timeoutMs
 * @returns {Promise<{ ok: true, elapsedMs: number }|null>}
 */
export async function probeTcpRtt(targetRecord, timeoutMs) {
  const hostname = String(targetRecord?.targetUrl?.hostname || "").trim();
  if (!hostname) return null;
  const port = resolveTargetPort(targetRecord.targetUrl);
  if (!port) return null;
  const timeout = Math.max(250, Math.floor(Number(timeoutMs)) || 0);
  const startedAt = Date.now();
  let socket = null;
  let timeoutId = null;
  try {
    socket = connect({ hostname, port });
    await Promise.race([
      socket.opened,
      new Promise((_resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error("tcp_probe_timeout")), timeout);
      }),
    ]);
    return { ok: true, elapsedMs: Math.max(0, Date.now() - startedAt) };
  } catch {
    return null;
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
    try {
      socket?.close?.();
    } catch {}
  }
}
