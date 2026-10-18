/* Mon Suivi : fonctionne hors connexion après la première visite. Change V pour forcer une mise à jour. */
const V='mon-suivi-v2';
const CORE=['./','index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(!(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'))return;
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{
      if(res&&(res.status===200||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>hit||caches.match('index.html'));
    return hit||net;
  }));
});
