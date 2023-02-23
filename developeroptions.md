Developer options

#### npm scripts

`npm run script-name` runs the script "script-name".
`npm ci` removes `node_modules` and reinstalls all packages.

|Script name | Description |
| - | - |
| build | Build the project*. |
| electron | Starts the desktop version of Tableaunoir |
| esbuild-watch | Serves the frontend i.e. the js/html/images to `http://localhost:8000`. Detects file changes and rebuilds* the project. Manual browser refresh required. |
| lint | Show linter warning/errors. |
| serve | Start a local backend server. Handles connections between participants |


\* See [Build details](#Build details)

#### Build details
*Building* has a few steps - 
1. Translate typescript into Javascript
2. Bundle all Javascript into a single file `tableaunoir.js`
3. Copy static HTML, CSS and image files

and put it all in the `dist` folder. When using `esbuild-watch` a source map will be created meaning all the typescript source files will be available for inspection and debugging in the in-browser devtools.

The esbuild verbosity can be adjusted by setting the `LOG_LEVEL` environment variable like so
```bash
LOG_LEVEL=debug node esconfig.js
```
The default is `warning`. For options see [the esbuild documentation](https://esbuild.github.io/api/#log-level)


#### Create your own Tableaunoir server

In order to share blackboards you need a server. For installing the server:

 1. In the server, first `git clone` (and then later `git pull`) the project.

 2. Modify the `src/config.js`.

 3. Build Tableaunoir

 4. Install Apache HTTPD to deploy `dist/index.html` (other web servers might work too, but have not been tested).

 5. Configure the server part, see [`server/README.md`](server/README.md).

 6. Run `server/run.sh`.



