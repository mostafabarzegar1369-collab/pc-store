#!/usr/bin/env python3
"""ربات قیمت پارت‌زون (نسخه‌ی ۱)

کار ربات:
  ۱. برای هر محصولی که در پنل مدیریت «لینک سایت‌های مقایسه» دارد، قیمت را از همان لینک‌ها می‌خواند.
  ۲. قیمت میانه (حد وسط) را حساب می‌کند.
  ۳. اگر با قیمت فعلی فرق داشت، فقط «پیشنهاد قیمت» می‌سازد. اعمال آن با تأیید شما در پنل است.
هرگز قیمت را خودش تغییر نمی‌دهد و هرگز زیر «کف قیمت» پیشنهاد نمی‌دهد.

اجرا:
  python price_bot.py                       اجرای کامل (نیاز به SUPABASE_URL و SUPABASE_SERVICE_KEY)
  python price_bot.py --dry                 فقط نمایش، بدون نوشتن در دیتابیس
  python price_bot.py --test-url URL [--ref قیمت_تومان]   تست خواندن قیمت از یک لینک
"""
import os, sys, json, re, math, time, gzip, statistics, argparse
import urllib.request, urllib.parse, urllib.error, urllib.robotparser

UA = 'PartZoneBot/1.0 (price check for our own store)'
CFG = {'min_sources': 2, 'min_change_pct': 1.0, 'warn_change_pct': 15.0,
       'round_to': 1000, 'delay_seconds': 3, 'sane_ratio': [0.2, 5.0], 'timeout': 25}
FA = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')


def to_num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v) if v > 0 else None
    s = str(v).translate(FA).replace(',', '').replace('٬', '').replace('،', '').strip()
    m = re.search(r'\d+(?:\.\d+)?', s)
    n = float(m.group()) if m else None
    return n if n and n > 0 else None


def walk_offers(o, out):
    if isinstance(o, list):
        for x in o:
            walk_offers(x, out)
    elif isinstance(o, dict):
        if 'outofstock' in str(o.get('availability', '')).lower():
            return
        cur = o.get('priceCurrency')
        for k in ('price', 'lowPrice'):
            v = to_num(o.get(k))
            if v:
                out.append((v, cur))
                break
        if 'offers' in o:
            walk_offers(o['offers'], out)


def walk(o, out):
    if isinstance(o, dict):
        if 'offers' in o:
            walk_offers(o['offers'], out)
        for k, v in o.items():
            if k != 'offers':
                walk(v, out)
    elif isinstance(o, list):
        for x in o:
            walk(x, out)


def meta(html, names):
    for n in names:
        for pat in (r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]*content=["\']([^"\']*)["\']',
                    r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']%s["\']'):
            m = re.search(pat % re.escape(n), html, re.I)
            if m:
                return m.group(1)
    return None


def extract(html):
    """لیست (عدد، واحد پول یا None) از صفحه."""
    out = []
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.I | re.S):
        try:
            walk(json.loads(m.group(1).strip()), out)
        except Exception:
            pass
    if not out:
        v = to_num(meta(html, ['product:price:amount', 'og:price:amount']))
        if v:
            out.append((v, meta(html, ['product:price:currency', 'og:price:currency'])))
    return out


def to_toman(v, cur, ref):
    c = (cur or '').upper()
    if c in ('IRR', 'RIAL', 'RIALS'):
        return v / 10
    if c in ('IRT', 'TOMAN', 'TOMANS'):
        return v
    if ref and ref > 0:
        return v if abs(math.log(v / ref)) <= abs(math.log((v / 10) / ref)) else v / 10
    return v


def pick_price(html, ref):
    """ارزان‌ترین قیمت معتبر صفحه به تومان یا None."""
    c = [to_toman(v, cur, ref) for v, cur in extract(html)]
    return min(c) if c else None


def decide(current, prices, floor, cfg):
    """خروجی: (قیمت_پیشنهادی، یادداشت، درصد_تغییر) یا None"""
    if len(prices) < cfg['min_sources'] or not current:
        return None
    r = cfg['round_to']
    sug = int(round(statistics.median(prices) / r) * r)
    notes = []
    if floor and sug < floor:
        sug = int(floor)
        notes.append('کف قیمت اعمال شد')
    if sug == current:
        return None
    chg = (sug - current) / current * 100
    if abs(chg) < cfg['min_change_pct']:
        return None
    if abs(chg) >= cfg['warn_change_pct']:
        notes.append('تغییر زیاد است؛ منبع‌ها را با دقت بررسی کنید')
    return sug, '. '.join(notes), round(chg, 1)


