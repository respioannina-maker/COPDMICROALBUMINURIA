/* CRF COPD – Frontend (GitHub Pages) + Google Apps Script backend (UPsert ανά NPS) */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0QhaqWezwaIT7qZaiY0HoVMu_xFdW9CnZyfxo__lgXchpCiU3G3O1lJw18RIxwhRPqw/exec";

(function(){
  const sectionSel = document.getElementById('Section');
  const sections = Array.from(document.querySelectorAll('.section'));
  const status = document.getElementById('status');
  const form = document.getElementById('crfForm');
  const exportBtn = document.getElementById('exportBtn');

  // Τοπικό backup για ασφάλεια (αν πέσει δίκτυο)
  const STORAGE_KEY = 'crf_entries_v1';

  function showSection(name){
    sections.forEach(s=> s.style.display = (s.dataset.section === name) ? 'block' : 'none');
  }
  sectionSel?.addEventListener('change', e => showSection(e.target.value));

  function getEntries(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch(e){ return []; }
  }
  function setEntries(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function serializeForm(form){
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((v,k)=>{ if (v!=='' && v!=null) obj[k]=v; });
    return obj;
  }

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = serializeForm(form);

    if (!payload['NPS'] || !payload['Section']){
      status.textContent = 'Συμπληρώστε NPS και Ενότητα.';
      return;
    }
    payload['timestamp'] = new Date().toISOString();

    // 1) Τοπικό backup
    const local = getEntries(); local.push(payload); setEntries(local);

    // 2) Αποστολή στο κεντρικό Google Sheet (UPsert ανά NPS)
    try{
      const res = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const j = await res.json().catch(()=>({ok:true}));
      if (j.ok){
        status.textContent = '✅ Καταχωρήθηκε στο κεντρικό αρχείο (μία γραμμή ανά NPS).';
        form.reset();
        sections.forEach(s=> s.style.display='none');
      } else {
        status.textContent = '⚠️ Σφάλμα server: ' + (j.error || 'Άγνωστο σφάλμα');
      }
    }catch(err){
      console.error(err);
      status.textContent = '⚠️ Πρόβλημα σύνδεσης — αποθηκεύτηκε τοπικά. Πατήστε “Εξαγωγή CSV”.';
    }
  });

  // Εξαγωγή όλων των τοπικών εγγραφών σε CSV (για backup/συγχώνευση)
  function toCSV(rows){
    if (!rows.length) return '';
    const cols = Array.from(rows.reduce((set, r)=>{ Object.keys(r).forEach(k=>set.add(k)); return set; }, new Set()));
    const esc = v => (''+(v??'')).replace(/"/g,'""');
    const header = cols.map(c=>`"${esc(c)}"`).join(',');
    const lines = rows.map(r=> cols.map(c=>`"${esc(r[c])}"`).join(','));
    return [header, ...lines].join('\n');
  }

  exportBtn?.addEventListener('click', ()=>{
    const entries = getEntries();
    if (!entries.length){ status.textContent = 'Δεν υπάρχουν εγγραφές για εξαγωγή.'; return; }
    const csv = toCSV(entries);
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `crf_data_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    status.textContent = '⬇️ Κατέβηκε το CSV (backup).';
  });
})();
