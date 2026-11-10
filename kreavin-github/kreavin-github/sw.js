const C="kreavin-v9",AG="kreavin-agenda";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"])))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==AG).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
const today=()=>{const d=new Date(),z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
async function agendaNotif(){const c=await caches.open(AG),r=await c.match("agenda.json");if(!r)return;const j=await r.json(),t=today(),L=(j.days||{})[t]||[];
 const s=await c.match("shown.json"),sh=s?(await s.json()).d:"";if(sh===t||!L.length)return;
 await self.registration.showNotification(`Agenda hari ini (${L.length})`,{body:L.slice(0,6).join("\n")+(L.length>6?`\n+${L.length-6} lainnya`:""),tag:"kv-today",icon:"icon-192.png",badge:"icon-192.png",data:{v:"cal"}});
 await c.put("shown.json",new Response(JSON.stringify({d:t})))}
self.addEventListener("periodicsync",e=>{if(e.tag==="kv-agenda")e.waitUntil(agendaNotif())});
self.addEventListener("notificationclick",e=>{e.notification.close();const v=(e.notification.data&&e.notification.data.v)||"dash";
 e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{const w=cs.find(x=>x.url.startsWith(self.registration.scope));if(w){w.postMessage({go:v});return w.focus()}return self.clients.openWindow(self.registration.scope)}))});
