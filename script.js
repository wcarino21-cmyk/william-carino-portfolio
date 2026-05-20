// script.js (cache-busting loader)
const fileMap = {
  'page1': 'BODY-page1.html',
  'about': 'BODY-about.html',
  'projects': 'BODY-projects.html',
  'skills': 'BODY-skills.html',
  'contact': 'BODY-contact.html'
};

const cacheBust = (url) => `${url}?v=${Date.now()}`;

const loadFile = (id, file) => {
  return fetch(cacheBust(file), {cache: "no-store"})
    .then(r => {
      if(!r.ok) throw new Error(`${file} fetch failed ${r.status}`);
      return r.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
};

// initial load: nav + home + footer (cache-busted)
Promise.all([
  loadFile('nav', 'NAV.html'),
  loadFile('page', fileMap['page1']),
  loadFile('footer', 'FOOTER.html')
]).then(() => {
  attachNavHandlers();
  attachPageHandlers();
  window.scrollTo(0,0);
}).catch(err=>{
  console.error('Initial load error:', err);
});

function attachNavHandlers(){
  document.getElementById('nav').addEventListener('click', e => {
    const a = e.target.closest('a[data-page]');
    if(!a) return;
    e.preventDefault();
    const pageKey = a.getAttribute('data-page');
    const target = a.getAttribute('data-target') || null;
    navigateTo(pageKey, target);
  });
}

function navigateTo(pageKey, target){
  const file = fileMap[pageKey] || fileMap['page1'];
  loadFile('page', file).then(()=>{
    attachPageHandlers();
    if(target){
      setTimeout(()=> {
        const el = document.querySelector(target);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }, 80);
    } else {
      window.scrollTo({top:0, behavior:'smooth'});
    }
  }).catch(err=>{
    console.error('navigateTo error:', err);
  });
}

function attachPageHandlers(){
  const pageEl = document.getElementById('page');
  if(!pageEl) return;

  pageEl.querySelectorAll('.back-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      navigateTo('page1', '#hero');
    });
  });

  pageEl.querySelectorAll('[data-page]').forEach(el=>{
    el.addEventListener('click', e=>{
      e.preventDefault();
      const pageKey = el.getAttribute('data-page');
      const target = el.getAttribute('data-target') || null;
      navigateTo(pageKey, target);
    });
  });

  pageEl.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Robust download handler for Download CV link
  document.addEventListener('click', function(e){
    const dl = e.target.closest('#download-cv-link');
    if(!dl) return;

    const href = dl.getAttribute('href');
    const isExternal = /^https?:\/\//i.test(href);
    if(!isExternal) return; // same-origin file: browser will handle download attribute

    e.preventDefault();
    fetch(href, { cache: "no-store" })
      .then(resp => {
        if(!resp.ok) throw new Error('Download failed');
        return resp.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = href.split('/').pop() || 'CV.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open(href, '_blank', 'noopener');
      });
  });
}
async function loadHTML(id, file) {
  const response = await fetch(file);
  const text = await response.text();
  document.getElementById(id).innerHTML = text;
}

// Load your modular files
loadHTML("nav", "nav.html");
loadHTML("page", "body-about.html"); // you can change this to whichever page you want as default
loadHTML("footer", "footer.html");
