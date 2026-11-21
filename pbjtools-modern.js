/* PBJTOOLS v1.6 — shortcut pencarian, favorit, riwayat alat, dan indikator langkah. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const cards=[...document.querySelectorAll('#toolSections .tool-card')];
const pins=[...document.querySelectorAll('[data-pin-tool]')];
const keyFav='pbjtools_favorite_tools_v16',keyRecent='pbjtools_recent_tools_v16';
const stored=(key)=>{try{let a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,20):[]}catch{return []}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
let favorites=stored(keyFav),recent=stored(keyRecent);
const labelFor=id=>document.querySelector(`#toolSections [data-pdf-tool="${CSS.escape(id)}"] strong`)?.textContent||id;
function updatePins(){pins.forEach(pin=>{const yes=favorites.includes(pin.dataset.pinTool);pin.classList.toggle('is-pinned',yes);pin.textContent=yes?'★':'☆';pin.setAttribute('aria-pressed',String(yes));pin.title=(yes?'Hapus dari favorit: ':'Simpan sebagai favorit: ')+labelFor(pin.dataset.pinTool)});$('favoriteCount').textContent=String(favorites.length)}
function renderRecent(){const wrapper=$('recentTools'),list=$('recentToolList');if(!wrapper||!list)return;const arr=recent.filter(id=>cards.some(c=>c.dataset.pdfTool===id)).slice(0,5);wrapper.hidden=!arr.length;list.replaceChildren();arr.forEach(id=>{const b=document.createElement('button');b.type='button';b.dataset.pdfTool=id;b.textContent=labelFor(id);b.setAttribute('aria-label','Buka '+labelFor(id));b.addEventListener('click',()=>document.querySelector(`#toolSections [data-pdf-tool=\"${CSS.escape(id)}\"]`)?.click());list.appendChild(b)});}
function countShown(){const n=cards.filter(c=>!c.hidden).length;const el=$('toolVisibilityStatus');if(el)el.textContent=n+' alat ditampilkan · '+cards.filter(c=>!c.hidden&&!c.classList.contains('upcoming')).length+' bisa langsung dipakai'}
// Existing directory filtering remains in place; this complements it with a Favorites filter.
const filters=document.querySelector('.tool-filters');
const search=$('toolSearch');
const originalFilters=[...filters.querySelectorAll('button')];
const favoriteFilter=$('favoriteFilter');
let current='all';
function refresh(){const q=(search?.value||'').trim().toLocaleLowerCase('id-ID');let visible=0;
 document.querySelectorAll('.tool-section').forEach(section=>{let sectionCount=0;section.querySelectorAll('.tool-card').forEach(card=>{const ok= current==='all'||(current==='ready'&&!card.classList.contains('upcoming'))||(current==='fav'&&favorites.includes(card.dataset.pdfTool))||(section.dataset.group===current);const good=ok&&card.textContent.toLocaleLowerCase('id-ID').includes(q);card.hidden=!good;if(good){visible++;sectionCount++}});section.hidden=!sectionCount;});
 $('noToolsFound').hidden=visible>0;countShown();
}
// Run after original events; this pass also supports the custom favorites filter.
filters.addEventListener('click',e=>{const btn=e.target.closest('button[data-tool-filter]');if(!btn)return;current=btn.dataset.toolFilter;queueMicrotask(()=>{originalFilters.forEach(b=>b.classList.toggle('active',b===btn));refresh()})});
search?.addEventListener('input',()=>queueMicrotask(refresh));
pins.forEach(pin=>pin.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const id=pin.dataset.pinTool;if(favorites.includes(id)){favorites=favorites.filter(x=>x!==id)}else{favorites=[id,...favorites].slice(0,20)}save(keyFav,favorites);updatePins();refresh()}));
// Event listener on capture sees both launcher and directory; only successful (available) tools enter history.
document.addEventListener('click',e=>{const card=e.target.closest('[data-pdf-tool]');if(!card||card.classList.contains('upcoming')||!cards.some(c=>c.dataset.pdfTool===card.dataset.pdfTool))return;const id=card.dataset.pdfTool;recent=[id,...recent.filter(x=>x!==id)].slice(0,6);save(keyRecent,recent);renderRecent()},true);
$('clearRecent')?.addEventListener('click',()=>{recent=[];save(keyRecent,recent);renderRecent()});
$('browseAllTools')?.addEventListener('click',()=>{document.getElementById('pdf-tools')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});setTimeout(()=>search?.focus({preventScroll:true}),250)});
document.addEventListener('keydown',e=>{const typing=e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement||e.target?.isContentEditable;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k' || (e.key==='/'&&!typing&&!e.ctrlKey&&!e.altKey&&!e.metaKey)){
  if($('landing')?.hidden)return;e.preventDefault();document.getElementById('pdf-tools')?.scrollIntoView({block:'start',behavior:'instant'});search?.focus({preventScroll:true});search?.select();}
 if(e.key==='Escape'&&document.activeElement===search){search.value='';search.blur();search.dispatchEvent(new Event('input',{bubbles:true}))}
});
// Subtle workflow indicator; status and uploaded file DOM are authoritative.
const list=$('pdfFileList'),status=$('pdfStatus'),run=$('pdfRun'),steps=$('pdfFlowSteps');
function updatePhases(){if(!steps)return;const files=list?.querySelectorAll('[data-file-remove],.pdf-file-item,.pdf-file-row,.pdf-file').length||0;const hasFiles=files>0||!!(list?.textContent||'').trim();const success=status?.classList.contains('success');const phase=success?3:(hasFiles?2:1);steps.querySelectorAll('[data-phase]').forEach(s=>{const n=Number(s.dataset.phase);s.classList.toggle('current',n===phase);s.classList.toggle('done',n<phase)});}
if(window.MutationObserver&&steps){const watcher=new MutationObserver(updatePhases);[list,status].filter(Boolean).forEach(el=>watcher.observe(el,{childList:true,subtree:true,attributes:el===status,attributeFilter:el===status?['class']:undefined}));updatePhases()}
updatePins();renderRecent();refresh();
})();
