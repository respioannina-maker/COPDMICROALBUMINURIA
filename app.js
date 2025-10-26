/* CRF COPD – Frontend (μόνο κεντρική αποθήκευση στο Google Sheet) */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0QhaqWezwaIT7qZaiY0HoVMu_xFdW9CnZyfxo__lgXchpCiU3G3O1lJw18RIxwhRPqw/exec";

(function(){
  const sectionSel = document.getElementById('Section');
  const sections   = Array.from(document.querySelectorAll('.section'));
  const status     = document.getElementById('status');
  const form       = document.getElementById('crfForm');
  const exportBtn  = document.getElementById('exportBtn');

  // Δεν κρατάμε καθόλου τοπικά δεδομένα → κρύψε το κουμπί Export CSV (αν υπάρχει)
  if (exportBtn) exportBtn.style.display = 'none';

  // Άλλαξε την ετικέτα του submit για να είναι ξεκάθαρο ότι πάει κεντρικά
  try {
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Καταχώρηση (Κεντρικά)';
  } catch(_) {}

  function showSection(name){
    sections.forEach(s => s.style.display = (s.dataset.section === name) ? 'block' : 'none');
  }
  sectionSel?.addEventListener('change', e => showSection(e.target.value));

  function serializeForm(formEl){
    const fd = new FormData(formEl);
    const obj = {};
    fd.forEach((v,k)=>{ if (v!=='' && v!=null) obj[k]=v; });
    return obj;
  }

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!form) return;

    const payload = serializeForm(form);

    // Απλή επικύρωση
    if (!payload['NPS'] || !payload['Section']){
      if (status) status.textContent = 'Συμπληρώστε NPS και Ενότητα.';
      return;
    }
    payload['timestamp'] = new Date().toISOString();

    // POST στο Google Apps Script (UPsert ανά NPS – μία γραμμή/ασθενή)
    try{
      if (status) status.textContent = '⏳ Αποστολή στο κεντρικό αρχείο...';
 if (status) status.textContent = '⏳ Αποστολή στο κεντρικό αρχείο...';

try {
  await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  status.textContent = '✅ Καταχωρήθηκε στο κεντρικό Google Sheet.';
  form.reset();
  sections.forEach(s=> s.style.display='none');
} catch (err) {
  console.error(err);
  status.textContent = '⚠️ Πρόβλημα σύνδεσης — δεν αποθηκεύτηκε. Δοκιμάστε ξανά.';
}

      }

      if (ok){
        if (status) status.textContent = '✅ Καταχωρήθηκε στο κεντρικό Google Sheet (μία γραμμή ανά NPS).';
        form.reset();
        sections.forEach(s=> s.style.display='none');
      } else {
        if (status) status.textContent = '⚠️ Σφάλμα server: ' + (errMsg || `HTTP ${res.status}`);
      }
    }catch(err){
      console.error(err);
      if (status) status.textContent = '⚠️ Πρόβλημα σύνδεσης — δεν αποθηκεύτηκε. Δοκιμάστε ξανά.';
    }
  });
})();
