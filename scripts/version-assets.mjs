import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
let html=fs.readFileSync(dist+'index.html','utf8');
for(const name of ['artists.js','app.js','styles.css']){
 const version=crypto.createHash('sha256').update(fs.readFileSync(dist+name)).digest('hex').slice(0,12);
 const escaped=name.replace('.', '\\.');
 html=html.replace(new RegExp('(["\\\'])'+escaped+'(?:\\?v=[^"\\\']*)?(["\\\'])','g'),`$1${name}?v=${version}$2`);
}
fs.writeFileSync(dist+'index.html',html);
console.log('Updated content versions for local scripts and styles.');
