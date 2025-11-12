// /js/ankerwoordjes.js
(() => {
  const STYLE_ID = 'ankerwoordjes-grid-style';

  function ensureStyleOnce() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      /* 4-koloms grid binnen de feedback-table */
      #testTable .section-head td{
        font-weight:800;
        color:#0b3d91;
        background:rgba(1,104,155,.08);
        border-top:1px solid rgba(0,0,0,.06);
        padding:10px 12px;
      }
      #testTable .woorden-grid{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px 12px; padding:12px; }
      #testTable .woord-chip{
        border:2px solid #cfe3ff; background:#f5f9ff; border-radius:10px;
        padding:8px 10px; text-align:center; font-weight:600; box-shadow:0 1px 0 rgba(0,0,0,.06);
      }
      #testTable .woorden-grid.empty{
        display:flex; align-items:center; justify-content:center;
        padding:16px; color:#808080; font-style:italic; border:1px dashed #d6d6d6; border-radius:10px;
      }
      @media (max-width:560px){ #testTable .woorden-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
    `;
    document.head.appendChild(s);
  }

  function ensureStructure() {
    const popup = document.getElementById('testPopup');
    if (!popup) throw new Error('#testPopup niet gevonden');
    const content = popup.querySelector('.popup-content');
    let form = content.querySelector('#formTest');
    if (!form) { form = document.createElement('form'); form.id = 'formTest'; content.replaceChildren(form); }

    let table = form.querySelector('#testTable');
    if (!table) {
      table = document.createElement('table');
      table.id = 'testTable';
      table.className = 'feedback-table';
      form.appendChild(table);
    }
    // thead met titel
    let thead = table.querySelector('thead');
    if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
    if (!thead.querySelector('#testTitle')) {
      thead.innerHTML = `<tr><th id="testTitle" colspan="2">🧪 Anker woordjes</th></tr>`;
    }

    // tbody met secties + actions
    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }

    // helper om sectie te maken als ontbreekt
    const ensureSection = (key, label) => {
      let headRow = tbody.querySelector(`tr.section-head[data-sec="${key}"]`);
      if (!headRow) {
        headRow = document.createElement('tr');
        headRow.className = 'section-head';
        headRow.dataset.sec = key;
        headRow.innerHTML = `<td colspan="2">${label}</td>`;
        tbody.appendChild(headRow);
      }
      let gridRow = tbody.querySelector(`tr.section-grid[data-sec="${key}"]`);
      if (!gridRow) {
        gridRow = document.createElement('tr');
        gridRow.className = 'section-grid';
        gridRow.dataset.sec = key;
        gridRow.innerHTML = `<td colspan="2"><div id="${key}Woorden" class="woorden-grid"></div></td>`;
        tbody.appendChild(gridRow);
      }
      return gridRow.querySelector(`#${key}Woorden`);
    };

    const normaalEl = ensureSection('normaal', 'Normaal');
    const snuffelEl = ensureSection('snuffel', 'Snuffel');

    // actions row (close)
    let actions = tbody.querySelector('tr.button-row-host');
    if (!actions) {
      actions = document.createElement('tr');
      actions.className = 'button-row-host';
      actions.innerHTML = `
        <td colspan="2" class="button-row">
          <button type="button" id="closeTestPopup" class="btn">Sluiten</button>
        </td>`;
      tbody.appendChild(actions);
    }

    // close handlers (id kan vernieuwd zijn)
    popup.querySelector('#closeTestPopup')?.addEventListener('click', () => closePopup());

    // backdrop klik
    if (!popup.__bk) {
      popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
      popup.__bk = true;
    }

    return {
      popup,
      titleEl: thead.querySelector('#testTitle'),
      normaalEl,
      snuffelEl
    };
  }

  function renderGrid(container, woorden) {
    const list = (woorden || []).filter(Boolean).map(w => String(w).trim());
    if (!list.length) {
      container.classList.add('empty');
      container.innerHTML = '(Nog geen inhoud toegevoegd)';
      return;
    }
    container.classList.remove('empty');
    container.innerHTML = list.map(w => `<div class="woord-chip">${w}</div>`).join('');
  }

  function openPopup() {
    const p = document.getElementById('testPopup');
    if (!p) return;
    p.style.display = 'flex';
    const btn = p.querySelector('#closeTestPopup');
    btn?.focus?.();
  }

  function closePopup() {
    const p = document.getElementById('testPopup');
    if (!p) return;
    p.style.display = 'none';
  }

  function openAnkerWoordjes(titel, woordenNormaal = [], woordenSnuffel = []) {
    ensureStyleOnce();
    const { popup, titleEl, normaalEl, snuffelEl } = ensureStructure();

    if (titleEl) titleEl.textContent = titel || '🧪 Anker woordjes';

    const sortedNormaal = [...(woordenNormaal || [])].sort((a,b)=>String(a).localeCompare(String(b),'nl',{sensitivity:'base'}));
    const sortedSnuffel = [...(woordenSnuffel || [])].sort((a,b)=>String(a).localeCompare(String(b),'nl',{sensitivity:'base'}));

    renderGrid(normaalEl, sortedNormaal);
    renderGrid(snuffelEl, sortedSnuffel);

    openPopup();
  }

  // Exporteer API
  window.openAnkerWoordjes = openAnkerWoordjes;
})();
