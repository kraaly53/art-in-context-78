'use strict';
(() => {
 const all = window.ARTISTS;
 const activity = new Map(window.ARTIST_ACTIVITY.map(a => [a.id, a]));
 const periods = {
  all: {label:'All six centuries', min:1450, max:2026, focus:1930},
  early: {label:'1450–1599', min:1450, max:1599, focus:1503},
  seventeenth: {label:'1600–1749', min:1600, max:1749, focus:1642},
  nineteenth: {label:'1750–1899', min:1750, max:1899, focus:1886},
  twentieth: {label:'1900–2026', min:1900, max:2026, focus:1930}
 };
 const state = {year:1930, period:'all', zoom:7, selected:'22', onlyActive:false,fit:true,expanded:false};
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
 const rangeFor = id => periods[id] || periods.all;
 const isActive = (a,year) => year >= a.start && year <= a.end;
 const portrait = a => a.portrait ? `<img src="${esc(a.portrait.path)}" alt="" loading="lazy">` : `<span class="time-initials" aria-hidden="true">${a.name==='Banksy'?'?':esc(a.name.split(' ').slice(0,2).map(n=>n[0]).join(''))}</span>`;
 // Focal points frame faces from the existing, unaltered portrait files.
 const faceFrames={
  '02':[50,20,2.5],'03':[30,37,2.3],'04':[50,35,1.5],'07':[50,32,1.7],
  '08':[50,22,2.6],'09':[66,40,1.6],'10':[45,24,2.1],'11':[45,20,2.5],
  '12':[55,22,2.3],'13':[75,45,2],'14':[53,35,1.5],'16':[51,27,1.9],
  '18':[50,23,2.2],'19':[37,33,1.6],'20':[53,30,1.7],'21':[50,35,1.5],
  '24':[55,40,1.4],'27':[50,35,2.2],'28':[50,35,1.5],'29':[50,38,1.4],
  '33':[62,43,1.5],'35':[50,38,1.4],'36':[50,21,2.4],'38':[52,30,1.7],
  '39':[59,24,2.1],'41':[49,21,5],'43':[51,23,2.2],'44':[57,38,1.8],
  '45':[50,27,1.9],'49':[53,31,1.7],'50':[52,48,1.7]
 };
 const portraitRatios={"02":0.73646,"28":0.64583,"06":0.75075,"11":0.95685,"38":0.72716,"16":0.74818,"12":0.69167,"48":0.89492,"51":0.7783,"36":0.6975,"21":0.83125,"18":0.78277,"25":0.75,"22":0.85521,"35":0.7875,"26":0.79211,"08":0.75,"45":0.77187,"41":0.48229,"09":0.77812,"27":0.70208,"40":0.66563,"44":0.71979,"43":0.74959,"47":0.90576,"50":0.74947,"33":0.79896,"24":0.75104,"19":1.06452,"20":0.71875,"37":0.86458,"04":0.73333,"13":0.9375,"17":1.33891,"39":0.59896,"49":0.66667,"10":0.9875,"07":0.66667,"29":0.74896,"03":0.69792,"14":0.75208};
 function overviewPortrait(a){
  if(!a.portrait)return portrait(a);
  const f=faceFrames[a.id];let style=`background-image:url('${esc(a.portrait.path)}')`;
  if(f){const[x,y,z]=f,r=portraitRatios[a.id]||1,w=z*r*100,h=z*100;const px=Math.abs(100-w)<.01?50:(50-x*w/100)/(100-w)*100,py=Math.abs(100-h)<.01?50:(50-y*h/100)/(100-h)*100;style+=`;background-size:${w}% ${h}%;background-position:${px}% ${py}%`;}
  return `<span class="time-face-photo" aria-hidden="true" style="${style}"></span>`;
 }
 let root=null, api=null, timer=null, plotLayout=[], scale=7, laneHeight=88, markerSize=44, resizeObserver=null, resizeFrame=null, detailDialog=null;
 const leftPad=54, rightPad=240, rowHeight=88;
 function layoutRows(records,range,pixels,labelSpace=190,gap=32){
  const ends=[];
  return records.filter(a=>a.start<=range.max&&a.end>=range.min)
   .sort((a,b)=>a.start-b.start||a.end-b.end||a.id.localeCompare(b.id))
   .map(a=>{
    const startX=leftPad+(Math.max(a.start,range.min)-range.min)*pixels;
    const endX=leftPad+(Math.min(a.end,range.max)-range.min)*pixels;
    let row=ends.findIndex(x=>x+gap<startX);if(row<0)row=ends.length;
    ends[row]=endX+labelSpace;
    return {...a,row,startX,endX};
   });
 }
 function groupMoments(a,pixels,range){
  const groups=[];
  a.timeline.map((t,i)=>({...t,index:i})).filter(t=>t.year>=range.min&&t.year<=range.max)
   .sort((a,b)=>a.year-b.year||a.index-b.index).forEach(t=>{
    const last=groups[groups.length-1];
    if(last&&(t.year-last[0].year)*pixels<46)last.push(t);else groups.push([t]);
   });
  return groups;
 }
 function updatePlayControls(playing){
  root?.querySelectorAll('[data-time-play]').forEach(b=>{b.textContent=playing?(b.dataset.timePlay==='compact'?'Pause':'Pause time travel'):(b.dataset.timePlay==='compact'?'Play':'Play through years');b.setAttribute('aria-pressed',String(playing));});
 }
 function pause(){
  if(timer!==null){clearInterval(timer);timer=null;}
  updatePlayControls(false);
 }
 function render(container,callbacks){
  pause();root=container;api=callbacks;
  const range=rangeFor(state.period);
  applyMode();
  root.innerHTML=`<section class="time-intro"><div><p class="kicker">THE ART TIME MACHINE</p><h1>Different lives.<br><em>Shared time.</em></h1><p>Slide through the years. Watch creative careers overlap. Find the artists who shared a moment.</p></div><div class="time-year-console"><span class="time-console-label">YOUR YEAR</span><output id="time-year-output" for="time-year">${state.year}</output><p id="time-year-count"></p><label class="sr-only" for="time-year">Choose a year</label><input id="time-year" type="range" min="${range.min}" max="${range.max}" step="1" value="${state.year}" aria-describedby="time-year-count"><div class="time-travel-actions"><button class="button accent small" data-time-action="play" data-time-play="full" aria-pressed="false">Play through years</button><button class="time-return" data-time-action="return">Find this year</button></div></div></section>
  <section class="time-workspace" aria-labelledby="time-map-title"><div class="time-workspace-head"><div><p class="kicker">${all.length} ARTISTS · ONE CONNECTED VIEW</p><h2 role="heading" aria-level="${state.fit?1:2}" id="time-map-title">When were they creating?</h2></div><div class="time-view-switch" role="group" aria-label="Timeline view"><button data-time-mode="fit" aria-pressed="${state.fit}">Everyone at a glance</button><button data-time-mode="detail" aria-pressed="${!state.fit}">Detailed timeline</button><button data-time-action="focus" aria-pressed="${state.expanded}">${state.expanded?'Exit focus view':'Focus view'}</button></div></div><div class="time-toolbar"><div class="time-periods" role="group" aria-label="Timeline period">${Object.entries(periods).map(([id,p])=>`<button class="filter" data-time-period="${id}" aria-pressed="${state.period===id}">${p.label}</button>`).join('')}</div><div class="time-map-options"><span id="time-fit-count" class="time-fit-count"></span><label class="time-zoom-control">Zoom<select id="time-zoom" aria-label="Zoom"><option value="4">Wide view</option><option value="7">Explore</option><option value="14">Look closer</option></select></label><label>Find an artist<select id="time-find" aria-label="Find an artist"><option value="">Choose a name</option>${[...all].sort((a,b)=>a.name.localeCompare(b.name)).map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label><label class="time-check"><input id="time-only" type="checkbox" ${state.onlyActive?'checked':''}> Only careers at this year</label></div></div>
  <div class="time-layout"><div class="time-map-column"><div class="time-map-nav"><button data-time-action="earlier">Earlier years</button><div class="time-map-scrub"><label for="time-map-year">Year <output id="time-map-year-output" for="time-map-year">${state.year}</output><span id="time-map-active-count" class="time-map-active-count"></span></label><input id="time-map-year" type="range" min="${range.min}" max="${range.max}" step="1" value="${state.year}" aria-label="Timeline year"></div><button data-time-action="play" data-time-play="compact" aria-pressed="false">Play</button><button data-time-action="later">Later years</button><span id="time-window-label" class="sr-only">${range.label}</span></div><p class="time-map-instructions" id="time-map-instructions">${state.fit?'Everyone stays visible. Hover for a quick fact; click or tap for a larger portrait and story. Green frames mark careers overlapping your year.':'Hover, tap or focus a face or a dot for its story. Pan sideways through years; scroll down to explore more artist lanes. Keyboard: Left/Right to pan, Home/End to reach the edges.'}</p><div id="time-map" class="time-map" role="region" aria-label="${state.fit?'All artists at a glance career timeline':'Horizontally scrolling artist career timeline'}" aria-describedby="time-map-instructions" tabindex="0"><div id="time-canvas"></div></div><div class="time-legend"><span><i class="legend-band"></i> Approximate creative period</span><span><i class="${state.fit?'legend-active':'legend-dot'}"></i> ${state.fit?'Green frame: active period':'Career moment'}</span><span><i class="legend-now"></i> Your chosen year</span></div></div><aside id="time-detail" class="time-detail" aria-labelledby="time-detail-title"></aside></div>
  <p class="time-evidence-note">Moving faces mark your chosen year within a career. Bands show approximate, source-based creative periods; the detail card explains each range. A band can include pauses in practice. Eight artists use initials or an anonymous symbol because a verified portrait is unavailable.</p></section>
  <section class="time-contemporaries" aria-labelledby="time-contemporaries-title"><div class="section-head"><div><p class="kicker">WHO SHARES YOUR YEAR?</p><h2 id="time-contemporaries-title">A moment in common.</h2><p id="time-cohort-summary"></p></div><div class="time-quick-years" role="group" aria-label="Try a year">${[1500,1650,1880,1930,1985,2020].map(y=>`<button data-time-year="${y}">${y}</button>`).join('')}</div></div><div id="time-cohort" class="time-cohort"></div></section>
  <details class="time-source-note"><summary>How to read these career dates</summary><p>These are approximate periods of artistic practice or documented activity, rather than birth-to-death bars. Some end before an artist’s death. The selected artist’s detail card explains the evidence and uncertainty. An open-ended period reaches the current edition’s review year, 2026; it does not predict future activity. Overlap shows a shared period, without assuming the artists met or influenced one another.</p><p>All ${all.reduce((n,a)=>n+a.timeline.length,0)} career moments are available on the full timeline. Nearby moments are grouped into a numbered dot; open it to read each dated entry. Photographs and artwork previews come from the school-reviewed local collection. Evidence reviewed November 2026.</p></details>`;
  root.querySelector('#time-zoom').value=String(state.zoom);
  for(const slider of root.querySelectorAll('#time-year,#time-map-year'))slider.addEventListener('input',e=>{pause();setYear(Number(e.target.value),true);});
  root.querySelector('#time-zoom').addEventListener('change',e=>{state.zoom=Number(e.target.value);renderMap();centerYear();revealRow(state.selected);});
  root.querySelector('#time-find').addEventListener('change',e=>{if(e.target.value)locateArtist(e.target.value);});
  root.querySelector('#time-only').addEventListener('change',e=>{state.onlyActive=e.target.checked;renderMap();centerYear();revealRow(state.selected);});
  root.addEventListener('click',onClick);
  root.addEventListener('pointerover',onHover);
  root.addEventListener('focusin',onFocus);
  root.querySelector('#time-map').addEventListener('keydown',onPanKey);
  renderMap();showDetail(state.selected);updateYear();centerYear();revealRow(state.selected);
  resizeObserver=new ResizeObserver(()=>{if(resizeFrame!==null)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=null;if(root&&state.fit){renderMap();showDetail(state.selected);}});});resizeObserver.observe(root.querySelector('#time-map'));
 }
 function destroy(){
  pause();resizeObserver?.disconnect();resizeObserver=null;if(resizeFrame!==null)cancelAnimationFrame(resizeFrame);resizeFrame=null;if(detailDialog){detailDialog.close();detailDialog=null;}document.body.classList.remove('time-fit-mode','time-fit-expanded');root?.classList.remove('time-fit-page');if(root){root.removeEventListener('click',onClick);root.removeEventListener('pointerover',onHover);root.removeEventListener('focusin',onFocus);}root=null;api=null;
 }
 function renderMap(){
  const range=rangeFor(state.period),map=root.querySelector('#time-map');
  const fittingWidth=Math.max(100,map.clientWidth-leftPad-44);scale=state.fit?fittingWidth/(range.max-range.min):state.zoom;
  let records=window.ARTIST_ACTIVITY;
  if(state.onlyActive)records=records.filter(a=>isActive(a,state.year));
  if(state.fit){renderFitMap(records,range,map);return;}
  plotLayout=layoutRows(records,range,scale,state.fit?26:190,state.fit?10:32);
  const rows=plotLayout.length?Math.max(...plotLayout.map(a=>a.row))+1:0;
  const width=state.fit?map.clientWidth:leftPad+(range.max-range.min)*scale+rightPad;
  laneHeight=state.fit?Math.max(8,(map.clientHeight-52-12)/Math.max(rows,1)):rowHeight;
  markerSize=state.fit?Math.min(38,Math.max(8,laneHeight-3)):44;
  const height=state.fit?Math.max(0,map.clientHeight-52):Math.max(360,rows*rowHeight+28);
  map.classList.toggle('is-overview',state.fit);map.style.setProperty('--time-face-size',markerSize+'px');map.style.setProperty('--time-lane-height',laneHeight+'px');
  const interval=scale>=14?10:scale>=7?25:scale>=2?50:100;
  const ticks=[];for(let y=Math.ceil(range.min/interval)*interval;y<=range.max;y+=interval)ticks.push(y);
  root.querySelector('#time-canvas').innerHTML=`<div class="time-axis" style="width:${width}px"><span class="time-axis-word">YEAR</span>${ticks.map(y=>`<span class="time-tick" style="left:${leftPad+(y-range.min)*scale}px">${y}</span>`).join('')}<span id="time-axis-current" class="time-axis-current"></span></div><div class="time-plot" style="width:${width}px;height:${height}px;--time-grid:${interval*scale}px;--time-origin:${leftPad+(Math.ceil(range.min/interval)*interval-range.min)*scale}px"><div class="time-year-line" aria-hidden="true"></div>${plotLayout.map(p=>{
   const a=all.find(a=>a.id===p.id);const active=isActive(p,state.year);const x=faceX(p);
   const groups=state.fit?[]:groupMoments(a,scale,range);
   return `<div class="time-career ${active?'is-active':''} ${a.id===state.selected?'is-selected':''}" data-time-career="${a.id}" style="top:${p.row*laneHeight+(state.fit?5:18)}px"><div class="time-career-band" style="left:${p.startX}px;width:${Math.max(2,p.endX-p.startX)}px" aria-hidden="true"></div><button class="time-face" data-time-person="${a.id}" style="left:${x-markerSize/2}px" aria-label="Explore ${esc(a.name)}: ${esc(p.label)}" aria-controls="time-detail" aria-pressed="${a.id===state.selected}">${portrait(a)}<span class="time-face-label">${esc(a.name)}<small>${esc(p.label)}</small></span></button><span class="time-career-start" style="left:${p.startX}px">${p.start<range.min?'Continues from '+p.start:p.start}</span><span class="time-career-end" style="left:${p.endX}px">${p.end>range.max?'Continues to '+(p.ongoing?'2026':p.end):p.ongoing?'2026 · open':p.end}</span>${groups.map(g=>`<button class="time-event" data-time-person="${a.id}" data-time-events="${g.map(t=>t.index).join(',')}" aria-controls="time-detail" style="left:${leftPad+(g[0].year-range.min)*scale-22}px" aria-label="${esc(a.name)}: ${g.length===1?(g[0].dateLabel||g[0].year)+', '+g[0].text:g.length+' career moments, '+g[0].year+' to '+g[g.length-1].year}" aria-pressed="false"><span class="time-event-mark">${g.length>1?g.length:''}</span></button>`).join('')}</div>`;
  }).join('')}${!plotLayout.length?'<p class="time-map-empty">No documented careers overlap this year in the selected period. Try a different year or show all careers.</p>':''}</div>`;
  root.querySelector('#time-window-label').textContent=range.label;
  updateYear(false);
 }
 function fitGrid(count,width,height){
  const mobile=width<560;
  const maxColumns=mobile?7:Math.min(10,Math.max(3,Math.floor((width-9)/132)));
  const rows=Math.max(1,Math.ceil(count/maxColumns)),columns=Math.max(1,Math.ceil(count/rows));
  const tileHeight=(height-14-(rows-1)*5)/rows,tileWidth=(width-14-(columns-1)*5)/columns;
  const portraitSize=mobile?Math.min(40,Math.max(12,tileHeight-38)):Math.min(88,Math.max(20,Math.min(tileHeight-14,tileWidth*.43)));
  const fontSize=mobile?8:Math.min(14,Math.max(11,Math.floor(tileWidth/10.5)));
  return {columns,rows,portraitSize,fontSize};
 }
 function renderFitMap(records,range,map){
  plotLayout=[...records].filter(p=>p.start<=range.max&&p.end>=range.min).sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
  const axisHeight=window.matchMedia('(max-width:560px)').matches?28:32;
  const height=Math.max(1,map.clientHeight-axisHeight),width=map.clientWidth,grid=fitGrid(plotLayout.length,width,height);
  map.classList.add('is-overview');map.style.setProperty('--time-face-size',grid.portraitSize+'px');map.style.setProperty('--time-fit-font',grid.fontSize+'px');
  const ticks=[range.min];for(let y=Math.ceil(range.min/100)*100;y<range.max;y+=100)if((y-range.min)/(range.max-range.min)*width*.88>=40&&(range.max-y)/(range.max-range.min)*width*.88>=40)ticks.push(y);if(range.max!==range.min)ticks.push(range.max);
  const pct=y=>(y-range.min)/(range.max-range.min)*100;
  root.querySelector('#time-canvas').innerHTML=`<div class="time-axis" style="width:${width}px"><span class="time-axis-word">YEAR</span>${ticks.map(y=>`<span class="time-tick" style="left:${6+pct(y)*.88}%">${y}</span>`).join('')}<span id="time-axis-current" class="time-axis-current" style="left:${6+pct(state.year)*.88}%"></span></div><div class="time-plot time-fit-grid" style="width:${width}px;height:${height}px;--time-fit-columns:${grid.columns};--time-fit-rows:${grid.rows}">${plotLayout.map(p=>{
   const a=all.find(a=>a.id===p.id);return `<div class="time-career ${isActive(p,state.year)?'is-active':''} ${state.selected===p.id?'is-selected':''}" data-time-career="${p.id}"><button class="time-face" data-time-person="${p.id}" title="${esc(a.name+' · '+p.label+'\n'+a.facts[0])}" aria-label="${esc(a.name)}: ${esc(p.label)}" aria-description="${esc(a.facts[0])}. Open for a larger portrait and story." aria-haspopup="dialog" aria-controls="time-story-dialog" aria-pressed="${state.selected===p.id}">${overviewPortrait(a)}<span class="time-face-label">${esc(a.name)}<small>${esc(p.label)}</small></span></button><div class="time-mini-track" aria-hidden="true"><div class="time-career-band" style="left:${pct(Math.max(range.min,p.start))}%;width:${Math.max(.3,pct(Math.min(range.max,p.end))-pct(Math.max(range.min,p.start)))}%"></div><span class="time-mini-now" style="left:${pct(state.year)}%"></span></div></div>`;
  }).join('')}${!plotLayout.length?'<p class="time-map-empty">No careers in this collection overlap your year. Choose another year or turn off the active-only filter.</p>':''}</div>`;
  root.querySelector('#time-window-label').textContent=range.label;map.scrollLeft=0;map.scrollTop=0;updateYear(false);
 }
 function faceX(p){return leftPad+(clamp(state.year,Math.max(p.start,rangeFor(state.period).min),Math.min(p.end,rangeFor(state.period).max))-rangeFor(state.period).min)*scale;}
 function centerYear(){if(state.fit)return;const map=root?.querySelector('#time-map');if(!map)return;const range=rangeFor(state.period);map.scrollLeft=Math.max(0,leftPad+(state.year-range.min)*scale-map.clientWidth*.45);}
 function revealRow(id){if(state.fit)return;const p=plotLayout.find(p=>p.id===id),map=root?.querySelector('#time-map');if(p&&map)map.scrollTop=Math.max(0,p.row*rowHeight-80);}
 function setYear(year,follow=false){
  const range=rangeFor(state.period);state.year=clamp(Math.round(year),range.min,range.max);
  if(state.onlyActive)renderMap();else updateYear();
  if(follow){
   if(!isActive(activity.get(state.selected),state.year)){const next=plotLayout.find(a=>isActive(a,state.year));if(next){showDetail(next.id);revealRow(next.id);}else root.querySelector('#time-map').scrollTop=0;}
   centerYear();
  }
  if(state.year>=range.max&&timer!==null){pause();api.announce('Reached '+range.max+'. Time travel paused.');}
 }
 function updateYear(updateCohort=true){
  if(!root)return;
  const range=rangeFor(state.period),active=all.filter(a=>isActive(activity.get(a.id),state.year));
  root.querySelector('#time-year').value=state.year;root.querySelector('#time-year-output').textContent=state.year;root.querySelector('#time-map-year').value=state.year;root.querySelector('#time-map-year-output').textContent=state.year;
  root.querySelector('#time-map-active-count').textContent=active.length+' careers';
  root.querySelector('#time-fit-count').textContent=state.year+' · '+active.length+' of '+all.length+' careers overlap';
  root.querySelector('#time-year-count').textContent=`${active.length} ${active.length===1?'artist’s career overlaps':'artists’ careers overlap'} this year`;
  const x=leftPad+(state.year-range.min)*scale;
  const line=root.querySelector('.time-year-line');if(line)line.style.left=x+'px';
  const current=root.querySelector('#time-axis-current');if(current){current.style.left=state.fit?(6+(state.year-range.min)/(range.max-range.min)*88)+'%':x+'px';current.textContent=state.year;}
  for(const p of plotLayout){const lane=root.querySelector(`[data-time-career="${p.id}"]`);lane.classList.toggle('is-active',isActive(p,state.year));if(state.fit){lane.querySelector('.time-mini-now').style.left=((state.year-range.min)/(range.max-range.min)*100)+'%';}else lane.querySelector('.time-face').style.left=(faceX(p)-markerSize/2)+'px';}
  if(updateCohort||state.onlyActive)renderCohort(active);
  root.querySelector('[data-time-action="earlier"]').disabled=state.year===range.min;root.querySelector('[data-time-action="later"]').disabled=state.year===range.max;
 }
 function renderCohort(active){
  root.querySelector('#time-cohort-summary').textContent=active.length?`${state.year}: ${active.length} overlapping creative periods. Choose someone to find their band and story.`:`${state.year}: no documented creative periods in this collection. Try another year.`;
  root.querySelector('#time-cohort').innerHTML=active.map(a=>`<button class="time-cohort-person" data-time-locate="${a.id}">${portrait(a)}<span>${esc(a.name)}<small>${esc(activity.get(a.id).label)}</small></span></button>`).join('')||'<p class="time-cohort-empty">This collection has a gap here. Try a nearby year to discover more artists.</p>';
 }
 function showDetail(id,indices){
  const a=all.find(a=>a.id===id),period=activity.get(id);if(!a||!period||!root)return;
  state.selected=id;const work=a.gallery.find(g=>g.workKey===a.featuredWork.key);
  const moments=indices?indices.map(i=>a.timeline[i]):a.timeline;
  const detail=root.querySelector('#time-detail');
  detail.innerHTML=`<p class="kicker">${indices?'A CAREER MOMENT':'BEHIND THE BAND'}</p><div class="time-detail-person">${a.portrait?`<img class="time-detail-portrait" src="${esc(a.portrait.path)}" alt="Portrait of ${esc(a.name)}">`:`<div class="time-detail-initial">${portrait(a)}</div>`}<div><p class="time-detail-movement">${esc(a.movement)}</p><h3 id="time-detail-title">${esc(a.name)}</h3></div></div><p class="time-period-label">${esc(period.label)}</p><p class="time-range-basis">${esc(a.facts[0])}</p><ol class="time-detail-moments">${moments.map(t=>`<li><strong>${esc(t.dateLabel||t.year)}</strong><span>${esc(t.text)}</span></li>`).join('')}</ol><div class="time-feature-study"><img src="${esc(work.path)}" alt="${esc(work.alt)}"><div><span>FROM THE REVIEWED GALLERY</span><strong>${esc(work.title)}</strong><small>${esc(work.date)}</small></div></div><details class="time-artwork-detail"><summary>Look closer at this work</summary><p>${esc(work.description)}</p></details><p class="time-detail-media">${esc(a.media.join(' · '))}</p><div class="time-detail-actions"><button class="button small" data-time-open="${a.id}">Explore artist</button>${api.listenButton(a.name+'. '+period.label+'. '+period.basis+' '+moments.map(t=>(t.dateLabel||t.year)+'. '+t.text).join(' '),'Listen to this story',true)}<button class="button secondary small time-back-map" data-time-action="back-map">Back to the map</button></div><details class="time-detail-sources"><summary>Career-date evidence</summary><p>${esc(period.basis)}</p><p>${period.sources.map(esc).join('<br>')}</p>${!a.portrait?'<p>No verified portrait is included for this artist; initials or an anonymous symbol are used.</p>':''}</details><p class="time-detail-hint">Hover, tap or focus another face or dot to discover more.</p>`;
  root.querySelectorAll('[data-time-person]').forEach(b=>{const match=b.dataset.timePerson===id&&(indices?b.dataset.timeEvents===indices.join(','):!b.dataset.timeEvents);b.setAttribute('aria-pressed',String(match));});
  root.querySelectorAll('[data-time-career]').forEach(l=>l.classList.toggle('is-selected',l.dataset.timeCareer===id));
  api.voiceStatus();
 }
 function locateArtist(id){
  pause();const p=activity.get(id);if(!p)return;
  const range=rangeFor(state.period);if(p.start>range.max||p.end<range.min){state.period='all';updatePeriodControls();}
  state.year=clamp(state.year,p.start,p.end);state.selected=id;renderMap();updateYear();showDetail(id);centerYear();revealRow(id);
  root.querySelector('#time-find').value=id;
  api.announce('Found '+all.find(a=>a.id===id).name+'. '+p.label+'.');
 }
 function updatePeriodControls(){
  const range=rangeFor(state.period);for(const input of root.querySelectorAll('#time-year,#time-map-year')){input.min=range.min;input.max=range.max;}
  root.querySelectorAll('[data-time-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.timePeriod===state.period)));
 }
 function selectPerson(button){showDetail(button.dataset.timePerson,button.dataset.timeEvents?button.dataset.timeEvents.split(',').map(Number):null);}
 function onHover(e){const b=e.target.closest('[data-time-person]');if(b&&!b.contains(e.relatedTarget))selectPerson(b);}
 function onFocus(e){const b=e.target.closest('[data-time-person]');if(b){pause();selectPerson(b);}}
 function onClick(e){
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.speak){pause();return;}
  if(b.dataset.timeOpen){pause();api.openArtist(b.dataset.timeOpen);return;}
  if(b.dataset.timeMode){pause();state.fit=b.dataset.timeMode==='fit';if(state.fit){state.period='all';state.onlyActive=false;}if(!state.fit)state.expanded=false;const container=root,callbacks=api;destroy();render(container,callbacks);return;}
  if(b.dataset.timePerson){pause();selectPerson(b);if(state.fit){openDetailDialog();return;}if(window.matchMedia('(max-width:850px)').matches)root.querySelector('#time-detail').scrollIntoView({block:'nearest',behavior:'instant'});return;}
  if(b.dataset.timeLocate){locateArtist(b.dataset.timeLocate);root.querySelector(window.matchMedia('(max-width:850px)').matches?'#time-detail':'#time-map').scrollIntoView({block:'center',behavior:'instant'});return;}
  if(b.dataset.timeYear){pause();const y=Number(b.dataset.timeYear),range=rangeFor(state.period);if(y<range.min||y>range.max){state.period='all';updatePeriodControls();renderMap();}setYear(y,true);root.querySelector('.time-workspace').scrollIntoView({block:'start',behavior:'instant'});return;}
  if(b.dataset.timePeriod){pause();state.period=b.dataset.timePeriod;const range=rangeFor(state.period);if(state.year<range.min||state.year>range.max)state.year=range.focus;updatePeriodControls();renderMap();setYear(state.year,true);return;}
  const action=b.dataset.timeAction;if(!action)return;
  if(action==='close-detail'){detailDialog?.close();return;}
  if(action==='focus'){pause();state.expanded=!state.expanded;applyMode();b.setAttribute('aria-pressed',String(state.expanded));b.textContent=state.expanded?'Exit focus view':'Focus view';if(state.fit)renderMap();return;}
  if(action==='play'){
   if(timer!==null){pause();return;}
   const range=rangeFor(state.period);if(state.year===range.max)setYear(range.min,true);
   updatePlayControls(true);root.querySelector('.time-map-column').scrollIntoView({block:'start',behavior:'instant'});
   timer=setInterval(()=>{if(!root){pause();return;}setYear(state.year+1,true);},650);return;
  }
  pause();if(action==='back-map'){detailDialog?.close();const map=root.querySelector('#time-map');map.scrollIntoView({block:'center',behavior:'instant'});map.focus({preventScroll:true});return;}if(action==='return'){centerYear();return;}
  if(action==='earlier'||action==='later')setYear(state.year+(action==='earlier'?-25:25),true);
 }
 function onPanKey(e){
  if(e.target!==e.currentTarget)return;const map=e.currentTarget;
  if(state.fit&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();pause();const range=rangeFor(state.period);setYear(e.key==='Home'?range.min:e.key==='End'?range.max:state.year+(e.key==='ArrowLeft'?-1:1),true);return;}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();map.scrollLeft+=(e.key==='ArrowLeft'?-1:1)*Math.max(120,map.clientWidth*.7);}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();map.scrollLeft=e.key==='Home'?0:map.scrollWidth;}
 }
 function applyMode(){
  document.body.classList.toggle('time-fit-mode',state.fit);document.body.classList.toggle('time-fit-expanded',state.fit&&state.expanded);root.classList.toggle('time-fit-page',state.fit);
 }
 function openDetailDialog(){
  if(detailDialog?.open)return;
  const opener=document.activeElement,d=document.createElement('dialog');detailDialog=d;d.id='time-story-dialog';d.className='time-fit-dialog';d.setAttribute('aria-label','Artist story');
  d.innerHTML='<button class="close" data-time-action="close-detail" aria-label="Close artist story">×</button>'+root.querySelector('#time-detail').innerHTML;
  d.addEventListener('click',onClick);d.addEventListener('close',()=>{d.remove();detailDialog=null;if(opener?.isConnected)opener.focus({preventScroll:true});});document.body.append(d);api.voiceStatus();d.showModal();
 }
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root&&state.fit&&state.expanded&&!detailDialog?.open&&!document.activeElement?.matches('select')){e.preventDefault();state.expanded=false;applyMode();const button=root.querySelector('[data-time-action="focus"]');button.textContent='Focus view';button.setAttribute('aria-pressed','false');button.focus();renderMap();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
 window.ArtTimeline={render,destroy,pause,isActive,layoutRows,groupMoments,rangeFor,fitGrid};
})();
