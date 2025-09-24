// Cross-platform port guard: frees a TCP port by terminating listener PIDs before starting the dev server.
// Usage: node scripts/freePort.js 5000
// Defaults to port 5000 if not provided.

const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const log = (...args) => console.log('[freePort]', ...args);
const warn = (...args) => console.warn('[freePort:warn]', ...args);
const error = (...args) => console.error('[freePort:error]', ...args);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function freePort(port) {
  const platform = process.platform;

  if (platform === 'win32') {
    await freePortWindows(port);
  } else {
    await freePortUnix(port);
  }
}

async function freePortWindows(port) {
  try {
    // Get all TCP listeners, filter to the target port and LISTENING state
    const { stdout } = await execAsync('netstat -ano -p tcp');
    const lines = stdout.split(/\r?\n/).filter(Boolean);

    const pids = new Set();

    for (const line of lines) {
      // Example line:
      //  TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING       6632
      //  TCP    [::]:5000              [::]:0                 LISTENING       6632
      if (line.includes(`:${port}`) && line.toUpperCase().includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (/^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }
    }

    if (pids.size === 0) {
      log(`No listeners found on port ${port} (Windows)`);
      return;
    }

    log(`Found ${pids.size} listener(s) on port ${port}: ${Array.from(pids).join(', ')}`);

    for (const pid of pids) {
      try {
        const { stdout: killOut } = await execAsync(`taskkill /PID ${pid} /F`);
        log(`Killed PID ${pid}: ${killOut.trim()}`);
      } catch (e) {
        // If process is already gone or access denied, log and continue
        warn(`Could not kill PID ${pid}: ${e.message}`);
      }
    }

    // Small delay to let OS release the port
    await sleep(300);
  } catch (e) {
    error(`Windows freePort failed: ${e.message}`);
  }
}

async function freePortUnix(port) {
  // Try lsof first, fallback to fuser if available
  try {
    const { stdout } = await execAsync(`lsof -t -i tcp:${port} || true`);
    const pids = new Set(
      stdout
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => /^\d+$/.test(s))
    );

    if (pids.size === 0) {
      // Fallback to fuser (not always present)
      try {
        const { stdout: fuserOut } = await execAsync(`fuser -n tcp ${port} || true`);
        // fuser outputs PIDs possibly suffixed with '/tcp'
        fuserOut
          .split(/\s+/)
          .map((s) => s.replace(/\/tcp$/, '').trim())
          .filter((s) => /^\d+$/.test(s))
          .forEach((pid) => pids.add(pid));
      } catch (e) {
        // ignore
      }
    }

    if (pids.size === 0) {
      log(`No listeners found on port ${port} (Unix)`);
      return;
    }

    log(`Found ${pids.size} listener(s) on port ${port}: ${Array.from(pids).join(', ')}`);

    for (const pid of pids) {
      try {
        // SIGKILL to ensure immediate release
        process.kill(Number(pid), 'SIGKILL');
        log(`Killed PID ${pid}`);
      } catch (e) {
        warn(`Could not kill PID ${pid}: ${e.message}`);
      }
    }

    await sleep(300);
  } catch (e) {
    error(`Unix freePort failed: ${e.message}`);
  }
}

(async () => {
  const port = Number(process.argv[2]) || 5000;
  if (!Number.isInteger(port) || port <= 0) {
    error(`Invalid port: ${process.argv[2]}`);
    process.exit(1);
  }

  log(`Ensuring port ${port} is free...`);
  await freePort(port);
  log(`Port ${port} is ready.`);
  process.exit(0);
})();