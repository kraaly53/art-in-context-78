import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const context={window:{},document:{addEventListener(){}},};context.window.addEventListener=()=>{};
for(const file of ['artists.js','activity.js','timeline.js'])vm.runInNewContext(fs.readFileSync(dist+file,'utf8'),context,{filename:file});
const artists=context.window.ARTISTS,activity=context.window.ARTIST_ACTIVITY,timeline=context.window.ArtTimeline;
assert.equal(activity.length,51);assert.equal(new Set(activity.map(a=>a.id)).size,51);
for(const p of activity){
 const a=artists.find(a=>a.id===p.id);assert(a,`Unknown artist ${p.id}`);
 assert(Number.isInteger(p.start)&&Number.isInteger(p.end));assert(p.start>=1450&&p.start<=p.end&&p.end<=2026);
 if(a.birth!==null)assert(p.start>=a.birth,`Career begins before birth: ${a.name}`);
 if(a.death!==null)assert(p.end<=a.death,`Posthumous production claimed: ${a.name}`);
 assert(typeof p.ongoing==='boolean');if(p.ongoing)assert.equal(p.end,2026);
 assert(p.label.length>8&&p.basis.length>100&&p.sources.length>0&&p.sources.every(s=>s.startsWith('https://')));
 assert(timeline.isActive(p,p.start)&&timeline.isActive(p,p.end));
 assert(!timeline.isActive(p,p.start-1)&&!timeline.isActive(p,p.end+1));
}
// A birth-to-death chart would falsely mark these artists as working during childhood or after retirement.
const period=id=>activity.find(a=>a.id===id);
assert(!timeline.isActive(period('07'),1915));assert(timeline.isActive(period('07'),1939));
assert(!timeline.isActive(period('09'),1988));assert(!timeline.isActive(period('33'),1960));
for(const id of ['03','04','37'])assert(timeline.isActive(period(id),1503));
assert(timeline.isActive(period('45'),1650));assert(!timeline.isActive(period('22'),1650));
for(const scale of [4,7,14]){
 const range=timeline.rangeFor('all'),layout=timeline.layoutRows(activity,range,scale);assert.equal(layout.length,51);
 for(const p of layout){assert(p.startX<=p.endX);assert(p.row>=0);}
 for(const row of new Set(layout.map(p=>p.row))){const lane=layout.filter(p=>p.row===row).sort((a,b)=>a.startX-b.startX);for(let i=1;i<lane.length;i++)assert(lane[i].startX>lane[i-1].endX+190,`Career labels collide at ${scale}px/year`);}
 assert.notEqual(layout.find(p=>p.id==='22').row,layout.find(p=>p.id==='07').row);
 let moments=0;
 for(const a of artists){const groups=timeline.groupMoments(a,scale,range);const indices=groups.flatMap(g=>g.map(t=>t.index));assert.equal(indices.length,3);assert.equal(new Set(indices).size,3);moments+=indices.length;}
 assert.equal(moments,153);
}
for(const key of ['early','seventeenth','nineteenth','twentieth']){
 const range=timeline.rangeFor(key),layout=timeline.layoutRows(activity,range,7);
 assert(layout.length>0);assert(layout.every(p=>p.start<=range.max&&p.end>=range.min));
 assert(range.focus>=range.min&&range.focus<=range.max);
}
const code=fs.readFileSync(dist+'timeline.js','utf8');
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(code));
assert(!/window\.open\(|localStorage|sessionStorage|https?:\/\//.test(code));
assert(code.includes('prefers')||fs.readFileSync(dist+'styles.css','utf8').includes('prefers-reduced-motion'));
assert(code.includes("document.hidden)pause()"));assert(code.includes('clearInterval(timer)'));
const html=fs.readFileSync(dist+'index.html','utf8');for(const file of ['activity.js','timeline.js'])assert(html.includes(file));
console.log('PASS: 51 sourced creative periods, inclusive year boundaries, honest career limits, nonoverlapping lanes at three zoom levels, all 153 moments preserved, local-only assets, and controlled playback.');
