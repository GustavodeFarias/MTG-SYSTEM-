/* ═══════════════════════════════════════════════════
   MTG SYSTEM ERP — Bundle Completo v4.0
   Storage → Toast/Modal → Validators → Formatters
   → Helpers → Auth → Products → Estoque → App → Layout
═══════════════════════════════════════════════════ */

/* ── STORAGE ── */
const Storage = {
  prefix: 'mtgsystem_',
  get(k) { try { const v = localStorage.getItem(this.prefix+k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(this.prefix+k, JSON.stringify(v)); return true; } catch { return false; } },
  remove(k) { localStorage.removeItem(this.prefix+k); },
  clear() { Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).forEach(k => localStorage.removeItem(k)); }
};

/* ── SEED ── */
(function seedDemoData() {
  if (Storage.get('seeded')) return;
  Storage.set('users', [
    { id:'u1', name:'Administrador', email:'admin@mtg.com', password:btoa('admin123'), role:'admin', status:'active', createdAt:new Date().toISOString() }
  ]);
  const now = new Date();
  const d = (daysAgo, h=10, m=0) => { const d=new Date(now); d.setDate(d.getDate()-daysAgo); d.setHours(h,m,0,0); return d.toISOString(); };
  Storage.set('products', [
    { id:'p1',  sku:'MTG-00001', name:'Pastilha de Freio Dianteira',    category:'Freios',       quantity:45,  price:89.90,   pricePounds:0,     supplier:'Auto Peças Norte',    createdAt:d(10,9,0)  },
    { id:'p2',  sku:'MTG-00002', name:'Disco de Freio Ventilado',       category:'Freios',       quantity:3,   price:299.50,  pricePounds:47.30, supplier:'Distribuidora Sul',   createdAt:d(9,11,15) },
    { id:'p3',  sku:'MTG-00003', name:'Óleo de Motor 5W30 1L',          category:'Motor',        quantity:120, price:35.00,   pricePounds:0,     supplier:'Importadora Centro',  createdAt:d(8,8,30)  },
    { id:'p4',  sku:'MTG-00004', name:'Filtro de Óleo Mahle',           category:'Filtros',      quantity:7,   price:22.90,   pricePounds:0,     supplier:'Auto Peças Norte',    createdAt:d(7,14,0)  },
    { id:'p5',  sku:'MTG-00005', name:'Bateria 60Ah Heliar',            category:'Elétrica',     quantity:2,   price:450.00,  pricePounds:71.20, supplier:'Mega Parts',          createdAt:d(7,15,45) },
    { id:'p6',  sku:'MTG-00006', name:'Amortecedor Dianteiro Monroe',   category:'Suspensão',    quantity:18,  price:380.00,  pricePounds:60.10, supplier:'Distribuidora Sul',   createdAt:d(6,9,0)   },
    { id:'p7',  sku:'MTG-00007', name:'Kit Embreagem Completo',         category:'Embreagem',    quantity:4,   price:650.00,  pricePounds:102.80,supplier:'Fornecedor ABC',      createdAt:d(5,10,30) },
    { id:'p8',  sku:'MTG-00008', name:'Correia Dentada Gates',          category:'Motor',        quantity:22,  price:95.00,   pricePounds:15.00, supplier:'Auto Peças Norte',    createdAt:d(4,13,0)  },
    { id:'p9',  sku:'MTG-00009', name:'Vela de Ignição NGK',            category:'Motor',        quantity:0,   price:18.50,   pricePounds:0,     supplier:'Importadora Centro',  createdAt:d(3,9,15)  },
    { id:'p10', sku:'MTG-00010', name:'Filtro de Ar K&N',              category:'Filtros',      quantity:31,  price:145.00,  pricePounds:22.90, supplier:'Mega Parts',          createdAt:d(2,11,0)  },
    { id:'p11', sku:'MTG-00011', name:'Mola de Suspensão Dianteira',    category:'Suspensão',    quantity:9,   price:220.00,  pricePounds:34.80, supplier:'Distribuidora Sul',   createdAt:d(2,14,30) },
    { id:'p12', sku:'MTG-00012', name:'Silencioso Traseiro Universal',  category:'Escapamento',  quantity:12,  price:180.00,  pricePounds:28.50, supplier:'Fornecedor ABC',      createdAt:d(1,10,0)  },
    { id:'p13', sku:'MTG-00013', name:'Caixa de Câmbio Remanuf. 5M',   category:'Transmissão',  quantity:1,   price:2800.00, pricePounds:442.50,supplier:'Mega Parts',          createdAt:d(1,15,20) },
    { id:'p14', sku:'MTG-00014', name:'Fluido de Freio DOT 4 500ml',   category:'Freios',       quantity:55,  price:28.00,   pricePounds:0,     supplier:'Auto Peças Norte',    createdAt:d(0,8,45)  },
    { id:'p15', sku:'MTG-00015', name:'Rolamento de Roda Dianteiro',   category:'Suspensão',    quantity:6,   price:155.00,  pricePounds:24.50, supplier:'Distribuidora Sul',   createdAt:d(0,9,0)   },
  ]);
  Storage.set('sku_counter', 15);
  Storage.set('movimentos', [
    { id:'mv1', produtoId:'p1', produtoNome:'Pastilha de Freio Dianteira', sku:'MTG-00001', tipo:'entrada', quantidade:20, qtdAntes:25, qtdDepois:45, motivo:'Compra fornecedor', usuario:'Administrador', data:d(5,10,0) },
    { id:'mv2', produtoId:'p3', produtoNome:'Óleo de Motor 5W30 1L',       sku:'MTG-00003', tipo:'saida',   quantidade:5,  qtdAntes:125,qtdDepois:120,motivo:'Venda balcão',      usuario:'Administrador', data:d(4,11,0) },
    { id:'mv3', produtoId:'p8', produtoNome:'Correia Dentada Gates',       sku:'MTG-00008', tipo:'entrada', quantidade:10, qtdAntes:12, qtdDepois:22, motivo:'Reposição',         usuario:'Administrador', data:d(3,14,0) },
    { id:'mv4', produtoId:'p2', produtoNome:'Disco de Freio Ventilado',    sku:'MTG-00002', tipo:'saida',   quantidade:2,  qtdAntes:5,  qtdDepois:3,  motivo:'Venda',             usuario:'Administrador', data:d(2,9,30) },
    { id:'mv5', produtoId:'p14',produtoNome:'Fluido de Freio DOT 4 500ml', sku:'MTG-00014', tipo:'entrada', quantidade:30, qtdAntes:25, qtdDepois:55, motivo:'Compra',            usuario:'Administrador', data:d(1,10,0) },
  ]);
  Storage.set('logs', [
    { id:'l1', type:'login', message:'Sistema iniciado', user:'Sistema', role:'admin', timestamp:d(0,8,0) }
  ]);
  Storage.set('seeded', true);
})();

