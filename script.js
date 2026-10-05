const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
const SB='https://amhclwujstlipwjjahrs.supabase.co',KEY='sb_publishable_i7OICU1vj-NcXez0FU5c8Q_P2qJP4Yj';
const sbf=(p,b,t)=>fetch(SB+p,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:JSON.stringify(b||{})}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}));
const rest=(p,m,b,pf)=>{const s=session(),h={apikey:KEY,'Content-Type':'application/json',Prefer:pf||'return=representation'};if(s)h.Authorization='Bearer '+s.at;return fetch(SB+'/rest/v1/'+p,{method:m||'GET',headers:h,body:b?JSON.stringify(b):undefined}).then(async r=>({ok:r.ok,d:await r.json().catch(()=>({}))}))};
const session=()=>get('sb','null');
const save=d=>{const u=d.user||{};localStorage.setItem('sb',JSON.stringify({name:(u.user_metadata&&u.user_metadata.name)||u.email,email:u.email,at:d.access_token,rt:d.refresh_token,exp:Date.now()+(d.expires_in||3600)*1000,adm:!!(session()||{}).adm}))};
const logout=()=>{const s=session();if(s)sbf('/auth/v1/logout',{},s.at).catch(()=>{});localStorage.removeItem('sb');location.reload()};
const errs={user_already_exists:'این ایمیل قبلاً ثبت شده است. وارد شوید.',invalid_credentials:'ایمیل یا رمز عبور درست نیست. دوباره بررسی کنید.',weak_password:'رمز عبور ضعیف است. رمز قوی‌تری انتخاب کنید.',email_not_confirmed:'ابتدا ایمیل خود را تأیید کنید.',over_email_send_rate_limit:'تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید.',validation_failed:'ایمیل واردشده معتبر نیست.',signup_disabled:'ثبت‌نام فعلاً غیرفعال است.'};
const emsg=d=>errs[d.error_code||d.code]||'مشکلی پیش آمد. دوباره تلاش کنید.';
async function markAdmin(){const r=await rest('admins?select=user_id').catch(()=>null),adm=!!(r&&r.ok&&Array.isArray(r.d)&&r.d.length),s=session();if(s){s.adm=adm;localStorage.setItem('sb',JSON.stringify(s))}return adm}
async function refreshSession(){const s=session();if(!s||s.exp>Date.now()+60000)return;const r=await sbf('/auth/v1/token?grant_type=refresh_token',{refresh_token:s.rt}).catch(()=>null);if(r&&r.ok)save(r.d);else if(r)localStorage.removeItem('sb')}
const fa=n=>n.toLocaleString('fa-IR');
const cats=[
 {id:'cpu',n:'پردازنده',i:'ti-cpu'},{id:'gpu',n:'کارت گرافیک',i:'ti-chip'},{id:'mb',n:'مادربرد',i:'ti-cpu-2'},
 {id:'ram',n:'رم',i:'ti-database'},{id:'ssd',n:'حافظه ذخیره‌سازی',i:'ti-server'},{id:'psu',n:'پاور',i:'ti-bolt'},
 {id:'case',n:'قاب کیس',i:'ti-box'},{id:'cool',n:'خنک‌کننده',i:'ti-snowflake'},{id:'mon',n:'مانیتور',i:'ti-device-desktop'},
 {id:'laptop',n:'لپ‌تاپ',i:'ti-device-laptop'},{id:'ps',n:'کنسول بازی',i:'ti-brand-playstation'},
 {id:'mouse',n:'موس',i:'ti-mouse'},{id:'kb',n:'کیبورد',i:'ti-keyboard'},{id:'head',n:'هدست',i:'ti-headphones'}];
