const enc=new TextEncoder();
const SYNTHETIC_PAYLOAD=enc.encode("OpenEdit Vault synthetic evidence: EV-204-017 | FIR 204/2026 | bank_transfer_report.pdf | captured 2026-08-14T10:42:18Z");
let originalBytes=SYNTHETIC_PAYLOAD.slice();
let originalHash="";
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function sha256(bytes){return hex(await crypto.subtle.digest("SHA-256",bytes));}
function short(h){return h.slice(0,18)+"…"+h.slice(-18)}

async function init(){
  originalHash=await sha256(originalBytes);
  $("#storedHash").textContent=originalHash;
  $("#originalHash").textContent=originalHash;
  buildTimeline();
  $("#chainResult").textContent="Chain not verified yet. Click “Verify chain” to run the browser-side check.";
}

$("#fileInput").addEventListener("change",async e=>{
 const file=e.target.files?.[0]; if(!file)return;
 const bytes=new Uint8Array(await file.arrayBuffer()); const hash=await sha256(bytes);
 $("#fileResult").classList.remove("hidden");
 $("#fileResult").innerHTML='<strong>'+escapeHtml(file.name)+'</strong><span class="muted">'+file.size.toLocaleString()+' bytes • SHA-256: </span><code>'+hash+'</code>';
 $("#compareHash").value=hash;
 $("#compareResult").classList.add("hidden");
});
$("#compareBtn").addEventListener("click",()=>{
 const expected=$("#compareHash").value.trim().toLowerCase(); const actual=$("#fileResult code")?.textContent?.trim().toLowerCase();
 if(!actual||!expected){showCompare("Choose a file and enter/confirm an expected hash first.","mismatch");return}
 showCompare(actual===expected?"MATCH — computed hash equals expected hash.":"MISMATCH — computed hash differs from expected hash.",actual===expected?"match":"mismatch");
});
function showCompare(t,c){const el=$("#compareResult");el.className="compare-result "+c;el.textContent=t;el.classList.remove("hidden")}

$("#copyHash").addEventListener("click",async()=>{await navigator.clipboard?.writeText(originalHash);$("#copyHash").textContent="✓";setTimeout(()=>$("#copyHash").textContent="⧉",1000)});
$("#tamperBtn").addEventListener("click",async()=>{
 const mutated=originalBytes.slice(); mutated[mutated.length-1]^=1;
 const h=await sha256(mutated); $("#tamperedHash").textContent=h; $("#tamperState").textContent="INTEGRITY FAILED — bytes changed"; $("#integrityPill").textContent="INTEGRITY FAILED"; $("#integrityPill").className="pill"; $("#integrityPill").style.cssText="background:#32131b;color:#fb7185;border:1px solid #713040";
});
$("#resetTamper").addEventListener("click",()=>{$("#tamperedHash").textContent="";$("#tamperState").textContent="Not simulated";$("#integrityPill").textContent="INTEGRITY VERIFIED";$("#integrityPill").className="pill success";$("#integrityPill").style.cssText=""});

const baseEvents=[
 {actor:"Seizing Officer • CCPS-07",time:"2026-08-14 10:42:18Z",action:"Evidence captured and registered"},
 {actor:"Forensic Analyst • FWS-07",time:"2026-08-14 11:16:42Z",action:"Integrity hash recorded"},
 {actor:"Investigating Officer • IO-21",time:"2026-08-14 13:05:09Z",action:"Evidence review logged"},
 {actor:"Forensic Analyst • FWS-07",time:"2026-08-15 09:12:31Z",action:"Verification checkpoint recorded"}
];
async function eventHash(previous,e){return sha256(enc.encode(previous+"|"+e.actor+"|"+e.time+"|"+e.action+"|EV-204-017"))}
async function buildTimeline(){let prev="GENESIS"; const list=[]; for(const e of baseEvents){const current=await eventHash(prev,e);list.push({...e,previous:prev,current});prev=current} window.chain=list; $("#timeline").innerHTML=list.map((e,i)=>'<article class="event"><div class="event-head"><strong>'+escapeHtml(e.action)+'</strong><time>'+e.time+'</time></div><p>'+escapeHtml(e.actor)+'</p><code>prev: '+short(e.previous)+'<br>curr: '+short(e.current)+'</code></article>').join("")}
$("#verifyChain").addEventListener("click",async()=>{let prev="GENESIS",ok=true; for(const e of window.chain||[]){const expected=await eventHash(prev,e);if(e.previous!==prev||e.current!==expected){ok=false;break}prev=e.current} const el=$("#chainResult");el.textContent=ok?"✓ CHAIN VALID — every event links to the expected previous hash.":"✕ CHAIN FAILED — a link or event hash does not match.";el.style.color=ok?"var(--green)":"var(--red)";el.style.background=ok?"#0a1710":"#241017";});
$$("[data-step]").forEach(b=>b.addEventListener("click",()=>{const map={verify:"verifier",tamper:"tamper",chain:"chain"};document.getElementById(map[b.dataset.step]).scrollIntoView({behavior:"smooth",block:"start"})}));
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]))}
init();