def http_get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'gzip',
                                               'Accept-Language': 'fa,en;q=0.8'})
    with urllib.request.urlopen(req, timeout=CFG['timeout']) as r:
        data = r.read()
        if r.headers.get('Content-Encoding') == 'gzip':
            data = gzip.decompress(data)
        return data.decode('utf-8', 'replace')


_rp = {}


def allowed(url):
    u = urllib.parse.urlparse(url)
    base = f'{u.scheme}://{u.netloc}'
    if base not in _rp:
        rp = urllib.robotparser.RobotFileParser()
        try:
            rp.parse(http_get(base + '/robots.txt').splitlines())
        except Exception:
            rp = None
        _rp[base] = rp
    rp = _rp[base]
    return True if rp is None else rp.can_fetch(UA, url)


def site_of(url):
    return urllib.parse.urlparse(url).netloc.replace('www.', '')


def read_source(url, ref):
    s = {'site': site_of(url), 'url': url}
    try:
        if not allowed(url):
            s['error'] = 'robots.txt اجازه نداد'
            return s, None
        p = pick_price(http_get(url), ref)
        if not p:
            s['error'] = 'قیمت در صفحه پیدا نشد'
            return s, None
        lo, hi = CFG['sane_ratio']
        if ref and not (lo <= p / ref <= hi):
            s['error'] = 'قیمت نامعتبر به نظر رسید'
            s['price'] = int(p)
            return s, None
        s['price'] = int(round(p))
        return s, p
    except urllib.error.HTTPError as e:
        s['error'] = f'خطای سایت ({e.code})'
    except Exception as e:
        s['error'] = 'اتصال برقرار نشد'
    return s, None


def sb(path, method='GET', body=None, prefer=None):
    key = os.environ['SUPABASE_SERVICE_KEY']
    base = os.environ['SUPABASE_URL'].rstrip('/')
    h = {'apikey': key, 'Content-Type': 'application/json'}
    if key.startswith('eyJ'):
        h['Authorization'] = 'Bearer ' + key
    if prefer:
        h['Prefer'] = prefer
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base + '/rest/v1/' + path, data=data, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=30) as r:
        t = r.read().decode()
        return json.loads(t) if t else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--test-url')
    ap.add_argument('--ref', type=float)
    a = ap.parse_args()
    here = os.path.dirname(os.path.abspath(__file__))
    try:
        with open(os.path.join(here, 'bot_config.json'), encoding='utf-8') as f:
            CFG.update(json.load(f))
    except Exception:
        pass
    if a.test_url:
        s, p = read_source(a.test_url, a.ref)
        print('نتیجه:', json.dumps(s, ensure_ascii=False))
        return
    products = sb('products?select=id,name,price&active=eq.true')
    bots = {b['product_id']: b for b in (sb('product_bot?select=*') or [])}
    made = skipped = 0
    for p in products:
        b = bots.get(p['id'])
        links = [u for u in ((b or {}).get('links') or []) if isinstance(u, str) and u.startswith('http')]
        if not links:
            continue
        sources, prices = [], []
        for u in links:
            s, v = read_source(u, p['price'])
            sources.append(s)
            if v:
                prices.append(v)
            time.sleep(CFG['delay_seconds'])
        res = decide(p['price'], prices, (b or {}).get('min_price'), CFG)
        print(f"{p['id']}: منبع معتبر {len(prices)}/{len(links)}", '->', res or 'بدون پیشنهاد')
        if a.dry:
            continue
        sb(f"price_suggestions?product_id=eq.{p['id']}&status=eq.pending", 'DELETE', prefer='return=minimal')
        if res:
            sug, note, chg = res
            sb('price_suggestions', 'POST', {'product_id': p['id'], 'current_price': p['price'],
               'suggested_price': sug, 'sources': sources, 'note': note or None}, 'return=minimal')
            made += 1
        else:
            skipped += 1
    print(f'پایان. پیشنهاد جدید: {made}، بدون تغییر یا ناکافی: {skipped}')


if __name__ == '__main__':
    main()
