# Hosting a tableaunoir instance

Tableaunoir is split into two components:

- a front-end application which provides all the user interface;
- a small websocket server which handles the communications between the clients
  on a shared board.

The front-end application is all you need if you are not planning to use shared
boards. Note that you might even use it offline, provided you have cloned this
repository, by opening the `index.html` file at the root of this repository in
your web browser.

If you want to host you own instance, as a convenience to your users, or for the
(still experimental) board sharing feature, read the following.


## Hosting the front-end

- Put the source code of the website in a folder that is accessible by your web
  server (apache, nginx, …) by e.g. cloning this repository or downloading
  [this](https://github.com/tableaunoir/tableaunoir.github.io/archive/master.zip)
  archive.

- Configure your web server to serve this folder.

Here is a minimal configuration for nginx, tune to fit to your needs (SSL
encryption, caching, etc).

```nginx
server {
  listen 80;
  server_name tableaunoir.example.com;

  root /path/to/the/code;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }

  # Optional: you might not want to serve these folders
  location /server { return 404; }
  location /.git   { return 404; }
}
```

## Hosting the back-end websocket server

The back-end requires a little more configuration.
Note that it does not necessarity have to be on the same machine as the
front-end.

### System dependencies

You need to install [Node.js](https://nodejs.org/en/) and two javascript
libraries: `ws` and `small-uuid`.
On debian 10 you can do so by running:

```sh
$ apt update
$ apt install nodejs npm
```

And then in the `server` folder of the repository:

```sh
$ npm install ws small-uuid
```

### Running the websocker server

Then you need to run `node main.js` from the `server` folder of the repository,
which will start a websocket server accepting connections on `0.0.0.0:8080`.
You can choose another port by updating the `PORT` variable at the top of the
`main.js` file.

Finally, you need to tell the front-end application about your websocket server
by updating the `SERVERADRESS` variable at the top of the `js/share.js` file to
match the host and port of your websocket server.

Also make sure that your firewall allows connections on the `8080` port.

If you are fine without SSL encryption, you are done.
Otherwise, take a look at the following.

## SSL encryption

TODO
