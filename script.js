const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>JSON.parse(localStorage.getItem(k)||d);
const cats=[
 {id:'cpu',n:'پردازنده',i:'ti-cpu'},{id:'gpu',n:'کارت گرافیک',i:'ti-chip'},
 {id:'ram',n:'رم و حافظه',i:'ti-database'},{id:'mouse',n:'موس',i:'ti-mouse'},
 {id:'kb',n:'کیبورد',i:'ti-keyboard'},{id:'head',n:'هدست',i:'ti-headphones'}];
/* محصولات: برای عکس واقعی، مسیر عکس را در img بنویسید مثل img:'images/mouse1.jpg' */
const products=[
 {cat:'cpu',name:'پردازنده Ryzen 7',price:12500000,img:''},
 {cat:'cpu',name:'پردازنده Core i7',price:13800000,img:''},
 {cat:'gpu',name:'کارت گرافیک RTX 4070',price:48900000,img:''},
 {cat:'gpu',name:'کارت گرافیک RX 7800',price:41000000,img:''},
 {cat:'ram',name:'رم DDR5 32GB',price:6200000,img:''},
 {cat:'ram',name:'SSD NVMe 1TB',price:5400000,img:''},
 {cat:'mouse',name:'موس گیمینگ بی‌سیم',price:2350000,img:''},
 {cat:'mouse',name:'موس سبک ۶۰ گرمی',price:1900000,img:''},
 {cat:'kb',name:'کیبورد مکانیکال',price:3100000,img:''},
 {cat:'kb',name:'کیبورد ۶۰ درصد',price:2700000,img:''},
 {cat:'head',name:'هدست ۷.۱ گیمینگ',price:2900000,img:''},
 {cat:'head',name:'هدفون استودیویی',price:3600000,img:''}];
function header(){
 const me=get('me','null'),n=localStorage.getItem('cart')||0;
 $('#hdr').innerHTML=`<header><div class="wrap nav"><a class="logo" href="index.html"><i class="ti ti-cpu"></i> پارت‌زون</a>
 <nav>${cats.map(c=>`<a href="index.html#${c.id}">${c.n}</a>`).join('')}</nav>
 <div class="acts"><span><i class="ti ti-shopping-cart"></i> <b id="cc">${n}</b></span>
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
  return`<h2 class="g" id="${c.id}"><i class="ti ${c.i}"></i>${c.n}</h2><div class="grid">`+l.map(p=>`<div class="card"><div class="pic">${p.img?`<img src="${p.img}" alt="${p.name}">`:`<i class="ti ${c.i}"></i>`}</div><h3>${p.name}</h3><div class="price">${p.price.toLocaleString('fa-IR')} تومان</div><button class="btn add">افزودن به سبد</button></div>`).join('')+'</div>'}).join('')||'<p>محصولی پیدا نشد. عبارت دیگری جستجو کنید.</p>';
 box.querySelectorAll('.card').forEach(c=>tilt(c,18,-8));
 box.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const n=(+localStorage.getItem('cart')||0)+1;localStorage.setItem('cart',n);$('#cc').textContent=n});
 $('#chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;shop()});
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
header();shop();auth();
const s=$('#search');if(s)s.oninput=()=>{q=s.value.trim();shop()};
const b=$('#big');if(b)tilt(b,24,0);