const cols=['#a78bfa','#8b5cf6','#c084fc','#818cf8','#b794f6','#9f7aea','#7c9cff','#c4b5fd','#9d8cff','#d8a7ff','#ff8fc7','#a78bfa','#8ea2ff','#b9a4ff'];cats.forEach((c,i)=>c.col=cols[i]);
const subs={cpu:['Ryzen','Core'],gpu:['RTX','RX'],mb:['AM5','LGA1700'],ram:['DDR5','DDR4'],ssd:['NVMe','HDD'],psu:['۷۵۰','ماژولار'],case:['میدتاور','مینی‌تاور'],cool:['هوایی','واترکولر'],mon:['۲۴','4K'],laptop:['گیمینگ','اداری'],ps:['کنسول','دسته'],mouse:['بی‌سیم','سبک'],kb:['مکانیکال','۶۰ درصد'],head:['گیمینگ','استودیویی']};
const CAT_IMAGES=[];
let _cfg;const siteCfg=()=>_cfg||(_cfg=fetch('site.json').then(r=>r.ok?r.json():{}).catch(()=>({})));
let products=[];
const descs={cpu:'پردازنده‌ی قدرتمند برای بازی و کارهای سنگین.',gpu:'کارت گرافیک برای بازی در کیفیت بالا و رندر سریع.',mb:'مادربرد پایدار با امکانات اتصال کامل.',ram:'حافظه‌ی سریع برای بالا بردن سرعت سیستم.',ssd:'ذخیره‌سازی سریع و مطمئن برای سیستم و بازی‌ها.',psu:'پاور پایدار با توان مناسب برای قطعات شما.',case:'قاب کیس با جریان هوای خوب و جای کافی برای قطعات.',cool:'خنک‌کننده برای دمای پایین‌تر و صدای کمتر.',mon:'مانیتور با تصویر شفاف و نرخ بازسازی مناسب بازی.',laptop:'لپ‌تاپ مناسب کار، تحصیل و بازی.',ps:'محصولات کنسول بازی برای تجربه‌ی بازی روی تلویزیون.',mouse:'موس دقیق و سبک برای بازی و کار روزمره.',kb:'کیبورد با حس تایپ عالی و ساخت مقاوم.',head:'هدست با صدای شفاف و راحت برای ساعت‌ها استفاده.'};
const icon=p=>cats.find(c=>c.id==p.cat).i;
const EXT=['jpg','png','webp','jpeg'];
window.imgFail=el=>{const i=+(el.dataset.i||0)+1;if(i<EXT.length){el.dataset.i=i;el.src='images/'+el.dataset.id+'.'+EXT[i]}else el.replaceWith(Object.assign(document.createElement('i'),{className:'ti '+el.dataset.ic}))};
const pic=p=>p.img?`<img src="${esc(p.img)}" data-id="${p.id}" data-i="99" data-ic="${icon(p)}" alt="${esc(p.name)}" loading="lazy" onerror="imgFail(this)">`:`<img src="images/${p.id}.jpg" data-id="${p.id}" data-ic="${icon(p)}" alt="${esc(p.name)}" loading="lazy" onerror="imgFail(this)">`;
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
 <nav class="dn"><div class="dd mega"><a href="index.html#cats">دسته‌بندی‌ها <i class="ti ti-chevron-down"></i></a><div class="mega-p">${cats.map(c=>`<a href="${qlink(c)}" style="--c:${c.col}"><i class="ti ${c.i}"></i>${c.n}</a>`).join('')}</div></div>
 <a href="${qlink(cats.find(c=>c.id=='laptop'))}">لپ‌تاپ</a><a href="${qlink(cats.find(c=>c.id=='ps'))}">کنسول بازی</a><a href="games.html">معرفی بازی‌ها</a></nav>
 <input class="hs" id="hs" placeholder="جستجو در محصولات" aria-label="جستجو">
 <div class="acts"><a href="cart.html" class="cartl"><i class="ti ti-shopping-cart"></i> <b id="cc">${count()}</b></a>
 ${me?`${me.adm?'<a href="admin.html">مدیریت</a>':''}<a href="orders.html">سفارش‌ها</a><span>${esc(me.name)}</span><button class="btn ghost" id="out">خروج</button>`
 :`<a class="btn ghost" href="login.html">ورود</a><a class="btn" href="register.html">ثبت‌نام</a>`}</div></div></header>
 <div class="ov" id="ov"></div>
 <aside class="drawer" id="dr" aria-label="منو"><div class="dh">${logo()}<button class="x" id="dx" aria-label="بستن منو"><i class="ti ti-x"></i></button></div>
 <div class="dq"><a href="index.html"><i class="ti ti-home"></i>خانه</a><a href="games.html"><i class="ti ti-device-gamepad-2"></i>معرفی بازی‌ها</a>
 <a href="cart.html"><i class="ti ti-shopping-cart"></i>سبد خرید<b class="bdg">${count()}</b></a>
 ${me?`${me.adm?'<a href="admin.html"><i class="ti ti-shield-lock"></i>پنل مدیریت</a>':''}<a href="orders.html"><i class="ti ti-package"></i>سفارش‌های من</a><button class="qb" id="out2"><i class="ti ti-logout"></i>خروج (${esc(me.name)})</button>`
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
 <div><h4>دسته‌ها</h4>${cats.slice(0,8).map(c=>`<a href="${qlink(c)}">${c.n}</a>`).join('')}</div>
 <div><h4>حساب کاربری</h4><a href="login.html">ورود</a><a href="register.html">ثبت‌نام</a><a href="cart.html">سبد خرید</a><a href="orders.html">سفارش‌های من</a><a href="games.html">معرفی بازی‌ها</a></div></div>
 <div class="cp">© پارت‌زون، تمام حقوق محفوظ است.</div></footer>`);
}
function tilt(el,deg,lift){if(matchMedia('(hover:none)').matches)return;
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
  return`<h2 class="g" id="${c.id}" style="--c:${c.col}"><i class="ti ${c.i}"></i>${c.n}</h2><div class="grid">`+l.map(p=>`<div class="card" style="--c:${c.col}"><a href="product.html?id=${p.id}"><div class="pic">${pic(p)}${p.disc?`<span class="bj ds">${fa(p.disc)}٪ تخفیف</span>`:p.best?'<span class="bj">پرفروش</span>':p.new?'<span class="bj nw">جدید</span>':''}</div><h3>${esc(p.name)}</h3></a><button class="cmpb" data-id="${p.id}" aria-label="افزودن به مقایسه"><i class="ti ti-arrows-diff"></i></button><div class="price">${priceTxt(p)}</div><button class="btn add" data-id="${p.id}">افزودن به سبد</button></div>`).join('')+'</div>'}).join('')||'<p>محصولی پیدا نشد. عبارت دیگری جستجو کنید.</p>';
 box.querySelectorAll('.card').forEach(c=>tilt(c,18,-8));
 box.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const c=cart();c[b.dataset.id]=(c[b.dataset.id]||0)+1;saveCart(c);toast('به سبد خرید اضافه شد')});
 box.querySelectorAll('.cmpb').forEach(b=>b.onclick=()=>toggleCmp(b.dataset.id));syncCmp();
 $('#chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;shop()});
}
function productPage(){
 const box=$('#prodBox');if(!box)return;
 const p=products.find(x=>x.id==new URLSearchParams(location.search).get('id'));
 if(!p){box.innerHTML='<div class="empty"><i class="ti ti-package-off"></i><h2>این محصول پیدا نشد</h2><a class="btn" href="index.html">بازگشت به فروشگاه</a></div>';return}
 document.title=p.name;
 const c=cats.find(x=>x.id==p.cat),rel=products.filter(x=>x.cat==p.cat&&x.id!=p.id);
 box.innerHTML=`<div class="crumb"><a href="index.html">خانه</a> / <a href="index.html#${c.id}">${c.n}</a> / ${esc(p.name)}</div>
 <div class="pd"><div class="pstage"><div class="pic bigp" id="pimg" style="--c:${c.col}">${pic(p)}</div><div class="pshadow"></div><small class="hint">لمس کنید یا نگه دارید تا بزرگ شود</small></div>
 <div class="pinfo"><h1>${esc(p.name)}</h1><div class="price lg">${priceTxt(p)}</div><p class="desc">${esc(p.desc||descs[p.cat])}</p>
 <table class="spec">${(p.specs||[]).map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
 <div class="buy"><button class="btn" id="addp">افزودن به سبد</button><button class="btn ghost" id="cmpp" data-id="${p.id}"><i class="ti ti-arrows-diff"></i> مقایسه</button><a class="btn ghost" href="cart.html">مشاهده سبد</a></div></div></div>
 ${rel.length?`<h2 class="g">محصولات مشابه</h2><div class="grid">${rel.map(r=>`<div class="card" style="--c:${c.col}"><a href="product.html?id=${r.id}"><div class="pic">${pic(r)}</div><h3>${esc(r.name)}</h3></a><div class="price">${priceTxt(r)}</div></div>`).join('')}</div>`:''}`;
 $('#addp').onclick=()=>{const k=cart();k[p.id]=(k[p.id]||0)+1;saveCart(k);toast('به سبد خرید اضافه شد')};
 tilt($('#pimg'),16,0);zoomable($('#pimg'));$('#cmpp').onclick=()=>toggleCmp(p.id);syncCmp();box.querySelectorAll('.grid .card').forEach(x=>tilt(x,18,-8));
}
function cartPage(){
 const box=$('#cartBox');if(!box)return;
 const c=cart(),ids=Object.keys(c).filter(id=>products.some(p=>p.id==id)&&c[id]>0);
 if(!ids.length){box.innerHTML='<div class="empty"><i class="ti ti-shopping-cart-off"></i><h2>سبد خرید شما خالی است</h2><p>محصولی انتخاب کنید تا اینجا نمایش داده شود.</p><a class="btn" href="index.html">دیدن محصولات</a></div>';return}
 let total=0;
 box.innerHTML=ids.map(id=>{const p=products.find(x=>x.id==id),n=c[id];total+=p.price*n;
  return`<div class="row"><div class="pic sm">${pic(p)}</div><div class="inf"><h3>${esc(p.name)}</h3><div class="price">${priceTxt(p)}</div></div>
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
const priceTxt=p=>(p.old?`<s class="old">${fa(p.old)}</s> `:'')+fa(p.price)+' تومان';
const normP=d=>{if(!d||!/^[\w-]+$/.test(d.id)||!cats.some(c=>c.id==d.cat))return null;return{id:d.id,cat:d.cat,name:String(d.name||''),price:(()=>{const b=+d.price||0,c=Math.min(90,Math.max(0,parseInt(d.discount)||0));return c?Math.max(0,Math.round(b*(100-c)/100/1000)*1000):b})(),old:(()=>{const b=+d.price||0,c=Math.min(90,Math.max(0,parseInt(d.discount)||0));return c?b:0})(),disc:Math.min(90,Math.max(0,parseInt(d.discount)||0)),specs:Array.isArray(d.specs)?d.specs.filter(x=>Array.isArray(x)):[],desc:d.description||'',best:d.best?1:0,new:d.is_new?1:0,img:d.image||''}};
async function loadProducts(){
 try{const r=await fetch(SB+'/rest/v1/products?select=*&active=eq.true&order=created_at.asc,id.asc',{headers:{apikey:KEY}});
  if(r.ok){const d=await r.json();if(Array.isArray(d)&&d.length)return d.map(normP).filter(Boolean)}}catch(e){}
 return (await fetch('products.json')).json()}
function bestRail(){const b=$('#best');if(!b)return;
 b.innerHTML=products.filter(p=>p.best).map((p,i)=>{const c=cats.find(x=>x.id==p.cat);return`<a class="bc" href="product.html?id=${p.id}" style="--c:${c.col}"><span class="rk">${fa(i+1)}</span><div class="pic">${pic(p)}</div><h3>${esc(p.name)}</h3><div class="price">${priceTxt(p)}</div></a>`}).join('')}
async function tiles(){const t=$('#tiles');if(!t)return;
 const cf=await siteCfg(),L=[...CAT_IMAGES,...(Array.isArray(cf.catImages)?cf.catImages:[])];
 t.innerHTML=cats.map(c=>`<a href="${qlink(c)}" style="--c:${c.col}"><span class="cc">${L.includes(c.id)?`<img src="images/cat-${c.id}.jpg" data-id="cat-${c.id}" data-ic="${c.i}" alt="" onerror="imgFail(this)">`:`<i class="ti ${c.i}"></i>`}</span>${c.n}</a>`).join('');
 document.querySelectorAll('.strip .sa').forEach(b=>b.onclick=()=>t.scrollBy({left:b.classList.contains('l')?-320:320,behavior:'smooth'}))}
async function gamesPage(){
 const box=$('#gBox');if(!box)return;
 let g;try{g=await(await fetch('games.json')).json()}catch(e){box.innerHTML='<p class="err">بارگذاری بازی‌ها انجام نشد. صفحه را رفرش کنید.</p>';return}
 let f='all';const lab={PC:'PC',PS:'PlayStation'};
 const draw=()=>{$('#gChips').innerHTML=[['all','همه'],['PC','PC'],['PS','PlayStation']].map(x=>`<button class="chip ${f==x[0]?'on':''}" data-f="${x[0]}">${x[1]}</button>`).join('');
  box.innerHTML=g.filter(x=>f=='all'||x.pf.includes(f)).map((x,i)=>`<div class="gc" style="--c:${cols[i%cols.length]}"><div class="gi"><i class="ti ti-device-gamepad-2"></i></div><h3>${esc(x.name)}</h3><div class="tg"><span>${esc(x.genre)}</span>${x.pf.map(p=>`<span class="pf">${lab[p]}</span>`).join('')}</div><p>${esc(x.txt)}</p><div class="gb"><a class="btn" href="${qlink(cats.find(c=>c.id==x.need))}">سخت‌افزار مناسب</a>${x.pf.includes('PS')?`<a class="btn ghost" href="${qlink(cats.find(c=>c.id=='ps'))}">کنسول</a>`:''}</div></div>`).join('');
  $('#gChips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{f=b.dataset.f;draw()})};
 draw();
}
const cmp=()=>{const a=get('cmp','[]');return Array.isArray(a)?a:[]};
const saveCmp=a=>{localStorage.setItem('cmp',JSON.stringify(a));syncCmp();cmpBar()};
function syncCmp(){const a=cmp();document.querySelectorAll('.cmpb').forEach(x=>x.classList.toggle('on',a.includes(x.dataset.id)));const p=$('#cmpp');if(p&&p.dataset.id)p.classList.toggle('on',a.includes(p.dataset.id))}
function toggleCmp(id){const a=cmp(),p=products.find(x=>x.id==id);if(!p)return;
 if(a.includes(id)){saveCmp(a.filter(x=>x!=id));return toast('از مقایسه حذف شد')}
 const f=products.find(x=>x.id==a[0]);if(f&&f.cat!=p.cat)return toast('فقط محصولات هم‌دسته را می‌توان مقایسه کرد');
 if(a.length>=4)return toast('حداکثر ۴ محصول قابل مقایسه است');
 a.push(id);saveCmp(a);toast('به مقایسه اضافه شد')}
function cmpBar(){let b=$('#cmpbar');const a=cmp().filter(id=>products.some(p=>p.id==id));
 if(!a.length){if(b)b.remove();return}
 if(!b){b=document.createElement('div');b.id='cmpbar';document.body.appendChild(b)}
 b.innerHTML=`<span><i class="ti ti-arrows-diff"></i> ${fa(a.length)} محصول در مقایسه</span><a class="btn" href="compare.html">مقایسه</a><button id="cmpclr" aria-label="پاک کردن مقایسه"><i class="ti ti-x"></i></button>`;
 $('#cmpclr').onclick=()=>saveCmp([])}
function comparePage(){const box=$('#cmpBox');if(!box)return;
 const ids=cmp().filter(id=>products.some(p=>p.id==id));
 if(ids.length<2){box.innerHTML='<div class="empty"><i class="ti ti-arrows-diff"></i><h2>حداقل دو محصول لازم است</h2><p>در صفحه‌ی محصولات روی دکمه‌ی مقایسه‌ی دو محصول هم‌دسته بزنید.</p><a class="btn" href="index.html">دیدن محصولات</a></div>';return}
 const L=ids.map(id=>products.find(p=>p.id==id)),labels=[...new Set(L.flatMap(p=>(p.specs||[]).map(x=>x[0])))],low=Math.min(...L.map(p=>p.price));
 const val=(p,l)=>{const x=(p.specs||[]).find(y=>y[0]==l);return x?x[1]:'—'};
 box.innerHTML=`<div class="cmpw"><table class="cmpt"><tr><th></th>${L.map(p=>`<td class="ch" style="--c:${cats.find(c=>c.id==p.cat).col}"><div class="pic sm">${pic(p)}</div><a href="product.html?id=${p.id}"><b>${esc(p.name)}</b></a><button class="rm" data-id="${p.id}" aria-label="حذف از مقایسه"><i class="ti ti-x"></i></button></td>`).join('')}</tr>
 <tr><th>قیمت</th>${L.map(p=>`<td class="${p.price==low?'best':''}">${priceTxt(p)}${p.price==low?'<small>کم‌ترین قیمت</small>':''}</td>`).join('')}</tr>
 ${labels.map(l=>{const v=L.map(p=>val(p,l));return`<tr class="${new Set(v).size>1?'diff':''}"><th>${esc(l)}</th>${v.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`}).join('')}
 <tr><th></th>${L.map(p=>`<td><button class="btn add2" data-id="${p.id}">افزودن به سبد</button></td>`).join('')}</tr></table></div>
 <p class="mu">ردیف‌هایی که مقدارشان فرق دارد رنگی هستند.</p><button class="btn ghost" id="cl">پاک کردن مقایسه</button>`;
 box.querySelectorAll('.rm').forEach(b=>b.onclick=()=>{saveCmp(cmp().filter(x=>x!=b.dataset.id));comparePage()});
 box.querySelectorAll('.add2').forEach(b=>b.onclick=()=>{const k=cart();k[b.dataset.id]=(k[b.dataset.id]||0)+1;saveCart(k);toast('به سبد خرید اضافه شد')});
 $('#cl').onclick=()=>{saveCmp([]);comparePage()}}
function zoomable(el){if(!el)return;let t,held=false;
 el.addEventListener('pointerdown',()=>{held=false;t=setTimeout(()=>{held=true;el.classList.add('pull')},280)});
 const end=()=>{clearTimeout(t);el.classList.remove('pull')};
 el.addEventListener('pointerup',()=>{const was=held;end();if(!was)lightbox(el)});
 ['pointerleave','pointercancel'].forEach(e=>el.addEventListener(e,end));
 el.addEventListener('contextmenu',e=>e.preventDefault())}
function lightbox(el){const im=el.querySelector('img');if(!im)return;
 const o=document.createElement('div');o.className='lb';
 o.innerHTML=`<button class="lbx" aria-label="بستن"><i class="ti ti-x"></i></button><img src="${im.currentSrc||im.src}" alt="${esc(im.alt)}"><small>برای بزرگ‌نمایی روی عکس بزنید</small>`;
 document.body.appendChild(o);document.body.classList.add('lock');
 const g=o.querySelector('img');let z=false;
 const close=()=>{o.remove();document.body.classList.remove('lock');document.removeEventListener('keydown',k)};
 const k=e=>{if(e.key=='Escape')close()};document.addEventListener('keydown',k);
 o.onclick=e=>{if(e.target==o)close()};o.querySelector('.lbx').onclick=close;
 g.onclick=()=>{z=!z;g.classList.toggle('z',z)};
 g.addEventListener('pointermove',e=>{if(z)g.style.transformOrigin=(e.offsetX/g.offsetWidth*100)+'% '+(e.offsetY/g.offsetHeight*100)+'%'})}
async function slider(){const r=$('#sl');if(!r)return;const cf=await siteCfg();
 const ps=qlink(cats.find(c=>c.id=='ps')),lp=qlink(cats.find(c=>c.id=='laptop'));
 const DEF=[
  {t:'فروش ویژه قطعات گیمینگ',h:'قدرت سیستمت رو<br><span class="hl">خودت بساز</span>',p:'از کارت گرافیک تا قاب کیس، از لپ‌تاپ تا کنسول بازی؛ همه‌چیز در یک فروشگاه.',b:'مشاهده محصولات',u:'#shop',i:['mouse','chip','keyboard'],tg:['۲۶۰۰۰ DPI','RTX 4070'],g:'linear-gradient(135deg,#2d1b7a,#4a2bb8 55%,#6d3fe0)'},
  {t:'دنیای PlayStation',h:'کنسول و لوازم<br><span class="hl">بازی روی تلویزیون</span>',p:'کنسول، دسته و لوازم جانبی برای تجربه‌ی بازی راحت.',b:'مشاهده کنسول‌ها',u:ps,i:['headphones','brand-playstation','device-gamepad-2'],tg:['PlayStation 5','DualSense'],g:'linear-gradient(135deg,#1c1056,#3a2aa8 55%,#5b3fd1)'},
  {t:'لپ‌تاپ',h:'برای کار، تحصیل<br><span class="hl">و بازی</span>',p:'از لپ‌تاپ اداری تا مدل‌های گیمینگ با کارت گرافیک جدا.',b:'مشاهده لپ‌تاپ‌ها',u:lp,i:['keyboard','device-laptop','mouse'],tg:['RTX 4060','۱۶ گیگابایت'],g:'linear-gradient(135deg,#251a6e,#4328a6 55%,#7a4be8)'},
  {t:'راهنمای بازی‌ها',h:'ببین سیستمت چه<br><span class="hl">بازی‌هایی می‌کشد</span>',p:'بازی‌های محبوب را بشناسید و سخت‌افزار مناسب هر کدام را ببینید.',b:'معرفی بازی‌ها',u:'games.html',i:['device-gamepad-2','chip','device-desktop'],tg:['PC','PlayStation'],g:'linear-gradient(135deg,#2a1a78,#5530b8 55%,#8250f0)'}];
 const S=Array.isArray(cf.slides)&&cf.slides.length?cf.slides.map(x=>({t:'',h:'',p:'',b:'مشاهده',u:'#shop',i:['mouse','chip','keyboard'],tg:['',''],g:DEF[0].g,...x})):DEF;
 const bgOf=x=>x.bgimg?`linear-gradient(90deg,rgba(18,12,34,.88),rgba(18,12,34,.3)),url('${esc(x.bgimg)}') center/cover`:x.g,hOf=x=>x.hl?esc(x.h)+'<br><span class="hl">'+esc(x.hl)+'</span>':x.h;
 r.innerHTML=`<div class="slides">${S.map((x,i)=>`<div class="hero slide ${i?'':'on'}" style="background:${bgOf(x)}" aria-hidden="${i?'true':'false'}"><div><small>${esc(x.t)}</small><h1>${hOf(x)}</h1><p>${esc(x.p)}</p><div class="row"><a class="btn" href="${esc(x.u)}">${esc(x.b)}</a>${i?'':'<a class="btn ghost" href="register.html">ساخت حساب</a>'}</div></div><div class="stage">${x.img?`<img class="simg" src="${esc(x.img)}" alt="" loading="lazy">`:x.bgimg?'':`<div class="fan">${x.tg[0]?`<span class="ftag" style="left:10px;top:0">${esc(x.tg[0])}</span>`:''}${x.tg[1]?`<span class="ftag" style="left:190px;bottom:-4px">${esc(x.tg[1])}</span>`:''}<div class="fc a"><i class="ti ti-${esc(x.i[0])}"></i></div><div class="fc c"><i class="ti ti-${esc(x.i[2])}"></i></div><div class="fc b"><i class="ti ti-${esc(x.i[1])}"></i></div></div>`}</div></div>`).join('')}</div>
 <button class="sl-a r" aria-label="اسلاید قبلی"><i class="ti ti-chevron-right"></i></button><button class="sl-a l" aria-label="اسلاید بعدی"><i class="ti ti-chevron-left"></i></button>
 <div class="dots">${S.map((_,i)=>`<button aria-label="اسلاید ${fa(i+1)}" class="${i?'':'on'}"></button>`).join('')}</div>`;
 let n=0,t;const sl=r.querySelectorAll('.slide'),dt=r.querySelectorAll('.dots button');
 const go=i=>{n=(i+S.length)%S.length;sl.forEach((x,k)=>{x.classList.toggle('on',k==n);x.setAttribute('aria-hidden',k!=n)});dt.forEach((x,k)=>x.classList.toggle('on',k==n))};
 const stop=()=>clearInterval(t),play=()=>{stop();if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;t=setInterval(()=>go(n+1),5500)};
 dt.forEach((x,k)=>x.onclick=()=>{go(k);play()});
 r.querySelector('.sl-a.l').onclick=()=>{go(n+1);play()};r.querySelector('.sl-a.r').onclick=()=>{go(n-1);play()};
 r.addEventListener('mouseenter',stop);r.addEventListener('mouseleave',play);
 let x0=null;r.addEventListener('pointerdown',e=>{x0=e.clientX;stop()});
 r.addEventListener('pointerup',e=>{if(x0!=null&&Math.abs(e.clientX-x0)>45)go(n+(e.clientX<x0?1:-1));x0=null;play()});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():play());
 play()}
async function adminPrices(){
 const box=$('#prBox');if(!box)return;
 const msg=(i,t,p,b)=>box.innerHTML=`<div class="empty"><i class="ti ${i}"></i><h2>${t}</h2><p>${p||''}</p>${b||''}</div>`;
 if(!session())return msg('ti-lock','ابتدا وارد شوید','','<a class="btn" href="login.html?m=admin">ورود مدیر</a>');
 await refreshSession();
 const a=await rest('admins?select=user_id').catch(()=>null);
 if(!a||!a.ok||!a.d.length)return msg('ti-lock','دسترسی ندارید','این صفحه فقط برای مدیر فروشگاه است.');
 let L=[],nm={};
 const load=async()=>{
  const [x,y]=await Promise.all([rest('price_suggestions?select=*&status=eq.pending&order=created_at.desc').catch(()=>null),rest('products?select=id,name,price').catch(()=>null)]);
  if(!x||!x.ok){box.innerHTML='<p class="err">جدول پیشنهاد قیمت پیدا نشد. مرحله‌ی SQL ربات را انجام دهید.</p>';return}
  nm={};((y&&y.ok&&y.d)||[]).forEach(p=>nm[p.id]=p);L=x.d;draw()};
 const done=async(s,st)=>{await rest('price_suggestions?id=eq.'+s.id,'PATCH',{status:st},'return=minimal').catch(()=>null)};
 const apply=async s=>{const r=await rest('products?id=eq.'+encodeURIComponent(s.product_id),'PATCH',{price:s.suggested_price},'return=minimal').catch(()=>null);if(!r||!r.ok)return false;await done(s,'approved');return true};
 const draw=()=>{
  const safe=L.filter(s=>!s.note);
  box.innerHTML=`<div class="ap-bar"><span class="mu">${fa(L.length)} پیشنهاد در انتظار تأیید</span>${safe.length>1?`<button class="btn" id="okAll">تأیید همه‌ی پیشنهادهای بدون هشدار (${fa(safe.length)})</button>`:''}</div>`+
  (L.map(s=>{const p=nm[s.product_id]||{name:s.product_id},d=s.suggested_price-s.current_price,pc=Math.round(d/s.current_price*1000)/10;
   return`<div class="sg"><div class="sg-h"><b>${esc(p.name)}</b><span class="mu">${new Date(s.created_at).toLocaleDateString('fa-IR')}</span></div>
   <div class="sg-p"><span class="mu">${fa(s.current_price)}</span> ← <b class="${d>0?'up':'dn'}">${fa(s.suggested_price)}</b> تومان <small>(${pc>0?'+':''}${fa(pc)}٪)</small></div>
   ${s.note?`<div class="note">${esc(s.note)}</div>`:''}
   ${p.price!=null&&p.price!=s.current_price?'<div class="note">قیمت فعلی محصول بعد از ساخته شدن این پیشنهاد عوض شده است.</div>':''}
   <ul class="srcs">${(s.sources||[]).map(z=>`<li>${esc(z.site||'')}: ${z.error?`<span class="err">${esc(z.error)}</span>`:''}${z.price?' '+fa(z.price)+' تومان':''} ${/^https?:\/\//i.test(z.url||'')?`<a href="${esc(z.url)}" target="_blank" rel="noopener">مشاهده</a>`:''}</li>`).join('')}</ul>
   <div class="ap-bar"><button class="btn" data-ok="${s.id}">تأیید و اعمال</button><button class="btn ghost" data-no="${s.id}">رد</button></div></div>`}).join('')||'<p class="mu">پیشنهادی در انتظار نیست.</p>');
  box.querySelectorAll('[data-ok]').forEach(b=>b.onclick=async()=>{const s=L.find(x=>x.id==b.dataset.ok);toast(await apply(s)?'قیمت جدید اعمال شد':'اعمال نشد');load()});
  box.querySelectorAll('[data-no]').forEach(b=>b.onclick=async()=>{await done(L.find(x=>x.id==b.dataset.no),'rejected');toast('رد شد');load()});
  const all=$('#okAll');if(all)all.onclick=async()=>{if(!confirm('همه‌ی '+fa(safe.length)+' پیشنهاد بدون هشدار اعمال شوند؟'))return;let n=0;for(const s of safe)if(await apply(s))n++;toast(fa(n)+' قیمت اعمال شد');load()}};
 load()}
async function toWebp(file){const url=URL.createObjectURL(file);
 const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
 const s=Math.min(1,1000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
 c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);
 const w=await new Promise(ok=>c.toBlob(ok,'image/webp',.86));
 return w&&w.type=='image/webp'?w:await new Promise(ok=>c.toBlob(ok,'image/png'))}
async function adminProducts(){
  const box=$('#apBox');if(!box)return;
  const msg=(i,t,p,b)=>box.innerHTML=`<div class="empty"><i class="ti ${i}"></i><h2>${t}</h2><p>${p||''}</p>${b||''}</div>`;
  if(!session())return msg('ti-lock','ابتدا وارد شوید','','<a class="btn" href="login.html">ورود</a>');
  await refreshSession();
  const a=await rest('admins?select=user_id').catch(()=>null);
  if(!a||!a.ok||!a.d.length)return msg('ti-lock','دسترسی ندارید','این صفحه فقط برای مدیر فروشگاه است.');
  let dbCats = [];
  let dbFilters = [];
  let dbOptions = [];
  const loadCats = async () => {
    const [c, f, o] = await Promise.all([
      rest('categories?select=*&order=created_at.asc').catch(()=>null),
      rest('filters?select=*&order=created_at.asc').catch(()=>null),
      rest('filter_options?select=*&order=created_at.asc').catch(()=>null)
    ]);
    if(c && c.ok) dbCats = c.d || [];
    if(f && f.ok) dbFilters = f.d || [];
    if(o && o.ok) dbOptions = o.d || [];
  };
  let list=[];
  const cn = id => {
    const c = dbCats.find(x => x.id == id);
    if (c) return c.name;
    return (cats.find(c=>c.id==id)||{n:id}).n;
  };
  const load=async()=>{
    await loadCats();
    const r=await rest('products?select=*&order=created_at.desc,id.asc').catch(()=>null);
    if(!r||!r.ok){box.innerHTML='<p class="err">جدول محصولات پیدا نشد. مرحله‌ی ساخت جدول در Supabase را انجام دهید.</p>';return}
    list=r.d;draw()
  };
  const draw=()=>{
    const mainCats = dbCats.filter(c => !c.parent_id);
    box.innerHTML=`
      <div class="ap-bar">
        <button class="btn" id="apNew"><i class="ti ti-plus"></i> محصول جدید</button>
        <button class="btn ghost" id="apImp">وارد کردن محصولات اولیه</button>
        <span class="mu">${fa(list.length)} محصول</span>
      </div>
      <div class="apf"><b>تخفیف گروهی</b>
        <label>برای
          <select id="d_scope">
            <option value="all">همه محصولات</option>
            ${mainCats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}
          </select>
        </label>
        <label>درصد تخفیف (۱ تا ۹۰)<input id="d_pct" inputmode="numeric" placeholder="مثلاً ۱۰"></label>
        <div class="ap-bar" style="margin-top:12px">
          <button class="btn" id="d_apply">اعمال تخفیف</button>
          <button class="btn ghost" id="d_clear">برداشتن تخفیف</button>
        </div>
        <div class="err" id="d_msg"></div>
      </div>
      <div id="apForm"></div>
      <div>${list.map(p=>`<div class="ap-row ${p.active?'':'off'}">
        <div class="pic sm">${p.image?`<img src="${esc(p.image)}" alt="">`:`<i class="ti ${(dbCats.find(c=>c.id==p.category_id)||cats.find(c=>c.id==p.cat)||{i:'ti-box'}).i}"></i>`}</div>
        <div class="inf">
          <b>${esc(p.name)}</b>
          <div class="mu">${esc(cn(p.category_id || p.cat))} · ${fa(p.price)} تومان${p.discount?` · ${fa(p.discount)}٪ تخفیف`:''}${p.best?' · پرفروش':''}${p.is_new?' · جدید':''}${p.active?'':' · مخفی'}</div>
        </div>
        <button class="btn ghost" data-e="${esc(p.id)}">ویرایش</button>
        <button class="rm" data-d="${esc(p.id)}" aria-label="حذف"><i class="ti ti-trash"></i></button>
      </div>`).join('')||'<p class="mu">هنوز محصولی در دیتابیس نیست.</p>'}</div>`;
    $('#apNew').onclick=()=>form();
    const bulk=async pct=>{const sc=$('#d_scope').value,m=$('#d_msg'),q=sc=='all'?'id=not.is.null':'category_id=eq.'+sc;
      if(pct>0&&!confirm('تخفیف '+fa(pct)+'٪ روی '+(sc=='all'?'همه‌ی محصولات':'دسته‌ی '+cn(sc))+' اعمال شود؟'))return;
      const r=await rest('products?'+q,'PATCH',{discount:pct},'return=minimal').catch(()=>null);
      if(!r||!r.ok){m.style.color='';m.textContent='انجام نشد.';return}
      toast(pct?'تخفیف اعمال شد':'تخفیف برداشته شد');load()};
    $('#d_apply').onclick=()=>{const v=parseInt(($('#d_pct').value||'').replace(/[^0-9]/g,''),10);if(!(v>=1&&v<=90)){$('#d_msg').textContent='درصد را بین ۱ تا ۹۰ بنویسید.';return}bulk(v)};
    $('#d_clear').onclick=()=>bulk(0);
    $('#apImp').onclick=async()=>{if(!confirm('محصولات اولیه اضافه شوند؟'))return;
      const d=await(await fetch('products.json')).json();
      const rows=d.map(p=>({id:p.id,cat:p.cat,name:p.name,price:p.price,specs:p.specs||[],best:!!p.best,is_new:!!p.new,active:true}));
      const r=await rest('products?on_conflict=id','POST',rows,'resolution=ignore-duplicates,return=minimal').catch(()=>null);
      toast(r&&r.ok?'اضافه شد':'انجام نشد');load()};
    box.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>form(list.find(p=>p.id==b.dataset.e)));
    box.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(!confirm('حذف شود؟'))return;
      const r=await rest('products?id=eq.'+encodeURIComponent(b.dataset.d),'DELETE',null,'return=minimal').catch(()=>null);
      toast(r&&r.ok?'حذف شد':'حذف نشد');load()})
  };
  const form=async p=>{
    const isNew=!p;
    const bo=isNew?null:await rest('product_bot?product_id=eq.'+encodeURIComponent(p.id)).catch(()=>null),bd=(bo&&bo.ok&&bo.d[0])||{};
    p=p||{id:'p'+Date.now().toString(36),cat:'cpu',name:'',price:'',description:'',specs:[],best:false,is_new:false,active:true,image:''};
    const f=$('#apForm');
    const mainCats = dbCats.filter(c => !c.parent_id);
    const currentCatId = p.category_id || p.cat;
    const getFiltersForCat = (cid) => {
      const subs2 = dbCats.filter(c => c.parent_id == cid).map(c => c.id);
      return dbFilters.filter(f2 => f2.category_id == cid || subs2.includes(f2.category_id));
    };
    const renderFilterOptions = (catId) => {
      const fl = getFiltersForCat(catId);
      const wrap = $('#f_filters');
      if(!wrap) return;
      if(!fl.length){ wrap.innerHTML = '<p class="mu">برای این گروه هنوز