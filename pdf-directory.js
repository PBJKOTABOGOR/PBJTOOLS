/* Katalog PDF Tools · filter tidak memuat berkas, tidak mengirim data. */
(()=>{'use strict';
const search=document.getElementById('toolSearch');const sections=[...document.querySelectorAll('.tool-section')];const buttons=[...document.querySelectorAll('.tool-filters button')];let current='all';
function filterTools(){const query=(search.value||'').trim().toLocaleLowerCase('id-ID');let total=0;for(const section of sections){let count=0;for(const tool of section.querySelectorAll('.tool-card')){const ready=!tool.classList.contains('upcoming');const matchGroup=current==='all'||(current==='ready'?ready:section.dataset.group===current);const matchText=tool.textContent.toLocaleLowerCase('id-ID').includes(query);const visible=matchGroup&&matchText;tool.hidden=!visible;if(visible)count++}section.hidden=!count;total+=count;}document.getElementById('noToolsFound').hidden=total>0;}
search?.addEventListener('input',filterTools);
buttons.forEach(button=>button.addEventListener('click',()=>{current=button.dataset.toolFilter;buttons.forEach(b=>b.classList.toggle('active',b===button));filterTools()}));
document.querySelectorAll('[data-upcoming]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.upcoming;if(backendModes.has(mode)){openBackend(mode);return}const label=button.querySelector('strong')?.textContent||'Fitur';showInfo(label,'Alat ini belum tersedia di PBJTOOLS. Tidak ada berkas yang diproses.')}));

// Konversi yang tersedia lewat Apps Script sesudah pengguna memasang URL Web App.
const backendModes=new Set(['wordpdf','excelpdf','pptpdf','pdfword']);
const backendUrl=()=>String(window.PBJTOOLS_DRIVE_WEBAPP_URL||'').trim();
function openBackend(mode){
 const url=backendUrl();
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(url)){
   showInfo('Konversi lewat Drive', 'Sambungan Google Apps Script belum dipasang. Buka PANDUAN_DRIVE.md di paket PBJTOOLS dan ikuti langkah deployment.');
   return;
 }
 const u=new URL(url);u.searchParams.set('mode',mode);window.open(u.toString(),'_blank','noopener,noreferrer');
}
function showInfo(title,desc){const el=document.getElementById('toolInfoModal');el.hidden=false;el.querySelector('[data-info-name]').textContent=title;el.querySelector('p').textContent=desc;document.body.style.overflow='hidden'}

const modal=document.createElement('div');modal.id='toolInfoModal';modal.className='modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML='<div class="modal-backdrop" data-close-tool-info></div><div class="modal-card" style="max-width:450px"><button class="modal-close icon-button" aria-label="Tutup" data-close-tool-info>×</button><div class="modal-mark">ⓘ</div><h2 data-info-name>Fitur</h2><p>Layanan ini memerlukan proses tambahan di server atau mesin konversi khusus, sehingga belum tersedia pada PBJTOOLS versi browser ini. Tidak ada berkas yang diunggah atau diubah.</p><button class="btn btn-primary" data-close-tool-info style="margin-top:18px">Kembali ke daftar</button></div>';
document.body.appendChild(modal);
modal.addEventListener('click',e=>{if(e.target.closest('[data-close-tool-info]')){modal.hidden=true;document.body.style.overflow=''}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){modal.hidden=true;document.body.style.overflow=''}});
filterTools();
})();
