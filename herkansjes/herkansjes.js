/**
 * HERKANSJES — toont fout gemaakte woordjes (met anker, modus en laatste foutmoment)
 * Data: localStorage key 'fout_woordjes'
 */

let foutWoordjes = [];

/* ===================== Helpers ===================== */
function laadFoutWoordjes() {
  try {
    const data = localStorage.getItem('fout_woordjes');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Fout bij laden van fout_woordjes:', e);
    return [];
  }
}

function formaatLaatsteKeer(tsList) {
  if (!tsList || tsList.length === 0) return '-';
  const d = new Date(tsList[tsList.length - 1]);
  return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' });
}

function alleTijdenHTML(tsList) {
  return (tsList || [])
    .map(t => new Date(t).toLocaleString('nl-NL'))
    .join('<br>');
}

/** Inline SVG voor modusbadge (S of N), zonder <title> (dus geen browser-tooltip) */
function svgModusBadge(modus) {
  const letter = modus === 'snuffel' ? 'S' : 'N';
  return `
    <svg class="modus-badge-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="#e5f3fa"></circle>
      <text x="50%" y="66%" text-anchor="middle" fill="#01689B"
            font-size="13" font-family="Arial, sans-serif" font-weight="bold">${letter}</text>
    </svg>
  `;
}

/* ===================== EBX Tooltip (1 instantie + delegatie) ===================== */
let ebxTooltipDiv = null;
let ebxHideTimer = null;
let ebxCurrentAnchor = null;

function zorgVoorTooltip() {
  if (ebxTooltipDiv) return ebxTooltipDiv;
  ebxTooltipDiv = document.createElement('div');
  ebxTooltipDiv.id = 'ebxTooltip';
  Object.assign(ebxTooltipDiv.style, {
    position: 'fixed',
    background: '#01689B',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
    fontSize: '13px',
    lineHeight: '1.45',
    maxWidth: '280px',
    zIndex: '9999',
    pointerEvents: 'none',
    display: 'none',
    opacity: '0',
    transition: 'opacity .10s ease-in-out',
    whiteSpace: 'nowrap'
  });
  document.body.appendChild(ebxTooltipDiv);
  return ebxTooltipDiv;
}

function showTooltipAt(e, html) {
  const tip = zorgVoorTooltip();
  if (ebxHideTimer) { clearTimeout(ebxHideTimer); ebxHideTimer = null; }

  // Content alleen updaten als het echt anders is (scheelt reflow)
  if (tip.dataset.content !== html) {
    tip.innerHTML = html;
    tip.dataset.content = html;
  }

  tip.style.display = 'block';
  moveTooltip(e);
  requestAnimationFrame(() => (tip.style.opacity = '1'));
}

function moveTooltip(e) {
  if (!ebxTooltipDiv) return;
  let left = e.clientX + 14;
  let top  = e.clientY + 14;

  const rect = ebxTooltipDiv.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  if (left + rect.width + 8 > vw) left = vw - rect.width - 8;
  if (top  + rect.height + 8 > vh) top  = vh - rect.height - 8;

  ebxTooltipDiv.style.left = left + 'px';
  ebxTooltipDiv.style.top  = top  + 'px';
}

function scheduleHideTooltip(delay = 120) {
  if (!ebxTooltipDiv) return;
  if (ebxHideTimer) clearTimeout(ebxHideTimer);
  ebxHideTimer = setTimeout(() => {
    ebxTooltipDiv.style.opacity = '0';
    setTimeout(() => {
      if (ebxTooltipDiv) ebxTooltipDiv.style.display = 'none';
    }, 90);
    ebxCurrentAnchor = null;
  }, delay);
}

