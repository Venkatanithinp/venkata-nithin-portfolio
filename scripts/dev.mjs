import { spawn } from 'node:child_process';

// The managed preview passes Vite-style options; map them to Next's CLI.
const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', value('--host', '0.0.0.0'), '--port', value('--port', '4173')], {stdio:'inherit'});
process.on('SIGTERM', () => server.kill('SIGTERM'));
process.on('SIGINT', () => server.kill('SIGINT'));
server.on('exit', code => process.exit(code ?? 0));
