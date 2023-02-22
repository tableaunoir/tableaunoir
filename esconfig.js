const esbuild = require('esbuild');
const copy = require('./copy-plugin');
const chokidar = require('chokidar');

const cliArgs = process.argv.slice(2);
const developmentMode = cliArgs.includes('development');
console.log(`Development mode ${developmentMode ? 'ON' : 'OFF'}`);

const watchMode = cliArgs.includes('watch');
console.log(`Watch mode ${watchMode ? 'ON' : 'OFF'}`);

const logLevel = process.env.LOG_LEVEL || 'warning';
console.log(`Log level ${logLevel}`);

const OUTDIR = 'dist';

const buildOptions = {
  entryPoints: ['./src/main.ts'],
  outfile: `${OUTDIR}/tableaunoir.js`,
  bundle: true,
  minify: !developmentMode,
  sourcemap: developmentMode,
  logLevel,
  format: 'esm',
  platform: 'browser',
  target: 'ES6',
  external: ['fs', 'path'],
  plugins: [copy({
    dereference: true,
    errorOnExist: false,
    preserveTimestamps: true,
    recursive: true,
    copyTasks: [
      { from: 'src/index.html', to: `${OUTDIR}/index.html` },
      { from: 'src/style.css', to: `${OUTDIR}/style.css` },
      { from: 'src/manifest.webmanifest', to: `${OUTDIR}/manifest.webmanifest` },
      { from: 'src/fr.json', to: `${OUTDIR}/fr.json` },
      { from: 'src/de.json', to: `${OUTDIR}/de.json` },
      { from: 'src/es.json', to: `${OUTDIR}/es.json` },
      { from: 'favicon.svg', to: `${OUTDIR}/favicon.svg`},
      { from: 'img', to: `${OUTDIR}/img` },
      { from: 'sounds', to: `${OUTDIR}/sounds` },
    ]
  })],
};

(async () => {
  log('Building started');

  // setting up the context also builds
  const buildContext = await esbuild.context(buildOptions);
  log('Building done');
  if (!watchMode) {
    await buildContext.rebuild();
    await buildContext.dispose();
    return;
  }

  log('Watching');
  const ignored = [
    './node_modules',
    `./${OUTDIR}`,
    './.github',
    './.git',
  ]
  chokidar.watch('.', { ignored }).on('change', async fileName => {
    log(`${fileName} changed, rebuilding`);
    await buildContext.rebuild();
    log('Rebuild done');
  })
  
  const { port } = await buildContext.serve({ servedir: OUTDIR });
  console.log(`Serving @ http://localhost:${port}`);
})();

function log(message) {
  console.log(`${message} - ${new Date().toLocaleString()}`);
}
