/* PBJTOOLS Image Tools v2.3 — responsive workspace + faster local editing; optional image segmentation via IMG.LY (AGPL-3.0). */
(() => {'use strict';
const $ = id => document.getElementById(id);
const edit = $('editCanvas'), ctx=edit.getContext('2d',{willReadFrequently:true});
const source=document.createElement('canvas'), sourceCtx=source.getContext('2d',{willReadFrequently:true});
const stage=$('canvasStage');
const state={file:null,mode:'remove',pointer:'',dragging:false,painted:false,start:null,selection:null,history:[],busy:false,hasImage:false,format:'image/png',quality:.9,firstLoad:true,ratio:1,previewOriginal:false,originalUrl:null,cropRatio:'free'};
const byteSize=n=>n>=1048576?(n/1048576).toFixed(2)+' MB':n>=1024?(n/1024).toFixed(0)+' KB':n+' byte';
const setStatus=(t,type='')=>{$('actionStatus').textContent=t;$('actionStatus').parentElement.className='status-row'+(type?' '+type:'');};
function progress(n,t){$('imageProgress').hidden=false;$('imageBar').style.width=Math.min(100,Math.max(0,n))+'%';if(t)setStatus(t);}
const has=()=>state.hasImage&&!state.busy;
function copiedCanvas(canvas){const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c}
function snapshot(){if(!has())return;state.history.push(copiedCanvas(edit));if(state.history.length>5)state.history.shift();$('undoBtn').disabled=false}
function updateDimensions(){if(!state.hasImage)return;$('imageDimensions').textContent=`${edit.width.toLocaleString('id-ID')} × ${edit.height.toLocaleString('id-ID')} piksel`;$('editedMeta').textContent=`${edit.width} × ${edit.height} px`;$('imgWidth').value=edit.width;$('imgHeight').value=edit.height;state.ratio=edit.width/edit.height||1;}
function redraw(src){edit.width=src.width;edit.height=src.height;ctx.clearRect(0,0,edit.width,edit.height);ctx.drawImage(src,0,0);updateDimensions();clearSelection()}
function clearSelection(){state.selection=null;$('cropSelection').hidden=true;$('applyCrop').disabled=true;$('cancelCrop').disabled=true;syncQuickActions()}
function enable(){const active=has();['autoRemove','colorRemove','brushErase','brushRestore','applyResize','applyCompress','applyAdjust','rotateLeft','rotateRight','flipH','flipV','downloadImage','resetBtn','viewOriginal'].forEach(id=>$(id).disabled=!active);$('undoBtn').disabled=!active||!state.history.length;$('brushDone').disabled=!active||!['erase','restore'].includes(state.pointer);$('exportFormat').disabled=!active;$('exportQuality').disabled=!active;syncQuickActions();}
function syncQuickActions(){
 const mode=state.mode, available=has(), apply=$('quickApply'),cancel=$('quickCancel'),hint=$('quickHint');
 const titles={remove:'Hapus latar: otomatis, pilih warna, atau gunakan kuas.',crop:'Tarik pada gambar untuk memilih area potong.',resize:'Atur lebar dan tinggi pada panel kiri.',compress:'Pilih format dan kualitas pada panel kiri.',adjust:'Sesuaikan slider untuk melihat hasilnya.',rotate:'Gunakan tombol putar atau balik pada panel kiri.'};
 const labels={crop:'Terapkan potongan',resize:'Terapkan ukuran',compress:'Gunakan format',adjust:'Terapkan warna'};
 hint.textContent= !state.hasImage?'Pilih gambar untuk mulai mengedit.':titles[mode];
 apply.hidden=!labels[mode];
 if(labels[mode])apply.textContent=labels[mode];
 const selected=state.selection && Math.abs(state.selection.x1-state.selection.x0)>=5 && Math.abs(state.selection.y1-state.selection.y0)>=5;
 apply.disabled=!available||(mode==='crop'&&!selected);
 cancel.hidden=mode!=='crop'||!state.selection;
 cancel.disabled=!available;
 if(mode==='crop'&&selected){const c=state.selection;hint.textContent=`Area terpilih: ${Math.abs(c.x1-c.x0)} × ${Math.abs(c.y1-c.y0)} px · klik Terapkan potongan`;}
 $('quickDownload').disabled=!available;
}
function setMode(mode){state.mode=mode;state.pointer='';if(state.previewOriginal){$('originalOverlay').hidden=true;state.previewOriginal=false;$('viewOriginal').textContent='Bandingkan asli'};document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});document.querySelectorAll('.mode-panel').forEach(p=>p.hidden=p.id!=='mode-'+mode);const names={remove:'Hapus latar belakang',crop:'Potong gambar',resize:'Ubah ukuran gambar',compress:'Kompres gambar',adjust:'Sesuaikan warna',rotate:'Putar atau balik gambar'};$('settingsTitle').textContent=names[mode];if(mode!=='crop')clearSelection();$('colorRemove').textContent='Pilih warna dari gambar';edit.style.cursor=mode==='crop'?'crosshair':'default';setStatus(state.hasImage?'Pilih pengaturan, lalu olah gambar.':'Pilih gambar untuk memulai.');enable();}
async function imageFromBlob(blob){if('createImageBitmap' in window){return await createImageBitmap(blob)}return await new Promise((res,rej)=>{const im=new Image(),url=URL.createObjectURL(blob);im.onload=()=>{URL.revokeObjectURL(url);res(im)};im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Gambar tidak dapat dibuka'))};im.src=url})}
async function loadFile(file){if(!file)return;const supported=/\.(png|jpe?g|webp)$/i.test(file.name)&& (!file.type || ['image/png','image/jpeg','image/webp'].includes(file.type));if(!supported){setStatus('Pilih gambar berformat JPG, PNG, atau WEBP.','error');return}if(file.size>16*1024*1024){setStatus('Ukuran gambar maksimal 16 MB.','error');return}if(state.busy)return;try{state.busy=true;progress(12,'Membuka gambar...');const im=await imageFromBlob(file);const origWidth=im.naturalWidth||im.width,origHeight=im.naturalHeight||im.height;if(origWidth*origHeight>46000000)throw Error('Resolusi terlalu besar untuk diproses pada perangkat ini.');const scale=Math.min(1,2800/Math.max(origWidth,origHeight));source.width=Math.max(1,Math.round(origWidth*scale));source.height=Math.max(1,Math.round(origHeight*scale));sourceCtx.clearRect(0,0,source.width,source.height);sourceCtx.drawImage(im,0,0,source.width,source.height);if(im.close)im.close();state.file=file;clearPreviewFilter();state.history=[];state.pointer='';state.hasImage=true;redraw(source);$('fileName').textContent=file.name;$('fileMeta').textContent=byteSize(file.size)+' · '+origWidth+' × '+origHeight+' px';$('fileDetail').hidden=false;$('emptyPreview').hidden=true;$('canvasPosition').hidden=false;if(state.originalUrl)URL.revokeObjectURL(state.originalUrl);state.originalUrl=URL.createObjectURL(file);$('originalOverlay').src=state.originalUrl;$('originalOverlay').hidden=true;document.body.classList.add('has-image');state.previewOriginal=false;$('viewOriginal').textContent='Bandingkan asli';$('exportFormat').value='image/png';$('exportQuality').value='90';$('exportQualityVal').textContent='90%';progress(100,'Gambar siap diedit.');setTimeout(()=>{$('imageProgress').hidden=true},180);setStatus('Gambar siap diedit.','ok');}catch(e){console.error(e);setStatus(e.message||'Gagal membuka gambar.','error')}finally{state.busy=false;enable();updateDimensions()}}
let bgModuleLoading=null;
function getBackgroundModule(){
 if(!bgModuleLoading)bgModuleLoading=import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm')
 .catch(()=>import('https://esm.sh/@imgly/background-removal@1.7.0?bundle'))
 .catch(e=>{bgModuleLoading=null;throw e});
 return bgModuleLoading;
}
async function automaticBackground(){if(!has())return;state.busy=true;enable();progress(1,'Menyiapkan penghapus latar otomatis...');try{const mod=await getBackgroundModule();
const remove=mod.default||mod.removeBackground;if(typeof remove!=='function')throw Error('Mesin hapus latar tidak tersedia.');progress(14,'Memuat model gambar (pertama kali membutuhkan internet)...');const sourceBlob=state.history.length?await toBlob(edit,'image/png',1):state.file;const blob=await remove(sourceBlob,{model:'isnet_quint8',device:'cpu',output:{format:'image/png',type:'foreground'},progress:(name,current,total)=>{if(state.busy){const p=String(name||'').startsWith('compute')?76+Math.round((current/Math.max(1,total))*17):14+Math.round((current/Math.max(1,total))*60);progress(Math.min(95,p),String(name||'').startsWith('compute')?'Memisahkan latar gambar...':'Memuat model gambar...')}}});if(!blob?.size)throw Error('Tidak ada hasil yang dihasilkan.');progress(96,'Memasang hasil...');const img=await imageFromBlob(blob);state.busy=false;snapshot();state.busy=true;redraw(img);if(img.close)img.close();$('exportFormat').value='image/png';progress(100,'Latar belakang berhasil dihapus.');setStatus('Latar belakang berhasil dihapus. Periksa tepi gambar sebelum mengunduh.','ok');}
catch(e){console.error('PBJTOOLS background removal',e);setStatus('Penghapus otomatis belum berhasil: '+(e.message||'model tidak bisa dimuat')+'. Gunakan “Pilih warna dari gambar” untuk latar polos.','error');$('imageProgress').hidden=true}
finally{state.busy=false;enable()}}
function imagePoint(ev){const r=edit.getBoundingClientRect();return {x:Math.min(edit.width-1,Math.max(0,Math.floor((ev.clientX-r.left)*edit.width/r.width))),y:Math.min(edit.height-1,Math.max(0,Math.floor((ev.clientY-r.top)*edit.height/r.height)))} }
function colorErase(pt){if(!has())return;const {width:w,height:h}=edit,im=ctx.getImageData(0,0,w,h),d=im.data,at=(pt.y*w+pt.x),pos=at*4;if(d[pos+3]<10){setStatus('Area tersebut sudah transparan. Klik area lain.');return}const target=[d[pos],d[pos+1],d[pos+2]];const tol=Number($('tolerance').value),lim=tol*tol*3;const seen=new Uint8Array(w*h),stack=new Int32Array(w*h);let top=0,count=0;stack[top++]=at;seen[at]=1;snapshot();while(top){const p=stack[--top],i=p*4;let dist=(d[i]-target[0])**2+(d[i+1]-target[1])**2+(d[i+2]-target[2])**2;if(dist>lim)continue;d[i+3]=0;count++;const x=p%w,y=(p/w)|0;const push=v=>{if(!seen[v]){seen[v]=1;stack[top++]=v}};if(x>0)push(p-1);if(x<w-1)push(p+1);if(y>0)push(p-w);if(y<h-1)push(p+w)}if(!count){state.history.pop();$('undoBtn').disabled=!state.history.length;setStatus('Tidak ada area yang cocok. Naikkan toleransi warna.');return}ctx.putImageData(im,0,0);setStatus(`Area latar dihapus (${count.toLocaleString('id-ID')} piksel). Klik lagi jika ada bagian tersisa.`,'ok');enable()}
function drawBrush(pt){let radius=Number($('brushSize').value)/2;ctx.save();ctx.beginPath();ctx.arc(pt.x,pt.y,radius,0,2*Math.PI);if(state.pointer==='erase'){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';ctx.fill()}else{ctx.clip();ctx.globalCompositeOperation='source-over';ctx.drawImage(source,0,0,source.width,source.height,0,0,edit.width,edit.height)}ctx.restore();}
function updateCropTarget(pt){
 const sel=state.selection;if(!sel)return;
 const ratio=state.cropRatio==='free'?0:Number(state.cropRatio);
 if(!ratio){sel.x1=pt.x;sel.y1=pt.y;return}
 let dx=pt.x-sel.x0,dy=pt.y-sel.y0;
 const sx=dx<0?-1:1,sy=dy<0?-1:1;
 let w=Math.abs(dx),h=Math.abs(dy);
 if(w<1&&h<1){sel.x1=sel.x0;sel.y1=sel.y0;return}
 if(h<1)h=w/ratio;
 else if(w<1)w=h*ratio;
 else if(w/h>ratio)w=h*ratio;
 else h=w/ratio;
 w=Math.min(w,sx>0?edit.width-1-sel.x0:sel.x0);h=Math.min(h,sy>0?edit.height-1-sel.y0:sel.y0);
 const factor=Math.min(1,w/(h*ratio||1));
 if(factor<1)h=w/ratio;else w=h*ratio;
 sel.x1=sel.x0+sx*Math.round(w);sel.y1=sel.y0+sy*Math.round(h);
}
let strokeFrame=0,strokePending=null,strokeLast=null;
function brushSegment(pt){
 if(!strokeLast){drawBrush(pt);strokeLast=pt;return}
 const dx=pt.x-strokeLast.x,dy=pt.y-strokeLast.y;
 const gap=Math.max(3,Number($('brushSize').value)*.42);
 const steps=Math.min(80,Math.max(1,Math.ceil(Math.hypot(dx,dy)/gap)));
 for(let i=1;i<=steps;i++)drawBrush({x:strokeLast.x+dx*i/steps,y:strokeLast.y+dy*i/steps});
 strokeLast=pt;
}
function flushStroke(){if(strokeFrame){cancelAnimationFrame(strokeFrame);strokeFrame=0}if(strokePending){brushSegment(strokePending);strokePending=null}}
function cropSelectionUpdate(){if(!state.selection)return;const s=state.selection,a={x:Math.min(s.x0,s.x1),y:Math.min(s.y0,s.y1),w:Math.abs(s.x1-s.x0),h:Math.abs(s.y1-s.y0)};const r=edit.getBoundingClientRect(),wr=$('canvasPosition').getBoundingClientRect();const el=$('cropSelection');Object.assign(el.style,{left:(r.left-wr.left+a.x*r.width/edit.width)+'px',top:(r.top-wr.top+a.y*r.height/edit.height)+'px',width:Math.max(2,a.w*r.width/edit.width)+'px',height:Math.max(2,a.h*r.height/edit.height)+'px'});el.hidden=false;$('applyCrop').disabled=a.w<5||a.h<5;$('cancelCrop').disabled=false;syncQuickActions();}
function brushActive(mode){if(!has())return;state.pointer=state.pointer===mode?'':mode;edit.style.cursor=state.pointer?'crosshair':'default';$('brushErase').classList.toggle('selected',state.pointer==='erase');$('brushRestore').classList.toggle('selected',state.pointer==='restore');$('brushDone').disabled=!state.pointer;setStatus(state.pointer==='erase'?'Geser kuas pada area yang ingin dihapus.':state.pointer==='restore'?'Geser kuas untuk mengembalikan bagian dari gambar asli.':'Selesai merapikan.');}
function applyCrop(){if(!has()||!state.selection)return;let s=state.selection,x=Math.min(s.x0,s.x1),y=Math.min(s.y0,s.y1),w=Math.abs(s.x1-s.x0),h=Math.abs(s.y1-s.y0);if(w<5||h<5)return;snapshot();const t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d').drawImage(edit,x,y,w,h,0,0,w,h);redraw(t);setStatus('Gambar berhasil dipotong.','ok');enable()}
function applyResize(){if(!has())return;const w=Number($('imgWidth').value),h=Number($('imgHeight').value);if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>8000||h>8000||w*h>28000000){setStatus('Masukkan ukuran yang benar (maksimal 8.000 px per sisi dan 28 juta piksel).','error');return}snapshot();const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').drawImage(edit,0,0,w,h);redraw(tmp);enable();setStatus(`Ukuran diperbarui menjadi ${w} × ${h} px.`,'ok')}
function applyAdjust(){if(!has())return;const b=Number($('brightness').value),c=Number($('contrast').value),s=Number($('saturation').value);snapshot();const im=ctx.getImageData(0,0,edit.width,edit.height),d=im.data;const contrast=(259*(c*2.55+255))/(255*(259-c*2.55));for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],bl=d[i+2];r=contrast*(r-128)+128+b*2;g=contrast*(g-128)+128+b*2;bl=contrast*(bl-128)+128+b*2;const lum=.2126*r+.7152*g+.0722*bl,f=1+s/100;d[i]=lum+(r-lum)*f;d[i+1]=lum+(g-lum)*f;d[i+2]=lum+(bl-lum)*f;}ctx.putImageData(im,0,0);['brightness','contrast','saturation'].forEach(k=>{$(k).value=0;$(k+'Val').textContent='0'});enable();setStatus('Penyesuaian warna diterapkan.','ok')}
function transform(name){if(!has())return;snapshot();const oldW=edit.width,oldH=edit.height,turn=name==='left'||name==='right';const t=document.createElement('canvas');t.width=turn?oldH:oldW;t.height=turn?oldW:oldH;const c=t.getContext('2d');if(name==='left'){c.translate(0,oldW);c.rotate(-Math.PI/2)}else if(name==='right'){c.translate(oldH,0);c.rotate(Math.PI/2)}else if(name==='h'){c.translate(oldW,0);c.scale(-1,1)}else if(name==='v'){c.translate(0,oldH);c.scale(1,-1)}c.drawImage(edit,0,0);redraw(t);enable();setStatus('Orientasi gambar diperbarui.','ok')}
function undo(){if(!has()||!state.history.length)return;const previous=state.history.pop();redraw(previous);enable();setStatus('Perubahan terakhir dibatalkan.','ok')}
function reset(){if(!has()||!confirm('Kembalikan gambar ke kondisi semula?'))return;snapshot();redraw(source);enable();setStatus('Gambar dikembalikan ke kondisi semula.','ok')}
async function toBlob(can,type,quality){return await new Promise((res,rej)=>can.toBlob(x=>x?res(x):rej(new Error('Gagal menyimpan format gambar.')),type,quality))}
function saveFile(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
async function exportImage(){if(!has())return;state.busy=true;enable();progress(10,'Menyiapkan gambar...');try{const format=$('exportFormat').value,quality=Number($('exportQuality').value)/100;let work=edit;if(format==='image/jpeg'){work=document.createElement('canvas');work.width=edit.width;work.height=edit.height;let x=work.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,work.width,work.height);x.drawImage(edit,0,0)}progress(68,'Menyimpan hasil...');const blob=await toBlob(work,format,quality);let filename=state.file.name.replace(/\.[^.]+$/,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/-PBJtool$/i,'')+'-PBJtool.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[format]||'png');saveFile(blob,filename);progress(100,'File berhasil disiapkan.');setStatus(`File berhasil diunduh: ${filename} (${byteSize(blob.size)}).`,'ok')}catch(e){setStatus('Gagal mengunduh: '+e.message,'error');$('imageProgress').hidden=true}finally{state.busy=false;enable()}}
function liveAdjust(){['brightness','contrast','saturation'].forEach(k=>$(k+'Val').textContent=$(k).value);if(state.mode==='adjust'&&state.hasImage){let b=Number($('brightness').value),c=Number($('contrast').value),s=Number($('saturation').value);edit.style.filter=`brightness(${100+b}%) contrast(${100+c}%) saturate(${100+s}%)`}}
// All edits are applied to the actual canvas; preview filters are never applied while drawing other tools.
function clearPreviewFilter(){edit.style.filter='none';['brightness','contrast','saturation'].forEach(k=>{$(k).value=0;$(k+'Val').textContent='0'})}
function initEvents(){
 document.querySelectorAll('[data-remove-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  const choice=btn.dataset.removeTab;
  document.querySelectorAll('[data-remove-tab]').forEach(x=>{const chosen=x===btn;x.classList.toggle('active',chosen);x.setAttribute('aria-selected',String(chosen))});
  document.querySelectorAll('[data-remove-panel]').forEach(panel=>panel.hidden=panel.dataset.removePanel!==choice);
  state.pointer='';edit.style.cursor='default';
  ['brushErase','brushRestore'].forEach(id=>$(id).classList.remove('selected'));
  $('colorRemove').textContent='Pilih warna dari gambar';
  $('brushDone').disabled=true;
  if(state.hasImage)setStatus(choice==='auto'?'Klik Hapus latar otomatis untuk memproses gambar.':choice==='color'?'Klik Pilih warna, lalu klik latar pada gambar.':'Pilih Hapus atau Pulihkan, lalu usap bagian gambar.');
 }));
 $('quickApply').addEventListener('click',()=>{
  if(!has())return;
  if(state.mode==='crop')applyCrop();
  if(state.mode==='resize')applyResize();
  if(state.mode==='compress')$('applyCompress').click();
  if(state.mode==='adjust'){$('editCanvas').style.filter='none';applyAdjust()}
  if(state.mode==='remove')automaticBackground();
 });
 $('quickCancel').addEventListener('click',clearSelection);
 $('quickDownload').addEventListener('click',exportImage);
 $('expandPreview').addEventListener('click',()=>{
  const expanded=$('canvasStage').closest('.preview-panel').classList.toggle('preview-expanded');
  document.body.classList.toggle('preview-open',expanded);
  $('expandPreview').setAttribute('aria-pressed',String(expanded));
  $('expandPreview').textContent=expanded?'↙ Tutup layar penuh':'⛶ Perbesar';
  if(state.selection)cropSelectionUpdate();
 });
 document.querySelectorAll('[data-crop-ratio]').forEach(btn=>btn.addEventListener('click',()=>{
  state.cropRatio=btn.dataset.cropRatio;
  document.querySelectorAll('[data-crop-ratio]').forEach(x=>{const chosen=x===btn;x.classList.toggle('active',chosen);x.setAttribute('aria-pressed',String(chosen))});
  clearSelection();setStatus('Tarik area pada gambar untuk memotong.');
 }));
 // Load only the small JavaScript module on hover; large background model is loaded on demand.
 $('autoRemove').addEventListener('pointerenter',()=>{if(state.hasImage&&!bgModuleLoading)getBackgroundModule().catch(()=>{})},{once:true});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{clearPreviewFilter();setMode(b.dataset.mode)}));$('imgFile').addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value=''});$('replaceImage').addEventListener('click',()=>$('imgFile').click());const drop=$('dropZone');drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('imgFile').click()}});['dragover','dragenter'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.add('drag-over')}));['dragleave','drop'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.remove('drag-over')}));drop.addEventListener('drop',e=>loadFile(e.dataTransfer.files?.[0]));$('autoRemove').addEventListener('click',automaticBackground);$('colorRemove').addEventListener('click',()=>{state.pointer=state.pointer==='pick'?'':'pick';edit.style.cursor=state.pointer==='pick'?'crosshair':'default';$('colorRemove').textContent=state.pointer==='pick'?'Batalkan pilih warna':'Pilih warna dari gambar';setStatus(state.pointer==='pick'?'Klik latar di dalam gambar untuk menghapus warna yang menyambung.':'Pilih warna latar.');});$('brushErase').addEventListener('click',()=>brushActive('erase'));$('brushRestore').addEventListener('click',()=>brushActive('restore'));$('brushDone').addEventListener('click',()=>brushActive(state.pointer));$('tolerance').addEventListener('input',()=>{$('toleranceVal').textContent=$('tolerance').value});$('brushSize').addEventListener('input',()=>{$('brushVal').textContent=$('brushSize').value});edit.addEventListener('pointerdown',e=>{if(!has()||state.previewOriginal)return;const pt=imagePoint(e);if(state.mode==='crop'){state.selection={x0:pt.x,y0:pt.y,x1:pt.x,y1:pt.y};state.dragging=true;edit.setPointerCapture(e.pointerId);cropSelectionUpdate();e.preventDefault();return}if(state.mode==='remove'&&state.pointer==='pick'){colorErase(pt);return}if(state.mode==='remove'&&['erase','restore'].includes(state.pointer)){snapshot();state.dragging=true;strokeLast=null;strokePending=null;edit.setPointerCapture(e.pointerId);brushSegment(pt);e.preventDefault()}});edit.addEventListener('pointermove',e=>{if(!state.dragging||!has())return;const pt=imagePoint(e);if(state.mode==='crop'&&state.selection){updateCropTarget(pt);cropSelectionUpdate()}else if(state.mode==='remove'&&['erase','restore'].includes(state.pointer)){strokePending=pt;if(!strokeFrame)strokeFrame=requestAnimationFrame(()=>{strokeFrame=0;if(strokePending){brushSegment(strokePending);strokePending=null}})}});const end=()=>{flushStroke();strokeLast=null;state.dragging=false;enable()};edit.addEventListener('pointerup',end);edit.addEventListener('pointercancel',end);$('applyCrop').addEventListener('click',applyCrop);$('cancelCrop').addEventListener('click',clearSelection);$('lockRatio').addEventListener('change',()=>state.ratio=edit.width/edit.height||1);$('imgWidth').addEventListener('input',()=>{if($('lockRatio').checked&&state.ratio&&Number($('imgWidth').value)>0)$('imgHeight').value=Math.max(1,Math.round(Number($('imgWidth').value)/state.ratio))});$('imgHeight').addEventListener('input',()=>{if($('lockRatio').checked&&state.ratio&&Number($('imgHeight').value)>0)$('imgWidth').value=Math.max(1,Math.round(Number($('imgHeight').value)*state.ratio))});$('applyResize').addEventListener('click',applyResize);$('compressQuality').addEventListener('input',()=>{$('compressQualityVal').textContent=$('compressQuality').value+'%'});$('applyCompress').addEventListener('click',()=>{$('exportFormat').value=$('compressFormat').value;$('exportQuality').value=$('compressQuality').value;$('exportQualityVal').textContent=$('exportQuality').value+'%';setStatus('Format dan kualitas ekspor sudah diterapkan. Klik “Unduh Hasil”.','ok')});['brightness','contrast','saturation'].forEach(id=>$(id).addEventListener('input',liveAdjust));$('applyAdjust').addEventListener('click',()=>{edit.style.filter='none';applyAdjust()});[['rotateLeft','left'],['rotateRight','right'],['flipH','h'],['flipV','v']].forEach(([k,v])=>$(k).addEventListener('click',()=>transform(v)));$('undoBtn').addEventListener('click',undo);$('resetBtn').addEventListener('click',reset);$('viewOriginal').addEventListener('click',()=>{if(!has())return;state.previewOriginal=!state.previewOriginal;$('originalOverlay').hidden=!state.previewOriginal;$('viewOriginal').textContent=state.previewOriginal?'Lihat hasil edit':'Bandingkan asli'});document.querySelectorAll('[data-bg]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-bg]').forEach(x=>x.classList.toggle('selected',x===btn));stage.classList.toggle('bg-white',btn.dataset.bg==='white');stage.classList.toggle('bg-dark',btn.dataset.bg==='dark')}));$('exportQuality').addEventListener('input',()=>{$('exportQualityVal').textContent=$('exportQuality').value+'%'});$('downloadImage').addEventListener('click',exportImage);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('preview-open')){$('expandPreview').click();return}if(e.key==='Escape'&&state.mode==='crop'&&state.selection){clearSelection();return}if(e.key==='Enter'&&state.mode==='crop'&&state.selection&&has()&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();applyCrop();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&state.hasImage&&!state.busy&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();undo()}})}
initEvents();setMode('remove');
})();
