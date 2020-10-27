# Install 
apt install nodejs
apt install npm
sudo npm install ws
sudo npm install small-uuid

openssl rsa -in /etc/ssl/private/tableaunoir.irisa.fr.key -text > private.pem
openssl x509 -inform PEM -in /etc/ssl/private/tableaunoir.irisa.fr.cer > public.pem



# Run
On the server, run <code>node main.js</code> in the server folder.