/* ===================== UI: Popup tekenen ===================== */
function toonHerkansjes() {
  foutWoordjes = laadFoutWoordjes();

  let popup = document.getElementById('herkansjesTip');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'herkansjesTip';
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div id="herkansjesHeader">
      <span>📖 Mijn herkansjes</span>
      <button id="herkansjesClose" aria-label="Sluiten">&times;</button>
    </div>
    <div id="herkansjesContainer"></div>
  `;

  document.getElementById('herkansjesClose').onclick = () => {
    popup.classList.remove('show');
  };

  const container = document.getElementById('herkansjesContainer');
  container.innerHTML = '';

  if (foutWoordjes.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#555;">Geen fout woordjes opgeslagen.</p>';
  } else {
    // groepeer per anker
    const gegroepeerd = {};
    for (const item of foutWoordjes) {
      (gegroepeerd[item.anker] ||= []).push(item);
    }

    for (const anker of Object.keys(gegroepeerd)) {
      const blok = document.createElement('div');
      blok.className = 'anker-blok';

      const h3 = document.createElement('h3');
      h3.textContent = `Anker ${anker}`;
      blok.appendChild(h3);

      const tabel = document.createElement('table');
      tabel.className = 'anker-tabel';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>Modus</th>
          <th>Woordje</th>
          <th>Aantal</th>
          <th>Laatst gemeten</th>
          <th></th>
        </tr>
      `;
      tabel.appendChild(thead);

      const tbody = document.createElement('tbody');

      for (const item of gegroepeerd[anker]) {
        const tr = document.createElement('tr');

        // Modus badge
        const tdModus = document.createElement('td');
        tdModus.style.textAlign = 'center';
        const badgeWrap = document.createElement('span');
        badgeWrap.className = 'modus-badge';
        badgeWrap.dataset.titel = item.modus === 'snuffel' ? 'Snuffel' : 'Normaal';
        badgeWrap.innerHTML = svgModusBadge(item.modus);
        tdModus.appendChild(badgeWrap);
        tr.appendChild(tdModus);

        // Woordje
        const tdWoord = document.createElement('td');
        tdWoord.textContent = item.woord;
        tr.appendChild(tdWoord);

        // Aantal
        const tdAantal = document.createElement('td');
        tdAantal.textContent = item.aantal;
        tr.appendChild(tdAantal);

        // Laatste fout + tooltip alle tijden
        const tdLaatste = document.createElement('td');
        tdLaatste.className = 'tooltipcel';
        tdLaatste.textContent = formaatLaatsteKeer(item.tijden);
        tdLaatste.dataset.tooltipHtml = alleTijdenHTML(item.tijden);
        tr.appendChild(tdLaatste);

        // Verwijder
        const tdDel = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.className = 'verwijder-knop';
        delBtn.title = 'Verwijderen';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => bevestigVerwijderen(item));
        tdDel.appendChild(delBtn);
        tr.appendChild(tdDel);

        tbody.appendChild(tr);
      }

      tabel.appendChild(tbody);
      blok.appendChild(tabel);
      container.appendChild(blok);
    }
  }

  // ---- Tooltip event-delegatie (soepel) ----
  container.onmousemove = (e) => {
    const anchor = e.target.closest('.tooltipcel, .modus-badge');
    if (anchor) {
      let html;
      if (anchor.classList.contains('tooltipcel')) {
        html = anchor.dataset.tooltipHtml || anchor.textContent.trim();
      } else {
        html = anchor.dataset.titel || (anchor.textContent === 'S' ? 'Snuffel' : 'Normaal');
      }

      if (ebxCurrentAnchor !== anchor) {
        ebxCurrentAnchor = anchor;
        showTooltipAt(e, html);
      } else {
        moveTooltip(e);
      }
    } else {
      scheduleHideTooltip(120);
    }
  };

  container.onmouseleave = () => scheduleHideTooltip(0);

  popup.classList.add('show');
}

/* ===================== Meldingen & verwijderen ===================== */
function bevestigVerwijderen(item) {
  if (typeof toonBevestiging === 'function') {
toonBevestiging(
  `Weet je zeker dat je "${item.woord}" uit Anker ${item.anker} wilt verwijderen?`,
  (ok) => {
    if (!ok) return;
    verwijderItem(item);
    setTimeout(() => toonOKHerkansjes(`"${item.woord}" uit Anker ${item.anker} is verwijderd.`), 100);
  }
);
  } else {
    if (confirm(`Verwijder "${item.woord}" uit Anker ${item.anker}?`)) {
      verwijderItem(item);
      toonOKHerkansjes(`"${item.woord}" uit Anker ${item.anker} is verwijderd.`);
    }
  }
}


function verwijderItem(item) {
  foutWoordjes = foutWoordjes.filter(
    i => !(i.anker === item.anker && i.woord === item.woord && i.modus === item.modus)
  );
  localStorage.setItem('fout_woordjes', JSON.stringify(foutWoordjes));

  const container = document.getElementById('herkansjesContainer');
  if (container) {
    container.innerHTML = '';
    foutWoordjes = laadFoutWoordjes();
    if (foutWoordjes.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#555;">Geen fout woordjes opgeslagen.</p>';
    } else {
      toonHerkansjes();
    }
  }

}

/* ===================== Herkansjes-specifieke OK-popup ===================== */
function toonOKHerkansjes(boodschap, onOk) {
  // Sluit bestaande OK-modals als die er zijn
  const bestaand = document.getElementById('herkansjesOkModal');
  if (bestaand) bestaand.remove();

  // Donkere overlay (boven de herkansjes-popup)
  const overlay = document.createElement('div');
  overlay.id = 'herkansjesOkModal';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 10550; /* iets boven #herkansjesTip (9999) */
    background: rgba(0,0,0,.45);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Witte dialoogbox
  const box = document.createElement('div');
  box.style.cssText = `
    background: #fff;
    border-radius: 14px;
    padding: 22px 28px;
    max-width: 360px;
    width: min(90vw, 360px);
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
  `;
  box.innerHTML = `
    <p style="margin-bottom:20px;font-size:16px;">${boodschap}</p>
    <div style="display:flex; justify-content:center;">
      <button id="herkansjesOkBtn" class="btn" style="
        background:#01689B;
        color:white;
        border:none;
        border-radius:8px;
        padding:8px 20px;
        font-size:14px;
        cursor:pointer;
        box-shadow:0 3px 6px rgba(0,0,0,0.2);
      ">OK</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const okBtn = box.querySelector('#herkansjesOkBtn');

  // Sluit en voer callback uit
  function close(ok = true) {
    overlay.remove();
    if (typeof onOk === 'function' && ok) onOk();
    window.removeEventListener('keydown', keyHandler);
  }

  // Toetsenbordondersteuning
  function keyHandler(e) {
    if (e.key === 'Enter' || e.key === 'Escape') close(true);
  }

  okBtn.addEventListener('click', () => close(true));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(true);
  });
  window.addEventListener('keydown', keyHandler);

  // Focus op knop
  setTimeout(() => okBtn.focus(), 0);
}



/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const link = document.getElementById('mijnHerkansjesLink');
  if (link) link.addEventListener('click', toonHerkansjes);
});
