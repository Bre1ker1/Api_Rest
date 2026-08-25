const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];

// Especificamos keySize de 2048 bits para que Node.js v24 no rechace la clave por corta
const pkey = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

fs.writeFileSync(path.join(certsDir, 'server.key'), pkey.private);
fs.writeFileSync(path.join(certsDir, 'server.cert'), pkey.cert);

console.log('Certificados SSL de 2048 bits creados correctamente.');