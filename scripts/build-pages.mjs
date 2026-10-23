import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep the Sites build intact; package its module Worker for Pages advanced mode.
const root = resolve(import.meta.dirname, '..');
process.chdir(root);
const build = spawnSync(process.execPath, ['node_modules/vinext/dist/cli.js', 'build'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const output = resolve('dist/pages');
await rm(output, { recursive: true, force: true });
await cp('dist/client', output, { recursive: true });
await rm(resolve(output, '.vite'), { recursive: true, force: true });
await rm(resolve(output, '.assetsignore'), { force: true });
await mkdir(resolve(output, '_worker.js'), { recursive: true });
await cp('dist/server', resolve(output, '_worker.js/app'), { recursive: true });
await rm(resolve(output, '_worker.js/app/wrangler.json'), { force: true });
await writeFile(resolve(output, '_worker.js/index.js'), `import app from './app/index.js';
export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  }
};
`);
const entries = await readdir(output, { withFileTypes: true });
const exclude = entries.filter(e => !e.name.startsWith('.') && !['_worker.js', '_headers', '_redirects', '_routes.json'].includes(e.name))
  .map(e => '/' + e.name + (e.isDirectory() ? '/*' : ''));
await writeFile(resolve(output, '_routes.json'), JSON.stringify({ version: 1, include: ['/*'], exclude }, null, 2));
// Remove the Workers-only redirect so Pages uses its dashboard configuration.
await rm(resolve('.wrangler/deploy/config.json'), { force: true });
console.log('Cloudflare Pages output: dist/pages');
