// Keep unreleased studio UI and preview assets out of the public game.
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]))).flat()}
const shipped=await files('dist');
for(const path of shipped.filter(p=>/\.(js|css|html)$/.test(p))){const text=await readFile(path,'utf8');for(const marker of ['PRIVATE DESIGN LAB','Future Fairway','Snowy Village','lab-studio','fairway-lab-profile-v1'])if(text.includes(marker))throw Error(`Unreleased preview leaked into ${path}: ${marker}`)}
console.log('Release gate passed: private studio and premium preview assets excluded.');
