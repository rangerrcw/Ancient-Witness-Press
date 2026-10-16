(()=>{
'use strict';
const $=id=>document.getElementById(id), list=$('results'),detail=$('detail'),q=$('q'),stage=$('stage'),count=$('count');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[ʿʾ‘’'`]/g,'').toLocaleLowerCase('en');
const publicStage=s=>String(s||'').replace(/Corrected\s+Checkpoint\s+(\d+)/gi,'Checkpoint $1').replace(/(?:CP|Checkpoint)011\s+Imported Baseline/gi,'Checkpoint 011').replace(/\b(?:Corrected|Fixed|Revised)\s+(?=Checkpoint)/gi,'');
const publicSource=s=>publicStage(String(s||'').replace(/\s*·\s*Original DOCX SHA-256:.*$/i,'').replace(/^Source:\s*/i,''));
const cmp=(a,b)=>norm(a).localeCompare(norm(b),'en',{numeric:true});
let groups=[],chosen='';
function parse(r){
 const out={arabic:[],root:[],definition:[],references:[],status:[]};
 for(const p of r.paragraphs||[]){
  const s=p.trim();if(!s)continue;
  if(/^Arabic\s*:/i.test(s))out.arabic.push(s.replace(/^Arabic\s*:\s*/i,''));
  else if(/^Definition status\s*:/i.test(s)||/^Status\s*:/i.test(s))out.status.push(s.replace(/^(Definition status|Status)\s*:\s*/i,''));
  else if(/^Occurrences currently controlling entry\s*:/i.test(s))out.references.push(s.replace(/^Occurrences currently controlling entry\s*:\s*/i,''));
  else if(/^Root\s*:/i.test(s)){
   const match=s.match(/^Root\s*:\s*([^\.]+)\.\s*(.*)$/i);
   if(match){out.root.push(match[1]);if(match[2])out.definition.push(match[2]);}
   else out.root.push(s.replace(/^Root\s*:\s*/i,''));
  }else out.definition.push(s);
 }
 // Recover explicitly written inline Arabic/reference fields without changing
 // the original definition paragraph or inferring a root/status.
 for(const text of r.paragraphs||[]){
  const parts=text.split(' — ');
  if(!out.arabic.length&&parts.length>=3&&/[\u0621-\u064A]/.test(parts[1])&&!/[A-Za-z]/.test(parts[1]))out.arabic.push(parts[1].trim());
  if(!out.references.length&&(/^[0-9]+:[0-9]+/.test(text)||text.startsWith(r.term+' — '))){
   const refs=text.match(/\b[0-9]+:[0-9]+(?:[-–][0-9]+)?/g)||[];
   out.references.push(...refs);
  }
 }
 return out;
}
function section(r){
 const p=parse(r), para=(label,arr)=>arr.length?`<p><strong>${label}:</strong> ${arr.map(escape).join('<br>')}</p>`:'';
 const rawDef=p.definition.join(' ').trim();
 // A short meaning is extracted from the original wording, not added as a new interpretation.
 const shortMeaning=rawDef.includes(';')?rawDef.split(';')[0].trim():rawDef;
 const sourceDoc=r.original||(r.stage.includes('Master Block 001')?'/original-documents/master-block-001-dictionary.docx':r.stage.includes('Checkpoint 010')?'/original-documents/checkpoint-010-dictionary.docx':r.stage.includes('CP011')?'/original-documents/cp011-dictionary.docx':'/archive-navigation.html');
 const root=p.root.length?p.root:['Not given in this source entry.'];
 const meaning=shortMeaning?[shortMeaning]:['Not given in this source entry.'];
 const definition=p.definition.length?p.definition:['Not given in this source entry.'];
 const references=p.references.length?p.references:['Not given in this source entry.'];
 return `<section class="dict-source">`+
 `<h4>${escape(r.term)}${p.arabic.length?' — '+p.arabic.map(escape).join(' / '):''}</h4>`+
 para('Meaning',meaning)+
 para('Arabic Root',root)+
 para('Research Definition',definition)+
 para('Qur’an References',references)+
 `<p><strong>Original Research Document:</strong> <a href="${sourceDoc}" download>View / Download</a></p>`+
 `<p class="definition-status"><strong>Definition Status:</strong> ${p.status.length?p.status.map(escape).join('; '):'Not separately specified in this source entry.'}</p>`+
 '</section>';
}
function show(g){
 chosen=g.name;detail.innerHTML=(g.items.length>1?`<h2>${escape(g.name)}</h2>`:'')+
 g.items.map(section).join('');
 for(const b of list.querySelectorAll('button'))b.classList.toggle('active',b.dataset.key===g.name);
 history.replaceState(null,'','#'+encodeURIComponent(g.name));
}
function render(){
 const query=norm(q.value.trim()),filterStage=stage.value;
 const visible=groups.filter(g=>g.items.some(r=>(!filterStage||r.stage===filterStage)&&(!query||norm([g.name,r.stage,r.source,...r.paragraphs].join(' ')).includes(query))));
 list.replaceChildren();for(const g of visible){const b=document.createElement('button');b.className='item';b.dataset.key=g.name;b.innerHTML=`${escape(g.name)}<small>${g.items.length} source ${g.items.length===1?'entry':'entries'}</small>`;b.onclick=()=>show(g);list.appendChild(b)}
 count.textContent=visible.length+' terms (A–Z)';
 if(!visible.length){detail.innerHTML='<p>No matching dictionary terms.</p>';return}
 const active=visible.find(g=>g.name===chosen)||visible[0];show(active);
}
fetch('/data/navigation-dictionary.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
 const by=new Map();for(const r of data){const k=norm(r.term).replace(/\s+/g,' ').trim();if(!by.has(k))by.set(k,{name:r.term,items:[]});by.get(k).items.push(r)}
 groups=[...by.values()].sort((a,b)=>cmp(a.name,b.name));
 for(const s of [...new Set(data.map(r=>r.stage))]){const o=document.createElement('option');o.value=s;o.textContent=publicStage(s);stage.append(o)}
 q.addEventListener('input',render);stage.addEventListener('change',render);
 const hash=decodeURIComponent(location.hash.slice(1));const selected=groups.find(g=>norm(g.name)===norm(hash));chosen=selected?.name||'';render();
}).catch(e=>detail.textContent='Could not load dictionary index: '+e.message);
})();
