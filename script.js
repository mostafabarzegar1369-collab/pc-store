const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
const SB='https://amhclwujstlipwjjahrs.supabase.co',KEY='sb_publishable_i7OICU1vj-NcXez0FU5c8Q_P2qJP4Yj';
const sbf=(p,b,t)=>fetch(SB+p,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:JSON.stringify(b||{})}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}));
const rest=(p,m,b)=>{const s=session(),h={apikey:KEY,'Content-Type':'application/json',Prefer:'return=representation'};if(s)h.Authorization='Bearer '+s.at;return fetch(SB+'/rest/v1/'+p,{method:m||'GET',headers:h,body:b?JSON.stringify(b):undefined}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}))};
const session=()=>get('sb','null');
const save=d=>{const u=d.user||{};localStorage.setItem('sb',JSON.stringify({name:(u.user_metadata&&u.user_metadata.name)||u.email,email:u.email,at:d.access_token,rt:d.refresh_token,exp:Date.now()+(d.expires_in||3600)*1000}))};
const logout=()=>{const s=session();if(s)sbf('/auth/v1/logout',{},s.at).catch(()=>{});localStorage.removeItem('sb');location.reload()};
const errs={user_already_exists:'این ایمیل قبلاً ثبت شده است. وارد شوید.',invalid_credentials:'ایمیل یا رمز عبور درست نیست. دوباره بررسی کنید.',weak_password:'رمز عبور ضعیف است. رمز قوی‌تری انتخاب کنید.',email_not_confirmed:'ابتدا ایمیل خود را تأیید کنید.',over_email_send_rate_limit:'تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید.',validation_failed:'ایمیل واردشده معتبر نیست.',signup_disabled:'ثبت‌نام فعلاً غیرفعال است.'};
const emsg=d=>errs[d.error_code||d.code]||'مشکلی پیش آمد. دوباره تلاش کنید.';
async function refreshSession(){const s=session();if(!s||s.exp>Date.now()+60000)return;const r=await sbf('/auth/v1/token?grant_type=refresh_token',{refresh_token:s.rt}).catch(()=>null);if(r&&r.ok)save(r.d);else if(r)localStorage.removeItem('sb')}
const fa=n=>n.toLocaleString('fa-IR');
const cats=[
 {id:'cpu',n:'پردازنده',i:'ti-cpu'},{id:'gpu',n:'کارت گرافیک',i:'ti-chip'},
 {id:'ram',n:'رم و حافظه',i:'ti-database'},{id:'mouse',n:'موس',i:'ti-mouse'},
 {id:'kb',n:'کیبورد',i:'ti-keyboard'},{id:'head',n:'هدست',i:'ti-headphones'}];
/* عکس هر محصول: فایل images/شناسه.jpg (مثلا images/mouse1.jpg). اگر عکس نبود، آیکون نشان داده می‌شود */
const cols=['#a78bfa','#ff6bb5','#ff6b78','#c084fc','#ff8fc7','#ff8a65'];cats.forEach((c,i)=>c.col=cols[i]);
const subs={cpu:['Ryzen','Core'],gpu:['RTX','RX'],ram:['DDR5','SSD'],mouse:['بی‌سیم','سبک'],kb:['مکانیکال','۶۰ درصد'],head:['گیمینگ','استودیویی']};
let products=[];
const descs={cpu:'پردازنده‌ی قدرتمند برای بازی و کارهای سنگین، با گارانتی معتبر.',gpu:'کارت گرافیک برای بازی در کیفیت بالا و رندر سریع.',ram:'قطعه‌ی سریع برای بالا بردن سرعت کلی سیستم.',mouse:'موس دقیق و سبک برای بازی و کار روزمره.',kb:'کیبورد با حس تایپ عالی و ساخت مقاوم.',head:'هدست با صدای شفاف و راحت برای ساعت‌ها استفاده.'};
const icon=p=>cats.find(c=>c.id==p.cat).i;
const pic=p=>`<img src="images/${p.id}.jpg" alt="${p.name}" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'ti ${icon(p)}'}))">`;
const cart=()=>{const c=get('cart2','{}');return c&&typeof c=='object'?c:{}};
const saveCart=c=>{localStorage.setItem('cart2',JSON.stringify(c));const n=Object.values(c).reduce((a,b)=>a+b,0);document.querySelectorAll('#cc,.bdg').forEach(e=>e.textContent=n)};
const count=()=>Object.values(cart()).reduce((a,b)=>a+b,0);
function toast(t){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}
 e.textContent=t;e.classList.add('show');clearTimeout(e.t);e.t=setTimeout(()=>e.classList.remove('show'),1800)}
