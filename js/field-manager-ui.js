// js/field-manager-ui.js
(function(){
  if(!window.ZZZDataManager) {
    console.error('ZZZDataManager required');
    return;
  }

  // helpers
  const $ = id => document.getElementById(id);

  const catSel = $('fmCategorySelect');
  const subSel = $('fmSubcategorySelect');
  const fieldsList = $('fmFieldsList');
  const addCatBtn = $('fmAddCategory');
  const addSubBtn = $('fmAddSubcategory');
  const addFieldBtn = $('fmAddFieldBtn');
  const fieldType = $('fmFieldType');
  const fieldOptionsWrap = $('fmFieldOptionsWrap');

  function renderCategories() {
    const cats = ZZZDataManager.getAllCategories() || [];
    catSel.innerHTML = cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('') || '<option value="">-- no categories --</option>';
    // trigger change
    catSel.dispatchEvent(new Event('change'));
  }

  function renderSubcategories() {
    const cid = catSel.value;
    const subs = cid ? ZZZDataManager.getSubcategoriesByCategory(cid) : [];
    subSel.innerHTML = subs.map(s=>`<option value="${s.id}">${s.name}</option>`).join('') || '<option value="">-- no subcategories --</option>';
    subSel.dispatchEvent(new Event('change'));
  }

  function renderFields() {
    const cid = catSel.value;
    const sid = subSel.value;
    const fields = cid && sid ? ZZZDataManager.getFieldsBySubcategory(cid, sid) : [];
    if(!fields || fields.length===0){
      fieldsList.innerHTML = '<div class="muted">No fields. Add a field to start.</div>';
      return;
    }
    fieldsList.innerHTML = fields.map(f=>`
      <div class="p-2 border rounded mb-2 flex justify-between items-start">
        <div>
          <div class="font-semibold">${f.label} ${f.required ? '<span class="text-red-500">*</span>':''}</div>
          <div class="muted text-sm">${f.type} ${f.placeholder ? ' • ' + f.placeholder : ''}</div>
          ${f.options && f.options.length ? `<div class="text-xs mt-1">Options: ${f.options.join(', ')}</div>` : ''}
        </div>
        <div class="flex gap-2">
          <button data-field="${f.id}" class="fm-edit px-2 py-1 border rounded">Edit</button>
          <button data-field="${f.id}" class="fm-del px-2 py-1 bg-red-50 text-red-600 rounded">Delete</button>
        </div>
      </div>
    `).join('');
    // wire delete/edit
    fieldsList.querySelectorAll('.fm-del').forEach(b=>{
      b.addEventListener('click', ()=>{
        const fid = b.dataset.field;
        ZZZDataManager.deleteField(catSel.value, subSel.value, fid);
        renderFields();
        // notify listing page (use storage change)
        localStorage.setItem('zzz_fields_updated_at', Date.now());
      });
    });
    fieldsList.querySelectorAll('.fm-edit').forEach(b=>{
      b.addEventListener('click', ()=>{
        const fid = b.dataset.field;
        const f = ZZZDataManager.getFieldsBySubcategory(catSel.value, subSel.value).find(x=>x.id===fid);
        if(!f) return;
        // Simple inline edit (for speed) - prompt for label & required
        const nl = prompt('Field label', f.label);
        if(nl === null) return;
        const req = confirm('Make required? OK = yes');
        f.label = nl;
        f.required = req;
        ZZZDataManager.saveData();
        renderFields();
        localStorage.setItem('zzz_fields_updated_at', Date.now());
      });
    });
  }

  // events
  catSel.addEventListener('change', ()=> renderSubcategories());
  subSel.addEventListener('change', ()=> renderFields());

  addCatBtn.addEventListener('click', ()=>{
    const name = prompt('Category name');
    if(!name) return;
    ZZZDataManager.addCategory({ name });
    renderCategories();
    localStorage.setItem('zzz_fields_updated_at', Date.now());
  });

  addSubBtn.addEventListener('click', ()=>{
    const name = prompt('Subcategory name');
    const cid = catSel.value;
    if(!cid) return alert('Select a category first');
    if(!name) return;
    ZZZDataManager.addSubcategory(cid, { name });
    renderSubcategories();
    localStorage.setItem('zzz_fields_updated_at', Date.now());
  });

  fieldType.addEventListener('change', ()=>{
    if(fieldType.value === 'select') fieldOptionsWrap.classList.remove('hidden');
    else fieldOptionsWrap.classList.add('hidden');
  });

  addFieldBtn.addEventListener('click', ()=>{
    const cid = catSel.value;
    const sid = subSel.value;
    if(!cid || !sid) return alert('Choose category & subcategory first.');
    const label = document.getElementById('fmFieldLabel').value.trim();
    const type = fieldType.value;
    const placeholder = document.getElementById('fmFieldPlaceholder').value.trim();
    const required = document.getElementById('fmFieldRequired').checked;
    let options = [];
    if(type === 'select'){
      const raw = document.getElementById('fmFieldOptions').value.trim();
      options = raw ? raw.split(',').map(s=>s.trim()).filter(Boolean) : [];
      if(options.length===0) return alert('Please provide select options (comma separated).');
    }
    if(!label) return alert('Enter field label.');
    ZZZDataManager.addField(cid, sid, { label, type, placeholder, required, options });
    // clear inputs
    document.getElementById('fmFieldLabel').value = '';
    document.getElementById('fmFieldPlaceholder').value = '';
    document.getElementById('fmFieldOptions').value = '';
    document.getElementById('fmFieldRequired').checked = false;
    renderFields();
    localStorage.setItem('zzz_fields_updated_at', Date.now());
  });

  $('fmRefreshPreview').addEventListener('click', ()=> renderFields());

  // init
  renderCategories();
})();
