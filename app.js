(function(){
  const sectionSel = document.getElementById('Section');
  const sections = Array.from(document.querySelectorAll('.section'));
  const status = document.getElementById('status');
  const form = document.getElementById('crfForm');
  const exportBtn = document.getElementById('exportBtn');

  const STORAGE_KEY = 'crf_entries_v1';

  function showSection(name){
    sections.forEach(s=>{
      s.style.display = (s.dataset.section === name) ? 'block' : 'none';
    });
  }
  sectionSel.addEventListener('change', e => showSection(e.target.value));

  function getEntries(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
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

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const payload = serializeForm(form);
    if (!payload['NPS'] || !payload['Section']){
      status.textContent = 'Συμπληρώστε NPS και Ενότητα.';
      return;
    }
    const entries = getEntries();
    payload['timestamp'] = new Date().toISOString();
    entries.push(payload);
    setEntries(entries);
    status.textContent = '✔ Αποθηκεύτηκε τοπικά. Πατήστε "Εξαγωγή CSV" για λήψη αρχείου.';
    form.reset();
    sections.forEach(s=> s.style.display='none');
  });

  function toCSV(rows){
    if (!rows.length) return '';
    const cols = Array.from(rows.reduce((set, r)=>{
      Object.keys(r).forEach(k=> set.add(k));
      return set;
    }, new Set()));
    const esc = (v)=>(''+(v??'')).replace(/"/g,'""');
    const header = cols.map(c=>`"${esc(c)}"`).join(',');
    const lines = rows.map(r=> cols.map(c=>`"${esc(r[c])}"`).join(','));
    return [header, ...lines].join('\n');
  }

  exportBtn.addEventListener('click', ()=>{
    const entries = getEntries();
    if (!entries.length){
      status.textContent = 'Δεν υπάρχουν εγγραφές για εξαγωγή.';
      return;
    }
    const csv = toCSV(entries);
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `crf_data_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    status.textContent = '⬇️ Κατέβηκε το CSV. Ανεβάστε το στο GitHub ή ανοίξτε το σε Excel.';
  });
})();