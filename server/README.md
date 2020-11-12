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

### Apache

Let's assume that you've got an already working server with sensible values.
Ensure `mod_proxy` and `mod_proxy_wstunnel` are enabled. Add a configuration
file for tableaunoir `/etc/apache2/conf-available/tableaunoir.conf` :

```apache
ProxyPass /tableaunoir/ws  ws://localhost:8080/
Alias /tableaunoir /var/www/tableaunoir
# This assume a copy of tableaunoir in /var/www

# You may want to do something smarter than `Alias`; exercice left to the
# advised reader
```

```sh
e2enmod proxy
e2enmod proxy_wstunnel
a2enconf tableaunoir
# run node (see next section)
# reload appache
```

Finally to use it through https, use `const SERVERADRESS = 'wss://your-domain.com/tableaunoir/ws'`
in `js/share.js`.


## Hosting the back-end websocket server

The back-end requires a little more configuration.
Note that it does not necessarily have to be on the same machine as the
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

### Running the websocket server

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

If you want SSL encryption, you should not expose the websocket server on the
network since it does not understand SSL.
One possible way to have SSL encryption on your instance is to have your web
server (nginx, apache, …) act as a reverse-proxy between the websocket server
and the outside world.

Thus, the clients communicate over an encrypted channel with the web server,
which in turn communicates in clear text with the websocket server running
**locally**.

```
           wss               ws
Client <---------> Nginx <--------> node main.js
         outside           locally
          world
```

Here is a sample nginx configuration file implementing the reverse proxy.
We use two different domain names here for the back-end and the front-end as a
convenience though it should be possible to have both under the same domain name
with some extra configuration (not tried yet).

```nginx
# ---
# Front-end, just serve the static content of the repository.
# ---

server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name tableaunoir.example.com;

  # SSL config, you might want to take a look https://ssl-config.mozilla.org/
  # to set other configuration parameters.
  ssl_certificate /path/to/certificate;
  ssl_certificate_key /path/to/certificate/key;

  root /path/to/the/code;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }

  location /server { return 404; }
  location /.git   { return 404; }
}

# ---
# Back-end, nginx act as a reverse-proxy to localhost:8080
# ---

upstream tableaunoir {
  server localhost:8080;  # Or whatever port the backend in listening on
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;

  # Different host name for convenience
  server_name ws.tableaunoir.example.com;

  # SSL config, you might want to take a look https://ssl-config.mozilla.org/
  # to set other configuration parameters.
  ssl_certificate /path/to/certificate;
  ssl_certificate_key /path/to/certificate/key;

  root /dev/null;

  # http://nginx.org/en/docs/http/websocket.html
  location / {
    include proxy_params;
    proxy_pass http://tableaunoir;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}

# ---
# Redirect all unencrypted traffic
# ---

server {
  listen 80;
  listen [::]:80;
  server_name tableaunoir.example.com ws.tableaunoir.example.com;
  return 301 https://$host$request_uri;
}
```

Do not forget to update the `SERVERADDRESS` in `js/share.js` to
`wss://ws.tableaunoir.example.com` (no port specified, `wss` instead of `ws`).

In this setup, you should also configure your firewall to block incoming trafic
from the outside world to the `8080` port, so that the only way to talk to the
websocket server is through nginx over SSL.