const logo=()=>`<a class="logo" href="index.html"><span class="lg"><i class="ti ti-cpu"></i></span><span class="ln">پارت‌زون</span></a>`;
const qlink=(c,x)=>`index.html?cat=${c.id}${x?'&q='+encodeURIComponent(x):''}#shop`;
function header(){
 const me=session();
 $('#hdr').innerHTML=`<header><div class="wrap nav">
 <button class="burger" id="bg" aria-label="باز کردن منو"><i class="ti ti-menu-2"></i></button>${logo()}
 <nav class="dn">${cats.map(c=>`<div class="dd"><a href="${qlink(c)}" style="--c:${c.col}">${c.n}</a><div class="sub">${subs[c.id].map(x=>`<a href="${qlink(c,x)}">${x}</a>`).join('')}</div></div>`).join('')}</nav>
 <input class="hs" id="hs" placeholder="جستجو در محصولات" aria-label="جستجو">
 <div class="acts"><a href="cart.html" class="cartl"><i class="ti ti-shopping-cart"></i> <b id="cc">${count()}</b></a>
 ${me?`<a href="orders.html">سفارش‌ها</a><span>${esc(me.name)}</span><button class="btn ghost" id="out">خروج</button>`
 :`<a class="btn ghost" href="login.html">ورود</a><a class="btn" href="register.html">ثبت‌نام</a>`}</div></div></header>
 <div class="ov" id="ov"></div>
 <aside class="drawer" id="dr" aria-label="منو"><div class="dh">${logo()}<button class="x" id="dx" aria-label="بستن منو"><i class="ti ti-x"></i></button></div>
 <div class="dq"><a href="index.html"><i class="ti ti-home"></i>خانه</a>
 <a href="cart.html"><i class="ti ti-shopping-cart"></i>سبد خرید<b class="bdg">${count()}</b></a>
 ${me?`<a href="orders.html"><i class="ti ti-package"></i>سفارش‌های من</a><button class="qb" id="out2"><i class="ti ti-logout"></i>خروج (${esc(me.name)})</button>`
 :`<a href="login.html"><i class="ti ti-login"></i>ورود</a><a href="register.html"><i class="ti ti-user-plus"></i>ثبت‌نام</a>`}</div>
 <div class="dt">محصولات</div>
 ${cats.map(c=>`<div class="acc"><button class="ah" style="--c:${c.col}"><span class="ic"><i class="ti ${c.i}"></i></span>${c.n}<i class="ti ti-chevron-down ch"></i></button>
 <div class="ab"><a href="${qlink(c)}">همه‌ی ${c.n}</a>${subs[c.id].map(x=>`<a href="${qlink(c,x)}">${x}</a>`).join('')}</div></div>`).join('')}</aside>`;
 const dr=$('#dr'),ov=$('#ov'),tog=o=>{dr.classList.toggle('open',o);ov.classList.toggle('on',o);document.body.classList.toggle('lock',o)};
 $('#bg').onclick=()=>tog(true);$('#dx').onclick=ov.onclick=()=>tog(false);
 dr.querySelectorAll('.ah').forEach(x=>x.onclick=()=>x.parentElement.classList.toggle('on'));
 dr.querySelectorAll('a').forEach(x=>x.addEventListener('click',()=>tog(false)));
 document.onkeydown=e=>{if(e.key=='Escape')tog(false)};
 ['#out','#out2'].forEach(k=>{const o=$(k);if(o)o.onclick=logout});
 const hs=$('#hs');if(hs)hs.onkeydown=e=>{if(e.key=='Enter')location='index.html?q='+encodeURIComponent(hs.value.trim())+'#shop'};
}
function footer(){
 document.querySelectorAll('footer').forEach(x=>x.remove());
 document.body.insertAdjacentHTML('beforeend',`<footer class="ft"><div class="wrap fg"><div>${logo()}<p>فروشگاه آنلاین قطعات و لوازم جانبی کامپیوتر.</p></div>
 <div><h4>دسته‌ها</h4>${cats.map(c=>`<a href="${qlink(c)}">${c.n}</a>`).join('')}</div>
 <div><h4>حساب کاربری</h4><a href="login.html">ورود</a><a href="register.html">ثبت‌نام</a><a href="cart.html">سبد خرید</a><a href="orders.html">سفارش‌های من</a></div></div>
 <div class="cp">© پارت‌زون، تمام حقوق محفوظ است.</div></footer>`);
}
function tilt(el,deg,lift){
 el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform=`rotateY(${-x*deg}deg) rotateX(${y*deg}deg) translateY(${lift}px) scale(1.04)`});
 el.addEventListener('mouseleave',()=>el.style.transform='');
}
const P=new URLSearchParams(location.search);let cat=cats.some(c=>c.id==P.get('cat'))?P.get('cat'):'all',q=(P.get('q')||'').trim();
function shop(){
 const box=$('#shop');if(!box)return;
 $('#chips').innerHTML=`<button class="chip ${cat=='all'?'on':''}" data-c="all">همه</button>`+cats.map(c=>`<button class="chip ${cat==c.id?'on':''}" data-c="${c.id}">${c.n}</button>`).join('');
 box.innerHTML=cats.filter(c=>cat=='all'||cat==c.id).map(c=>{
  const l=products.filter(p=>p.cat==c.id&&p.name.includes(q));if(!l.length)return'';
  return`<h2 class="g" id="${c.id}" style="--c:${c.col}"><i class="ti ${c.i}"></i>${c.n}</h2><div class="grid">`+l.map(p=>`<div class="card" style="--c:${c.col}"><a href="product.html?id=${p.id}"><div class="pic">${pic(p)}</div><h3>${p.name}</h3></a><div class="price">${fa(p.price)} تومان</div><button class="btn add" data-id="${p.id}">افزودن به سبد</button></div>`).join('')+'</div>'}).join('')||'<p>محصولی پیدا نشد. عبارت دیگری جستجو کنید.</p>';
 box.querySelectorAll('.card').forEach(c=>tilt(c,18,-8));
 box.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const c=cart();c[b.dataset.id]=(c[b.dataset.id]||0)+1;saveCart(c);toast('به سبد خرید اضافه شد')});
 $('#chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;shop()});
}
function productPage(){
 const box=$('#prodBox');if(!box)return;
 const p=products.find(x=>x.id==new URLSearchParams(location.search).get('id'));
 if(!p){box.innerHTML='<div class="empty"><i class="ti ti-package-off"></i><h2>این محصول پیدا نشد</h2><a class="btn" href="index.html">بازگشت به فروشگاه</a></div>';return}
 document.title=p.name;
 const c=cats.find(x=>x.id==p.cat),rel=products.filter(x=>x.cat==p.cat&&x.id!=p.id);
 box.innerHTML=`<div class="crumb"><a href="index.html">خانه</a> / <a href="index.html#${c.id}">${c.n}</a> / ${p.name}</div>
 <div class="pd"><div class="pstage"><div class="pic bigp" id="pimg" style="--c:${c.col}">${pic(p)}</div></div>
 <div class="pinfo"><h1>${p.name}</h1><div class="price lg">${fa(p.price)} تومان</div><p class="desc">${p.desc||descs[p.cat]}</p>
 <table class="spec">${(p.specs||[]).map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
 <div class="buy"><button class="btn" id="addp">افزودن به سبد</button><a class="btn ghost" href="cart.html">مشاهده سبد</a></div></div></div>
 ${rel.length?`<h2 class="g">محصولات مشابه</h2><div class="grid">${rel.map(r=>`<div class="card" style="--c:${c.col}"><a href="product.html?id=${r.id}"><div class="pic">${pic(r)}</div><h3>${r.name}</h3></a><div class="price">${fa(r.price)} تومان</div></div>`).join('')}</div>`:''}`;
 $('#addp').onclick=()=>{const k=cart();k[p.id]=(k[p.id]||0)+1;saveCart(k);toast('به سبد خرید اضافه شد')};
 tilt($('#pimg'),16,0);box.querySelectorAll('.grid .card').forEach(x=>tilt(x,18,-8));
}
function cartPage(){
 const box=$('#cartBox');if(!box)return;
 const c=cart(),ids=Object.keys(c).filter(id=>products.some(p=>p.id==id)&&c[id]>0);
 if(!ids.length){box.innerHTML='<div class="empty"><i class="ti ti-shopping-cart-off"></i><h2>سبد خرید شما خالی است</h2><p>محصولی انتخاب کنید تا اینجا نمایش داده شود.</p><a class="btn" href="index.html">دیدن محصولات</a></div>';return}
 let total=0;
 box.innerHTML=ids.map(id=>{const p=products.find(x=>x.id==id),n=c[id];total+=p.price*n;
  return`<div class="row"><div class="pic sm">${pic(p)}</div><div class="inf"><h3>${p.name}</h3><div class="price">${fa(p.price)} تومان</div></div>
  <div class="qty"><button data-a="+" data-id="${id}" aria-label="افزایش">+</button><b>${fa(n)}</b><button data-a="-" data-id="${id}" aria-label="کاهش">−</button></div>
  <div class="lt">${fa(p.price*n)}</div><button class="rm" data-a="x" data-id="${id}" aria-label="حذف"><i class="ti ti-trash"></i></button></div>`}).join('')+
 `<div class="sum"><span>جمع کل</span><b>${fa(total)} تومان</b></div>
 <div class="sumb"><button class="btn ghost" id="clr">خالی کردن سبد</button><button class="btn" id="pay">ثبت سفارش</button></div><div class="err" id="msg"></div>`;
 box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const k=b.dataset.id,a=b.dataset.a,d=cart();
  if(a=='+')d[k]++;else if(a=='-')d[k]--;else d[k]=0;if(d[k]<=0)delete d[k];saveCart(d);cartPage()});
 $('#clr').onclick=()=>{saveCart({});cartPage()};