/* ── TOAST & MODAL ── */
const Toast = {
  _el() {
    let c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
    return c;
  },
  show(title, msg='', type='info', ms=4000) {
    const icons = {
      success:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="toast-icon">${icons[type]||icons.info}</div><div class="toast-content"><div class="toast-title">${title}</div>${msg?`<div class="toast-message">${msg}</div>`:''}</div><button class="toast-close" onclick="Toast.dismiss(this.closest('.toast'))"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    this._el().appendChild(t);
    if (ms > 0) setTimeout(() => this.dismiss(t), ms);
    return t;
  },
  dismiss(t) { if (!t || t.classList.contains('out')) return; t.classList.add('out'); setTimeout(() => t.remove(), 300); },
  success(t,m) { return this.show(t,m,'success'); },
  error(t,m) { return this.show(t,m,'error',6000); },
  warning(t,m) { return this.show(t,m,'warning',5000); },
  info(t,m) { return this.show(t,m,'info'); }
};

const Modal = {
  open(id) { const el=document.getElementById(id); if(el){el.classList.add('open');document.body.style.overflow='hidden';} },
  close(id) {
    const el = id ? document.getElementById(id) : document.querySelector('.modal-overlay.open');
    if(el){el.classList.remove('open');document.body.style.overflow='';}
  },
  confirm({title, message, onConfirm, danger=true, confirmText='Confirmar'}) {
    const el = document.getElementById('confirmModal');
    if (!el) return;
    el.querySelector('.confirm-title').textContent = title;
    el.querySelector('.confirm-message').textContent = message;
    const btn = el.querySelector('#confirmBtn');
    btn.className = `btn ${danger?'btn-danger':'btn-primary'}`;
    btn.textContent = confirmText;
    btn.onclick = () => { this.close('confirmModal'); onConfirm?.(); };
    this.open('confirmModal');
  }
};
document.addEventListener('keydown', e => { if(e.key==='Escape') Modal.close(); });

/* ── VALIDATORS ── */
const Validators = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()),
  required: v => v !== null && v !== undefined && String(v).trim() !== '',
  password: v => String(v).length >= 6,
  showErrors(errs) {
    document.querySelectorAll('.form-error.visible').forEach(el=>el.classList.remove('visible'));
    document.querySelectorAll('.form-input.error').forEach(el=>el.classList.remove('error'));
    Object.entries(errs).forEach(([name,msg]) => {
      const inp = document.querySelector(`[name="${name}"]`) || document.getElementById(name);
      const errEl = document.querySelector(`[data-error="${name}"]`);
      if(inp) inp.classList.add('error');
      if(errEl){errEl.textContent=msg;errEl.classList.add('visible');}
    });
  },
  clearErrors() {
    document.querySelectorAll('.form-error.visible').forEach(el=>el.classList.remove('visible'));
    document.querySelectorAll('.form-input.error').forEach(el=>el.classList.remove('error'));
  }
};

