// scripts/boot.js
// Boot loader: inject components, auth, logout and modules automatically.
// Place this just before </body> in pages.

(async function boot(){
  const root = document.documentElement;

  async function fetchText(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed: '+url);
    return await res.text();
  }

  // 1) Inject any data-include components
  document.querySelectorAll('[data-include]').forEach(async el => {
    const path = el.getAttribute('data-include');
    try{
      const html = await fetchText(path);
      el.innerHTML = html;
    }catch(err){
      console.error('boot include', path, err);
    }
  });

  // 2) Load auth + logout scripts (if not already loaded)
  async function loadScriptOnce(src){
    if(document.querySelector(`script[data-src="${src}"]`) || document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.setAttribute('data-src', src);
    document.body.appendChild(s);
    return new Promise((res, rej) => {
      s.onload = res;
      s.onerror = rej;
    });
  }

  // Prefer local scripts first
  try {
    await loadScriptOnce('scripts/auth.js').catch(()=>console.warn('auth load failed'));
    await loadScriptOnce('scripts/logout.js').catch(()=>console.warn('logout load failed'));
  } catch(e){ console.warn(e); }

  // 3) Auto-mount modules:
  // - find elements with data-module="payments" (or other name)
  // - inject modules/<name>.html and then load modules/<name>.js
  async function mountModule(name, mountEl){
    const htmlPath = `modules/${name}.html`;
    const jsPath = `modules/${name}.js`;
    try{
      const html = await fetchText(htmlPath);
      mountEl.innerHTML = html;
    }catch(err){
      console.error('module html load failed', name, err);
      mountEl.innerHTML = `<div style="padding:16px;color:#b00">Failed to load module: ${name}</div>`;
      return;
    }
    // load module script (if exists)
    try{
      await loadScriptOnce(jsPath).catch(()=>console.warn('module js load failed', jsPath));
    }catch(err){
      console.warn('module script error', err);
    }
  }

  // Find all module placeholders and mount now
  const placeholders = document.querySelectorAll('[data-module]');
  placeholders.forEach(el => {
    const name = el.getAttribute('data-module');
    mountModule(name, el);
  });

  // 4) Lazy-load modules when clicking a tab with data-module-target (optional)
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-module-target]');
    if(!btn) return;
    const name = btn.getAttribute('data-module-target');
    const target = document.querySelector(`[data-module="${name}"]`);
    if(target && target.innerHTML.trim()===''){
      mountModule(name, target);
    }
  });

})();
