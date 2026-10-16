(()=>{'use strict';
const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=$('#surah-select'),status=$('#status'),box=$('#research');
let activePassageListeners=null;
const names=['Al-Fātiḥah','Al-Baqarah','Āl ʿImrān','An-Nisāʾ','Al-Māʾidah','Al-Anʿām','Al-Aʿrāf','Al-Anfāl','At-Tawbah','Yūnus','Hūd','Yūsuf'];
for(let i=1;i<=12;i++)select.insertAdjacentHTML('beforeend',`<option value="${i}">${i}. ${E(names[i-1])}</option>`);
function bible(f,keys){let b=f.bible||{},ps=b.passages||[];if(keys?.length)ps=ps.filter(p=>keys.includes(p.key));if(!ps.length)return '<p>No Bible passage text linked to this record in the original export.</p>';return `<section class="bible"><h3>King James Version | Berean Standard Bible</h3><p class="small">${E(b.note)}</p><p class="small">${E(b.attribution)}</p>${ps.map(p=>`<div class="passage"><h4>${E(p.label)}</h4><div class="bible-grid">${(b.translations||[]).map(t=>`<div><strong>${E(t.name)}</strong><p class="small">${E(t.rights)}</p>${(p.verses?.[t.id]||[]).map(v=>`${v.superscription?`<p class="small"><em>${E(v.superscription)}</em></p>`:''}<p><sup>${E(v.verse)}</sup> ${E(v.text)}</p>${(v.displayCorrections||[]).map(c=>`<details class="small"><summary>Translation source and preserved reading</summary><p><strong>Previous imported reading:</strong> ${E(c.previousText)}</p><p><a href="${E(c.source)}" target="_blank" rel="noopener">${E(c.sourceEdition)}</a></p></details>`).join('')}`).join('')}</div>`).join('')}</div>${(p.editionNotes||[]).map(note=>`<p class="small">${E(note.text)} <a href="${E(note.sourceUrl)}" target="_blank" rel="noopener">Publisher’s edition note</a></p>`).join('')}</div>`).join('')}</section>`}
function quran(v){return `<article class="verse" id="v-${v.verse}"><h3>Qur’an ${v.surah}:${v.verse}</h3><p class="arabic" lang="ar" dir="rtl">${E(v.arabic)}</p><p class="translation"><strong>Talal Itani</strong><br>${E(v.itani)}</p><p class="translation"><strong>Pickthall</strong><br>${E(v.pickthall)}</p></article>`}
function recordBody(r,f){let links=(r.packetIds||[]).map(id=>`<a href="#packet-${encodeURIComponent(id)}">${E(id)}</a>`).join(', ');return `<p class="small">${E(r.verse)} · ${E(r.kind)}${r.open?' · OPEN':''}</p>${r.registerNote?`<p>${E(r.registerNote)}</p>`:''}${r.bodyParagraphs?.length?`<section><h4>Original research text</h4>${r.bodyParagraphs.map(p=>`<p class="research-text">${E(p)}</p>`).join('')}</section>`:''}${(r.fields||[]).map(x=>`<div class="field"><strong>${E(x.label)}</strong><div class="research-text">${E(x.value)}</div></div>`).join('')}${r.originalWorkbookFields?`<details><summary>Original source workbook fields</summary>${Object.entries(r.originalWorkbookFields).map(([k,v])=>`<p><strong>${E(k)}</strong>: ${E(v===null?'':v)}</p>`).join('')}</details>`:''}${r.originalBuild4Fields?`<details><summary>Original Build4 register fields</summary>${Object.entries(r.originalBuild4Fields).map(([k,v])=>`<p><strong>${E(k)}</strong>: ${E(v===null?'':v)}</p>`).join('')}</details>`:''}${r.bibleKeys?.length?bible(f,r.bibleKeys):''}${r.bibleGap?`<p>${E(r.bibleGap)}</p>`:''}${links?`<p>Related complete research packets: ${links}</p>`:''}${r.original?`<p><a href="${E(r.original)}" download>Download unchanged original source</a></p>`:''}<div class="source"><p>Source archive: ${E(r.source?.archive)}<br>Archive SHA-256: ${E(r.source?.archiveSha256)}<br>Source file: ${E(r.source?.path)}<br>File SHA-256: ${E(r.source?.sha256)}</p></div>`}
function covers(s,n,v){if(!s)return false;let x=s.replace(/[–—]/g,'-');for(const m of x.matchAll(/(\d+):(\d+)(?:\s*-\s*(?:(\d+):)?(\d+))?/g)){let sur=+m[1],start=+m[2],end=m[4]?+m[4]:start,endsur=m[3]?+m[3]:sur;if(n===sur&&n===endsur&&v>=start&&v<=end)return true;if(n===sur&&n<endsur&&v>=start)return true;if(n===endsur&&n>sur&&v<=end)return true;}return false}
function isSingleVerseReference(ref,n,v){let x=String(ref||'').replace(/[–—]/g,'-').trim();let m=x.match(/^(?:Q\s*)?(\d+):(\d+)$/);return !!m&&+m[1]===n&&+m[2]===v;}
function passageRangeSort(a,b){
 const parse=value=>{let m=String(value).replace(/[–—]/g,'-').match(/(?:^|[^\d])(\d+):(\d+)(?:\s*-\s*(?:(\d+):)?(\d+))?/);if(!m)return [99999,99999,99999];return [+m[1],+m[2],m[4]?+m[4]:+m[2]]};
 const x=parse(a),y=parse(b);return x[0]-y[0]||x[1]-y[1]||y[2]-x[2]||String(a).localeCompare(String(b));
}
// Display-only canonicalization: leave the authoritative JSON and original record references untouched.
function canonicalQuranReference(ref){
 return String(ref||'').normalize('NFKC').replace(/[–—−‑‒]/g,'-').replace(/\bQur[’']?an\s+/gi,'').replace(/^\s*Q\s+(?=\d)/i,'').replace(/\s*;\s*/g,'; ').replace(/\s*,\s*/g,', ').replace(/\s*-\s*/g,'–').replace(/\s+/g,' ').trim();
}
function canonicalBibleReference(ref){return String(ref||'').normalize('NFKC').replace(/[–—−‑‒]/g,'-').replace(/\s*-\s*/g,'–').replace(/\s+/g,' ').trim().toLowerCase();}
function isPassageWideRecord(r){
 if(!(r.bibleKeys||[]).length||!/\d+:\d+/.test(r.verse||''))return false;
 const c=canonicalQuranReference(r.verse);
 return !/^\d+:\d+$/.test(c);
}
function page(host,items,chunk,make){let pos=0;host.replaceChildren();let content=document.createElement('div'),button=document.createElement('button');button.type='button';button.className='more';host.append(content,button);function add(){let part=items.slice(pos,pos+chunk);content.insertAdjacentHTML('beforeend',part.map(make).join(''));pos+=part.length;button.textContent=`Show more (${pos} of ${items.length} displayed)`;button.hidden=pos>=items.length;}button.addEventListener('click',add);if(items.length)add();else button.hidden=true;}
async function load(){if(activePassageListeners)activePassageListeners.abort();activePassageListeners=new AbortController();const passageSignal=activePassageListeners.signal;let n=+select.value;status.textContent='Loading original research data…';box.replaceChildren();try{let res=await fetch(`/data/surah-${String(n).padStart(2,'0')}.json`);if(!res.ok)throw Error(`HTTP ${res.status}`);let f=await res.json(),vs=f.quran.verses||[],rs=f.records||[],ps=f.packets||[],bp=f.bible?.passages||[];status.innerHTML=`<p class="notice"><strong>${E(f.surah)}. ${E(f.name)}</strong> — ${vs.length} Qur’an verses, ${rs.length} research records, ${ps.length} full research packets, ${bp.length} Bible comparison passages. Research state: ${E(f.researchState)}. Original source metadata preserved.</p>`;
box.innerHTML=`<section class="attribution small">${E(f.quran.itani.credit)} ${E(f.quran.itani.edition)}. ${E(f.quran.itani.license)} Pickthall: ${E(f.quran.pickthall.name)} (${E(f.quran.pickthall.year)}), ${E(f.quran.pickthall.rights)}.</section><div class="filter"><label>Show verse <select id="verse-filter"><option value="all">All verses (verse-linked)</option>${vs.map(v=>`<option value="${v.verse}">${v.surah}:${v.verse}</option>`).join('')}</select></label> <label>Find research ID or title <input id="record-search" type="search" placeholder="QDISC, QB, subject…"></label></div><section><h2>Original Qur’an — Arabic, with English translations by Talal Itani and Pickthall</h2><div class="verse-nav"><button type="button" id="prev-verse">← Previous verse</button> <span id="verse-position"></span> <button type="button" id="next-verse">Next verse →</button></div><div id="verses"></div></section><section><h2>Biblical passages linked to this Qur’an verse</h2><div id="bible-all"></div></section><section><h2>ChatGPT discoveries linked to this verse</h2><div id="chatgpt-records"></div><h2>Grok discoveries linked to this verse</h2><div id="grok-records"></div></section><section><h2>Complete Grok research packets covering this verse</h2><p>Full original research text is displayed when a packet is opened.</p><div id="packets"></div></section>`;
function linkedFor(v,term){return rs.filter(r=>covers(r.verse,n,v)&&(!term||`${r.id} ${r.title} ${r.verse}`.toLowerCase().includes(term)))}
function lazyRecord(r){return `<details class="record" id="${E(r.slug)}"><summary>${E(r.id)} — ${E(r.title)} (${E(r.verse)})</summary><div class="lazy-record" data-record="${rs.indexOf(r)}"></div></details>`}
function lazyPacket(p,v){return `<details class="packet" id="packet-${E(p.id)}"><summary>${E(p.title||`${f.surah}:${p.verseStart}–${p.verseEnd}`)} — covers ${v}</summary><div class="lazy-packet" data-packet="${ps.indexOf(p)}"></div></details>`}
function lazyBible(p){return `<details class="passage"><summary>${E(p.label)} — linked research comparison</summary><div class="lazy-bible" data-bible-key="${E(p.key)}" data-bible="${bp.indexOf(p)}"></div></details>`}
// Stable, per-surah anchors for grouped passage-wide comparisons.
function passageGroups(term){
 const groups=new Map();
 for(const r of rs.filter(r=>isPassageWideRecord(r)&&(!term||`${r.id} ${r.title} ${r.verse}`.toLowerCase().includes(term)))){
  const range=canonicalQuranReference(r.verse);
  if(!groups.has(range))groups.set(range,new Map());
  for(const key of r.bibleKeys||[]){const p=bp.find(item=>item.key===key);if(p){const identity=canonicalBibleReference(p.label);if(!groups.get(range).has(identity))groups.get(range).set(identity,p);}}
 }
 return [...groups].sort((a,b)=>passageRangeSort(a[0],b[0]));
}
function passageAnchor(range,groups){let i=groups.findIndex(([key])=>key===range);return i<0?'':`passage-comparison-${n}-${i+1}`;}
function linkedSection(verse,term){
 let v=verse.verse,linked=linkedFor(v,term),keys=new Set(linked.filter(r=>isSingleVerseReference(r.verse,n,v)).flatMap(r=>r.bibleKeys||[]));
 let matched=bp.filter(p=>keys.has(p.key));
 // Passage-wide comparisons appear after the Quran verses, never above them.
 let groups=passageGroups(term);
 let wideRanges=groups.map(([range])=>range).filter(range=>rs.some(r=>isPassageWideRecord(r)&&canonicalQuranReference(r.verse)===range&&covers(r.verse,n,v)));
 let wideNotice=wideRanges.length?`<p class="small passage-reference">See passage-wide biblical comparisons below for Qur’an ${wideRanges.map(range=>`<a href="#${passageAnchor(range,groups)}">${E(range)}</a>`).join('; ')}.</p>`:'';
 let packets=ps.filter(p=>v>=p.verseStart&&v<=p.verseEnd);
 let section=(title,items,make,empty)=>`<section class="verse-related"><h4>${title} (${items.length})</h4>${items.length?items.map(make).join(''):`<p class="small">${empty}</p>`}</section>`;
 return `<div class="verse-block">${quran(verse)}${matched.length?section('Verse-specific biblical passages',matched,lazyBible,''):''}${wideNotice}${linked.some(r=>r.namespace==='chatgpt')?section('ChatGPT discoveries',linked.filter(r=>r.namespace==='chatgpt'),lazyRecord,''):''}${linked.some(r=>r.namespace==='grok')?section('Grok discoveries',linked.filter(r=>r.namespace==='grok'),lazyRecord,''):''}${section('Complete Grok research packets',packets,p=>lazyPacket(p,v),'No research packet covers this verse.')}</div>`;
}
let allRendered=0;
function passageWideComparisons(term, selectedVerse=null){
 const groups=passageGroups(term).filter(([range])=>selectedVerse===null || rs.some(r=>isPassageWideRecord(r)&&canonicalQuranReference(r.verse)===range&&covers(r.verse,n,selectedVerse)));
 if(!groups.length)return '';
 return `<section class="passage-wide"><h2>Passage-wide biblical comparisons</h2><p class="small">These comparisons follow the Qur’an verses, grouped by Qur’an passage reference. Duplicate Bible passage labels appear once per group; all original research records, references and classifications remain unchanged.</p>${groups.map(([range,items])=>`<section class="verse-related" id="${passageAnchor(range,groups)}"><h3>${/^(?:Q\s*)?\d+:/.test(String(range))?'Qur’an passage reference':'Original source reference'}: ${E(range)}</h3>${[...items.values()].map(lazyBible).join('')}</section>`).join('')}</section>`;
}

// Return navigation is attached to the exact Qur'an verse the reader came from.
// No original records, passage keys, or source JSON are modified.
function jumpToComparison(link,origin){
 const target=document.getElementById(link.getAttribute('href').slice(1));
 if(!target||!origin)return;
 let back=target.querySelector(':scope > .return-to-verse');
 if(!back){
  back=document.createElement('button');back.type='button';back.className='return-to-verse';
  target.insertBefore(back,target.firstChild);
 }
 const verseHeading=origin.querySelector('h3')?.textContent||'Qur’an verse';
 back.textContent=`← Back to ${verseHeading}`;
 back.onclick=()=>{origin.scrollIntoView({behavior:'auto',block:'start'});origin.focus({preventScroll:true});};
 // Move keyboard focus to the return control for accessible round-trip navigation.
 target.scrollIntoView({behavior:'auto',block:'start'});
 back.focus({preventScroll:true});
}
function surahAtlas(term){const items=rs.filter(r=>!vs.some(v=>covers(r.verse,n,v.verse))&&(!term||`${r.id} ${r.title}`.toLowerCase().includes(term)));return items.length?`<section><h2>Surah comparison atlas</h2>${items.map(lazyRecord).join('')}</section>`:'';}
function draw(){
 let selected=$('#verse-filter').value,term=$('#record-search').value.trim().toLowerCase();
 let all=selected==='all';
 let nav=$('.verse-nav');nav.hidden=all;
 for(let id of ['bible-all','chatgpt-records','grok-records','packets']){
   let el=$('#'+id);el.parentElement.hidden=all;
 }
 let host=$('#verses');
 if(all){
   host.onclick=null;host.replaceChildren();allRendered=0;
   let list=document.createElement('div'),button=document.createElement('button');button.type='button';button.className='more';host.append(list,button);
   const wide=document.createElement('div');host.append(wide);
   function add(){let batch=vs.slice(allRendered,allRendered+8);list.insertAdjacentHTML('beforeend',batch.map(v=>linkedSection(v,term)).join(''));allRendered+=batch.length;button.textContent=`Show next verses (${allRendered} of ${vs.length} displayed)`;button.hidden=allRendered>=vs.length;if(term||allRendered>=vs.length)wide.innerHTML=(allRendered>=vs.length?passageWideComparisons(term):'')+surahAtlas(term);}
   button.addEventListener('click',add);
   // A passage link loads the remaining verses first, so comparisons always follow every Qur'an verse.
   list.addEventListener('click',event=>{const link=event.target.closest('a[href^="#passage-comparison-"]');if(!link)return;event.preventDefault();const origin=link.closest('.verse-block')?.querySelector('.verse');if(!origin)return;while(allRendered<vs.length)add();jumpToComparison(link,origin);});
   add();return;
 }
 let v=+selected||vs[0]?.verse||1,verse=vs.find(x=>x.verse===v);
 let linked=linkedFor(v,term),keys=new Set(linked.flatMap(r=>r.bibleKeys||[]));
 let matched=bp.filter(p=>keys.has(p.key));
 let relatedPackets=ps.filter(p=>v>=p.verseStart&&v<=p.verseEnd);
 host.innerHTML=verse?`${quran(verse)}${passageWideComparisons(term,v)}`:'<p>Verse unavailable.</p>';
 host.onclick=event=>{const link=event.target.closest('a[href^="#passage-comparison-"]');if(!link)return;event.preventDefault();const origin=host.querySelector('.verse');jumpToComparison(link,origin);};
 $('#bible-all').innerHTML=matched.length?matched.map(lazyBible).join(''):'<p>No full Bible passage in the original export is directly keyed to research for this verse. No comparison has been invented.</p>';
 for(let ns of ['chatgpt','grok'])page($(`#${ns}-records`),linked.filter(r=>r.namespace===ns),12,lazyRecord);
 page($('#packets'),relatedPackets,5,p=>lazyPacket(p,v));
 $('#verse-position').textContent=`Verse ${v} of ${vs.length} · ${linked.length} linked discoveries · ${matched.length} linked Bible passages`;
 $('#prev-verse').disabled=v<=1;$('#next-verse').disabled=v>=vs.length;
}
// Populate passage contents on an explicit click as well as the native toggle event.
// This also works for keyboard activation and browsers with different toggle timing.
function populateExpandedDetails(el){
 if(!el || !el.open)return;
 const child=el.querySelector('.lazy-record,.lazy-packet,.lazy-bible');
 if(!child || child.dataset.loaded)return;
 try{
  let html='';
  if(child.classList.contains('lazy-record')){
   const r=rs[Number(child.dataset.record)];html=r?recordBody(r,f):'<p class="error">Research record unavailable.</p>';
  }else if(child.classList.contains('lazy-packet')){
   const p=ps[Number(child.dataset.packet)];html=p?`<p class="small">${E(p.path)} · SHA-256: ${E(p.sha256)}</p>${(p.paragraphs||[]).map(s=>`<p class="research-text">${E(s)}</p>`).join('')}${p.original?`<p><a href="${E(p.original)}" download>Download unchanged original research packet</a></p>`:''}`:'<p class="error">Research packet unavailable.</p>';
  }else{
   const key=child.dataset.bibleKey;
   const p=bp.find(item=>item.key===key) || bp[Number(child.dataset.bible)];
   html=p?bible({...f,bible:{...f.bible,passages:[p]}}):'<p class="error">Biblical passage text is not included in this research export.</p>';
  }
  child.innerHTML=html;
  child.dataset.loaded='1';
 }catch(err){child.innerHTML=`<p class="error">Unable to display this passage: ${E(err.message)}</p>`;}
}
box.addEventListener('toggle',e=>{
 const el=e.target;if(el instanceof HTMLDetailsElement)populateExpandedDetails(el);
},{capture:true,signal:passageSignal});
box.addEventListener('click',e=>{
 const summary=e.target.closest('summary');
 if(!summary||!box.contains(summary))return;
 const details=summary.parentElement;
 if(!(details instanceof HTMLDetailsElement))return;
 // The native click changes the open state after the click handler.
 queueMicrotask(()=>{if(!passageSignal.aborted)populateExpandedDetails(details)});
},{signal:passageSignal});
box.addEventListener('keydown',e=>{
 if(e.key!=='Enter'&&e.key!==' ')return;
 const summary=e.target.closest('summary');
 if(!summary||!box.contains(summary))return;
 const details=summary.parentElement;
 if(details instanceof HTMLDetailsElement)setTimeout(()=>{if(!passageSignal.aborted)populateExpandedDetails(details)},0);
},{signal:passageSignal});
$('#verse-filter').addEventListener('change',draw);$('#prev-verse').addEventListener('click',()=>{let f=$('#verse-filter');f.value=String(Math.max(1,(+f.value||1)-1));draw()});$('#next-verse').addEventListener('click',()=>{let f=$('#verse-filter');f.value=String(Math.min(vs.length,(+f.value||1)+1));draw()});$('#record-search').addEventListener('input',draw);draw();let hash=decodeURIComponent(location.hash.slice(1));if(hash){let t=document.getElementById(hash);if(t){t.open=true;t.scrollIntoView()}}
}catch(e){status.innerHTML=`<p class="error">Unable to load: ${E(e.message)}</p>`}}
select.addEventListener('change',()=>{history.replaceState(null,'',`/reader.html?surah=${select.value}`);load()});let p=new URLSearchParams(location.search),n=+p.get('surah');if(n>=1&&n<=12)select.value=String(n);load();
})();