/* ── FORMATTERS ── */
const Formatters = {
  currency: v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0),
  number: v => new Intl.NumberFormat('pt-BR').format(v||0),
  date(s) { if(!s) return '—'; try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return '—'; } },
  datetime(s) { if(!s) return '—'; try { return new Date(s).toLocaleString('pt-BR'); } catch { return '—'; } },
  timeAgo(s) {
    try {
      const diff = Math.floor((Date.now()-new Date(s))/1000);
      if(diff<60) return 'Agora';
      if(diff<3600) return `${Math.floor(diff/60)}min atrás`;
      if(diff<86400) return `${Math.floor(diff/3600)}h atrás`;
      return `${Math.floor(diff/86400)}d atrás`;
    } catch { return '—'; }
  },
  rolePT(r) { return {admin:'Administrador',estoquista:'Estoquista',analista:'Analista',visualizador:'Visualizador'}[r]||r; },
  statusPT(s) { return {active:'Ativo',inactive:'Inativo',blocked:'Bloqueado'}[s]||s; }
};

/* ── HELPERS ── */
const Helpers = {
  debounce(fn, ms=300) { let t; return (...a) => { clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; },
  generateId(pfx='id') { return pfx+Date.now()+Math.random().toString(36).slice(2,7); },
  nextSku() { let c=(Storage.get('sku_counter')||0)+1; Storage.set('sku_counter',c); return 'MTG-'+String(c).padStart(5,'0'); },
  sortArray(arr, key, dir='asc') {
    return [...arr].sort((a,b) => {
      let va=a[key], vb=b[key];
      if(va==null) va=''; if(vb==null) vb='';
      if(typeof va==='string') va=va.toLowerCase();
      if(typeof vb==='string') vb=vb.toLowerCase();
      if(va<vb) return dir==='asc'?-1:1;
      if(va>vb) return dir==='asc'?1:-1;
      return 0;
    });
  },
  paginate(arr, page, perPage) {
    const start=(page-1)*perPage;
    return { items:arr.slice(start,start+perPage), total:arr.length, pages:Math.max(1,Math.ceil(arr.length/perPage)), page };
  },
  getStockStatus(qty) { if(qty<=0) return 'critical'; if(qty<5) return 'critical'; if(qty<10) return 'low'; return 'ok'; },
  stockBadge(qty) {
    const s=this.getStockStatus(qty);
    if(s==='critical') return `<span class="badge badge-danger badge-dot">Crítico</span>`;
    if(s==='low') return `<span class="badge badge-warning badge-dot">Baixo</span>`;
    return `<span class="badge badge-success badge-dot">Normal</span>`;
  },
  exportCSV(data, filename) {
    if(!data.length) return;
    const keys=Object.keys(data[0]);
    const csv=[keys.join(','),...data.map(row=>keys.map(k=>`"${(row[k]??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    a.download=filename+'.csv'; a.click();
  }
};

/* ── AUTH ── */
const Auth = {
  SK: 'session',
  getSession() { return Storage.get(this.SK); },
  requireAuth() {
    const s=this.getSession();
    if(!s) { window.location.href='index.html'; return null; }
    return s;
  },
  redirectIfAuth() { if(this.getSession()) window.location.href='dashboard.html'; },
  login(email, password) {
    const users=Storage.get('users')||[];
    const u=users.find(u=>u.email===email.trim().toLowerCase() && u.password===btoa(password));
    if(!u) return {success:false, message:'E-mail ou senha incorretos'};
    if(u.status==='inactive') return {success:false, message:'Usuário desativado. Contate o administrador.'};
    if(u.status==='blocked')  return {success:false, message:'Usuário bloqueado. Contate o administrador.'};
    Storage.set(this.SK, {id:u.id, name:u.name, email:u.email, role:u.role});
    this.log('login', `Login: ${u.name}`);
    return {success:true};
  },
  register(data) {
    const users=Storage.get('users')||[];
    const email=data.email.trim().toLowerCase();
    if(users.find(u=>u.email===email)) return {success:false, message:'E-mail já cadastrado'};
    users.push({id:'u'+Date.now(), name:data.name.trim(), email, password:btoa(data.password), role:data.role||'visualizador', status:'active', createdAt:new Date().toISOString()});
    Storage.set('users',users);
    return {success:true};
  },
  logout() { this.log('logout','Logout'); Storage.remove(this.SK); window.location.href='index.html'; },
  can(action) {
    const s=this.getSession(); if(!s) return false;
    const perms={admin:['all'],estoquista:['products_read','products_write','dashboard','estoque'],analista:['products_read','reports','dashboard'],visualizador:['products_read','dashboard']};
    const p=perms[s.role]||[];
    return p.includes('all')||p.includes(action);
  },
  log(type, message) {
    const logs=Storage.get('logs')||[];
    const s=this.getSession();
    logs.unshift({id:'l'+Date.now(), type, message, user:s?.name||'Sistema', role:s?.role||'—', timestamp:new Date().toISOString()});
    Storage.set('logs',logs.slice(0,300));
  }
};

/* ── PRODUCTS ── */
const Products = {
  all:[], filtered:[], sortKey:'createdAt', sortDir:'desc',
  currentPage:1, perPage:10, search:'', categoryFilter:'', stockFilter:'',

  load() { this.all=Storage.get('products')||[]; this.applyFilters(); },
  save() { Storage.set('products',this.all); },

  applyFilters() {
    let r=[...this.all];
    if(this.search) {
      const q=this.search.toLowerCase();
      r=r.filter(p=>p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||(p.supplier||'').toLowerCase().includes(q));
    }
    if(this.categoryFilter) r=r.filter(p=>p.category===this.categoryFilter);
    if(this.stockFilter) r=r.filter(p=>Helpers.getStockStatus(p.quantity)===this.stockFilter);
    this.filtered=Helpers.sortArray(r,this.sortKey,this.sortDir);
  },
  getPage() { return Helpers.paginate(this.filtered,this.currentPage,this.perPage); },

  create(data) {
    const p={
      id:Helpers.generateId('p'), sku:Helpers.nextSku(),
      name:data.name.trim(), category:data.category,
      quantity:parseInt(data.quantity)||0,
      price:parseFloat(data.price)||0,
      pricePounds:parseFloat(data.pricePounds)||0,
      supplier:(data.supplier||'').trim(),
      createdAt:new Date().toISOString()
    };
    this.all.unshift(p); this.save();
    Auth.log('product_create',`Produto criado: ${p.name} (${p.sku})`);
    return p;
  },
  update(id, data) {
    const i=this.all.findIndex(p=>p.id===id); if(i===-1) return null;
    this.all[i]={...this.all[i],...data, updatedAt:new Date().toISOString()};
    this.save();
    Auth.log('product_update',`Produto atualizado: ${this.all[i].name}`);
    return this.all[i];
  },
  delete(id) {
    const p=this.all.find(p=>p.id===id);
    this.all=this.all.filter(p=>p.id!==id); this.save();
    if(p) Auth.log('product_delete',`Produto removido: ${p.name}`);
  },
  getById(id) { return this.all.find(p=>p.id===id); },
  getCategories() { return [...new Set(this.all.map(p=>p.category))].sort(); },
  getCritical() { return this.all.filter(p=>p.quantity<5); },
  getLow() { return this.all.filter(p=>p.quantity>=5&&p.quantity<10); },
  getTotalValue() { return this.all.reduce((s,p)=>s+(p.price*p.quantity),0); },
  getByCategory() { const c={}; this.all.forEach(p=>{c[p.category]=(c[p.category]||0)+1;}); return c; }
};

/* ── USERS ── */
const Users = {
  all:[],
  load() { this.all=Storage.get('users')||[]; },
  save() { Storage.set('users',this.all); },
  getAll() { return this.all; },
  getById(id) { return this.all.find(u=>u.id===id); },
  create(data) {
    const r=Auth.register(data);
    if(r.success){ this.load(); Auth.log('user_create',`Usuário criado: ${data.name} (${data.role})`); }
    return r;
  },
  update(id, data) {
    const i=this.all.findIndex(u=>u.id===id); if(i===-1) return false;
    if(data.password) data.password=btoa(data.password);
    this.all[i]={...this.all[i],...data};
    this.save(); Auth.log('user_update',`Usuário atualizado: ${this.all[i].name}`);
    return true;
  },
  setStatus(id, status) {
    const i=this.all.findIndex(u=>u.id===id); if(i===-1) return false;
    if(this.all[i].id===Auth.getSession()?.id) return false;
    this.all[i].status=status; this.save();
    Auth.log('user_status',`Status de ${this.all[i].name} → ${status}`);
    return true;
  },
  delete(id) {
    if(id===Auth.getSession()?.id) return false;
    const u=this.all.find(u=>u.id===id);
    this.all=this.all.filter(u=>u.id!==id); this.save();
    if(u) Auth.log('user_delete',`Usuário removido: ${u.name}`);
    return true;
  }
};

/* ── ESTOQUE ── */
const Estoque = {
  getMovimentos() { return Storage.get('movimentos')||[]; },
  save(list) { Storage.set('movimentos',list); },
  registrar(produtoId, tipo, quantidade, motivo, usuario) {
    const p=Products.getById(produtoId);
    if(!p) return {success:false, message:'Produto não encontrado'};
    const qty=parseInt(quantidade);
    if(isNaN(qty)||qty<=0) return {success:false, message:'Quantidade inválida'};
    if(tipo==='saida'&&p.quantity<qty) return {success:false, message:`Estoque insuficiente. Disponível: ${p.quantity}`};
    const novaQtd=tipo==='entrada'?p.quantity+qty:p.quantity-qty;
    const antes=p.quantity;
    Products.update(produtoId,{quantity:novaQtd});
    const movs=this.getMovimentos();
    movs.unshift({id:Helpers.generateId('mv'), produtoId, produtoNome:p.name, sku:p.sku, tipo, quantidade:qty, qtdAntes:antes, qtdDepois:novaQtd, motivo:motivo||'—', usuario:usuario||'Sistema', data:new Date().toISOString()});
    this.save(movs);
    Auth.log(tipo==='entrada'?'stock_in':'stock_out',`${tipo==='entrada'?'Entrada':'Saída'}: ${qty}x ${p.name} — ${motivo||'—'}`);
    return {success:true, novaQtd};
  },
  getTotalEntradas() { return this.getMovimentos().filter(m=>m.tipo==='entrada').reduce((s,m)=>s+m.quantidade,0); },
  getTotalSaidas()   { return this.getMovimentos().filter(m=>m.tipo==='saida').reduce((s,m)=>s+m.quantidade,0); }
};

/* ── APP CORE ── */
const App = {
  init() {
    this.applyTheme();
    this.bindSidebar();
    this.updateSidebarUser();
    this.highlightNav();
    this.checkInactivity();
  },
  applyTheme() { document.documentElement.setAttribute('data-theme', Storage.get('theme')||'dark'); },
  toggleTheme() {
    const cur=document.documentElement.getAttribute('data-theme');
    const next=cur==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    Storage.set('theme',next);
    Toast.info('Tema alterado', next==='dark'?'Modo escuro ativado':'Modo claro ativado');
  },
  bindSidebar() {
    const sb=document.getElementById('sidebar');
    const tog=document.getElementById('sidebarToggle');
    const ov=document.getElementById('sidebarOverlay');
    if(!sb) return;
    if(Storage.get('sb_collapsed')&&window.innerWidth>768) {
      sb.classList.add('collapsed');
      document.getElementById('mainContent')?.classList.add('expanded');
    }
    tog?.addEventListener('click',()=>{
      if(window.innerWidth<=768) { sb.classList.toggle('mobile-open'); ov?.classList.toggle('visible'); }
      else {
        sb.classList.toggle('collapsed');
        document.getElementById('mainContent')?.classList.toggle('expanded');
        Storage.set('sb_collapsed',sb.classList.contains('collapsed'));
      }
    });
    ov?.addEventListener('click',()=>{ sb.classList.remove('mobile-open'); ov.classList.remove('visible'); });
  },
  updateSidebarUser() {
    const s=Auth.getSession(); if(!s) return;
    const el=id=>document.getElementById(id);
    if(el('sidebarUserName')) el('sidebarUserName').textContent=s.name;
    if(el('sidebarUserRole')) el('sidebarUserRole').textContent=Formatters.rolePT(s.role);
    if(el('sidebarAvatar'))   el('sidebarAvatar').textContent=s.name.charAt(0).toUpperCase();
  },
  highlightNav() {
    const page=window.location.pathname.split('/').pop()||'dashboard.html';
    document.querySelectorAll('.nav-item').forEach(item=>{
      item.classList.remove('active');
      const href=item.getAttribute('data-href');
      if(href&&(page===href||(page===''&&href==='dashboard.html'))) item.classList.add('active');
    });
  },
  navigate(href) { window.location.href=href; },
  checkInactivity() {
    let t;
    const reset=()=>{ clearTimeout(t); t=setTimeout(()=>{ Auth.logout(); },30*60*1000); };
    ['mousemove','keydown','click','touchstart'].forEach(e=>document.addEventListener(e,reset,{passive:true}));
    reset();
  }
};

/* ── LAYOUT ── */
function renderLayout(title, activeHref) {
  const s=Auth.getSession();
  const ICON = {
    dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    produtos:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    estoque:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    relatorios:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    usuarios:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
    manual:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    config:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
  };
  const navItems = [
    {href:'dashboard.html',   label:'Dashboard',    icon:ICON.dashboard},
    {href:'produtos.html',    label:'Produtos',     icon:ICON.produtos},
    {href:'estoque.html',     label:'Estoque',      icon:ICON.estoque},
    {href:'relatorios.html',  label:'Relatórios',   icon:ICON.relatorios},
    {href:'usuarios.html',    label:'Usuários',     icon:ICON.usuarios, adminOnly:true},
    {href:'manual.html',      label:'Manual',       icon:ICON.manual},
    {href:'configuracoes.html',label:'Configurações',icon:ICON.config},
  ];
  const navHTML=navItems
    .filter(i=>!i.adminOnly||s?.role==='admin')
    .map(i=>`<div class="nav-item${i.href===activeHref?' active':''}" data-href="${i.href}" data-label="${i.label}" onclick="App.navigate('${i.href}')"><div class="nav-icon">${i.icon}</div><span class="nav-label">${i.label}</span></div>`)
    .join('');
  return `
<div id="sidebarOverlay" class="sidebar-overlay"></div>
<aside id="sidebar" class="sidebar">
  <div class="sidebar-logo">
    <img src="assets/images/logo.jpeg" alt="MTG" class="logo-img" onerror="this.style.display='none'">
    <div class="logo-text">MTG SYSTEM<span>ERP · Development</span></div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section-label">Menu Principal</div>
    ${navHTML}
  </nav>
  <div class="sidebar-bottom">
    <div class="user-card" onclick="App.navigate('configuracoes.html')">
      <div class="user-avatar" id="sidebarAvatar">${s?.name?.charAt(0)||'U'}</div>
      <div class="user-info">
        <div class="user-name" id="sidebarUserName">${s?.name||'Usuário'}</div>
        <div class="user-role" id="sidebarUserRole">${Formatters.rolePT(s?.role)}</div>
      </div>
    </div>
  </div>
</aside>
<div class="main-content" id="mainContent">
  <header class="topbar">
    <button class="topbar-toggle" id="sidebarToggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div class="topbar-title">${title}</div>
    <div class="topbar-actions">
      <button class="topbar-btn" onclick="App.toggleTheme()" title="Alternar tema">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
      <div style="width:1px;height:20px;background:var(--border);margin:0 4px"></div>
      <button class="topbar-btn" onclick="Auth.logout()" title="Sair" style="color:var(--danger)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </header>`;
}

/* ── CONFIRM MODAL HTML (injected once) ── */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('confirmModal')) {
    const div = document.createElement('div');
    div.innerHTML = `
    <div id="confirmModal" class="modal-overlay">
      <div class="modal modal-sm">
        <div class="modal-body" style="padding:var(--s8) var(--s6) var(--s6)">
          <div style="text-align:center">
            <div class="confirm-icon danger" style="margin-bottom:var(--s4)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="confirm-title" style="font-family:var(--font-h);font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px">Confirmar</div>
            <div class="confirm-message" style="font-size:13.5px;color:var(--text-muted);line-height:1.6"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="Modal.close('confirmModal')">Cancelar</button>
          <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(div.firstElementChild);
  }
});
