async function categoriesPage(){
  const box = $('#catBox'); if(!box) return;
  const msg = (i,t,p,b)=>box.innerHTML=`<div class="empty"><i class="ti ${i}"></i><h2>${t}</h2><p>${p||''}</p>${b||''}</div>`;

  if(!session()) return msg('ti-lock','ابتدا وارد شوید','','<a class="btn" href="login.html?m=admin">ورود مدیر</a>');
  await refreshSession();
  const a = await rest('admins?select=user_id').catch(()=>null);
  if(!a || !a.ok || !a.d.length) return msg('ti-lock','دسترسی ندارید','این صفحه فقط برای مدیر فروشگاه است.');

  let catsDB = [];  // گروه‌های اصلی و زیرگروه‌ها
  let filtersDB = []; // فیلترها
  let optionsDB = []; // گزینه‌های فیلترها

  const load = async () => {
    const [c, f, o] = await Promise.all([
      rest('categories?select=*&order=created_at.asc').catch(()=>null),
      rest('filters?select=*&order=created_at.asc').catch(()=>null),
      rest('filter_options?select=*&order=created_at.asc').catch(()=>null)
    ]);
    if(!c || !c.ok){ box.innerHTML='<p class="err">جدول categories پیدا نشد. مرحله SQL را انجام دهید.</p>'; return; }
    catsDB = c.d || [];
    filtersDB = (f && f.ok) ? f.d : [];
    optionsDB = (o && o.ok) ? o.d : [];
    draw();
  };

  const draw = () => {
    // گروه‌های اصلی = اونایی که parent_id شون null هست
    const mainCats = catsDB.filter(c => !c.parent_id);
    // زیرگروه‌ها = اونایی که parent_id دارن
    const getSubs = pid => catsDB.filter(c => c.parent_id == pid);
    // فیلترهای هر گروه
    const getFilters = cid => filtersDB.filter(f => f.category_id == cid);
    // گزینه‌های هر فیلتر
    const getOpts = fid => optionsDB.filter(o => o.filter_id == fid);

    box.innerHTML = `
      <div class="ap-bar"><button class="btn" id="addMain">+ افزودن گروه اصلی</button></div>
      ${mainCats.length ? mainCats.map(c => `
        <div class="sg" style="border-right:4px solid var(--pl);padding-right:12px">
          <div class="sg-h">
            <b><i class="ti ti-folder"></i> ${esc(c.name)}</b>
            <span class="mu">${fa(getSubs(c.id).length)} زیرگروه · ${fa(getFilters(c.id).length)} فیلتر</span>
            <button class="btn ghost" data-addsub="${c.id}">+ زیرگروه</button>
            <button class="btn ghost" data-addfilter="${c.id}">+ فیلتر</button>
            <button class="rm" data-delcat="${c.id}"><i class="ti ti-trash"></i></button>
          </div>

          ${getSubs(c.id).length ? `<div style="margin:8px 0;padding-right:20px">
            <b class="mu">زیرگروه‌ها:</b>
            ${getSubs(c.id).map(s => `
              <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
                <i class="ti ti-corner-down-left"></i> ${esc(s.name)}
                <button class="rm" data-delcat="${s.id}"><i class="ti ti-trash"></i></button>
              </div>`).join('')}
          </div>` : ''}

          ${getFilters(c.id).length ? `<div style="margin-top:8px">
            <b class="mu">فیلترها:</b>
            ${getFilters(c.id).map(f => `
              <div style="background:#1a1428;border-radius:8px;padding:8px;margin:6px 0">
                <div style="display:flex;align-items:center;gap:8px">
                  <i class="ti ti-filter"></i> <b>${esc(f.name)}</b>
                  <button class="btn ghost" data-addopt="${f.id}">+ گزینه</button>
                  <button class="rm" data-delfilter="${f.id}"><i class="ti ti-trash"></i></button>
                </div>
                <div style="margin:6px 12px;display:flex;flex-wrap:wrap;gap:6px">
                  ${getOpts(f.id).map(o => `
                    <span style="background:#2a1f4a;padding:2px 10px;border-radius:12px;font-size:13px">
                      ${esc(o.value)}
                      <button class="rm" style="display:inline;padding:0 4px" data-delopt="${o.id}"><i class="ti ti-x"></i></button>
                    </span>`).join('')}
                </div>
              </div>`).join('')}
          </div>` : ''}
        </div>
      `).join('') : '<p class="mu">هنوز گروهی ساخته نشده. «افزودن گروه اصلی» را بزنید.</p>'}
    `;

    // افزودن گروه اصلی
    $('#addMain').onclick = async () => {
      const name = prompt('نام گروه اصلی را بنویسید (مثلاً مانیتور):');
      if(!name) return;
      const slug = name.trim().toLowerCase().replace(/\s+/g,'-');
      const r = await rest('categories','POST',{name:name.trim(),slug,parent_id:null},'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'گروه ساخته شد' : 'ساخته نشد'); load();
    };

    // افزودن زیرگروه
    box.querySelectorAll('[data-addsub]').forEach(b => b.onclick = async () => {
      const name = prompt('نام زیرگروه را بنویسید:');
      if(!name) return;
      const slug = name.trim().toLowerCase().replace(/\s+/g,'-') + '-' + Date.now().toString(36);
      const r = await rest('categories','POST',{name:name.trim(),slug,parent_id:b.dataset.addsub},'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'زیرگروه ساخته شد' : 'ساخته نشد'); load();
    });

    // افزودن فیلتر
    box.querySelectorAll('[data-addfilter]').forEach(b => b.onclick = async () => {
      const name = prompt('نام فیلتر را بنویسید (مثلاً برند):');
      if(!name) return;
      const r = await rest('filters','POST',{category_id:b.dataset.addfilter,name:name.trim(),type:'select'},'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'فیلتر ساخته شد' : 'ساخته نشد'); load();
    });

    // افزودن گزینه به فیلتر
    box.querySelectorAll('[data-addopt]').forEach(b => b.onclick = async () => {
      const val = prompt('مقدار گزینه را بنویسید (مثلاً Samsung):');
      if(!val) return;
      const r = await rest('filter_options','POST',{filter_id:b.dataset.addopt,value:val.trim()},'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'گزینه اضافه شد' : 'اضافه نشد'); load();
    });

    // حذف گروه
    box.querySelectorAll('[data-delcat]').forEach(b => b.onclick = async () => {
      if(!confirm('این گروه حذف شود؟ (زیرگروه‌ها و فیلترهای آن هم حذف می‌شوند)')) return;
      const r = await rest('categories?id=eq.'+b.dataset.delcat,'DELETE',null,'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'حذف شد' : 'حذف نشد'); load();
    });

    // حذف فیلتر
    box.querySelectorAll('[data-delfilter]').forEach(b => b.onclick = async () => {
      if(!confirm('این فیلتر حذف شود؟')) return;
      const r = await rest('filters?id=eq.'+b.dataset.delfilter,'DELETE',null,'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'حذف شد' : 'حذف نشد'); load();
    });

    // حذف گزینه
    box.querySelectorAll('[data-delopt]').forEach(b => b.onclick = async () => {
      const r = await rest('filter_options?id=eq.'+b.dataset.delopt,'DELETE',null,'return=minimal').catch(()=>null);
      toast(r && r.ok ? 'حذف شد' : 'حذف نشد'); load();
    });
  };

  load();
}

// این خط رو در انتهای فایل script.js هم اضافه کن (اگه admin-categories.js جدا هست،
// بهتره این تابع رو توی script.js صدا بزنی، ولی چون ما این فایل رو جدا ساختیم،
// خودش بعد از لود script.js اجرا میشه)
if(document.getElementById('catBox')) categoriesPage();
