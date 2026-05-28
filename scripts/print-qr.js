// Prints a QR code for the local dev URL, so you can scan it from your phone.
// Called from `npm run dev` ~3s after Next.js starts.

const os = require('node:os');
const net = require('node:net');
const qrcode = require('qrcode-terminal');

// Walk all network interfaces and find the first non-internal IPv4 — that's
// the LAN address phones on the same Wi-Fi / hotspot can reach.
function getLanIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

// Returns a promise that resolves with whichever of [3000, 3001] is actually
// in use (i.e. occupied) — that's the port Next is listening on.
function detectPort(candidates = [3000, 3001]) {
  return Promise.all(
    candidates.map(
      (port) =>
        new Promise((resolve) => {
          const server = net.createServer();
          server.once('error', () => resolve({ port, inUse: true }));
          server.once('listening', () => server.close(() => resolve({ port, inUse: false })));
          server.listen(port);
        })
    )
  ).then((results) => {
    const inUse = results.find((r) => r.inUse);
    return inUse ? inUse.port : candidates[0];
  });
}

(async () => {
  const ip = getLanIP();
  if (!ip) {
    console.log('\n[QR] No LAN IP found — connect to Wi-Fi or a hotspot.\n');
    return;
  }
  const port = await detectPort();
  const url = `http://${ip}:${port}`;

  console.log('\n');
  console.log('─────────────────────────────────────────────');
  console.log(`  Scan with your phone Camera app:`);
  console.log(`  ${url}`);
  console.log('─────────────────────────────────────────────');
  qrcode.generate(url, { small: true });
  console.log('─────────────────────────────────────────────\n');
})();
