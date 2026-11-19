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
 const state = {year:1930, period:'all', zoom:7, selected:'22', onlyActive:false};
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
 const rangeFor = id => periods[id] || periods.all;
 const isActive = (a,year) => year >= a.start && year <= a.end;
 const portrait = a => a.portrait ? `<img src="${esc(a.portrait.path)}" alt="" loading="lazy">` : `<span class="time-initials" aria-hidden="true">${a.name==='Banksy'?'?':esc(a.name.split(' ').slice(0,2).map(n=>n[0]).join(''))}</span>`;
 let root=null, api=null, timer=null, plotLayout=[], scale=7;
 const leftPad=54, rightPad=240, rowHeight=88;
 function layoutRows(records,range,pixels){
  const ends=[];
  return records.filter(a=>a.start<=range.max&&a.end>=range.min)
   .sort((a,b)=>a.start-b.start||a.end-b.end||a.id.localeCompare(b.id))
   .map(a=>{
    const startX=leftPad+(Math.max(a.start,range.min)-range.min)*pixels;
    const endX=leftPad+(Math.min(a.end,range.max)-range.min)*pixels;
    let row=ends.findIndex(x=>x+32<startX);if(row<0)row=ends.length;
    ends[row]=endX+190;
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
  root.innerHTML=`<section class="time-intro"><div><p class="kicker">THE ART TIME MACHINE</p><h1>Different lives.<br><em>Shared time.</em></h1><p>Slide through the years. Watch creative careers overlap. Find the artists who shared a moment.</p></div><div class="time-year-console"><span class="time-console-label">YOUR YEAR</span><output id="time-year-output" for="time-year">${state.year}</output><p id="time-year-count"></p><label class="sr-only" for="time-year">Choose a year</label><input id="time-year" type="range" min="${range.min}" max="${range.max}" step="1" value="${state.year}" aria-describedby="time-year-count"><div class="time-travel-actions"><button class="button accent small" data-time-action="play" data-time-play="full" aria-pressed="false">Play through years</button><button class="time-return" data-time-action="return">Find this year</button></div></div></section>
  <section class="time-workspace" aria-labelledby="time-map-title"><div class="time-workspace-head"><div><p class="kicker">51 ARTISTS · ONE CONNECTED VIEW</p><h2 id="time-map-title">When were they creating?</h2></div><span class="time-scroll-hint">Scroll sideways to travel through time</span></div><div class="time-toolbar"><div class="time-periods" role="group" aria-label="Timeline period">${Object.entries(periods).map(([id,p])=>`<button class="filter" data-time-period="${id}" aria-pressed="${state.period===id}">${p.label}</button>`).join('')}</div><div class="time-map-options"><label>Zoom<select id="time-zoom" aria-label="Zoom"><option value="4">Wide view</option><option value="7">Explore</option><option value="14">Look closer</option></select></label><label>Find an artist<select id="time-find" aria-label="Find an artist"><option value="">Choose a name</option>${[...all].sort((a,b)=>a.name.localeCompare(b.name)).map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label><label class="time-check"><input id="time-only" type="checkbox" ${state.onlyActive?'checked':''}> Only careers at this year</label></div></div>
  <div class="time-layout"><div class="time-map-column"><div class="time-map-nav"><button data-time-action="earlier">Earlier years</button><div class="time-map-scrub"><label for="time-map-year">Year <output id="time-map-year-output" for="time-map-year">${state.year}</output></label><input id="time-map-year" type="range" min="${range.min}" max="${range.max}" step="1" value="${state.year}" aria-label="Timeline year"></div><button data-time-action="play" data-time-play="compact" aria-pressed="false">Play</button><button data-time-action="later">Later years</button><span id="time-window-label" class="sr-only">${range.label}</span></div><p class="time-map-instructions" id="time-map-instructions">Hover, tap or focus a face or a dot for its story. Pan sideways through years; scroll down to explore more artist lanes. Keyboard: Left/Right to pan, Home/End to reach the edges.</p><div id="time-map" class="time-map" role="region" aria-label="Horizontally scrolling artist career timeline" aria-describedby="time-map-instructions" tabindex="0"><div id="time-canvas"></div></div><div class="time-legend"><span><i class="legend-band"></i> Approximate creative period</span><span><i class="legend-dot"></i> Career moment</span><span><i class="legend-now"></i> Your chosen year</span></div></div><aside id="time-detail" class="time-detail" aria-labelledby="time-detail-title"></aside></div>
  <p class="time-evidence-note">Moving faces mark your chosen year within a career. Bands show approximate, source-based creative periods; the detail card explains each range. A band can include pauses in practice. Nine artists use initials or an anonymous symbol because a verified portrait is unavailable.</p></section>
  <section class="time-contemporaries" aria-labelledby="time-contemporaries-title"><div class="section-head"><div><p class="kicker">WHO SHARES YOUR YEAR?</p><h2 id="time-contemporaries-title">A moment in common.</h2><p id="time-cohort-summary"></p></div><div class="time-quick-years" role="group" aria-label="Try a year">${[1500,1650,1880,1930,1985,2020].map(y=>`<button data-time-year="${y}">${y}</button>`).join('')}</div></div><div id="time-cohort" class="time-cohort"></div></section>
  <details class="time-source-note"><summary>How to read these career dates</summary><p>These are approximate periods of artistic practice or documented activity, rather than birth-to-death bars. Some end before an artist’s death. The selected artist’s detail card explains the evidence and uncertainty. An open-ended period reaches the current edition’s review year, 2026; it does not predict future activity. Overlap shows a shared period, without assuming the artists met or influenced one another.</p><p>All 153 existing career moments are available on the full timeline. Nearby moments are grouped into a numbered dot; open it to read each dated entry. Photographs and artwork previews come from the school-reviewed local collection. Evidence reviewed November 2026.</p></details>`;
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
 }
 function destroy(){
  pause();if(root){root.removeEventListener('click',onClick);root.removeEventListener('pointerover',onHover);root.removeEventListener('focusin',onFocus);}root=null;api=null;
 }
 function renderMap(){
  const range=rangeFor(state.period);scale=state.zoom;
  let records=window.ARTIST_ACTIVITY;
  if(state.onlyActive)records=records.filter(a=>isActive(a,state.year));
  plotLayout=layoutRows(records,range,scale);
  const rows=plotLayout.length?Math.max(...plotLayout.map(a=>a.row))+1:0;
  const width=leftPad+(range.max-range.min)*scale+rightPad;
  const height=Math.max(360,rows*rowHeight+28);
  const interval=scale>=14?10:scale>=7?25:50;
  const ticks=[];for(let y=Math.ceil(range.min/interval)*interval;y<=range.max;y+=interval)ticks.push(y);
  root.querySelector('#time-canvas').innerHTML=`<div class="time-axis" style="width:${width}px"><span class="time-axis-word">YEAR</span>${ticks.map(y=>`<span class="time-tick" style="left:${leftPad+(y-range.min)*scale}px">${y}</span>`).join('')}<span id="time-axis-current" class="time-axis-current"></span></div><div class="time-plot" style="width:${width}px;height:${height}px;--time-grid:${interval*scale}px;--time-origin:${leftPad+(Math.ceil(range.min/interval)*interval-range.min)*scale}px"><div class="time-year-line" aria-hidden="true"></div>${plotLayout.map(p=>{
   const a=all.find(a=>a.id===p.id);const active=isActive(p,state.year);const x=faceX(p);
   const groups=groupMoments(a,scale,range);
   return `<div class="time-career ${active?'is-active':''} ${a.id===state.selected?'is-selected':''}" data-time-career="${a.id}" style="top:${p.row*rowHeight+18}px"><div class="time-career-band" style="left:${p.startX}px;width:${Math.max(2,p.endX-p.startX)}px" aria-hidden="true"></div><button class="time-face" data-time-person="${a.id}" style="left:${x-22}px" aria-label="Explore ${esc(a.name)}: ${esc(p.label)}" aria-controls="time-detail" aria-pressed="${a.id===state.selected}">${portrait(a)}<span class="time-face-label">${esc(a.name)}<small>${esc(p.label)}</small></span></button><span class="time-career-start" style="left:${p.startX}px">${p.start<range.min?'Continues from '+p.start:p.start}</span><span class="time-career-end" style="left:${p.endX}px">${p.end>range.max?'Continues to '+(p.ongoing?'2026':p.end):p.ongoing?'2026 · open':p.end}</span>${groups.map(g=>`<button class="time-event" data-time-person="${a.id}" data-time-events="${g.map(t=>t.index).join(',')}" aria-controls="time-detail" style="left:${leftPad+(g[0].year-range.min)*scale-22}px" aria-label="${esc(a.name)}: ${g.length===1?(g[0].dateLabel||g[0].year)+', '+g[0].text:g.length+' career moments, '+g[0].year+' to '+g[g.length-1].year}" aria-pressed="false"><span class="time-event-mark">${g.length>1?g.length:''}</span></button>`).join('')}</div>`;
  }).join('')}${!plotLayout.length?'<p class="time-map-empty">No documented careers overlap this year in the selected period. Try a different year or show all careers.</p>':''}</div>`;
  root.querySelector('#time-window-label').textContent=range.label;
  updateYear(false);
 }
 function faceX(p){return leftPad+(clamp(state.year,Math.max(p.start,rangeFor(state.period).min),Math.min(p.end,rangeFor(state.period).max))-rangeFor(state.period).min)*scale;}
 function centerYear(){const map=root?.querySelector('#time-map');if(!map)return;const range=rangeFor(state.period);map.scrollLeft=Math.max(0,leftPad+(state.year-range.min)*scale-map.clientWidth*.45);}
 function revealRow(id){const p=plotLayout.find(p=>p.id===id),map=root?.querySelector('#time-map');if(p&&map)map.scrollTop=Math.max(0,p.row*rowHeight-80);}
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
  root.querySelector('#time-year-count').textContent=`${active.length} ${active.length===1?'artist’s career overlaps':'artists’ careers overlap'} this year`;
  const x=leftPad+(state.year-range.min)*scale;
  const line=root.querySelector('.time-year-line');if(line)line.style.left=x+'px';
  const current=root.querySelector('#time-axis-current');if(current){current.style.left=x+'px';current.textContent=state.year;}
  for(const p of plotLayout){const lane=root.querySelector(`[data-time-career="${p.id}"]`);lane.classList.toggle('is-active',isActive(p,state.year));lane.querySelector('.time-face').style.left=(faceX(p)-22)+'px';}
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
  if(b.dataset.timeOpen){pause();api.openArtist(b.dataset.timeOpen);return;}
  if(b.dataset.timePerson){pause();selectPerson(b);if(window.matchMedia('(max-width:850px)').matches)root.querySelector('#time-detail').scrollIntoView({block:'nearest',behavior:'instant'});return;}
  if(b.dataset.timeLocate){locateArtist(b.dataset.timeLocate);root.querySelector(window.matchMedia('(max-width:850px)').matches?'#time-detail':'#time-map').scrollIntoView({block:'center',behavior:'instant'});return;}
  if(b.dataset.timeYear){pause();const y=Number(b.dataset.timeYear),range=rangeFor(state.period);if(y<range.min||y>range.max){state.period='all';updatePeriodControls();renderMap();}setYear(y,true);root.querySelector('.time-workspace').scrollIntoView({block:'start',behavior:'instant'});return;}
  if(b.dataset.timePeriod){pause();state.period=b.dataset.timePeriod;const range=rangeFor(state.period);if(state.year<range.min||state.year>range.max)state.year=range.focus;updatePeriodControls();renderMap();setYear(state.year,true);return;}
  const action=b.dataset.timeAction;if(!action)return;
  if(action==='play'){
   if(timer!==null){pause();return;}
   const range=rangeFor(state.period);if(state.year===range.max)setYear(range.min,true);
   updatePlayControls(true);root.querySelector('.time-map-column').scrollIntoView({block:'start',behavior:'instant'});
   timer=setInterval(()=>{if(!root){pause();return;}setYear(state.year+1,true);},650);return;
  }
  pause();if(action==='back-map'){const map=root.querySelector('#time-map');map.scrollIntoView({block:'center',behavior:'instant'});map.focus({preventScroll:true});return;}if(action==='return'){centerYear();return;}
  if(action==='earlier'||action==='later')setYear(state.year+(action==='earlier'?-25:25),true);
 }
 function onPanKey(e){
  if(e.target!==e.currentTarget)return;const map=e.currentTarget;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();map.scrollLeft+=(e.key==='ArrowLeft'?-1:1)*Math.max(120,map.clientWidth*.7);}
  if(e.key==='Home'||e.key==='End'){e.preventDefault();map.scrollLeft=e.key==='Home'?0:map.scrollWidth;}
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
 window.ArtTimeline={render,destroy,pause,isActive,layoutRows,groupMoments,rangeFor};
})();
