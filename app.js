/* CRF COPD – Frontend (μόνο Google Sheets – χωρίς τοπικό backup) */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0QhaqWezwaIT7qZaiY0HoVMu_xFdW9CnZyfxo__lgXchpCiU3G3O1lJw18RIxwhRPqw/exec";

(function(){
  const sectionSel = document.getElementById('Section');
  const sections   = Array.from(document.querySelectorAll('.section'));
  const status     = document.getElementById('status');
  const form       = document.getElementById('crfForm');

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
    const payload = serializeForm(form);

    if (!payload['NPS'] || !payload['Section']){
      status.textContent = "Συμπληρώστε NPS και Ενότητα.";
      return;
    }

    // Timestamp για debug στο Sheet
    payload['timestamp'] = new Date().toISOString();

    status.textContent = "⏳ Αποστολή στο κεντρικό αρχείο...";

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      status.textContent = "✅ Καταχωρήθηκε στο Google Sheet.";
      form.reset();
      sections.forEach(s=> s.style.display='none');
    } 
    catch (err) {
      console.error(err);
      status.textContent = "⚠️ Πρόβλημα σύνδεσης. Δοκιμάστε ξανά.";
    }
  });
})();
