(() => {
  const site = document.currentScript?.dataset.site;
  // Replace this with the Web app URL from Apps Script. It must end in /exec.
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyD5N3R-HK4Z5qasPBU-_RkGBnFJAee9Amd35B4Swdyl_WjLuIaSmBaja-anTBdAlrm/exec';
  if (!site || !['the-clutch-team.github.io', 'aamad-chaudhary.github.io'].includes(location.hostname)) return;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(ENDPOINT)) return;
  const key = 'google-preview-alert:' + site;
  let running = false, timer;
  try {
    const setting = new URLSearchParams(location.search).get('alerts');
    if (setting === 'off') localStorage.setItem('preview-alerts-ignore','1');
    if (setting === 'on') localStorage.removeItem('preview-alerts-ignore');
  } catch { return; }
  async function notify() {
    if (running || document.visibilityState !== 'visible') return;
    running = true;
    try {
      if (localStorage.getItem('preview-alerts-ignore') === '1') return;
      let state = sessionStorage.getItem(key);
      if (state?.startsWith('submitted:')) return;
      if (!state) {state = crypto.randomUUID(); sessionStorage.setItem(key,state);}
      // text/plain and no-cors avoid an unsupported cross-origin JSON preflight.
      // Google returns an opaque response: resolution confirms submission, not delivery.
      await fetch(ENDPOINT, {
        method:'POST', mode:'no-cors', credentials:'omit',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify({site,session:state,page:location.origin+location.pathname}),
        keepalive:true, referrerPolicy:'no-referrer', redirect:'follow'
      });
      sessionStorage.setItem(key,'submitted:'+state);
    } catch { /* Keep website behavior independent of notifications. */ }
    finally {running = false;}
  }
  function schedule() {
    clearTimeout(timer);
    if (document.visibilityState === 'visible') timer = setTimeout(notify,5000);
  }
  document.addEventListener('visibilitychange',schedule);
  schedule();
})();
