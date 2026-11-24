/* PBJTOOLS Design Studio v2.1 — browser-only document editor.
   Semua elemen dibuat sebagai SVG; data tidak dikirim ke server. */
(()=>{'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg', uid=()=>('d'+Math.random().toString(36).slice(2,10));
const deep=x=>JSON.parse(JSON.stringify(x));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const safeName=s=>String(s||'desain').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').trim().replace(/-PBJtool$/i,'').slice(0,75)||'Desain';
const colors=['#ffffff','#0b3155','#1c66a4','#3285c5','#e9f3fe','#f3a52d','#dc5354','#178e83','#223449','#e8e8e8','#000000','#7956ad'];
const sideNames={templates:'Template',text:'Teks',shapes:'Elemen',uploads:'Unggah',background:'Latar',layers:'Lapisan'};
let model,active=0,selected=null,history=[],future=[],clipboard=null,drag=null,scale=.5,uploadCache=[],db=null,saveTimer,toastTimer,rendering=false,editingText=null,lastTap=null;
const obj=(type,x,y,w,h,attrs={})=>({id:uid(),type,x,y,w,h,rotate:0,fill:'#1c66a4',stroke:'#ffffff',strokeWidth:0,opacity:1,locked:false,hidden:false,...attrs});
const rect=(x,y,w,h,fill,round=0,extra={})=>obj('rect',x,y,w,h,{fill,round,...extra});
const txt=(text,x,y,w,h,fontSize,fill,extra={})=>obj('text',x,y,w,h,{text,fontSize,fill,fontFamily:'Arial',fontWeight:'normal',align:'start',...extra});
const line=(x,y,w,h,fill,sw=4)=>obj('line',x,y,w,h,{stroke:fill,strokeWidth:sw,fill:'none'});
const page=(w,h,bg='#ffffff',elements=[])=>({id:uid(),w,h,bg,elements});
function makeTemplate(key){
 if(key==='blank')return page(1080,1080,'#ffffff',[]);
 if(key==='announcement')return page(1080,1350,'#f6f9fe',[
  rect(0,0,1080,355,'#103d69'),rect(60,52,105,9,'#6dc5f0',5),txt('PEMERINTAH KOTA BOGOR',62,89,930,48,28,'#b6d8f2',{fontWeight:'bold'}),txt('PENGUMUMAN',60,172,925,110,76,'#ffffff',{fontWeight:'bold'}),
  rect(65,422,950,585,'#ffffff',23),rect(110,481,12,110,'#2a83c8',6),txt('JUDUL KEGIATAN',150,474,805,75,49,'#113d67',{fontWeight:'bold'}),txt('Tulis informasi kegiatan atau pengumuman di sini. Semua tulisan dapat diganti dan dipindahkan.',110,619,835,270,33,'#456881'),
  rect(65,1060,950,154,'#e6f1fb',16),txt('HARI / TANGGAL     •     LOKASI KEGIATAN',104,1110,860,55,27,'#245d90',{fontWeight:'bold'}),rect(0,1296,1080,54,'#103d69')]);
 if(key==='certificate')return page(1123,794,'#fbfaf6',[
  rect(27,27,1069,740,'none',0,{stroke:'#bc963f',strokeWidth:5}),rect(45,45,1033,705,'none',0,{stroke:'#c6b276',strokeWidth:2}),rect(455,80,210,8,'#a68c4c',4),
  txt('PIAGAM PENGHARGAAN',125,128,880,68,48,'#1d466d',{fontWeight:'bold',align:'middle'}),txt('Diberikan kepada',305,230,515,35,22,'#6a7680',{align:'middle'}),
  txt('NAMA PENERIMA',140,309,846,80,68,'#164e80',{fontFamily:'Georgia',fontWeight:'bold',align:'middle'}),rect(270,410,583,3,'#b89b57'),
  txt('Atas partisipasi dan kontribusi dalam kegiatan',213,463,698,37,24,'#566a7b',{align:'middle'}),txt('NAMA KEGIATAN',213,515,698,45,31,'#1a446a',{fontWeight:'bold',align:'middle'}),txt('Kota Bogor, [tanggal]',710,664,300,29,19,'#4f697e',{align:'middle'})]);
 if(key==='infographic')return page(1080,1350,'#f2f7fc',[
  rect(0,0,1080,315,'#0c3b67'),rect(58,59,110,8,'#6bd1db',5),txt('INFOGRAFIS DATA',58,100,980,90,65,'#ffffff',{fontWeight:'bold'}),txt('Ringkasan data dan capaian',62,211,940,55,29,'#bbdaf0'),
  rect(58,372,458,275,'#ffffff',20),rect(565,372,458,275,'#ffffff',20),txt('245',95,426,400,102,82,'#176cae',{fontWeight:'bold'}),txt('TOTAL DATA',100,554,380,47,28,'#5e768e',{fontWeight:'bold'}),
  txt('78%',602,426,390,102,82,'#209989',{fontWeight:'bold'}),txt('CAPAIAN',610,554,380,47,28,'#5e768e',{fontWeight:'bold'}),rect(58,694,965,440,'#ffffff',20),txt('RINGKASAN UTAMA',101,740,840,62,40,'#17446c',{fontWeight:'bold'}),
  rect(103,845,790,34,'#d6e6f2',17),rect(103,845,590,34,'#257cba',17),rect(103,917,790,34,'#d6e6f2',17),rect(103,917,430,34,'#36a59b',17),txt('Sesuaikan angka dan keterangan dengan data yang benar.',86,1210,910,57,26,'#53728a')]);
 if(key==='social')return page(1080,1080,'#fffaf3',[
  rect(0,0,1080,260,'#133e68'),rect(55,66,140,12,'#f6c76f',6),txt('INFORMASI',57,115,960,83,68,'#ffffff',{fontWeight:'bold'}),rect(60,318,960,545,'#e7f0f6',27),
  obj('circle',382,405,320,320,{fill:'#6faed1'}),obj('circle',480,500,110,110,{fill:'#f1ce7b'}),txt('TULIS JUDUL DI SINI',93,893,906,69,55,'#173f69',{fontWeight:'bold',align:'middle'}),rect(0,1039,1080,41,'#133e68')]);
 if(key==='slides')return page(1920,1080,'#f4f8fc',[
  rect(0,0,820,1080,'#113d6b'),rect(100,144,175,10,'#72c3ee',5),txt('PAPARAN',95,232,670,112,91,'#ffffff',{fontWeight:'bold'}),txt('JUDUL PRESENTASI',98,395,660,265,75,'#ffffff',{fontWeight:'bold'}),
  txt('Nama unit kerja / kegiatan',102,785,650,55,31,'#bcd8ee'),rect(918,140,850,801,'#ffffff',27),obj('circle',1120,315,454,454,{fill:'#e8f2fb'}),rect(1060,529,580,95,'#2479bb',17),rect(1060,653,440,55,'#8eb9d8',12)]);
 if(key==='agenda')return page(794,1123,'#ffffff',[
  rect(0,0,794,223,'#153c66'),txt('AGENDA KEGIATAN',55,78,710,88,48,'#ffffff',{fontWeight:'bold'}),txt('Nama instansi / kegiatan',57,151,680,48,23,'#c9e3f5'),
  ...[0,1,2,3].flatMap((n)=>[rect(43,282+n*173,707,140,n%2?'#f5f8fc':'#e7f1fb',13),rect(67,315+n*173,91,77,'#2674ae',9),txt(String(n+1).padStart(2,'0'),78,336+n*173,71,36,30,'#ffffff',{fontWeight:'bold',align:'middle'}),txt('Rangkaian kegiatan '+(n+1),184,306+n*173,518,50,29,'#1e496a',{fontWeight:'bold'}),txt('Waktu dan tempat kegiatan',185,357+n*173,510,47,21,'#7c91a4')]),txt('PBJTOOLS · KOTA BOGOR',54,1038,700,40,19,'#7990a3')]);
 if(key==='report')return page(1123,794,'#f5f9fe',[
  rect(0,0,1123,170,'#143d67'),txt('LAPORAN RINGKAS',48,60,1030,75,59,'#ffffff',{fontWeight:'bold'}),
  ...[0,1,2].flatMap((n)=>[rect(55+352*n,220,318,170,'#ffffff',16),txt(['245','78%','12'][n],75+352*n,244,280,83,65,['#216dad','#148c7c','#db8833'][n],{fontWeight:'bold'}),txt(['Jumlah data','Capaian','Kegiatan'][n],81+352*n,333,267,38,25,'#627c91')]),
  rect(55,439,1012,276,'#ffffff',18),txt('CATATAN PENTING',82,476,910,58,37,'#1d517e',{fontWeight:'bold'}),txt('Sesuaikan isi dengan data laporan yang digunakan.',82,552,910,106,26,'#71899f')]);
 return makeTemplate('blank');
}
const templateCatalog=[['announcement','Pengumuman','Poster resmi · Tegak','#164773','1080 × 1350'],['certificate','Sertifikat','Piagam · A4 mendatar','#b9995d','1123 × 794'],['infographic','Infografis','Kartu data · Tegak','#16649b','1080 × 1350'],['social','Media sosial','Pengumuman singkat','#2570a8','1080 × 1080'],['slides','Presentasi','Slide 16:9','#153d6c','1920 × 1080'],['agenda','Agenda','Rundown kegiatan','#267bb2','794 × 1123'],['report','Laporan','Ringkasan angka','#2c648f','1123 × 794'],['blank','Kosong','Mulai dari halaman kosong','#b7c9da','1080 × 1080']];
function current(){return model.pages[active]}
function find(){return current()?.elements.find(e=>e.id===selected)||null}
function notify(s,err=false){const e=$('toast');e.textContent=s;e.classList.toggle('error',err);e.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('visible'),3400)}
function preChange(){history.push(JSON.stringify(model));if(history.length>35)history.shift();future=[];updateUndo()}
function updateUndo(){$('undo').disabled=!history.length;$('redo').disabled=!future.length}
function mark(){const l=$('saveLabel');l.textContent='Menyimpan...';clearTimeout(saveTimer);saveTimer=setTimeout(saveLocal,650)}
function redraw(){renderCanvas();renderInspector();renderLayers();renderPages();$('pageIndicator').textContent=`Halaman ${active+1} dari ${model.pages.length}`;$('projectTitle').value=model.name;updateUndo();mark()}
function svgEl(tag,attrs={},content=null){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>{if(v!=null)e.setAttribute(k,String(v))});if(content!=null)e.textContent=String(content);return e}
function estimateWrap(str,size,maxWidth,spacing=0){let lines=[];for(const paragraph of String(str??'').split('\n')){if(!paragraph){lines.push('');continue}let line='';const words=paragraph.split(/\s+/);for(const word of words){const trial=line?line+' '+word:word;if(trial.length*(size*.56+spacing)>maxWidth&&line){lines.push(line);line=word}else{line=trial}}lines.push(line)}return lines.slice(0,25)}
function buildObject(e,clickable=false){let g=svgEl('g',{transform:`translate(${e.x} ${e.y}) rotate(${e.rotate||0} ${e.w/2} ${e.h/2})`,opacity:e.opacity==null?1:e.opacity});if(clickable){g.setAttribute('data-id',e.id);g.setAttribute('data-locked',e.locked?'true':'false')}
 const style={fill:e.fill||'#1c66a4',stroke:e.strokeWidth>0?e.stroke:'none','stroke-width':e.strokeWidth||0};let s;
 switch(e.type){case 'text':{
   const fontSize=e.fontSize||40, upper=e.uppercase?String(e.text||'').toUpperCase():String(e.text||'');
   const attrs={x:e.align==='middle'?e.w/2:e.align==='end'?e.w:0,y:fontSize,fill:e.fill||'#173e69',
     'font-size':fontSize,'font-family':e.fontFamily||'Arial','font-weight':e.fontWeight||'normal',
     'font-style':e.fontItalic?'italic':'normal','text-decoration':e.fontUnderline?'underline':'none',
     'letter-spacing':e.letterSpacing||0,'text-anchor':e.align||'start','xml:space':'preserve',
     'paint-order':'stroke',stroke:e.strokeWidth>0?e.stroke:'none','stroke-width':e.strokeWidth||0};
   s=svgEl('text',attrs);
   const lines=estimateWrap(upper,fontSize,e.w,e.letterSpacing||0);
   lines.forEach((word,i)=>s.append(svgEl('tspan',{x:attrs.x,dy:i?fontSize*(e.lineHeight||1.23):0},word)));
   const fx=e.textEffect||'none';
   if(fx!=='none'){
     const fid='fx-'+e.id;
     const defs=svgEl('defs'),filter=svgEl('filter',{id:fid,x:'-60%',y:'-60%',width:'220%',height:'220%'});
     const c=/^#[0-9a-f]{6}$/i.test(e.effectColor||'')?e.effectColor:'#214666';
     const spec=fx==='glow'?{dx:0,dy:0,stdDeviation:7,opacity:.9}:fx==='deep'?{dx:6,dy:7,stdDeviation:3,opacity:.7}:{dx:3,dy:4,stdDeviation:4,opacity:.48};
     filter.append(svgEl('feDropShadow',{dx:spec.dx,dy:spec.dy,stdDeviation:spec.stdDeviation,'flood-color':c,'flood-opacity':spec.opacity}));
     defs.append(filter);g.append(defs);s.setAttribute('filter',`url(#${fid})`);
   }
   break}
 case 'circle':s=svgEl('ellipse',{cx:e.w/2,cy:e.h/2,rx:e.w/2,ry:e.h/2,...style});break;
 case 'line':s=svgEl('line',{x1:0,y1:0,x2:e.w,y2:e.h,...style,fill:'none','stroke-linecap':'round',stroke:e.stroke||'#143f69','stroke-width':Math.max(2,e.strokeWidth||6)});break;
 case 'triangle':s=svgEl('polygon',{points:`${e.w/2},0 ${e.w},${e.h} 0,${e.h}`,...style});break;
 case 'star':{let pts=[];for(let i=0;i<10;i++){let a=(-Math.PI/2)+i*Math.PI/5,r=i%2?Math.min(e.w,e.h)*.21:Math.min(e.w,e.h)*.49;pts.push(`${e.w/2+Math.cos(a)*r},${e.h/2+Math.sin(a)*r}`)}s=svgEl('polygon',{points:pts.join(' '),...style});break}
 case 'image':s=svgEl('image',{x:0,y:0,width:e.w,height:e.h,href:e.src||'',preserveAspectRatio:'xMidYMid meet'});break;
 default:s=svgEl('rect',{x:0,y:0,width:e.w,height:e.h,rx:e.round||0,ry:e.round||0,...style});break;
 }
 g.append(s);return g
}
function addSelection(svg,e){if(!e||e.locked)return;const g=svgEl('g',{transform:`translate(${e.x} ${e.y}) rotate(${e.rotate||0} ${e.w/2} ${e.h/2})`});g.append(svgEl('rect',{x:0,y:0,width:e.w,height:e.h,fill:'none',stroke:'#2187d6','stroke-width':2.8,'stroke-dasharray':'9 5','pointer-events':'none'}));for(const [key,x,y] of [['nw',0,0],['ne',e.w,0],['se',e.w,e.h],['sw',0,e.h]]){const h=svgEl('rect',{x:x-9,y:y-9,width:18,height:18,rx:4,fill:'#fff',stroke:'#1684d1','stroke-width':3,cursor:`${key}-resize`});h.setAttribute('data-handle',key);g.append(h)}g.append(svgEl('line',{x1:e.w/2,y1:-5,x2:e.w/2,y2:-48,stroke:'#1684d1','stroke-width':3,'pointer-events':'none'}));const r=svgEl('circle',{cx:e.w/2,cy:-49,r:10,stroke:'#1684d1','stroke-width':3,fill:'#fff',cursor:'grab'});r.setAttribute('data-handle','rotate');g.append(r);svg.append(g)}
function pageSVG(p,interactive=false){const svg=interactive?$('designCanvas'):svgEl('svg',{xmlns:NS,viewBox:`0 0 ${p.w} ${p.h}`,width:p.w,height:p.h});svg.setAttribute('viewBox',`0 0 ${p.w} ${p.h}`);if(!interactive){svg.setAttribute('width',p.w);svg.setAttribute('height',p.h)}svg.replaceChildren();svg.append(svgEl('rect',{x:0,y:0,width:p.w,height:p.h,fill:p.bg}));for(let e of p.elements){if(!e.hidden&&!(interactive&&editingText?.id===e.id))svg.append(buildObject(e,interactive))}if(interactive){const s=find();if(editingText?.id!==s?.id)addSelection(svg,s);if(drag?.guideX!=null)svg.append(svgEl('line',{x1:drag.guideX,y1:0,x2:drag.guideX,y2:p.h,stroke:'#eb4991','stroke-width':2,'stroke-dasharray':'8 9','pointer-events':'none'}));if(drag?.guideY!=null)svg.append(svgEl('line',{x1:0,y1:drag.guideY,x2:p.w,y2:drag.guideY,stroke:'#eb4991','stroke-width':2,'stroke-dasharray':'8 9','pointer-events':'none'}));}return svg}
function svgMarkup(p){return new XMLSerializer().serializeToString(pageSVG(p,false))}
function renderCanvas(){if(rendering)return;rendering=true;const p=current();const svg=pageSVG(p,true);svg.style.width=Math.round(p.w*scale)+'px';svg.style.height=Math.round(p.h*scale)+'px';$('canvasHolder').style.width=Math.round(p.w*scale)+'px';$('canvasHolder').style.height=Math.round(p.h*scale)+'px';$('zoomLabel').textContent=Math.round(scale*100)+'%';rendering=false}
function fitCanvas(){const p=current(),parent=$('canvasScroll');scale=Math.min(.94,Math.max(.11,Math.min((parent.clientWidth-90)/p.w,(parent.clientHeight-70)/p.h)));renderCanvas()}
function coords(ev){const svg=$('designCanvas'),m=svg.getScreenCTM();if(m){const v=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(m.inverse());return {x:v.x,y:v.y}}const r=svg.getBoundingClientRect(),p=current();return {x:(ev.clientX-r.left)*p.w/r.width,y:(ev.clientY-r.top)*p.h/r.height}}
function setSelected(id){if(editingText&&editingText.id!==id)finishTextEdit(true);selected=id;renderCanvas();renderInspector();renderLayers();if(window.innerWidth<=1050){$('inspector').classList.toggle('open',!!id);if(window.innerWidth<=720&&id)$('sidebar').classList.add('mobile-hidden')}}
function renderInspector(){const e=find();$('inspectorEmpty').hidden=!!e;$('inspectorControls').hidden=!e;$('inspectorTitle').textContent=e?({rect:'Persegi',circle:'Lingkaran',triangle:'Segitiga',star:'Bintang',line:'Garis',text:'Teks',image:'Gambar'}[e.type]||'Elemen'):'Pilih elemen';$('selectionType').textContent=e?('Dipilih: '+(e.type==='text'?String(e.text).slice(0,28):$('inspectorTitle').textContent)):'Tidak ada elemen dipilih';$('contextHint').textContent=e?(e.locked?'Elemen dikunci. Buka kunci untuk menggeser.':'Geser, ubah ukuran, atau putar langsung di kanvas'):'Pilih elemen di kanvas untuk mengubahnya';for(const k of ['duplicateObject','toFront','toBack','deleteObject'])$(k).disabled=!e;
 if(!e){$('quickTextBar').hidden=true;return;}$('textInspector').hidden=e.type!=='text';$('quickTextBar').hidden=e.type!=='text';const set=(id,v)=>{const el=$(id);if(document.activeElement!==el)el.value=v};if(e.type==='text'){set('propText',e.text||'');set('propFont',e.fontFamily||'Arial');set('propFontSize',Math.round(e.fontSize||40));set('propWeight',e.fontWeight||'normal');set('propAlign',e.align||'start');set('propLetterSpacing',e.letterSpacing||0);set('propLineHeight',e.lineHeight||1.23);set('propTextEffect',e.textEffect||'none');set('propEffectColor',e.effectColor||'#214666');
  for(const [id,val] of [['propItalic',!!e.fontItalic],['propUnderline',!!e.fontUnderline],['propUppercase',!!e.uppercase]])$(id).classList.toggle('active',val);
  set('quickFont',e.fontFamily||'Arial');set('quickSize',Math.round(e.fontSize||40));set('quickColor',/^#[0-9a-f]{6}$/i.test(e.fill)?e.fill:'#163e68');
  $('quickBold').classList.toggle('active',e.fontWeight==='bold');$('quickItalic').classList.toggle('active',!!e.fontItalic);$('quickUnderline').classList.toggle('active',!!e.fontUnderline);
 }
 set('propFill',/^#[0-9a-f]{6}$/i.test(e.fill)?e.fill:'#ffffff');set('propStroke',/^#[0-9a-f]{6}$/i.test(e.stroke)?e.stroke:'#ffffff');for(const [id,v] of [['propW',e.w],['propH',e.h],['propX',e.x],['propY',e.y],['propRotate',e.rotate],['propOpacity',Math.round((e.opacity??1)*100)]])set(id,Math.round(v));$('propLock').checked=!!e.locked;$('propVisible').checked=!e.hidden}
function renderLayers(){const list=$('layersList');list.replaceChildren();const els=current().elements.slice().reverse();if(!els.length){list.textContent='Belum ada elemen';return}for(const e of els){let row=document.createElement('div');row.className='layer-row'+(e.id===selected?' active':'');row.dataset.id=e.id;const select=document.createElement('button');select.className='layer-name';select.textContent=(e.type==='text'?(e.text||'Teks').slice(0,32):({image:'Gambar',rect:'Persegi',circle:'Lingkaran',line:'Garis',star:'Bintang',triangle:'Segitiga'}[e.type]||'Elemen'));select.onclick=()=>setSelected(e.id);row.append(select);const eye=document.createElement('button');eye.title=e.hidden?'Tampilkan':'Sembunyikan';eye.textContent=e.hidden?'◌':'◉';eye.onclick=()=>{preChange();e.hidden=!e.hidden;redraw()};row.append(eye);const lock=document.createElement('button');lock.title=e.locked?'Buka kunci':'Kunci';lock.textContent=e.locked?'▣':'▢';lock.onclick=()=>{preChange();e.locked=!e.locked;redraw()};row.append(lock);list.append(row)}}
function renderPages(){const list=$('pagesStrip');list.replaceChildren();model.pages.forEach((p,i)=>{const b=document.createElement('button');b.className='page-item'+(i===active?' active':'');b.title='Buka halaman '+(i+1);const m=document.createElement('span');m.className='page-mini';const svg=pageSVG(p,false);svg.removeAttribute('width');svg.removeAttribute('height');svg.style.width='100%';svg.style.height='100%';m.append(svg);const caption=document.createElement('small');caption.textContent='Halaman '+(i+1);b.append(m,caption);b.onclick=()=>{active=i;selected=null;fitCanvas();redraw()};list.append(b)})}
function setTab(tab){for(const b of document.querySelectorAll('.rail-btn[data-tab]'))b.classList.toggle('active',b.dataset.tab===tab);for(const t of ['templates','text','shapes','uploads','background','layers'])$('tab-'+t).hidden=t!==tab;$('sideTitle').textContent=sideNames[tab]||'Template';$('sidebar').classList.remove('mobile-hidden');if(window.innerWidth<=720)$('inspector').classList.remove('open');if(tab==='background'){const p=current();$('backgroundColor').value=p.bg;$('pageSize').value=p.w+'x'+p.h}}
function renderTemplates(filter=''){const l=$('templatesList');l.replaceChildren();for(const [key,name,sub,col,size] of templateCatalog.filter(x=>x.join(' ').toLowerCase().includes(filter.toLowerCase()))){const b=document.createElement('button');b.className='template-card';const thumb=document.createElement('span');thumb.className='template-thumb';const mini=pageSVG(makeTemplate(key),false);mini.removeAttribute('width');mini.removeAttribute('height');mini.setAttribute('preserveAspectRatio','xMidYMid meet');mini.style.width='100%';mini.style.height='100%';thumb.append(mini);const title=document.createElement('strong');title.textContent=name;const meta=document.createElement('small');meta.textContent=sub+' · '+size;b.append(thumb,title,meta);b.onclick=()=>{if(current().elements.length&&!confirm('Ganti halaman ini dengan template baru? Perubahan halaman saat ini bisa dibatalkan melalui Undo.'))return;preChange();model.pages[active]=makeTemplate(key);selected=null;fitCanvas();redraw();notify('Template '+name+' siap diedit.')};l.append(b)}}
function addElement(e){preChange();current().elements.push(e);selected=e.id;redraw();if(window.innerWidth<=1050){$('inspector').classList.add('open');if(window.innerWidth<=720)$('sidebar').classList.add('mobile-hidden')}notify('Elemen ditambahkan. Geser di kanvas untuk mengatur posisinya.')}
function addText(kind){let p=current(),s=Math.round(p.w/15),t='Tulis teks';if(kind==='heading'){t='Judul utama';s=Math.round(p.w/13)}else if(kind==='subheading'){t='Subjudul desain';s=Math.round(p.w/25)}else if(kind==='body'){t='Tulis keterangan atau informasi di sini.';s=Math.round(p.w/38)}else if(kind==='badge'){t='KETERANGAN';s=Math.round(p.w/45)}else if(kind==='quote'){t='“Tulis kutipan di sini”';s=Math.round(p.w/29)}const w=p.w*.73;addElement(txt(t,(p.w-w)/2,p.h*.37,w,s*3,s,'#163e68',{fontWeight:kind==='heading'||kind==='subheading'?'bold':'normal',align:kind==='heading'?'middle':'start'}))}
function addShape(type){const p=current(),w=p.w*.22,h=type==='line'?0:p.w*.16;let e=obj(type,(p.w-w)/2,(p.h-h)/2,w,h,{fill:'#347cb8',stroke:'#1b5689',strokeWidth:type==='line'?8:0,round:type==='round'?26:0});if(type==='round')e.type='rect';if(type==='circle')e.h=e.w;addElement(e)}
function updateElem(fn){const e=find();if(!e)return;preChange();fn(e);redraw()}
function changeLayer(amount){const els=current().elements,i=els.findIndex(e=>e.id===selected);if(i<0||i+amount<0||i+amount>=els.length)return;preChange();[els[i],els[i+amount]]=[els[i+amount],els[i]];redraw()}
function undo(){if(editingText)finishTextEdit(true);if(!history.length)return;future.push(JSON.stringify(model));model=JSON.parse(history.pop());active=Math.min(active,model.pages.length-1);selected=null;fitCanvas();redraw();notify('Perubahan dibatalkan.')}
function redo(){if(editingText)finishTextEdit(true);if(!future.length)return;history.push(JSON.stringify(model));model=JSON.parse(future.pop());active=Math.min(active,model.pages.length-1);selected=null;fitCanvas();redraw();notify('Perubahan dikembalikan.')}
function deleteSelected(){const e=find();if(!e)return;preChange();const els=current().elements;els.splice(els.indexOf(e),1);selected=null;redraw()}
function cloneSelected(){const e=find();if(!e)return;preChange();const c=deep(e);c.id=uid();c.x+=25;c.y+=25;c.locked=false;current().elements.push(c);selected=c.id;redraw()}
function snapDrag(e,newX,newY){
 const p=current(),threshold=10/Math.max(.35,scale);
 const others=p.elements.filter(t=>t.id!==e.id&&!t.hidden);
 const xTargets=[0,p.w/2,p.w],yTargets=[0,p.h/2,p.h];
 for(const t of others){xTargets.push(t.x,t.x+t.w/2,t.x+t.w);yTargets.push(t.y,t.y+t.h/2,t.y+t.h)}
 drag.guideX=null;drag.guideY=null;
 const xPts=[0,e.w/2,e.w],yPts=[0,e.h/2,e.h];
 let bestX=threshold,bestY=threshold;
 for(const target of xTargets)for(const offset of xPts){const d=Math.abs(newX+offset-target);if(d<bestX){bestX=d;drag.guideX=target;}}
 for(const target of yTargets)for(const offset of yPts){const d=Math.abs(newY+offset-target);if(d<bestY){bestY=d;drag.guideY=target;}}
 if(drag.guideX!==null){const offset=xPts.reduce((best,val)=>Math.abs(newX+val-drag.guideX)<Math.abs(newX+best-drag.guideX)?val:best,xPts[0]);newX=drag.guideX-offset;}
 if(drag.guideY!==null){const offset=yPts.reduce((best,val)=>Math.abs(newY+val-drag.guideY)<Math.abs(newY+best-drag.guideY)?val:best,yPts[0]);newY=drag.guideY-offset;}
 return {x:newX,y:newY};
}
function startPointer(ev){if(ev.button!=null&&ev.button!==0)return;if(ev.target.closest('[data-handle]')||ev.target.closest('[data-id]')){const handle=ev.target.closest('[data-handle]');const el=ev.target.closest('[data-id]');let e=handle?find():current().elements.find(v=>v.id===el?.getAttribute('data-id'));if(!e)return;ev.preventDefault();
  const now=Date.now(),tapPos=coords(ev);
  if(!handle&&e.type==='text'&&lastTap?.id===e.id&&now-lastTap.at<470&&Math.abs(tapPos.x-lastTap.x)<25&&Math.abs(tapPos.y-lastTap.y)<25){
    selected=e.id;lastTap=null;renderInspector();renderLayers();openTextEditor();return;
  }
  lastTap=handle?null:{id:e.id,at:now,x:tapPos.x,y:tapPos.y};
  if(!handle){selected=e.id;renderCanvas();renderInspector();renderLayers()}if(e.locked){notify('Elemen dikunci. Buka kunci melalui panel kanan.');return}const p=coords(ev);drag={id:e.id,handle:handle?.dataset.handle||'move',origin:p,base:deep(e),moved:false,guideX:null,guideY:null};if(handle?.dataset.handle==='rotate'){drag.startAngle=Math.atan2(p.y-(e.y+e.h/2),p.x-(e.x+e.w/2))*180/Math.PI}preChange();}else{setSelected(null);if(window.innerWidth<=1050)$('inspector').classList.remove('open')}}
function movePointer(ev){if(!drag)return;const e=find(),b=drag.base;if(!e||e.id!==drag.id)return;const pos=coords(ev),dx=pos.x-drag.origin.x,dy=pos.y-drag.origin.y,h=drag.handle;drag.moved=drag.moved||Math.abs(dx)+Math.abs(dy)>1.1;
 if(h==='move'){let s=snapDrag(b,b.x+dx,b.y+dy);e.x=s.x;e.y=s.y}
 else if(h==='rotate'){const angle=Math.atan2(pos.y-(b.y+b.h/2),pos.x-(b.x+b.w/2))*180/Math.PI;e.rotate=Math.round(b.rotate+angle-drag.startAngle);if(ev.shiftKey)e.rotate=Math.round(e.rotate/15)*15}
 else{let x=b.x,y=b.y,w=b.w,hh=b.h;if(h.includes('e'))w=b.w+dx;if(h.includes('w')){x=b.x+dx;w=b.w-dx}if(h.includes('s'))hh=b.h+dy;if(h.includes('n')){y=b.y+dy;hh=b.h-dy}if(w<22){if(h.includes('w'))x=b.x+b.w-22;w=22}if(hh<16){if(h.includes('n'))y=b.y+b.h-16;hh=16}if(ev.shiftKey&&b.w&&b.h){const ar=b.w/b.h;hh=w/ar}Object.assign(e,{x,y,w,h:hh});}renderCanvas();renderInspector()}
function endPointer(){if(!drag)return;const moved=drag.moved;if(moved)lastTap=null;drag=null;if(!moved){history.pop();updateUndo()}else{redraw()}}
function finishTextEdit(commit=true){
 if(!editingText)return;
 const edit=editingText,area=$('liveTextInput'),e=current().elements.find(x=>x.id===edit.id);
 editingText=null;
 $('canvasTextEditor').hidden=true;
 if(e&&commit&&area.value.slice(0,3500)!==edit.original){preChange();e.text=area.value.slice(0,3500);redraw();notify('Teks diperbarui.');}
 else renderCanvas();
}
function openTextEditor(){
 const e=find();if(!e||e.type!=='text'||e.locked)return;
 if(editingText)finishTextEdit();
 editingText={id:e.id,original:e.text||''};
 const wrap=$('canvasTextEditor'),input=$('liveTextInput');
 if(wrap.parentElement!==$('canvasHolder'))$('canvasHolder').append(wrap);
 const mul=scale;
 Object.assign(wrap.style,{left:(e.x*mul)+'px',top:(e.y*mul)+'px',width:Math.max(100,e.w*mul)+'px',height:Math.max(72,e.h*mul+31)+'px',transform:`rotate(${e.rotate||0}deg)`,transformOrigin:'center center'});
 Object.assign(input.style,{fontFamily:e.fontFamily||'Arial',fontSize:Math.max(12,(e.fontSize||40)*mul)+'px',fontWeight:e.fontWeight||'normal',fontStyle:e.fontItalic?'italic':'normal',textDecoration:e.fontUnderline?'underline':'none',letterSpacing:(e.letterSpacing||0)*mul+'px',lineHeight:String(e.lineHeight||1.23),color:e.fill||'#143e69',textAlign:e.align==='middle'?'center':e.align==='end'?'right':'left'});
 input.value=e.text||'';wrap.hidden=false;renderCanvas();
 input.focus();input.select();
}
function fileDownload(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
async function readImage(file){if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('Gunakan gambar PNG, JPG, atau WEBP.');if(file.size>10*1024*1024)throw Error('Maksimal 10 MB per gambar.');const u=URL.createObjectURL(file),im=new Image();try{await new Promise((ok,bad)=>{im.onload=ok;im.onerror=()=>bad(Error('Gambar tidak dapat dibaca.'));im.src=u});if(im.naturalWidth*im.naturalHeight>40000000)throw Error('Resolusi gambar terlalu besar.');const s=Math.min(1,1750/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);const format=file.type==='image/jpeg'?'image/jpeg':'image/png';let src=c.toDataURL(format,.89);if(src.length>5000000){src=c.toDataURL('image/jpeg',.81)}return {src,w:c.width,h:c.height}}finally{URL.revokeObjectURL(u)}}
async function uploadImages(files){for(let file of Array.from(files).slice(0,15)){try{let data=await readImage(file);uploadCache.unshift({...data,name:file.name});addUploadedImage(data);notify(file.name+' ditambahkan.')}catch(e){notify(e.message,true)}}renderUploads()}
function addUploadedImage(data){const p=current(),w=Math.min(p.w*.5,data.w),h=w*data.h/data.w;addElement(obj('image',(p.w-w)/2,(p.h-h)/2,w,h,{src:data.src,fill:'#ffffff'}))}
function renderUploads(){const l=$('uploadsList');l.replaceChildren();for(const up of uploadCache.slice(0,18)){let b=document.createElement('button'),im=document.createElement('img'),sm=document.createElement('small');im.src=up.src;sm.textContent=up.name;b.title='Tambahkan '+up.name;b.append(im,sm);b.onclick=()=>addUploadedImage(up);l.append(b)}}
async function rasterPage(p,mult=2,type='image/png'){
 const maxSide=5800,maxPixels=19000000,scaleFactor=Math.min(Number(mult)||1,maxSide/Math.max(p.w,p.h),Math.sqrt(maxPixels/(p.w*p.h)));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(p.w*scaleFactor));canvas.height=Math.max(1,Math.round(p.h*scaleFactor));
 const ctx=canvas.getContext('2d');if(type==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)}
 const source=svgMarkup(p);const u=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));let image=new Image();try{await new Promise((ok,bad)=>{const timeout=setTimeout(()=>bad(Error('Pratinjau desain terlalu lama dimuat.')),15000);image.onload=()=>{clearTimeout(timeout);ok()};image.onerror=()=>{clearTimeout(timeout);bad(Error('Gagal memuat elemen SVG. Coba gunakan gambar PNG/JPG biasa.'))};image.src=u});ctx.drawImage(image,0,0,canvas.width,canvas.height)}finally{URL.revokeObjectURL(u)}
 return canvas;
}
function canvasBlob(c,type,quality=.92){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Gagal menyiapkan hasil desain.')),type,quality))}
const toBytes=s=>new TextEncoder().encode(s);
async function pdfBlob(pages,mult=1.5){
 const images=[];for(const pg of pages){const can=await rasterPage(pg,mult,'image/jpeg'),b=await canvasBlob(can,'image/jpeg',.93);images.push({w:can.width,h:can.height,bytes:new Uint8Array(await b.arrayBuffer()),pageW:pg.w*.75,pageH:pg.h*.75})}
 let parts=[],count=0,offsets=[0];const put=x=>{const v=typeof x==='string'?toBytes(x):x;parts.push(v);count+=v.byteLength};const begin=id=>{offsets[id]=count;put(`${id} 0 obj\n`)};const end=()=>put('\nendobj\n');
 put('%PDF-1.4\n%PBJTOOLS\n');begin(1);put('<< /Type /Catalog /Pages 2 0 R >>');end();begin(2);put(`<< /Type /Pages /Kids [${images.map((_,i)=>(3+i*3)+' 0 R').join(' ')}] /Count ${images.length} >>`);end();
 for(let i=0;i<images.length;i++){
  const im=images[i],pid=3+i*3,cid=pid+1,iid=pid+2;
  begin(pid);put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${im.pageW.toFixed(3)} ${im.pageH.toFixed(3)}] /Resources << /XObject << /Img ${iid} 0 R >> >> /Contents ${cid} 0 R >>`);end();
  const content=`q\n${im.pageW.toFixed(3)} 0 0 ${im.pageH.toFixed(3)} 0 0 cm\n/Img Do\nQ\n`;
  begin(cid);put(`<< /Length ${toBytes(content).length} >>\nstream\n${content}endstream`);end();
  begin(iid);put(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);put(im.bytes);put('\nendstream');end();
 }
 const xrefOffset=count;put(`xref\n0 ${images.length*3+3}\n0000000000 65535 f \n`);for(let id=1;id<=images.length*3+2;id++)put(String(offsets[id]).padStart(10,'0')+' 00000 n \n');put(`trailer\n<< /Size ${images.length*3+3} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
 return new Blob(parts,{type:'application/pdf'});
}
async function runExport(){let format=$('exportFormat').value,mult=Number($('exportScale').value),file=safeName(model.name);const button=$('runExport');button.disabled=true;$('exportStatus').textContent='Menyiapkan '+(format.toUpperCase())+'...';try{
  if(format==='project'){fileDownload(new Blob([JSON.stringify({format:'PBJTOOLS_DESIGN',version:1,project:model},null,2)],{type:'application/json'}),file+'-PBJtool.pbjdesign')}
  else if(format==='svg'){fileDownload(new Blob([svgMarkup(current())],{type:'image/svg+xml'}),file+'-PBJtool.svg')}
  else if(format==='pdf'){const blob=await pdfBlob(model.pages,Math.min(mult,2));fileDownload(blob,file+'-PBJtool.pdf')}
  else{const mime=format==='jpg'?'image/jpeg':'image/png',can=await rasterPage(current(),mult,mime);const blob=await canvasBlob(can,mime,.94);fileDownload(blob,file+'-PBJtool.'+format)}
  $('exportStatus').textContent='File berhasil disiapkan. Periksa folder Unduhan.';notify('Desain berhasil diunduh.');
 }catch(e){console.error(e);$('exportStatus').textContent='Gagal: '+e.message;notify('Gagal mengekspor desain.',true)}finally{button.disabled=false}}
function validateProject(input){if(!input||input.format!=='PBJTOOLS_DESIGN'||!input.project||!Array.isArray(input.project.pages))throw Error('Berkas bukan proyek PBJTOOLS.');const src=input.project;if(src.pages.length<1||src.pages.length>50)throw Error('Jumlah halaman tidak didukung (maksimal 50).');let clean={name:String(src.name||'Desain tanpa judul').slice(0,90),pages:[]};
 for(const p of src.pages){let w=clamp(p.w,100,4000),h=clamp(p.h,100,4000);if(!Array.isArray(p.elements)||p.elements.length>250)throw Error('Terlalu banyak elemen dalam satu halaman.');let bg=/^#[0-9a-f]{6}$/i.test(p.bg)?p.bg:'#ffffff',elements=[];for(const raw of p.elements){if(!['rect','circle','line','triangle','star','text','image'].includes(raw.type))continue;const e=obj(raw.type,clamp(raw.x,-5000,5000),clamp(raw.y,-5000,5000),clamp(raw.w,1,5000),clamp(raw.h,1,5000));e.id=uid();for(const key of ['fill','stroke'])e[key]=(raw[key]==='none'||/^#[0-9a-f]{6}$/i.test(raw[key]))?raw[key]:key==='fill'?'#0b3155':'#ffffff';for(const [key,mn,mx] of [['strokeWidth',0,100],['opacity',0,1],['round',0,200],['rotate',-360,360],['fontSize',8,300]])if(raw[key]!=null)e[key]=clamp(raw[key],mn,mx);e.hidden=!!raw.hidden;e.locked=!!raw.locked;e.text=String(raw.text||'').slice(0,3500);e.fontFamily=['Arial','Georgia','Verdana','Tahoma','Trebuchet MS','Times New Roman','Courier New','Impact','Palatino Linotype','Segoe UI','Calibri'].includes(raw.fontFamily)?raw.fontFamily:'Arial';
 e.fontItalic=!!raw.fontItalic;e.fontUnderline=!!raw.fontUnderline;e.uppercase=!!raw.uppercase;
 e.letterSpacing=raw.letterSpacing==null?0:clamp(raw.letterSpacing,-10,60);
 e.lineHeight=raw.lineHeight==null?1.23:clamp(raw.lineHeight,.8,3);
 e.textEffect=['none','shadow','deep','glow'].includes(raw.textEffect)?raw.textEffect:'none';
 e.effectColor=/^#[0-9a-f]{6}$/i.test(raw.effectColor||'')?raw.effectColor:'#214666';e.fontWeight=raw.fontWeight==='bold'?'bold':'normal';e.align=['start','middle','end'].includes(raw.align)?raw.align:'start';if(e.type==='image'){if(!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(raw.src||''))continue;e.src=raw.src;if(e.src.length>10000000)throw Error('Ukuran proyek terlalu besar.')}elements.push(e)}clean.pages.push(page(w,h,bg,elements))}return clean}
async function loadProject(file){if(file.size>25*1024*1024)throw Error('Berkas proyek terlalu besar.');const text=await file.text();const data=validateProject(JSON.parse(text));if(!confirm('Buka proyek ini dan ganti desain yang sedang ditampilkan?'))return;model=data;active=0;selected=null;history=[];future=[];fitCanvas();redraw();notify('Proyek berhasil dibuka.')}
async function openDB(){return new Promise(resolve=>{try{const req=indexedDB.open('PBJTOOLS_DESIGN_LOCAL',1);req.onupgradeneeded=()=>req.result.createObjectStore('drafts');req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null)}catch(e){resolve(null)}})}
async function restoreLocal(){if(!db)return null;return new Promise(resolve=>{try{const tx=db.transaction('drafts','readonly'),request=tx.objectStore('drafts').get('last');request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>resolve(null)}catch(e){resolve(null)}})}
async function saveLocal(){const label=$('saveLabel');try{if(db){const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(model,'last');await new Promise((ok,bad)=>{tx.oncomplete=ok;tx.onerror=()=>bad(tx.error||Error('Penyimpanan gagal.'));tx.onabort=()=>bad(tx.error||Error('Penyimpanan dibatalkan.'))})}else{const string=JSON.stringify({format:'PBJTOOLS_DESIGN',project:model});if(string.length<3800000)localStorage.setItem('pbjtools_design_local',string);else throw Error('Data terlalu besar untuk penyimpanan browser.')}label.textContent='Tersimpan di perangkat'}catch(e){console.error(e);label.textContent='Belum tersimpan — unduh proyek';notify('Autosave penuh. Unduh file proyek untuk menyimpan desain.',true)}}
function fillPalette(id,click){const e=$(id);for(const c of colors){const b=document.createElement('button');b.style.background=c;b.title=c;b.onclick=()=>click(c);e.append(b)}}
function attach(){
 $('projectTitle').addEventListener('input',e=>{model.name=e.target.value.slice(0,90);mark()});
 $('undo').onclick=undo;$('redo').onclick=redo;$('saveProject').onclick=()=>{fileDownload(new Blob([JSON.stringify({format:'PBJTOOLS_DESIGN',version:1,project:model},null,2)],{type:'application/json'}),safeName(model.name)+'-PBJtool.pbjdesign');notify('Proyek disimpan sebagai file .pbjdesign.')};$('openProject').onclick=()=>$('projectFile').click();$('projectFile').onchange=async e=>{try{if(e.target.files[0])await loadProject(e.target.files[0])}catch(err){notify(err.message,true)}e.target.value=''};
 $('exportBtn').onclick=()=>{$('exportModal').hidden=false;$('exportStatus').textContent='';};$('runExport').onclick=runExport;$('exportFormat').onchange=()=>{$('exportScaleWrap').hidden=['svg','project'].includes($('exportFormat').value);$('exportNote').textContent=$('exportFormat').value==='pdf'?'Semua halaman diekspor sebagai PDF gambar. Teks di PDF tidak dapat diseleksi.':$('exportFormat').value==='project'?'Proyek bisa dibuka lagi dan diedit di PBJTOOLS.':'Halaman aktif akan diekspor sesuai ukuran desain.'};
 document.querySelectorAll('[data-close]').forEach(btn=>btn.onclick=()=>$((btn.dataset.close)).hidden=true);document.querySelectorAll('.overlay').forEach(el=>el.addEventListener('pointerdown',ev=>{if(ev.target===el)el.hidden=true}));
 document.querySelectorAll('.rail-btn[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));$('hideSidebar').onclick=()=>$('sidebar').classList.toggle('mobile-hidden');$('templateSearch').oninput=e=>renderTemplates(e.target.value);
 document.querySelectorAll('[data-add-text]').forEach(b=>b.onclick=()=>addText(b.dataset.addText));document.querySelectorAll('[data-add-shape]').forEach(b=>b.onclick=()=>addShape(b.dataset.addShape));fillPalette('shapeColors',c=>{const e=find();if(e)updateElem(x=>x.fill=c);else{addShape('rect');find().fill=c;redraw()}});fillPalette('bgColors',c=>{preChange();current().bg=c;redraw()});
 $('backgroundColor').onchange=e=>{preChange();current().bg=e.target.value;redraw()};$('pageSize').onchange=e=>{let [w,h]=e.target.value.split('x').map(Number);preChange();current().w=w;current().h=h;fitCanvas();redraw()};
 $('pickImages').onclick=()=>$('imageFile').click();$('imageFile').onchange=async e=>{await uploadImages(e.target.files);e.target.value=''};for(const el of [$('imageDrop'),$('canvasScroll')]){el.addEventListener('dragover',ev=>{ev.preventDefault();el.classList.add('drag-over')});el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));el.addEventListener('drop',async ev=>{ev.preventDefault();el.classList.remove('drag-over');const fs=Array.from(ev.dataTransfer.files).filter(f=>f.type.startsWith('image/'));if(fs.length){await uploadImages(fs);if(ev.currentTarget===$('canvasScroll'))setTab('uploads')}})}$('imageDrop').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('imageFile').click()}};
 $('layerUp').onclick=()=>changeLayer(1);$('layerDown').onclick=()=>changeLayer(-1);
 $('duplicateObject').onclick=cloneSelected;$('deleteObject').onclick=deleteSelected;$('toFront').onclick=()=>{const e=find();if(!e)return;preChange();const els=current().elements;els.splice(els.indexOf(e),1);els.push(e);redraw()};$('toBack').onclick=()=>{const e=find();if(!e)return;preChange();const els=current().elements;els.splice(els.indexOf(e),1);els.unshift(e);redraw()};
 const props={propText:'text',propFont:'fontFamily',propFontSize:'fontSize',propWeight:'fontWeight',propAlign:'align',propFill:'fill',propStroke:'stroke',propW:'w',propH:'h',propX:'x',propY:'y',propRotate:'rotate',propOpacity:'opacity',propLetterSpacing:'letterSpacing',propLineHeight:'lineHeight',propTextEffect:'textEffect',propEffectColor:'effectColor',propLock:'locked',propVisible:'hidden'};
 for(const [id,key] of Object.entries(props)){const el=$(id);el.addEventListener('focus',()=>{if(find())preChange()});el.addEventListener(el.type==='checkbox'?'change':'input',()=>{const e=find();if(!e)return;let val=el.type==='checkbox'?el.checked:el.value;if(key==='hidden')val=!val;if(['fontSize','w','h','x','y','rotate','opacity','letterSpacing','lineHeight'].includes(key)){val=Number(val);if(key==='opacity')val=clamp(val,0,100)/100;else if(['w','h'].includes(key))val=Math.max(8,val);else if(key==='fontSize')val=clamp(val,8,300);else if(key==='lineHeight')val=clamp(val,.8,3);else if(key==='letterSpacing')val=clamp(val,-10,60)}e[key]=val;renderCanvas();renderLayers();mark()});}
  // Text styling and alignment. Each button writes one undoable change.
  for(const [id,key] of [['propItalic','fontItalic'],['propUnderline','fontUnderline'],['propUppercase','uppercase']]){
    $(id).onclick=()=>{const e=find();if(!e||e.type!=='text')return;updateElem(x=>{x[key]=!x[key]})};
  }
  const updateQuick=(property,value)=>{const e=find();if(!e||e.type!=='text')return;updateElem(x=>{x[property]=value});};
  $('quickFont').onchange=ev=>updateQuick('fontFamily',ev.target.value);
  $('quickSize').onchange=ev=>updateQuick('fontSize',clamp(ev.target.value,8,300));
  $('quickColor').onchange=ev=>updateQuick('fill',ev.target.value);
  $('quickBold').onclick=()=>{const e=find();if(e?.type==='text')updateQuick('fontWeight',e.fontWeight==='bold'?'normal':'bold')};
  $('quickItalic').onclick=()=>{const e=find();if(e?.type==='text')updateQuick('fontItalic',!e.fontItalic)};
  $('quickUnderline').onclick=()=>{const e=find();if(e?.type==='text')updateQuick('fontUnderline',!e.fontUnderline)};
  document.querySelectorAll('[data-align]').forEach(btn=>btn.onclick=()=>{
    const e=find(),p=current();if(!e)return;
    const how=btn.dataset.align;
    updateElem(o=>{if(how==='left')o.x=0;else if(how==='center')o.x=(p.w-o.w)/2;else if(how==='right')o.x=p.w-o.w;else if(how==='top')o.y=0;else if(how==='middle')o.y=(p.h-o.h)/2;else if(how==='bottom')o.y=p.h-o.h;});
  });
  $('commitCanvasText').onclick=()=>finishTextEdit(true);
  $('liveTextInput').addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.preventDefault();finishTextEdit(false)}else if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();finishTextEdit(true)}});
  $('liveTextInput').addEventListener('blur',ev=>{if(editingText&&ev.relatedTarget?.id!=='commitCanvasText')finishTextEdit(true)});
 $('designCanvas').addEventListener('pointerdown',startPointer);window.addEventListener('pointermove',movePointer);window.addEventListener('pointerup',endPointer);window.addEventListener('pointercancel',endPointer);$('designCanvas').addEventListener('dblclick',ev=>{const el=ev.target.closest('[data-id]');if(el){setSelected(el.dataset.id);openTextEditor()}});
 $('applyText').onclick=()=>{updateElem(e=>{e.text=$('inlineText').value.slice(0,3500)});$('textModal').hidden=true};
 $('prevPage').onclick=()=>{active=(active-1+model.pages.length)%model.pages.length;selected=null;fitCanvas();redraw()};$('nextPage').onclick=()=>{active=(active+1)%model.pages.length;selected=null;fitCanvas();redraw()};
 $('addPage').onclick=()=>{preChange();const p=current();model.pages.splice(active+1,0,page(p.w,p.h,p.bg));active++;selected=null;fitCanvas();redraw()};$('clonePage').onclick=()=>{preChange();let p=deep(current());p.id=uid();p.elements.forEach(e=>e.id=uid());model.pages.splice(active+1,0,p);active++;selected=null;redraw()};$('removePage').onclick=()=>{if(model.pages.length===1){notify('Minimal satu halaman.');return}if(!confirm('Hapus halaman ini?'))return;preChange();model.pages.splice(active,1);active=Math.min(active,model.pages.length-1);selected=null;fitCanvas();redraw()};
 $('zoomOut').onclick=()=>{scale=Math.max(.1,scale-.1);renderCanvas()};$('zoomIn').onclick=()=>{scale=Math.min(2.5,scale+.1);renderCanvas()};$('fitPage').onclick=fitCanvas;
 $('previewBtn').onclick=()=>{const p=$('previewStage');p.replaceChildren();for(const pg of model.pages){const s=pageSVG(pg,false);s.removeAttribute('width');s.removeAttribute('height');s.style.width=Math.min(700,pg.w)+'px';s.style.height='auto';p.append(s)}$('previewModal').hidden=false};
 window.addEventListener('keydown',ev=>{if(ev.key==='Escape'){for(const m of document.querySelectorAll('.overlay'))m.hidden=true;return}if(ev.target.matches('input,textarea,select')||ev.target.isContentEditable)return;const key=ev.key.toLowerCase(),mod=ev.ctrlKey||ev.metaKey;if(mod&&key==='z'){ev.preventDefault();ev.shiftKey?redo():undo()}else if(mod&&key==='y'){ev.preventDefault();redo()}else if(mod&&key==='b'&&find()?.type==='text'){ev.preventDefault();const e=find();updateElem(x=>x.fontWeight=e.fontWeight==='bold'?'normal':'bold')}else if(mod&&key==='i'&&find()?.type==='text'){ev.preventDefault();const e=find();updateElem(x=>x.fontItalic=!e.fontItalic)}else if(mod&&key==='d'){ev.preventDefault();cloneSelected()}else if(mod&&key==='s'){ev.preventDefault();$('saveProject').click()}else if(mod&&key==='c'&&find()){ev.preventDefault();clipboard=deep(find());notify('Elemen disalin.')}else if(mod&&key==='v'&&clipboard){ev.preventDefault();let e=deep(clipboard);e.id=uid();e.x+=27;e.y+=27;addElement(e)}else if(key==='delete'||key==='backspace'){ev.preventDefault();deleteSelected()}else if(['arrowup','arrowdown','arrowleft','arrowright'].includes(key)&&find()&&!find().locked){ev.preventDefault();preChange();let d=ev.shiftKey?10:1,e=find();if(key==='arrowup')e.y-=d;else if(key==='arrowdown')e.y+=d;else if(key==='arrowleft')e.x-=d;else e.x+=d;redraw()}});
 window.addEventListener('resize',()=>{if(!drag)fitCanvas()});
}
async function initialize(){model={name:'Pengumuman Kegiatan',pages:[makeTemplate('announcement')]};db=await openDB();try{let saved=await restoreLocal();if(!saved){const fallback=localStorage.getItem('pbjtools_design_local');if(fallback)saved=JSON.parse(fallback).project}if(saved){model=validateProject({format:'PBJTOOLS_DESIGN',project:saved})}}catch(e){console.warn('Draft tidak bisa dipulihkan',e)}attach();renderTemplates();setTab('templates');fitCanvas();redraw();if(window.innerWidth<=720)$('sidebar').classList.add('mobile-hidden');$('saveLabel').textContent='Tersimpan di perangkat';notify('Design Studio siap digunakan.');}
initialize().catch(e=>{console.error(e);notify('Editor gagal dimuat: '+e.message,true)});
})();
