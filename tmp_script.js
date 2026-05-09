


function saveToken(){
  const t = document.getElementById('setup-token').value.trim();
  if(!t.startsWith('ghp_')){ document.getElementById('token-err').style.display='block'; return; }
  localStorage.setItem('doms_gh_token', t);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-login').style.display='block';
  document.getElementById('login-overlay').classList.add('show');
}

const GITHUB_USER = 'domspancit';
const GITHUB_REPO = 'domspancit.github.io';
const DATA_FILE = 'data.json';
function getToken(){ return localStorage.getItem('doms_gh_token')||''; }

async function ghGet() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${DATA_FILE}`, {
      headers: { 'Authorization': 'token ' + getToken(), 'Accept': 'application/vnd.github.v3+json' }
    });
    if (r.status === 404) return { entries: [] };
    const j = await r.json();
    const content = JSON.parse(atob(j.content.replace(/\n/g, '')));
    return { data: content, sha: j.sha };
  } catch(e) { return { entries: [] }; }
}

async function ghSave(entries) {
  const existing = await ghGet();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(entries, null, 2))));
  const body = { message: 'Update sales data', content };
  if (existing.sha) body.sha = existing.sha;
  const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${DATA_FILE}`, {
    method: 'PUT',
    headers: { 'Authorization': 'token ' + getToken(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.ok;
}

async function saveEntry(entry) {
  showSaving(true);
  const { data } = await ghGet();
  const entries = data?.entries || [];
  entries.push(entry);
  const ok = await ghSave({ entries });
  showSaving(false);
  if (!ok) { alert('Save failed. Check your connection.'); return false; }
  localStorage.setItem('doms_entries_cache', JSON.stringify(entries));
  return true;
}

async function getEntries() {
  try {
    const { data } = await ghGet();
    const entries = data?.entries || [];
    localStorage.setItem('doms_entries_cache', JSON.stringify(entries));
    return entries;
  } catch(e) {
    const cached = localStorage.getItem('doms_entries_cache');
    return cached ? JSON.parse(cached) : [];
  }
}

function showSaving(on) {
  let el = document.getElementById('saving-indicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'saving-indicator';
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#F47920;color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:700;z-index:999;display:none';
    el.textContent = 'Syncing to database...';
    document.body.appendChild(el);
  }
  el.style.display = on ? 'block' : 'none';
}

const BRANCHES=[{id:'br-01',name:'Fairview',ohd:4300},{id:'br-02',name:'Zabarte',ohd:3200},{id:'br-03',name:'Don Jose',ohd:4000}];
const PRODUCTS=[
  {id:'BG-S',cat:'noodle',name:'BG-S',phn:156},{id:'BG-M',cat:'noodle',name:'BG-M',phn:284},{id:'BG-L',cat:'noodle',name:'BG-L',phn:414},{id:'BG-XL',cat:'noodle',name:'BG-XL',phn:549},
  {id:'MIKI-S',cat:'noodle',name:'MIKI-S',phn:164},{id:'MIKI-M',cat:'noodle',name:'MIKI-M',phn:300},{id:'MIKI-L',cat:'noodle',name:'MIKI-L',phn:438},{id:'MIKI-XL',cat:'noodle',name:'MIKI-XL',phn:581},
  {id:'PALABOK-S',cat:'noodle',name:'PALABOK-S',phn:166},{id:'PALABOK-M',cat:'noodle',name:'PALABOK-M',phn:305},{id:'PALABOK-L',cat:'noodle',name:'PALABOK-L',phn:445},{id:'PALABOK-XL',cat:'noodle',name:'PALABOK-XL',phn:581},
  {id:'PC-M',cat:'noodle',name:'PC-M',phn:260},{id:'PC-L',cat:'noodle',name:'PC-L',phn:488},
  {id:'SPAG-S',cat:'noodle',name:'SPAG-S',phn:190},{id:'SPAG-M',cat:'noodle',name:'SPAG-M',phn:344},{id:'SPAG-L',cat:'noodle',name:'SPAG-L',phn:534},{id:'SPAG-XL',cat:'noodle',name:'SPAG-XL',phn:688},
  {id:'MAC-S',cat:'noodle',name:'MAC-S',phn:190},{id:'MAC-M',cat:'noodle',name:'MAC-M',phn:344},{id:'MAC-L',cat:'noodle',name:'MAC-L',phn:534},{id:'MAC-XL',cat:'noodle',name:'MAC-XL',phn:688},
  {id:'LUGLOG-S',cat:'noodle',name:'LUGLOG-S',phn:210},{id:'LUGLOG-M',cat:'noodle',name:'LUGLOG-M',phn:365},{id:'LUGLOG-L',cat:'noodle',name:'LUGLOG-L',phn:521},{id:'LUGLOG-XL',cat:'noodle',name:'LUGLOG-XL',phn:697},
  {id:'P SISIG-S',cat:'noodle',name:'P SISIG-S',phn:218},{id:'P SISIG-M',cat:'noodle',name:'P SISIG-M',phn:408},{id:'P SISIG-L',cat:'noodle',name:'P SISIG-L',phn:600},{id:'P SISIG-XL',cat:'noodle',name:'P SISIG-XL',phn:797},
  {id:'JAPCHAE-S',cat:'noodle',name:'JAPCHAE-S',phn:300},{id:'JAPCHAE-M',cat:'noodle',name:'JAPCHAE-M',phn:600},
  {id:'BILAO-S',cat:'bilao',name:'Bilao S',pck:40,cost:25},{id:'BILAO-M',cat:'bilao',name:'Bilao M',pck:46,cost:29},{id:'BILAO-L',cat:'bilao',name:'Bilao L',pck:53,cost:35},{id:'BILAO-XL',cat:'bilao',name:'Bilao XL',pck:63,cost:40},
  {id:'FRIED CX',cat:'addon',name:'Fried CX',phn:220,pck:20},{id:'LUMPIA-PORK',cat:'addon',name:'Lumpia Pork',phn:145,pck:20},{id:'LUMPIA-CHICKEN',cat:'addon',name:'Lumpia Chicken',phn:145,pck:20},
  {id:'LUMPIA-FISH',cat:'addon',name:'Lumpia Fish',phn:145,pck:20},{id:'LUMPIA-SPICY',cat:'addon',name:'Lumpia Spicy',phn:145,pck:20},{id:'CORDON',cat:'addon',name:'Cordon',phn:160,pck:20},
  {id:'PORKS SISIG',cat:'addon',name:'Porks Sisig',phn:120,pck:10},{id:'PUTO',cat:'addon',name:'Puto',phn:30,pck:10},{id:'PICHI',cat:'addon',name:'Pichi',phn:50,pck:10},
  {id:'LECHE FLAN',cat:'addon',name:'Leche Flan',phn:60,pck:10},{id:'GULAMAN',cat:'addon',name:'Gulaman',phn:40,pck:25},
  {id:'WATER',cat:'addon',name:'Water',phn:13},{id:'COKE',cat:'addon',name:'Coke',phn:38},{id:'KOPIKO',cat:'addon',name:'Kopiko',phn:19}
];
const VAT_RATE=0.12,OWNER_PASS='owner123';
// Staff accounts stored in localStorage (managed by owner)
function getStaffAccounts(){
  try{ return JSON.parse(localStorage.getItem('doms_staff_accounts')||'[]'); }catch(e){return[];}
}
function saveStaffAccounts(list){ localStorage.setItem('doms_staff_accounts',JSON.stringify(list)); }
let currentBranch=null,currentStaff=null,activeRange='today',customFrom=null,customTo=null,activeDashBranch='all';

// saveEntry and getEntries replaced by async GitHub versions above

function setRole(r,el){
  document.querySelectorAll('.role-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('staff-fields').style.display=r==='staff'?'block':'none';
  document.getElementById('owner-fields').style.display=r==='owner'?'block':'none';
}

function openLogin(){
  document.getElementById('screen-splash').style.display='none';
  document.getElementById('screen-login').style.display='block';
  document.getElementById('login-overlay').classList.add('show');
}
// ── SESSION MANAGEMENT ────────────────────────────────────
const SESSION_KEY='doms_session';
const INACTIVITY_MS=5*60*1000; // 5 minutes
let inactivityTimer=null;

function saveSession(role,branch,staff){
  sessionStorage.setItem(SESSION_KEY,JSON.stringify({role,branch,staff,ts:Date.now()}));
}
function clearSession(){
  sessionStorage.removeItem(SESSION_KEY);
}
function resetInactivityTimer(){
  if(inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer=setTimeout(()=>{
    // Only auto-logout if actually logged in (not on splash/login screen)
    const anyActive=[...document.querySelectorAll('.screen')].some(s=>s.classList.contains('active'));
    if(anyActive){
      clearSession();
      logout();
      // Show subtle "session expired" message
      const err=document.getElementById('login-err');
      if(err){err.textContent='Session expired due to inactivity.';err.style.display='block';}
    }
  },INACTIVITY_MS);
}
// Track user activity
['click','keydown','touchstart','mousemove'].forEach(ev=>{
  document.addEventListener(ev,()=>{
    const s=sessionStorage.getItem(SESSION_KEY);
    if(s) resetInactivityTimer();
  },{passive:true});
});

function doLogin(){
  const isOwner=document.querySelectorAll('.role-tab')[1].classList.contains('active');
  const err=document.getElementById('login-err');
  err.style.display='none';
  if(isOwner){
    if(document.getElementById('owner-pass').value===getOwnerPass()){
      saveSession('owner',null,null);
      resetInactivityTimer();
      showScreen('screen-owner');initOwnerDashboard();
    }
    else{err.textContent='Incorrect password.';err.style.display='block';}
  } else {
    const username=(document.getElementById('staff-username').value||'').trim();
    const pin=document.getElementById('staff-pin').value;
    if(!username){err.textContent='Please enter your username.';err.style.display='block';return;}
    if(!pin){err.textContent='Please enter your PIN.';err.style.display='block';return;}
    const accounts=getStaffAccounts();
    const account=accounts.find(a=>a.username.toLowerCase()===username.toLowerCase()&&a.pin===pin);
    if(account){
      currentBranch=account.branch;
      currentStaff=account.username;
      saveSession('staff',account.branch,account.username);
      resetInactivityTimer();
      document.getElementById('staff-branch-label').textContent=account.branch;
      document.getElementById('staff-date-label').textContent=new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
      showScreen('screen-staff');initStaffForm();
    } else {err.textContent='Incorrect username or PIN.';err.style.display='block';}
  }
}
function logout(){
  clearSession();
  if(inactivityTimer) clearTimeout(inactivityTimer);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-login').style.display='block';
  document.getElementById('login-overlay').classList.add('show');
  document.getElementById('staff-username').value='';
  document.getElementById('staff-pin').value='';
  document.getElementById('owner-pass').value='';
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('login-overlay').classList.remove('show');
  document.getElementById('screen-login').style.display='none';
  document.getElementById('screen-splash').style.display='none';
}

function initStaffForm(){
  buildGrid('noodle-grid',PRODUCTS.filter(p=>p.cat==='noodle'));
  buildGrid('addon-grid',PRODUCTS.filter(p=>p.cat==='addon'));
  document.getElementById('exp-list').innerHTML='';
  document.getElementById('misc-list').innerHTML='';
  ['vat-sales','cash-hand','gcash','grabfood','foodpanda','guest-count','top1','top2','top3'].forEach(id=>{const el=document.getElementById(id);if(el){el.value='';delete el.dataset.manual;}});
  const dateEl=document.getElementById('sales-date');
  if(dateEl) dateEl.value=new Date().toISOString().split('T')[0];
  updateBilaoSummary();
  updateCheckBalance();
  updateLiveTotals();
}
function buildGrid(gid,prods){
  document.getElementById(gid).innerHTML=prods.map(p=>`<div class="prod-cell"><label>${p.name}</label><input type="number" min="0" step="1" inputmode="numeric" id="qty-${p.id}" placeholder="0" oninput="onQtyChange()"></div>`).join('');
}

// ── BILAO SIZE GROUPS (noodle products → bilao size) ─────
const BILAO_SIZES={
  S:{pck:40,cost:25,noodles:['BG-S','MIKI-S','PALABOK-S','SPAG-S','MAC-S','LUGLOG-S','P SISIG-S','JAPCHAE-S']},
  M:{pck:46,cost:29,noodles:['BG-M','MIKI-M','PALABOK-M','PC-M','SPAG-M','MAC-M','LUGLOG-M','P SISIG-M','JAPCHAE-M']},
  L:{pck:53,cost:35,noodles:['BG-L','MIKI-L','PALABOK-L','PC-L','SPAG-L','MAC-L','LUGLOG-L','P SISIG-L']},
  XL:{pck:63,cost:40,noodles:['BG-XL','MIKI-XL','PALABOK-XL','SPAG-XL','MAC-XL','LUGLOG-XL','P SISIG-XL']},
};

function getBilaoQtyFromNoodles(){
  // For each bilao size, sum the qty of all noodles of that size
  // Noodle inputs store qty directly (e.g. "3" = 3 orders)
  const result={};
  Object.entries(BILAO_SIZES).forEach(([size,info])=>{
    let qty=0;
    info.noodles.forEach(id=>{
      const el=document.getElementById('qty-'+id);
      qty+=el?parseInt(el.value)||0:0;
    });
    result[size]=qty;
  });
  return result;
}

function updateBilaoSummary(){
  const qtyMap=getBilaoQtyFromNoodles();
  let totalQty=0, totalPck=0, totalCost=0;
  Object.entries(BILAO_SIZES).forEach(([size,info])=>{
    const qty=qtyMap[size]||0;
    const pckAmt=qty*info.pck;
    const costAmt=qty*info.cost;
    totalQty+=qty; totalPck+=pckAmt; totalCost+=costAmt;
    const cell=document.getElementById('bac-'+size);
    const qtyEl=document.getElementById('bac-qty-'+size);
    const detailEl=document.getElementById('bac-detail-'+size);
    if(qtyEl) qtyEl.textContent=qty+' pcs';
    if(detailEl) detailEl.textContent=qty>0?`₱${pckAmt.toLocaleString('en-PH')} rev\n₱${costAmt.toLocaleString('en-PH')} cost`:'—';
    if(cell){ if(qty>0)cell.classList.add('has-qty'); else cell.classList.remove('has-qty'); }
  });
  const paperCover=totalQty*4;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('bac-total-qty',totalQty+' pcs');
  set('bac-pck-total','₱'+totalPck.toLocaleString('en-PH'));
  set('bac-cost-total','₱'+(totalCost+paperCover).toLocaleString('en-PH'));
}

// ── AUTOMATION CORE ──────────────────────────────────────
function onQtyChange(){
  updateBilaoSummary();
  updateLiveTotals();
  autoFillTopSellers();
}

function updateLiveTotals(){
  try{
    const t=calcLiveTotals();
    const p=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:0,maximumFractionDigits:0});
    const set=(id,v,cls)=>{const el=document.getElementById(id);if(el){el.textContent=v;if(cls!==undefined)el.className='live-total-val '+cls;}};
    set('lt-vatsales',p(t.totalVatSales));
    set('lt-gross',p(t.gross));
    set('lt-pck',p(t.pck));
    set('lt-phn',p(t.phn));
    set('lt-gross-prf',p(t.grossPrf));
    set('lt-ohd',p(BRANCHES.find(b=>b.name===currentBranch)?.ohd||0));
    set('lt-expenses',p(t.expTotal));
    set('lt-prf-raw',p(t.prf));
    set('lt-prf',p(t.netPrf));
    // Check & balance in live summary
    set('lt-cash-sum',p(t.cashSum));
    const cb=t.checkBalance||0;
    set('lt-check-bal',(cb>0?'+':'')+p(cb), cb===0?'balanced':'unbalanced');
    set('lt-cash-after-vat',p(t.cashAfterVat));
  }catch(e){}
}

function autoFillTopSellers(){
  const t1=document.getElementById('top1');
  const t2=document.getElementById('top2');
  const t3=document.getElementById('top3');
  if(!t1||!t2||!t3) return;
  const qtys={};
  PRODUCTS.forEach(p=>{const el=document.getElementById('qty-'+p.id);if(el&&parseFloat(el.value)>0)qtys[p.id]=parseFloat(el.value);});
  const sorted=Object.entries(qtys).sort((a,b)=>b[1]-a[1]);
  // Only auto-fill if field hasn't been manually edited (check placeholder marker)
  if(!t1.dataset.manual) t1.value=sorted[0]?sorted[0][0]:'';
  if(!t2.dataset.manual) t2.value=sorted[1]?sorted[1][0]:'';
  if(!t3.dataset.manual) t3.value=sorted[2]?sorted[2][0]:'';
}
// ── END AUTOMATION ───────────────────────────────────────
function addExpRow(listId){
  const id='r'+Date.now();
  const row=document.createElement('div');row.className='exp-row';row.id=id;
  row.innerHTML=`<input type="text" placeholder="Description" style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--surface);color:var(--text)"><input type="number" placeholder="0.00" style="width:110px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--surface);color:var(--text);text-align:right" inputmode="decimal" oninput="onPaymentChange()"><button class="exp-del" onclick="document.getElementById('${id}').remove();onPaymentChange()">×</button>`;
  document.getElementById(listId).appendChild(row);
}
function getExpRows(listId){
  return Array.from(document.getElementById(listId).querySelectorAll('.exp-row')).map(r=>{
    const ins=r.querySelectorAll('input');return{desc:ins[0].value.trim(),amt:parseFloat(ins[1].value)||0};
  }).filter(e=>e.desc||e.amt);
}

function computeFinancials(products, vatSalesInput, cashHand, gcash, grabfood, foodpanda, totalExpenses, totalMisc){
  let phn=0;
  PRODUCTS.filter(p=>p.cat==='noodle'||p.cat==='addon').forEach(p=>{phn+=(products[p.id]||0)*(p.phn||0);});
  const bilaoQtyMap=getBilaoQtyFromNoodles();
  let bilaoQty=0, bilaoFoodCost=0, bilaoPck=0;
  Object.entries(BILAO_SIZES).forEach(([size,info])=>{const q=bilaoQtyMap[size]||0;bilaoQty+=q;bilaoPck+=q*info.pck;bilaoFoodCost+=q*info.cost;});
  let addonPck=0;
  PRODUCTS.filter(p=>p.cat==='addon'&&p.pck).forEach(p=>{addonPck+=(products[p.id]||0)*(p.pck||0);});
  const pck=bilaoPck+addonPck;
  const paperCover=bilaoQty*4;
  // foodCost calculated below after phn/pck are known
  const totalVatSales=vatSalesInput+gcash;
  const vat=totalVatSales*(0.12/1.12);
  const salesLessVat=totalVatSales-vat;
  const gross=salesLessVat+grabfood+foodpanda;
  const cashAfterVat=cashHand-vat;
  const expTotal=(totalExpenses||0)+(totalMisc||0);
  const cashSum=expTotal+cashHand;
  const checkBalance=vatSalesInput-cashSum;
  const lpg=(gross/15000)*800;
  const grossPrf=gross-phn;
  const ohd=BRANCHES.find(b=>b.name===currentBranch)?.ohd||0;
  // PRF = GrossPrf - LPG - OHD - Misc Expenses only (regular expenses excluded from PRF calc)
  const prf=grossPrf-lpg-ohd-totalMisc;
  const tts=prf*0.1;
  const netPrf=prf-tts;
  // Food Cost = PHN - total packaging cost (PCK)
  const foodCost=phn-pck;
  // Paper Cost = PCK (total packaging)
  const paperCost=pck;
  return{phn,pck,paperCost,bilaoQty,bilaoQtyMap,bilaoFoodCost,paperCover,foodCost,vatSalesInput,totalVatSales,vat,salesLessVat,gross,cashAfterVat,cashSum,checkBalance,expTotal,grossPrf,lpg,prf,tts,netPrf};
}

async function submitEntry(){
  const products={};
  PRODUCTS.forEach(p=>{const el=document.getElementById('qty-'+p.id);if(el&&parseFloat(el.value)>0)products[p.id]=parseFloat(el.value);});
  const vatSalesInput=parseFloat(document.getElementById('vat-sales').value)||0;
  const cashHand=parseFloat(document.getElementById('cash-hand').value)||0;
  const gcash=parseFloat(document.getElementById('gcash').value)||0;
  const grabfood=parseFloat(document.getElementById('grabfood').value)||0;
  const foodpanda=parseFloat(document.getElementById('foodpanda').value)||0;
  const guestCount=parseInt(document.getElementById('guest-count').value)||0;
  const expenses=getExpRows('exp-list');
  const miscExpenses=getExpRows('misc-list');
  const totalExpenses=expenses.reduce((s,e)=>s+e.amt,0);
  const totalMisc=miscExpenses.reduce((s,e)=>s+e.amt,0);
  const fin=computeFinancials(products,vatSalesInput,cashHand,gcash,grabfood,foodpanda,totalExpenses,totalMisc);
  const ohd=BRANCHES.find(b=>b.name===currentBranch)?.ohd||0;
  const avgCheck=guestCount>0?fin.gross/guestCount:0;
  const salesDate=document.getElementById('sales-date').value || new Date().toISOString().split('T')[0];
  autoFillTopSellers();
  const entry={
    id:'e'+Date.now(),date:salesDate,branch:currentBranch,
    products,vatSalesInput,cashHand,gcash,grabfood,foodpanda,guestCount,expenses,miscExpenses,
    totalExpenses,totalMisc,ohd,avgCheck,
    gross:fin.gross,salesLessVat:fin.salesLessVat,vat:fin.vat,
    totalVatSales:fin.totalVatSales,cashAfterVat:fin.cashAfterVat,
    checkBalance:fin.checkBalance,cashSum:fin.cashSum,
    phn:fin.phn,pck:fin.pck,paperCost:fin.paperCost,
    bilaoQty:fin.bilaoQty,bilaoFoodCost:fin.bilaoFoodCost,paperCover:fin.paperCover,
    foodCost:fin.foodCost,grossPrf:fin.grossPrf,lpg:fin.lpg,prf:fin.prf,tts:fin.tts,netPrf:fin.netPrf,
    bilaoS:fin.bilaoQtyMap.S||0,bilaoM:fin.bilaoQtyMap.M||0,bilaoL:fin.bilaoQtyMap.L||0,bilaoXL:fin.bilaoQtyMap.XL||0,
    top1:document.getElementById('top1')?.value||'',
    top2:document.getElementById('top2')?.value||'',
    top3:document.getElementById('top3')?.value||''
  };
  const saved=await saveEntry(entry);
  if(!saved) return;
  document.getElementById('modal-sub-text').textContent=`${currentBranch} · ${entry.date} · Total VAT Sales: ₱${fin.totalVatSales.toLocaleString('en-PH',{maximumFractionDigits:2})} · Net PRF: ₱${fin.netPrf.toLocaleString('en-PH',{maximumFractionDigits:2})}`;
  document.getElementById('success-modal').classList.add('show');
}
function closeModal(){document.getElementById('success-modal').classList.remove('show');initStaffForm();}

function getPaymentValues(){
  return{
    vatSalesInput:parseFloat(document.getElementById('vat-sales')?.value)||0,
    cashHand:parseFloat(document.getElementById('cash-hand')?.value)||0,
    gcash:parseFloat(document.getElementById('gcash')?.value)||0,
    grabfood:parseFloat(document.getElementById('grabfood')?.value)||0,
    foodpanda:parseFloat(document.getElementById('foodpanda')?.value)||0,
  };
}
function onPaymentChange(){ updateCheckBalance(); updateLiveTotals(); }
function updateCheckBalance(){
  const {vatSalesInput,cashHand,gcash}=getPaymentValues();
  const expTotal=getExpRows('exp-list').reduce((s,e)=>s+e.amt,0)+getExpRows('misc-list').reduce((s,e)=>s+e.amt,0);
  const totalVatSales=vatSalesInput+gcash;
  const vat=totalVatSales*(0.12/1.12);
  const cashSum=expTotal+cashHand;
  const checkBalance=vatSalesInput-cashSum;
  const cashAfterVat=cashHand-vat;
  const p=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
  const set=(id,v,cls)=>{const el=document.getElementById(id);if(el){el.textContent=v;if(cls!==undefined)el.className='cb-val '+cls;}};
  set('cb-cash-sum',p(cashSum));
  const diff=checkBalance;
  set('cb-balance',(diff>0?'+':'')+p(diff), diff===0?'balanced':'unbalanced');
  set('cb-cash-after-vat',p(cashAfterVat));
}
function calcLiveTotals(){
  const products={};
  PRODUCTS.forEach(p=>{const el=document.getElementById('qty-'+p.id);if(el&&parseFloat(el.value)>0)products[p.id]=parseFloat(el.value);});
  const {vatSalesInput,cashHand,gcash,grabfood,foodpanda}=getPaymentValues();
  const totalExpenses=getExpRows('exp-list').reduce((s,e)=>s+e.amt,0);
  const totalMisc=getExpRows('misc-list').reduce((s,e)=>s+e.amt,0);
  const fin=computeFinancials(products,vatSalesInput,cashHand,gcash,grabfood,foodpanda,totalExpenses,totalMisc);
  return{...fin,totalExpenses:fin.expTotal};
}

function staffTab(tab,el){
  document.querySelectorAll('#screen-staff .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  document.getElementById('staff-entry').style.display=tab==='entry'?'block':'none';
  document.getElementById('staff-history').style.display=tab==='history'?'block':'none';
  if(tab==='history')renderStaffHistory();
}
async function renderStaffHistory(){
  const month=document.getElementById('hist-month').value;
  const allE=await getEntries();
  const entries=allE.filter(e=>e.branch===currentBranch&&e.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date));
  const wrap=document.getElementById('staff-hist-content');
  if(!entries.length){wrap.innerHTML='<div class="empty"><div class="empty-icon">📋</div><div class="empty-text">No entries for this month.</div></div>';return;}
  wrap.innerHTML=entries.map(e=>`<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-weight:700">${e.date}</span>
      <span class="badge badge-green">₱${(e.totalVatSales||0).toLocaleString('en-PH',{maximumFractionDigits:0})}</span>
    </div>
    <div class="summary-row"><span class="lbl">Guests</span><span>${e.guestCount}</span></div>
    <div class="summary-row"><span class="lbl">Cash</span><span>₱${(e.cashHand||0).toLocaleString('en-PH',{maximumFractionDigits:0})}</span></div>
    <div class="summary-row"><span class="lbl">GCash</span><span>₱${(e.gcash||0).toLocaleString('en-PH',{maximumFractionDigits:0})}</span></div>
    <div class="summary-row"><span class="lbl">GrabFood</span><span>₱${(e.grabfood||0).toLocaleString('en-PH',{maximumFractionDigits:0})}</span></div>
    <div class="summary-row"><span class="lbl">FoodPanda</span><span>₱${(e.foodpanda||0).toLocaleString('en-PH',{maximumFractionDigits:0})}</span></div>
    <div class="summary-row"><span class="lbl">Expenses</span><span>₱${((e.totalExpenses||0)+(e.totalMisc||0)).toLocaleString('en-PH',{maximumFractionDigits:0})}</span></div>
  </div>`).join('');
}

function ownerTab(tab,el){
  if(tab==='settings'){renderStaffAccounts();loadBrandPhoto();}
  ['dashboard','reports','products','settings'].forEach(t=>{const el=document.getElementById('owner-'+t);if(el)el.style.display=t===tab?'block':'none';});
  document.querySelectorAll('#screen-owner .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  if(tab==='reports')renderReports();
  if(tab==='products')renderProductAnalysis();
}
function setRange(r,el){
  activeRange=r;
  document.querySelectorAll('.range-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  document.getElementById('custom-range').style.display=r==='custom'?'block':'none';
  if(r!=='custom')initOwnerDashboard();
}
function applyRange(){customFrom=document.getElementById('range-from').value;customTo=document.getElementById('range-to').value;if(customFrom&&customTo)initOwnerDashboard();}
function getFiltered(){
  const all=JSON.parse(localStorage.getItem('doms_entries_cache')||'[]'),now=new Date(),today=now.toISOString().split('T')[0];
  return all.filter(e=>{
    const d=new Date(e.date);
    if(activeRange==='today')return e.date===today;
    if(activeRange==='week'){const s=new Date(now);s.setDate(now.getDate()-now.getDay());return d>=s;}
    if(activeRange==='month')return e.date.startsWith(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
    if(activeRange==='year')return e.date.startsWith(String(now.getFullYear()));
    if(activeRange==='custom'&&customFrom&&customTo)return e.date>=customFrom&&e.date<=customTo;
    return true;
  });
}
function peso(n){return '₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});}
function pesoS(n){n=Number(n||0);if(n>=1000000)return '₱'+(n/1000000).toFixed(1)+'M';if(n>=1000)return '₱'+(n/1000).toFixed(1)+'k';return '₱'+n.toFixed(0);}

// ── Delete / Update entry ──────────────────────────────
async function quickRecalc(id){
  const cached=JSON.parse(localStorage.getItem('doms_entries_cache')||'[]');
  const e=cached.find(x=>x.id===id);
  if(!e){alert('Entry not found in cache. Please reload.');return;}
  const phn=e.phn||0;
  const pck=e.pck||0;
  const gross=e.gross||0;
  const totalMisc=e.totalMisc||0;
  const branchName=e.branch||'';
  const guestCount=e.guestCount||0;
  const ohd=BRANCHES.find(b=>b.name===branchName)?.ohd||0;
  const lpg=(gross/15000)*800;
  const grossPrf=gross-phn;
  const prf=grossPrf-lpg-ohd-totalMisc;
  const tts=prf*0.1;
  const netPrf=prf-tts;
  const foodCost=phn-pck;
  const paperCost=pck;
  const avgCheck=guestCount>0?gross/guestCount:0;
  await updateEntry(id,{lpg,grossPrf,prf,tts,netPrf,foodCost,paperCost,avgCheck,ohd});
}

async function deleteEntry(id){
  if(!confirm('Delete this entry? This cannot be undone.')) return;
  showSaving(true);
  const {data}=await ghGet();
  const entries=(data?.entries||[]).filter(e=>e.id!==id);
  const ok=await ghSave({entries});
  showSaving(false);
  if(!ok){alert('Delete failed. Check your connection.');return;}
  localStorage.setItem('doms_entries_cache',JSON.stringify(entries));
  closeEditModal();
  renderReports();
  initOwnerDashboard();
}

async function updateEntry(id,patch){
  showSaving(true);
  const {data}=await ghGet();
  const entries=(data?.entries||[]).map(e=>e.id===id?{...e,...patch}:e);
  const ok=await ghSave({entries});
  showSaving(false);
  if(!ok){alert('Save failed. Check your connection.');return;}
  localStorage.setItem('doms_entries_cache',JSON.stringify(entries));
  closeEditModal();
  renderReports();
  initOwnerDashboard();
}

function closeEditModal(){
  document.getElementById('edit-modal').classList.remove('show');
}

// ── Edit modal entry store ─────────────────────────────
let _editEntries={};

function openEditModal(entry){
  _editEntries[entry.id]=entry;
  const m=document.getElementById('edit-modal');
  const b=document.getElementById('edit-modal-body');
  const f=(label,field,val,type='number')=>`
    <div class="field">
      <label style="font-size:12px;font-weight:700;color:var(--text-2)">${label}</label>
      <input type="${type}" id="ef-${field}" value="${val??''}" style="width:100%;padding:10px 12px;border:1.5px solid var(--border-strong);border-radius:var(--radius);font-size:15px;background:var(--surface)">
    </div>`;

  // Build editable expense rows
  const makeRows=(prefix,items)=>items.map((x,i)=>`
    <div id="${prefix}-row-${i}" style="display:flex;gap:6px;margin-bottom:6px">
      <input type="text" id="${prefix}-desc-${i}" value="${x.desc||''}" placeholder="Description"
        oninput="efUpdateTotal('${prefix}')"
        style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--surface)">
      <input type="number" id="${prefix}-amt-${i}" value="${x.amt||''}" placeholder="0"
        oninput="efUpdateTotal('${prefix}')"
        style="width:90px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;text-align:right;background:var(--surface)">
      <button onclick="efDelRow('${prefix}',${i})" style="width:30px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text-3);cursor:pointer;font-size:16px">×</button>
    </div>`).join('');

  b.innerHTML=`
    <div style="background:var(--orange-light);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px">
      <strong>${entry.branch}</strong> &nbsp;·&nbsp; ${entry.date}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">
      ${f('Date','date',entry.date,'date')}
      ${f('Guest Count','guestCount',entry.guestCount,'number')}
      ${f('VAT Sales / Walk-ins (₱)','vatSalesInput',entry.vatSalesInput)}
      ${f('Cash on Hand (₱)','cashHand',entry.cashHand)}
      ${f('GCash (₱)','gcash',entry.gcash)}
      ${f('GrabFood (₱)','grabfood',entry.grabfood)}
      ${f('FoodPanda (₱)','foodpanda',entry.foodpanda)}
    </div>

    <div style="background:var(--bg);border-radius:10px;padding:10px 14px;margin:8px 0;border:1px solid var(--border)">
      <div style="font-size:12px;font-weight:700;color:var(--text-2);margin-bottom:8px">
        📋 REGULAR EXPENSES <span style="font-weight:400;color:var(--text-3)">(Check &amp; Balance only — does NOT affect PRF)</span>
      </div>
      <div id="ef-exp-rows">${makeRows('ef-exp', entry.expenses||[])}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <button onclick="efAddRow('ef-exp')" style="font-size:12px;color:var(--green);border:1.5px dashed var(--green);background:var(--green-light);border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:600">+ Add Row</button>
        <span style="font-size:12px;color:var(--text-3)">Total: <strong id="ef-exp-total">${peso(entry.totalExpenses||0)}</strong></span>
      </div>
    </div>

    <div style="background:var(--yellow);border-radius:10px;padding:10px 14px;margin:8px 0;border:1.5px solid var(--orange-light)">
      <div style="font-size:12px;font-weight:700;color:var(--orange-text);margin-bottom:8px">
        ⭐ MISC EXPENSES <span style="font-weight:400;color:var(--text-2)">(PRF uses this! PRF = GrossPrf − LPG − OHD − <u>Misc</u>)</span>
      </div>
      <div id="ef-misc-rows">${makeRows('ef-misc', entry.miscExpenses||[])}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <button onclick="efAddRow('ef-misc')" style="font-size:12px;color:var(--orange-dark);border:1.5px dashed var(--orange);background:var(--orange-light);border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:600">+ Add Row</button>
        <span style="font-size:12px;color:var(--text-3)">Total: <strong style="color:var(--orange-dark)" id="ef-misc-total">${peso(entry.totalMisc||0)}</strong></span>
      </div>
    </div>

    <div style="background:var(--green-light);border-radius:10px;padding:9px 14px;margin:6px 0 12px;font-size:12px;color:var(--green-text)">
      ✅ Saving will auto-recalculate: PRF, TTS, Net PRF, Food Cost, LPG, Avg Check, Check Balance.
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="saveEditModal('${entry.id}')" style="flex:2">💾 Save &amp; Recalculate</button>
      <button class="btn" style="flex:1;background:var(--red-light);color:var(--red-text);border:1.5px solid var(--red-text)" onclick="deleteEntry('${entry.id}')">🗑 Delete</button>
    </div>`;
  m.classList.add('show');
}

// ── Edit modal expense row helpers ───────────────────────
function efAddRow(prefix){
  const container=document.getElementById(`${prefix}-rows`);
  const existing=container.querySelectorAll('[id^="'+prefix+'-row-"]');
  const i=existing.length;
  const div=document.createElement('div');
  div.id=`${prefix}-row-${i}`;
  div.style.cssText='display:flex;gap:6px;margin-bottom:6px';
  div.innerHTML=`
    <input type="text" id="${prefix}-desc-${i}" placeholder="Description"
      oninput="efUpdateTotal('${prefix}')"
      style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--surface)">
    <input type="number" id="${prefix}-amt-${i}" placeholder="0"
      oninput="efUpdateTotal('${prefix}')"
      style="width:90px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;text-align:right;background:var(--surface)">
    <button onclick="efDelRow('${prefix}',${i})" style="width:30px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text-3);cursor:pointer;font-size:16px">×</button>`;
  container.appendChild(div);
}
function efDelRow(prefix,i){
  const row=document.getElementById(`${prefix}-row-${i}`);
  if(row){row.remove();efUpdateTotal(prefix);}
}
function efUpdateTotal(prefix){
  const container=document.getElementById(`${prefix}-rows`);
  if(!container) return;
  const amts=container.querySelectorAll('input[type="number"]');
  const total=Array.from(amts).reduce((s,el)=>s+(parseFloat(el.value)||0),0);
  const lbl=document.getElementById(`${prefix}-total`);
  if(lbl) lbl.textContent='₱'+total.toLocaleString('en-PH',{minimumFractionDigits:2});
}
function efReadRows(prefix){
  const container=document.getElementById(`${prefix}-rows`);
  if(!container) return [];
  const rows=container.querySelectorAll('[id^="'+prefix+'-row-"]');
  const result=[];
  rows.forEach(row=>{
    const i=row.id.split('-').pop();
    const desc=(document.getElementById(`${prefix}-desc-${i}`)?.value||'').trim();
    const amt=parseFloat(document.getElementById(`${prefix}-amt-${i}`)?.value)||0;
    if(desc||amt) result.push({desc,amt});
  });
  return result;
}

function saveEditModal(id){
  const g=f=>parseFloat(document.getElementById('ef-'+f)?.value)||0;
  const gi=f=>parseInt(document.getElementById('ef-'+f)?.value)||0;
  const gs=f=>document.getElementById('ef-'+f)?.value||'';
  const vatSalesInput=g('vatSalesInput'),cashHand=g('cashHand'),gcash=g('gcash');
  const grabfood=g('grabfood'),foodpanda=g('foodpanda');
  const guestCount=gi('guestCount'),newDate=gs('date');

  // Read expense rows using dynamic row reader
  const expenses=efReadRows('ef-exp');
  const miscExpenses=efReadRows('ef-misc');
  const totalExpenses=expenses.reduce((s,x)=>s+x.amt,0);
  const totalMisc=miscExpenses.reduce((s,x)=>s+x.amt,0);

  // Preserve phn/pck from original
  const orig=_editEntries[id]||JSON.parse(localStorage.getItem('doms_entries_cache')||'[]').find(e=>e.id===id)||{};
  const phn=orig.phn||0;
  const branchName=orig.branch||'';
  // Recalculate financials using same formulas
  const totalVatSales=vatSalesInput+gcash;
  const vat=totalVatSales*(0.12/1.12);
  const salesLessVat=totalVatSales-vat;
  const gross=salesLessVat+grabfood+foodpanda;
  const cashAfterVat=cashHand-vat;
  const expTotal=totalExpenses+totalMisc;
  const cashSum=expTotal+cashHand;
  const checkBalance=vatSalesInput-cashSum;
  const lpg=(gross/15000)*800;
  const ohd=BRANCHES.find(b=>b.name===branchName)?.ohd||0;
  const grossPrf=gross-phn;
  // PRF = GrossPrf - LPG - OHD - Misc only
  const prf=grossPrf-lpg-ohd-totalMisc;
  const tts=prf*0.1;
  const netPrf=prf-tts;
  const avgCheck=guestCount>0?gross/guestCount:0;
  const foodCost=phn-orig.pck; // Food Cost = PHN - PCK (packaging)
  const paperCost=orig.pck||0;
  updateEntry(id,{
    date:newDate,guestCount,vatSalesInput,cashHand,gcash,grabfood,foodpanda,
    expenses,miscExpenses,totalExpenses,totalMisc,foodCost,
    totalVatSales,vat,salesLessVat,gross,cashAfterVat,cashSum,checkBalance,
    lpg,grossPrf,prf,tts,netPrf,avgCheck,ohd,paperCost
  });
}

// ── Dashboard branch filter ───────────────────────────
function setDashBranch(branch,el){
  activeDashBranch=branch;
  document.querySelectorAll('.dbf-btn').forEach(b=>b.classList.remove('dbf-active'));
  if(el)el.classList.add('dbf-active');
  initOwnerDashboard();
}

async function initOwnerDashboard(){
  const allData=await getEntries();
  let allEntries=allData.filter(e=>{
    const now=new Date(),today=now.toISOString().split('T')[0];
    const d=new Date(e.date);
    if(activeRange==='today')return e.date===today;
    if(activeRange==='week'){const s=new Date(now);s.setDate(now.getDate()-now.getDay());return d>=s;}
    if(activeRange==='month')return e.date.startsWith(now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0'));
    if(activeRange==='year')return e.date.startsWith(String(now.getFullYear()));
    if(activeRange==='custom'&&customFrom&&customTo)return e.date>=customFrom&&e.date<=customTo;
    return true;
  });
  // Apply branch filter
  const entries=activeDashBranch==='all'?allEntries:allEntries.filter(e=>e.branch===activeDashBranch);
  const tot=f=>entries.reduce((s,e)=>s+(e[f]||0),0);
  // Branch summary cards
  document.getElementById('branch-summary-cards').innerHTML=BRANCHES.map((b,i)=>{
    const be=entries.filter(e=>e.branch===b.name);
    const bTotSales=be.reduce((s,e)=>s+(e.totalVatSales||0),0);
    const bGross=be.reduce((s,e)=>s+(e.gross||0),0);
    const bNetPrf=be.reduce((s,e)=>s+(e.netPrf||0),0);
    const bGuests=be.reduce((s,e)=>s+(e.guestCount||0),0);
    const bTts=be.reduce((s,e)=>s+(e.tts||0),0);
    const bLpg=be.reduce((s,e)=>s+(e.lpg||0),0);
    const bAvgCheck=bGross>0&&bGuests>0?bGross/bGuests:0;
    const colors=['red','green','orange'];
    const c=colors[i%3];
    return `<div class="branch-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px"><div class="branch-dot branch-dot-${i}"></div><div class="branch-name">${b.name}</div></div>
        <span class="badge badge-${c==='red'?'red':c==='green'?'green':'orange'}">${be.length} day${be.length!==1?'s':''}</span>
      </div>
      <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:8px">${pesoS(bTotSales)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">GROSS</div><div style="font-weight:700">${pesoS(bGross)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">NET PRF</div><div style="font-weight:700;color:var(--green-dark)">${pesoS(bNetPrf)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">TTS (10%)</div><div style="font-weight:700;color:var(--orange-dark)">${pesoS(bTts)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">LPG</div><div style="font-weight:700">${pesoS(bLpg)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">GUESTS</div><div style="font-weight:700">${bGuests.toLocaleString()}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:6px 8px"><div style="color:var(--text-3);font-weight:600">AVG CHECK</div><div style="font-weight:700">${bAvgCheck>0?'₱'+bAvgCheck.toFixed(2):'—'}</div></div>
      </div>
    </div>`;
  }).join('');
  // Overall metrics
  const totSales=tot('totalVatSales'),totGross=tot('gross'),totGuests=tot('guestCount');
  const totNetPrf=tot('netPrf'),totTts=tot('tts'),totLpg=tot('lpg');
  const totPhn=tot('phn'),totOhd=tot('ohd');
  const totExp=tot('totalExpenses')+tot('totalMisc');
  const totFoodCost=tot('foodCost');
  const totGrossPrf=tot('grossPrf');
  const totPrf=tot('prf');
  const avgCheck=totGross>0&&totGuests>0?totGross/totGuests:0;
  const totCashBalance=entries.reduce((s,e)=>s+(e.checkBalance||0),0);
  const balClass=Math.abs(totCashBalance)<1?'color:var(--green-text)':'color:var(--red-text)';
  document.getElementById('overall-metrics').innerHTML=`
    <div class="metric-card red"><div class="metric-lbl">TOTAL VAT SALES</div><div class="metric-val">${pesoS(totSales)}</div><div class="metric-sub">${entries.length} entr${entries.length!==1?'ies':'y'}</div></div>
    <div class="metric-card orange"><div class="metric-lbl">GROSS</div><div class="metric-val">${pesoS(totGross)}</div><div class="metric-sub">After VAT + Delivery</div></div>
    <div class="metric-card orange"><div class="metric-lbl">PHN (Noodle Rev)</div><div class="metric-val">${pesoS(totPhn)}</div><div class="metric-sub">Noodle revenue</div></div>
    <div class="metric-card orange"><div class="metric-lbl">GROSS PRF</div><div class="metric-val">${pesoS(totGrossPrf)}</div><div class="metric-sub">Gross − PHN</div></div>
    <div class="metric-card orange"><div class="metric-lbl">LPG</div><div class="metric-val">${pesoS(totLpg)}</div><div class="metric-sub">Gross/15000×800</div></div>
    <div class="metric-card orange"><div class="metric-lbl">OHD</div><div class="metric-val">${pesoS(totOhd)}</div><div class="metric-sub">Overhead per branch</div></div>
    <div class="metric-card orange"><div class="metric-lbl">PRF</div><div class="metric-val">${pesoS(totPrf)}</div><div class="metric-sub">GrossPrf−LPG−OHD−Misc</div></div>
    <div class="metric-card green"><div class="metric-lbl">TTS (Tithes 10%)</div><div class="metric-val">${pesoS(totTts)}</div><div class="metric-sub">PRF × 10% → Church</div></div>
    <div class="metric-card green"><div class="metric-lbl">NET PRF</div><div class="metric-val">${pesoS(totNetPrf)}</div><div class="metric-sub">PRF − TTS</div></div>
    <div class="metric-card red"><div class="metric-lbl">TOTAL EXPENSES</div><div class="metric-val">${pesoS(totExp)}</div><div class="metric-sub">All expenses + misc</div></div>
    <div class="metric-card red"><div class="metric-lbl">FOOD COST</div><div class="metric-val">${pesoS(totFoodCost)}</div><div class="metric-sub">PHN − Packaging Cost</div></div>
    <div class="metric-card orange"><div class="metric-lbl">PAPER COST (PCK)</div><div class="metric-val">${pesoS(tot('pck'))}</div><div class="metric-sub">Total packaging</div></div>
    <div class="metric-card ${Math.abs(totCashBalance)<1?'green':'red'}"><div class="metric-lbl">CHECK & BALANCE</div><div class="metric-val" style="${balClass}">${totCashBalance>=0?'+':''}${pesoS(totCashBalance)}</div><div class="metric-sub">${Math.abs(totCashBalance)<1?'✓ Balanced':'⚠ Variance'}</div></div>
    <div class="metric-card orange"><div class="metric-lbl">TOTAL GUESTS</div><div class="metric-val">${totGuests.toLocaleString()}</div><div class="metric-sub">${entries.length} entr${entries.length!==1?'ies':'y'}</div></div>
    <div class="metric-card green"><div class="metric-lbl">AVERAGE CHECK</div><div class="metric-val">${avgCheck>0?'₱'+avgCheck.toFixed(2):'—'}</div><div class="metric-sub">Gross ÷ Guests</div></div>`;
  // Top products
  const qtys={};entries.forEach(e=>Object.entries(e.products||{}).forEach(([id,qty])=>{qtys[id]=(qtys[id]||0)+qty;}));
  const sorted=Object.entries(qtys).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxQ=sorted[0]?.[1]||1;
  document.getElementById('top-products-chart').innerHTML=sorted.length?sorted.map(([id,qty])=>`<div class="bar-row"><div class="bar-label">${id}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(qty/maxQ*100)}%"></div></div><div class="bar-val">${qty} sold</div></div>`).join(''):'<div class="empty"><div class="empty-text">No data yet.</div></div>';
  // Recent entries - expanded columns
  const recent=[...entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15);
  recent.forEach(e=>{_editEntries[e.id]=e;}); // pre-store for edit
  document.getElementById('recent-tbody').innerHTML=recent.length?recent.map(e=>{
    const cb=e.checkBalance||0;
    const cbClass=Math.abs(cb)<1?'color:var(--green-text)':'color:var(--red-text)';
    return `<tr>
      <td>${e.date}</td>
      <td><span class="badge badge-red">${e.branch}</span></td>
      <td style="text-align:right">${peso(e.totalVatSales)}</td>
      <td style="text-align:right">${peso(e.gross||0)}</td>
      <td style="text-align:right">${e.guestCount}</td>
      <td style="text-align:right">${e.avgCheck>0?'₱'+(e.avgCheck).toFixed(0):'—'}</td>
      <td style="text-align:right;color:var(--green-dark)">${peso(e.netPrf||0)}</td>
      <td style="text-align:right;color:var(--orange-dark)">${peso(e.tts||0)}</td>
      <td style="text-align:right">${peso(e.lpg||0)}</td>
      <td style="text-align:right;font-weight:700;${cbClass}">${cb>=0?'+':''}${peso(cb)}</td>
      <td style="text-align:center"><button onclick="openEditModal(_editEntries['${e.id}'])" style="border:none;background:var(--orange-light);color:var(--orange-dark);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer">✏️</button></td>
    </tr>`;
  }).join(''):'<tr><td colspan="11" style="text-align:center;padding:24px;color:var(--text-3)">No entries yet.</td></tr>';
}

async function renderReports(){
  const branch=document.getElementById('report-branch').value;
  const month=document.getElementById('report-month').value;
  let entries=await getEntries();
  if(branch!=='all')entries=entries.filter(e=>e.branch===branch);
  if(month)entries=entries.filter(e=>e.date.startsWith(month));
  entries.sort((a,b)=>b.date.localeCompare(a.date));
  const wrap=document.getElementById('report-content');
  if(!entries.length){wrap.innerHTML='<div class="empty"><div class="empty-icon">📊</div><div class="empty-text">No data for this filter.</div></div>';return;}
  const tot=f=>entries.reduce((s,e)=>s+(e[f]||0),0);
  const totSales=tot('totalVatSales'),totGross=tot('gross'),totGuests=tot('guestCount');
  const totPhn=tot('phn'),totGrossPrf=tot('grossPrf'),totLpg=tot('lpg'),totOhd=tot('ohd');
  const totPrf=tot('prf'),totTts=tot('tts'),totNetPrf=tot('netPrf');
  const totExp=tot('totalExpenses')+tot('totalMisc'),totFoodCost=tot('foodCost'),totPck=tot('pck');
  const totGcash=tot('gcash'),totGrabfood=tot('grabfood'),totFoodpanda=tot('foodpanda');
  const totCashHand=tot('cashHand'),totCashAfterVat=tot('cashAfterVat');
  const totCashBalance=tot('checkBalance');
  const avgCheck=totGross>0&&totGuests>0?totGross/totGuests:0;
  const balClass=Math.abs(totCashBalance)<1?'color:var(--green-text)':'color:var(--red-text)';

  // Per-day cards
  const dayCards=entries.map(e=>{
    const cb=e.checkBalance||0;
    const cbClass=Math.abs(cb)<1?'color:var(--green-text)':'color:var(--red-text)';
    const cbIcon=Math.abs(cb)<1?'✓':'⚠';
    const avgCk=e.avgCheck>0?'₱'+e.avgCheck.toFixed(2):(e.gross>0&&e.guestCount>0?'₱'+(e.gross/e.guestCount).toFixed(2):'—');
    _editEntries[e.id]=e; // pre-store for edit button
    // Detect stale entry (old formula: foodCost = bilaoFoodCost+paperCover, new: phn-pck)
    const isStale=e.pck>0&&e.foodCost>0&&e.foodCost<e.pck;
    return `<div class="card" style="margin-bottom:12px">
      ${isStale?`<div style="background:#fff3cd;border:1.5px solid #ffc107;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <span>⚠️ <strong>Old formula.</strong> PRF, TTS, Net PRF &amp; Food Cost need recalculating.</span>
        <button onclick="quickRecalc('${e.id}')" style="border:none;background:#ffc107;color:#333;border-radius:6px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🔄 Fix Now</button>
      </div>`:''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px">
        <div>
          <span style="font-size:15px;font-weight:800">${e.date}</span>
          <span class="badge badge-red" style="margin-left:8px">${e.branch}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="font-size:18px;font-weight:800;color:var(--red)">${peso(e.totalVatSales||0)}</div>
          <button onclick="openEditModal(_editEntries['${e.id}'])" style="border:none;background:var(--orange-light);color:var(--orange-dark);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer">✏️ Edit</button>
          <button onclick="deleteEntry('${e.id}')" style="border:none;background:var(--red-light);color:var(--red-text);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer">🗑</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;margin-bottom:8px">
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">GUESTS</div><div style="font-weight:800;font-size:15px">${e.guestCount||0}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">AVG CHECK</div><div style="font-weight:800;font-size:15px">${avgCk}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">GROSS</div><div style="font-weight:800;font-size:15px">${peso(e.gross||0)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">CASH ON HAND (After VAT)</div><div style="font-weight:700">${peso(e.cashAfterVat||0)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">GCash</div><div style="font-weight:700">${peso(e.gcash||0)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">GrabFood</div><div style="font-weight:700">${peso(e.grabfood||0)}</div></div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:8px;display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:12px">
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">PHN</div><div style="font-weight:800">${peso(e.phn||0)}</div></div>
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">OHD</div><div style="font-weight:800">${peso(e.ohd||0)}</div></div>
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">GROSS PRF</div><div style="font-weight:800">${peso(e.grossPrf||0)}</div></div>
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">LPG</div><div style="font-weight:800">${peso(e.lpg||0)}</div></div>
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">PRF</div><div style="font-weight:800">${peso(e.prf||0)}</div></div>
        <div style="background:var(--orange-light);border-radius:8px;padding:7px 9px"><div style="color:var(--orange-text);font-weight:700;margin-bottom:2px">TTS (10%)</div><div style="font-weight:800">${peso(e.tts||0)}</div></div>
        <div style="background:var(--green-light);border-radius:8px;padding:7px 9px;grid-column:span 2"><div style="color:var(--green-text);font-weight:700;margin-bottom:2px">NET PRF</div><div style="font-weight:900;font-size:16px;color:var(--green-dark)">${peso(e.netPrf||0)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">FOOD COST</div><div style="font-weight:700">${peso(e.foodCost||0)}</div></div>
        <div style="background:var(--bg);border-radius:8px;padding:7px 9px"><div style="color:var(--text-3);font-weight:600;margin-bottom:2px">PAPER COST (PCK)</div><div style="font-weight:700">${peso(e.paperCost||e.pck||0)}</div></div>
        <div style="background:${Math.abs(cb)<1?'var(--green-light)':'var(--red-light)'};border-radius:8px;padding:7px 9px;grid-column:span 2">
          <div style="color:${Math.abs(cb)<1?'var(--green-text)':'var(--red-text)'};font-weight:700;margin-bottom:2px">${cbIcon} CHECK &amp; BALANCE</div>
          <div style="font-weight:800;font-size:15px;${cbClass}">${cb>=0?'+':''}${peso(cb)}</div>
        </div>
      </div>
      ${e.top1||e.top2||e.top3?`<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:8px;font-size:12px"><div style="color:var(--text-3);font-weight:600;margin-bottom:4px">TOP SELLERS</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[e.top1,e.top2,e.top3].filter(Boolean).map((t,i)=>`<span class="badge badge-orange">${['🥇','🥈','🥉'][i]} ${t}</span>`).join('')}</div></div>`:''}
      ${e.expenses?.length||e.miscExpenses?.length?`<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:8px;font-size:12px"><div style="color:var(--text-3);font-weight:600;margin-bottom:4px">EXPENSES (Total: ${peso((e.totalExpenses||0)+(e.totalMisc||0))})</div><div style="display:flex;flex-wrap:wrap;gap:6px">${[...(e.expenses||[]),...(e.miscExpenses||[])].map(x=>`<span style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-weight:600">${x.desc}: ${peso(x.amt)}</span>`).join('')}</div></div>`:''}
    </div>`;
  }).join('');

  wrap.innerHTML=`
  <div class="card" style="background:var(--yellow);border:1.5px solid var(--orange-light)">
    <div style="font-size:14px;font-weight:800;color:var(--orange-text);margin-bottom:12px">📊 Period Summary${month?' – '+month:''} ${branch!=='all'?'· '+branch:''}</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:13px">
      <div><span style="color:var(--text-2)">VAT Sales</span><div style="font-weight:800;font-size:16px">${peso(totSales)}</div></div>
      <div><span style="color:var(--text-2)">Gross</span><div style="font-weight:800;font-size:16px">${peso(totGross)}</div></div>
      <div><span style="color:var(--text-2)">Guests</span><div style="font-weight:800;font-size:16px">${totGuests.toLocaleString()}</div></div>
      <div><span style="color:var(--text-2)">Avg Check</span><div style="font-weight:800;font-size:16px">${avgCheck>0?'₱'+avgCheck.toFixed(2):'—'}</div></div>
      <div><span style="color:var(--text-2)">PHN</span><div style="font-weight:700">${peso(totPhn)}</div></div>
      <div><span style="color:var(--text-2)">OHD</span><div style="font-weight:700">${peso(totOhd)}</div></div>
      <div><span style="color:var(--text-2)">Gross PRF</span><div style="font-weight:700">${peso(totGrossPrf)}</div></div>
      <div><span style="color:var(--text-2)">LPG</span><div style="font-weight:700">${peso(totLpg)}</div></div>
      <div><span style="color:var(--text-2)">PRF</span><div style="font-weight:700">${peso(totPrf)}</div></div>
      <div><span style="color:var(--orange-text);font-weight:700">TTS (10%)</span><div style="font-weight:800;color:var(--orange-dark)">${peso(totTts)}</div></div>
      <div style="grid-column:span 2"><span style="color:var(--green-text);font-weight:700">NET PRF</span><div style="font-weight:900;font-size:20px;color:var(--green-dark)">${peso(totNetPrf)}</div></div>
      <div><span style="color:var(--text-2)">Expenses</span><div style="font-weight:700;color:var(--red-text)">${peso(totExp)}</div></div>
      <div><span style="color:var(--text-2)">Food Cost (PHN−PCK)</span><div style="font-weight:700">${peso(totFoodCost)}</div></div>
      <div><span style="color:var(--text-2)">Paper Cost (PCK)</span><div style="font-weight:700">${peso(tot('pck'))}</div></div>
      <div style="grid-column:span 2"><span style="${balClass.replace('color:','color:').replace(';','')}font-weight:700">Check &amp; Balance</span><div style="font-weight:800;font-size:16px;${balClass}">${totCashBalance>=0?'+':''}${peso(totCashBalance)} ${Math.abs(totCashBalance)<1?'✓ Balanced':'⚠ Variance'}</div></div>
    </div>
  </div>
  ${dayCards}`;
}

async function renderProductAnalysis(){
  const branch=document.getElementById('prod-branch-filter').value;
  const month=document.getElementById('prod-month').value;
  let entries=await getEntries();
  if(branch!=='all')entries=entries.filter(e=>e.branch===branch);
  if(month)entries=entries.filter(e=>e.date.startsWith(month));
  const qtys={},revs={};
  entries.forEach(e=>Object.entries(e.products||{}).forEach(([id,qty])=>{
    qtys[id]=(qtys[id]||0)+qty;
    const p=PRODUCTS.find(x=>x.id===id);revs[id]=(revs[id]||0)+qty*(p?.phn||p?.pck||0);
  }));
  const sorted=Object.entries(qtys).sort((a,b)=>b[1]-a[1]);
  const maxQ=sorted[0]?.[1]||1;
  document.getElementById('product-sales-chart').innerHTML=sorted.length?sorted.slice(0,10).map(([id,qty])=>`<div class="bar-row"><div class="bar-label">${id}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(qty/maxQ*100)}%"></div></div><div class="bar-val">${qty} sold</div></div>`).join(''):'<div class="empty"><div class="empty-text">No data.</div></div>';
  document.getElementById('product-table-wrap').innerHTML=sorted.length?`<div class="card" style="padding:0;overflow:hidden"><table class="data-table"><thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>${sorted.map(([id,qty])=>`<tr><td>${id}</td><td>${qty}</td><td>${peso(revs[id]||0)}</td></tr>`).join('')}</tbody></table></div>`:'';
}

function seedDemo(){
  if(getEntries().length>0)return;
  const demo=[
    {branch:'Fairview',date:'2026-02-26',totalVatSales:13629,gross:12516.75,cashHand:4800,gcash:5764,grabfood:350,foodpanda:0,guestCount:15,totalExpenses:3063,totalMisc:220,phn:6147,pck:959,foodCost:471,netPrf:1063.97,avgCheck:834.45,products:{'BILAO-S':7,'BILAO-M':4,'BILAO-L':4,'BILAO-XL':1,'BG-M':1,'BG-L':2,'MIKI-S':2,'MIKI-M':1,'MIKI-L':2,'PALABOK-S':3,'PALABOK-XL':1,'SPAG-S':1,'SPAG-M':1,'MAC-S':1,'P SISIG-M':1,'PUTO':7,'PICHI':3,'LUMPIA-PORK':1,'LUMPIA-CHICKEN':1,'LUMPIA-FISH':1,'LUMPIA-SPICY':1,'CORDON':1,'FRIED CX':1},top1:'PUTO',top2:'PALABOK-S',top3:'BG-L',expenses:[{desc:'LPG',amt:667.56},{desc:'TTS',amt:118.22}],miscExpenses:[{desc:'Misc',amt:220}]},
    {branch:'Zabarte',date:'2026-02-26',totalVatSales:9800,gross:8900,cashHand:3200,gcash:4100,grabfood:500,foodpanda:0,guestCount:11,totalExpenses:2100,totalMisc:150,phn:4500,pck:700,foodCost:350,netPrf:780,avgCheck:744,products:{'BILAO-S':5,'BILAO-M':3,'BILAO-L':2,'PALABOK-S':4,'MIKI-L':3,'PUTO':5,'PICHI':2},top1:'PALABOK-S',top2:'PUTO',top3:'MIKI-L',expenses:[{desc:'LPG',amt:500}],miscExpenses:[]},
    {branch:'Don Jose',date:'2026-02-25',totalVatSales:11200,gross:10500,cashHand:4100,gcash:4800,grabfood:300,foodpanda:0,guestCount:13,totalExpenses:2800,totalMisc:180,phn:5200,pck:850,foodCost:420,netPrf:920,avgCheck:730,products:{'BILAO-S':6,'BILAO-M':3,'BILAO-L':3,'PALABOK-S':2,'MIKI-S':3,'MIKI-M':2,'SPAG-S':2,'PUTO':6,'PICHI':4},top1:'BILAO-S',top2:'PUTO',top3:'MIKI-S',expenses:[{desc:'LPG',amt:600}],miscExpenses:[]},
    {branch:'Fairview',date:'2026-02-25',totalVatSales:14200,gross:13100,cashHand:5200,gcash:6000,grabfood:400,foodpanda:600,guestCount:17,totalExpenses:3200,totalMisc:200,phn:6800,pck:1050,foodCost:520,netPrf:1150,avgCheck:733,products:{'BILAO-S':8,'BILAO-M':5,'BILAO-L':4,'BILAO-XL':2,'BG-L':3,'MIKI-L':3,'PALABOK-S':4,'PUTO':9,'PICHI':4},top1:'PUTO',top2:'BG-L',top3:'PALABOK-S',expenses:[{desc:'LPG',amt:700}],miscExpenses:[]},
    {branch:'Fairview',date:'2026-02-24',totalVatSales:12100,gross:11200,cashHand:4300,gcash:5400,grabfood:400,foodpanda:0,guestCount:14,totalExpenses:2900,totalMisc:180,phn:5900,pck:900,foodCost:450,netPrf:990,avgCheck:750,products:{'BILAO-S':6,'BILAO-M':4,'BILAO-L':3,'BG-M':2,'MIKI-S':2,'PALABOK-S':3,'PUTO':7,'PICHI':3},top1:'PUTO',top2:'BILAO-S',top3:'PALABOK-S',expenses:[{desc:'LPG',amt:600}],miscExpenses:[]},
  ];
  demo.forEach(e=>saveEntry({id:'d'+Math.random().toString(36).slice(2),...e}));
}


function changeOwnerPassword(){
  const old=document.getElementById('set-old-pass').value;
  const nw=document.getElementById('set-new-pass').value;
  const cf=document.getElementById('set-confirm-pass').value;
  const err=document.getElementById('pass-err');
  const ok=document.getElementById('pass-ok');
  err.style.display='none'; ok.style.display='none';
  const storedPass=localStorage.getItem('doms_owner_pass')||OWNER_PASS;
  if(old!==storedPass){err.textContent='Current password is incorrect.';err.style.display='block';return;}
  if(nw.length<4){err.textContent='New password must be at least 4 characters.';err.style.display='block';return;}
  if(nw!==cf){err.textContent='New passwords do not match.';err.style.display='block';return;}
  localStorage.setItem('doms_owner_pass',nw);
  document.getElementById('set-old-pass').value='';
  document.getElementById('set-new-pass').value='';
  document.getElementById('set-confirm-pass').value='';
  ok.style.display='block';
}

function getOwnerPass(){ return localStorage.getItem('doms_owner_pass')||OWNER_PASS; }

function renderStaffAccounts(){
  const list=getStaffAccounts();
  const el=document.getElementById('staff-accounts-list');
  if(!list.length){el.innerHTML='<div style="color:var(--text-2);font-size:13px;padding:8px 0">No staff accounts yet. Add one below.</div>';return;}
  el.innerHTML=list.map((a,i)=>`
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px">${a.username}</div>
        <div style="font-size:12px;color:var(--text-2)">${a.branch}</div>
      </div>
      <button class="btn" style="padding:6px 12px;font-size:12px" onclick="editStaffPin(${i})">Change PIN</button>
      <button class="btn" style="padding:6px 12px;font-size:12px;color:var(--red)" onclick="deleteStaff(${i})">Remove</button>
    </div>
  `).join('');
}

function showAddStaff(){
  document.getElementById('add-staff-form').style.display='block';
  document.getElementById('new-staff-name').focus();
}
function hideAddStaff(){
  document.getElementById('add-staff-form').style.display='none';
  document.getElementById('new-staff-name').value='';
  document.getElementById('new-staff-pin').value='';
  document.getElementById('new-staff-branch').value='';
  document.getElementById('add-staff-err').style.display='none';
}

function addStaffAccount(){
  const name=(document.getElementById('new-staff-name').value||'').trim();
  const pin=document.getElementById('new-staff-pin').value.trim();
  const branch=document.getElementById('new-staff-branch').value;
  const err=document.getElementById('add-staff-err');
  err.style.display='none';
  if(!name){err.textContent='Username is required.';err.style.display='block';return;}
  if(pin.length<4){err.textContent='PIN must be 4-6 digits.';err.style.display='block';return;}
  if(!branch){err.textContent='Please select a branch.';err.style.display='block';return;}
  const list=getStaffAccounts();
  if(list.find(a=>a.username.toLowerCase()===name.toLowerCase())){
    err.textContent='Username already exists.';err.style.display='block';return;
  }
  list.push({username:name,pin,branch});
  saveStaffAccounts(list);
  hideAddStaff();
  renderStaffAccounts();
}

function deleteStaff(i){
  if(!confirm('Remove this staff account?')) return;
  const list=getStaffAccounts();
  list.splice(i,1);
  saveStaffAccounts(list);
  renderStaffAccounts();
}

function editStaffPin(i){
  const list=getStaffAccounts();
  const newPin=prompt(`New PIN for ${list[i].username}:`);
  if(!newPin) return;
  if(newPin.length<4){alert('PIN must be at least 4 digits.');return;}
  list[i].pin=newPin.trim();
  saveStaffAccounts(list);
  renderStaffAccounts();
}

function uploadBrandPhoto(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    localStorage.setItem('doms_brand_photo',e.target.result);
    loadBrandPhoto();
  };
  reader.readAsDataURL(file);
}

function removeBrandPhoto(){
  localStorage.removeItem('doms_brand_photo');
  loadBrandPhoto();
}

function loadBrandPhoto(){
  const photo=localStorage.getItem('doms_brand_photo');
  const img=document.getElementById('brand-avatar');
  const ph=document.getElementById('brand-avatar-placeholder');
  if(img&&ph){
    if(photo){img.src=photo;img.style.display='block';ph.style.display='none';}
    else{img.style.display='none';ph.style.display='flex';}
  }
}

window.onload=function(){
  if(!localStorage.getItem('doms_gh_token')){ showScreen('screen-token'); return; }
  // Restore session on refresh
  const saved=sessionStorage.getItem(SESSION_KEY);
  if(saved){
    try{
      const s=JSON.parse(saved);
      if(Date.now()-s.ts < INACTIVITY_MS){
        if(s.role==='owner'){
          showScreen('screen-owner');initOwnerDashboard();resetInactivityTimer();
        } else if(s.role==='staff'&&s.branch){
          currentBranch=s.branch;currentStaff=s.staff;
          document.getElementById('staff-branch-label').textContent=s.branch;
          document.getElementById('staff-date-label').textContent=new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
          showScreen('screen-staff');initStaffForm();resetInactivityTimer();
        } else { clearSession(); }
      } else { clearSession(); }
    }catch(e){ clearSession(); }
  }
  const now=new Date().toISOString().slice(0,7);
  ['hist-month','report-month','prod-month'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=now;});
  document.getElementById('report-month').addEventListener('change',renderReports);
  document.getElementById('report-branch').addEventListener('change',renderReports);
  document.getElementById('prod-month').addEventListener('change',renderProductAnalysis);
  document.getElementById('prod-branch-filter').addEventListener('change',renderProductAnalysis);
  document.getElementById('hist-month').addEventListener('change',renderStaffHistory);
};