$('#pay').onclick=async()=>{const m=$('#msg');m.style.color='';
  if(!session()){m.innerHTML='برای ثبت سفارش ابتدا <a href="login.html" style="color:var(--pl)">وارد شوید</a>.';return}
  m.textContent='در حال ثبت سفارش...';await refreshSession();
  const items=ids.map(id=>{const p=products.find(x=>x.id==id);return{id,name:p.name,price:p.price,qty:c[id]}});
  const r=await rest('orders','POST',{items,total}).catch(()=>null);
  if(!r||!r.ok){m.textContent='ثبت سفارش انجام نشد. دوباره تلاش کنید.';return}
  saveCart({});box.innerHTML=`<div class="empty"><i class="ti ti-circle-check"></i><h2>سفارش شما ثبت شد</h2><p>شماره سفارش: ${fa(r.d[0].id)}<br>پرداخت آنلاین در مرحله‌ی بعد اضافه می‌شود.</p><a class="btn" href="orders.html">سفارش‌های من</a></div>`};
}
async function ordersPage(){
 const box=$('#ordBox');if(!box)return;
 const empty=(i,t,b)=>box.innerHTML=`<div class="empty"><i class="ti ${i}"></i><h2>${t}</h2>${b}</div>`;
 if(!session())return empty('ti-lock','ابتدا وارد شوید','<a class="btn" href="login.html">ورود</a>');
 await refreshSession();
 const r=await rest('orders?select=*&order=created_at.desc').catch(()=>null);
 if(!r||!r.ok)return box.innerHTML='<p class="err">بارگذاری سفارش‌ها انجام نشد. صفحه را رفرش کنید.</p>';
 if(!r.d.length)return empty('ti-package','هنوز سفارشی ندارید','<a class="btn" href="index.html">دیدن محصولات</a>');
 const st={pending:'در انتظار پرداخت',paid:'پرداخت‌شده',shipped:'ارسال‌شده',canceled:'لغوشده'};
 box.innerHTML=r.d.map(o=>`<div class="row ord"><div><b>سفارش ${fa(o.id)}</b><div class="mu">${new Date(o.created_at).toLocaleDateString('fa-IR')}</div><div>${o.items.map(i=>esc(i.name)+' × '+fa(i.qty)).join('، ')}</div></div><div class="lt">${fa(o.total)} تومان<br><small>${st[o.status]||esc(o.status)}</small></div></div>`).join('');
}
async function adminPage(){
 const box=$('#admBox');if(!box)return;
 const msg=(i,t,p,b)=>box.innerHTML=`<div class="empty"><i class="ti ${i}"></i><h2>${t}</h2><p>${p||''}</p>${b||''}</div>`;
 if(!session())return msg('ti-lock','ابتدا وارد شوید','','<a class="btn" href="login.html">ورود</a>');
 await refreshSession();
 const a=await rest('admins?select=user_id').catch(()=>null);
 if(!a||!a.ok||!a.d.length)return msg('ti-lock','دسترسی ندارید','این صفحه فقط برای مدیر فروشگاه است.');
 const r=await rest('orders?select=*&order=created_at.desc').catch(()=>null);
 if(!r||!r.ok)return box.innerHTML='<p class="err">بارگذاری سفارش‌ها انجام نشد.</p>';
 const st={pending:'در انتظار پرداخت',paid:'پرداخت‌شده',shipped:'ارسال‌شده',canceled:'لغوشده'};
 const cnt=k=>r.d.filter(o=>o.status==k).length,sold=r.d.filter(o=>o.status=='paid'||o.status=='shipped').reduce((x,o)=>x+o.total,0);
 box.innerHTML=`<div class="stats"><div><b>${fa(r.d.length)}</b><span>همه‌ی سفارش‌ها</span></div><div><b>${fa(cnt('pending'))}</b><span>در انتظار پرداخت</span></div><div><b>${fa(sold)}</b><span>فروش تومان</span></div></div>`+
 (r.d.length?r.d.map(o=>`<div class="row ord"><div><b>سفارش ${fa(o.id)}</b> <span class="mu">${new Date(o.created_at).toLocaleDateString('fa-IR')}</span><div class="mu">${esc(o.customer||'ایمیل ثبت نشده')}</div><div>${o.items.map(i=>esc(i.name)+' × '+fa(i.qty)).join('، ')}</div></div>
 <div class="lt">${fa(o.total)} تومان<br><select data-id="${o.id}" aria-label="وضعیت سفارش">${Object.keys(st).map(k=>`<option value="${k}" ${o.status==k?'selected':''}>${st[k]}</option>`).join('')}</select></div></div>`).join(''):'<p>هنوز سفارشی ثبت نشده است.</p>');
 box.querySelectorAll('select').forEach(x=>x.onchange=async()=>{
  const u=await rest('orders?id=eq.'+x.dataset.id,'PATCH',{status:x.value}).catch(()=>null);
  toast(u&&u.ok&&u.d.length?'وضعیت سفارش ذخیره شد':'ذخیره نشد. دوباره تلاش کنید.')});
}
function auth(){
 const r=$('#regForm'),l=$('#logForm'),m=(t,ok)=>{const e=$('#err');e.textContent=t;e.style.color=ok?'#7be0a4':''};
 if(r)r.onsubmit=async e=>{e.preventDefault();const f=new FormData(r),b=r.querySelector('button');
  if(f.get('pass').length<6)return m('رمز عبور باید حداقل ۶ کاراکتر باشد.');
  b.disabled=true;m('در حال ساخت حساب...',1);
  const x=await sbf('/auth/v1/signup',{email:f.get('email').trim().toLowerCase(),password:f.get('pass'),data:{name:f.get('name').trim()}}).catch(()=>null);
  b.disabled=false;
  if(!x)return m('اتصال برقرار نشد. اینترنت خود را بررسی کنید.');
  if(!x.ok)return m(emsg(x.d));
  if(x.d.access_token){save(x.d);location='index.html'}else m('حساب ساخته شد. ایمیل خود را برای تأیید بررسی کنید.',1)};
 if(l)l.onsubmit=async e=>{e.preventDefault();const f=new FormData(l),b=l.querySelector('button');
  b.disabled=true;m('در حال ورود...',1);
  const x=await sbf('/auth/v1/token?grant_type=password',{email:f.get('email').trim().toLowerCase(),password:f.get('pass')}).catch(()=>null);
  b.disabled=false;
  if(!x)return m('اتصال برقرار نشد. اینترنت خود را بررسی کنید.');
  if(!x.ok)return m(emsg(x.d));
  save(x.d);location='index.html'};
}
footer();header();auth();ordersPage();adminPage();refreshSession().then(header);
fetch('products.json').then(r=>r.json()).then(d=>{products=d;shop();productPage();cartPage()}).catch(()=>{['#shop','#prodBox','#cartBox'].forEach(k=>{const e=$(k);if(e)e.innerHTML='<p class="err">بارگذاری محصولات انجام نشد. صفحه را رفرش کنید.</p>'})});
const s=$('#search');if(s)s.value=q;if(s)s.oninput=()=>{q=s.value.trim();shop()};
const b=$('#big');if(b)tilt(b,24,0);
