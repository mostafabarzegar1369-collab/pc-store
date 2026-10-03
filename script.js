const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
const fa=n=>n.toLocaleString('fa-IR');
const cats=[
 {id:'cpu',n:'پردازنده',i:'ti-cpu'},{id:'gpu',n:'کارت گرافیک',i:'ti-chip'},
 {id:'ram',n:'رم و حافظه',i:'ti-database'},{id:'mouse',n:'موس',i:'ti-mouse'},
 {id:'kb',n:'کیبورد',i:'ti-keyboard'},{id:'head',n:'هدست',i:'ti-headphones'}];
/* عکس هر محصول: فایل images/شناسه.jpg (مثلا images/mouse1.jpg). اگر عکس نبود، آیکون نشان داده می‌شود */
const products=[
 {id:'cpu1',cat:'cpu',name:'پردازنده Ryzen 7',price:12500000},
 {id:'cpu2',cat:'cpu',name:'پردازنده Core i7',price:13800000},
 {id:'gpu1',cat:'gpu',name:'کارت گرافیک RTX 4070',price:48900000},
 {id:'gpu2',cat:'gpu',name:'کارت گرافیک RX 7800',price:41000000},
 {id:'ram1',cat:'ram',name:'رم DDR5 32GB',price:6200000},
 {id:'ram2',cat:'ram',name:'SSD NVMe 1TB',price:5400000},
 {id:'mouse1',cat:'mouse',name:'موس گیمینگ بی‌سیم',price:2350000},
 {id:'mouse2',cat:'mouse',name:'موس سبک ۶۰ گرمی',price:1900000},
 {id:'kb1',cat:'kb',name:'کیبورد مکانیکال',price:3100000},
 {id:'kb2',cat:'kb',name:'کیبورد ۶۰ درصد',price:2700000},
 {id:'head1',cat:'head',name:'هدست ۷.۱ گیمینگ',price:2900000},
 {id:'head2',cat:'head',name:'هدفون استودیویی',price:3600000}];
const icon=p=>cats.find(c=>c.id==p.cat).i;
const pic=p=>`<img src="images/${p.id}.jpg" alt="${p.name}" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'ti ${icon(p)}'}))">`;
const cart=()=>{const c=get('cart2','{}');return c&&typeof c=='object'?c:{}};
const saveCart=c=>{localStorage.setItem('cart2',JSON.stringify(c));const n=Object.values(c).reduce((a,b)=>a+b,0),e=$('#cc');if(e)e.textContent=n};
const count=()=>Object.values(cart()).reduce((a,b)=>a+b,0);
function toast(t){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}
 e.textContent=t;e.classList.add('show');clearTimeout(e.t);e.t=setTimeout(()=>e.classList.remove('show'),1800)}
function header(){
 const me=get('me','null');
 $('#hdr').innerHTML=`<header><div class="wrap nav"><a class="logo" href="index.html"><i class="ti ti-cpu"></i> پارت‌زون</a>
 <nav>${cats.map(c=>`<a href="index.html#${c.id}">${c.n}</a>`).join('')}</nav>
 <div class="acts"><a href="cart.html" class="cartl"><i class="ti ti-shopping-cart"></i> <b id="cc">${count()}</b></a>
 ${me?`<span>${esc(me.name)}</span><button class="btn ghost" id="out">خروج</button>`
 :`<a class="btn ghost" href="login.html">ورود</a><a class="btn" href="register.html">ثبت‌نام</a>`}</div></div></header>`;
 const o=$('#out');if(o)o.onclick=()=>{localStorage.removeItem('me');location.reload()};
}
function tilt(el,deg,lift){
 el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform=`rotateY(${-x*deg}deg) rotateX(${y*deg}deg) translateY(${lift}px) scale(1.04)`});
 el.addEventListener('mouseleave',()=>el.style.transform='');
}
let cat='all',q='';
function shop(){
 const box=$('#shop');if(!box)return;
 $('#chips').innerHTML=`<button class="chip ${cat=='all'?'on':''}" data-c="all">همه</button>`+cats.map(c=>`<button class="chip ${cat==c.id?'on':''}" data-c="${c.id}">${c.n}</button>`).join('');
 box.innerHTML=cats.filter(c=>cat=='all'||cat==c.id).map(c=>{
  const l=products.filter(p=>p.cat==c.id&&p.name.includes(q));if(!l.length)return'';
  return`<h2 class="g" id="${c.id}"><i class="ti ${c.i}"></i>${c.n}</h2><div class="grid">`+l.map(p=>`<div class="card"><div class="pic">${pic(p)}</div><h3>${p.name}</h3><div class="price">${fa(p.price)} تومان</div><button class="btn add" data-id="${p.id}">افزودن به سبد</button></div>`).join('')+'</div>'}).join('')||'<p>محصولی پیدا نشد. عبارت دیگری جستجو کنید.</p>';
 box.querySelectorAll('.card').forEach(c=>tilt(c,18,-8));
 box.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const c=cart();c[b.dataset.id]=(c[b.dataset.id]||0)+1;saveCart(c);toast('به سبد خرید اضافه شد')});
 $('#chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;shop()});
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
 <div class="sumb"><button class="btn ghost" id="clr">خالی کردن سبد</button><button class="btn" id="pay">ادامه و پرداخت</button></div><div class="err" id="msg"></div>`;
 box.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const k=b.dataset.id,a=b.dataset.a,d=cart();
  if(a=='+')d[k]++;else if(a=='-')d[k]--;else d[k]=0;if(d[k]<=0)delete d[k];saveCart(d);cartPage()});
 $('#clr').onclick=()=>{saveCart({});cartPage()};
 $('#pay').onclick=()=>{$('#msg').textContent=get('me','null')?'درگاه پرداخت هنوز متصل نشده است. این بخش در مرحله‌ی بعد اضافه می‌شود.':'برای ادامه ابتدا وارد حساب خود شوید.'};
}
function auth(){
 const r=$('#regForm'),l=$('#logForm');
 if(r)r.onsubmit=e=>{e.preventDefault();const f=new FormData(r),u=get('users','[]'),em=f.get('email').trim().toLowerCase();
  if(f.get('pass').length<6)return $('#err').textContent='رمز عبور باید حداقل ۶ کاراکتر باشد.';
  if(u.some(x=>x.email==em))return $('#err').textContent='این ایمیل قبلاً ثبت شده است. وارد شوید.';
  u.push({name:f.get('name').trim(),email:em,pass:f.get('pass')});localStorage.setItem('users',JSON.stringify(u));
  localStorage.setItem('me',JSON.stringify({name:u[u.length-1].name}));location='index.html'};
 if(l)l.onsubmit=e=>{e.preventDefault();const f=new FormData(l),em=f.get('email').trim().toLowerCase();
  const u=get('users','[]').find(x=>x.email==em&&x.pass==f.get('pass'));
  if(!u)return $('#err').textContent='ایمیل یا رمز عبور درست نیست. دوباره بررسی کنید.';
  localStorage.setItem('me',JSON.stringify({name:u.name}));location='index.html'};
}
header();shop();cartPage();auth();
const s=$('#search');if(s)s.oninput=()=>{q=s.value.trim();shop()};
const b=$('#big');if(b)tilt(b,24,0);
