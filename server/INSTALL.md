# Install
Follow these instructions to install the dependencies on a Ubuntu-like GNU/Linux distribution (e.g. Debian):

```bash
$ apt install nodejs
$ apt install npm
$ sudo npm install ws
$ sudo npm install small-uuid

$ openssl rsa -in /etc/ssl/private/tableaunoir.irisa.fr.key -text > private.pem
$ openssl x509 -inform PEM -in /etc/ssl/private/tableaunoir.irisa.fr.cer > public.pem
```

# Run
On the server, run this in the server folder:
```bash
$ node main.js
```

Be sure that the server has an HTTP web server installed, liked [Apache HTTPD](https://httpd.apache.org/) or [NGinx](https://www.nginx.org) (tableaunoir was only tested with Apache HTTPD).
