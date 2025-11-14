/**
 * Bestand: ankerwoordjesPopup.js
 * Auteur  : RP Szwajcer
 * Datum   : 10-11-2025
 * Doel    : Popup met ankerwoordjes (volledige functionaliteit + EBX-stijl)
 */

(() => {
    const IDS = {
        popup: 'ankerwoordjesForm',
        normaal: 'normaalWoorden',
        snuffel: 'snuffelWoorden'
    };

    // === CSS koppelen ===
    function ensureStyleOnce() {
        if (document.getElementById('ankerwoordjesForm-style')) return;
        const link = document.createElement('link');
        link.id = 'ankerwoordjesForm-style';
        link.rel = 'stylesheet';
        link.href = 'index/ankerwoordjesPopup.css';
        document.head.appendChild(link);
    }

    // === Storage helpers ===
    function loadExtraWords() {
        try {
            return JSON.parse(localStorage.getItem('ExtraAnkerWoordjes') || '{}');
        } catch {
            return {};
        }
    }

    function saveExtraWords(data) {
        localStorage.setItem('ExtraAnkerWoordjes', JSON.stringify(data));
    }

    // === Popup open/sluit ===
    function openPopup() {
        const popup = document.getElementById('ankerwoordjesForm');
        if (!popup) return;

        popup.style.display = 'flex';

        // ✅ Verwijder eventueel oude sluitknop om duplicaten te voorkomen
        const oudeBtn = popup.querySelector('#closePopup');
        if (oudeBtn) oudeBtn.remove();

        // ✅ Voeg een subtiel wit X-knopje toe rechtsboven
        const closeBtn = document.createElement('button');
        closeBtn.id = 'closePopup';
        closeBtn.textContent = '×';
        closeBtn.title = 'Sluiten';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '8px';
        closeBtn.style.right = '10px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.lineHeight = '1';
        closeBtn.style.fontWeight = '300';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.opacity = '0.9';
        closeBtn.style.zIndex = '9999';

        // Verwijder de overlay-laag (de zwarte achtergrond en eventblokker)
        // De echte kaart in plaats van de overlay selecteren
        popup.style.background = 'none';
        popup.style.backdropFilter = 'none';
        //popup.style.pointerEvents = 'none';
        popup.style.border = 'none';
        popup.style.boxShadow = 'none';

        // ✅ Voeg toe aan de blauwe titelbalk
        const titelBalk = popup.querySelector('thead tr th#testTitle');
        if (titelBalk) {
            titelBalk.style.position = 'relative';
            titelBalk.appendChild(closeBtn);
        } else {
            popup.appendChild(closeBtn);
        }

        // Info-knop (ℹ️) opnieuw zetten en click-event koppelen
        let infoBtn = document.getElementById('infoBtn');
        if (infoBtn) {
            if (!infoBtn.innerHTML.trim()) {
                infoBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#01689B">
            <circle cx="12" cy="12" r="10" stroke="#01689B" stroke-width="1.5" fill="white"/>
            <text x="12" y="17" text-anchor="middle" fill="#01689B" font-size="14" font-family="Arial" font-weight="bold">i</text>
          </svg>`;
            }

            // Koppel event elke keer bij openen opnieuw (voorkomt gemiste listeners)
            infoBtn.onclick = () => {
                const badges = document.querySelectorAll('#ankerwoordjesForm .woord-chip .count-badge');
                const zichtbaar = !infoBtn.classList.contains('active');
                infoBtn.classList.toggle('active', zichtbaar);

                badges.forEach(badge => {
                    badge.classList.toggle('hidden', !zichtbaar);
                });
            };
        }

        // ✅ Voorkom dubbele sluit-trigger
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // voorkomt document-click sluiting
            popup.style.display = 'none';
        });
    }

    function closePopup() {
        const popup = document.getElementById(IDS.popup);
        if (popup) popup.style.display = 'none';
    }

    // === Klik buiten popup sluit deze ===
    document.addEventListener('click', (e) => {
        const popup = document.getElementById(IDS.popup);
        if (!popup) return;

        const display = popup.style.display || getComputedStyle(popup).display;
        const visible = display === 'flex' || display === 'block';
        if (!visible) { popup._closeArmed = false; return; }

        const target = (e.target && e.target.nodeType === 1) ? e.target : e.target?.parentElement;
        if (!popup._armedOnce && window.ankerIndexClick) {
            popup._armedOnce = true;
            return;
        }

        if (e.target === popup) {
            popup._closeArmed = false;
            closePopup();
            return;
        }

        if (!target) return;

        const content = popup.querySelector('.popup-content');
        const insideContent = content ? content.contains(target) : false;

        // ✅ Voeg closePopup toe als uitzondering
        const isException = typeof target.closest === 'function' &&
            (target.closest('.woord-chip') ||
                target.closest('.confirm-buttons') ||
                target.closest('.input-row') ||
                target.closest('button') ||
                target.closest('#closePopup')) || // <— voorkomt flits bij X
            target.name === 'Anker';

        if (!insideContent && !isException) {
            popup._closeArmed = false;
            popup._armedOnce = false;
            window.ankerIndexClick = false;
            closePopup();
        }
    });

    // === Escape sluit popup ===
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });

    // === Renderen van woorden ===
    function renderWords(ankerNaam, woordenNormaal, woordenSnuffel) {
        const ankerId = ankerNaam
            .replace(/[^\w\s-]/g, '')
            .replace('Anker', '')
            .trim();

        const extra = loadExtraWords()[ankerId] || { normaal: [], snuffel: [] };
        const gecombineerd = {
            normaal: [...woordenNormaal, ...extra.normaal],
            snuffel: [...woordenSnuffel, ...extra.snuffel]
        };

        renderGrid(document.getElementById(IDS.normaal), gecombineerd.normaal, ankerNaam, 'normaal', extra);
        renderGrid(document.getElementById(IDS.snuffel), gecombineerd.snuffel, ankerNaam, 'snuffel', extra);

        // --- Headers ---
        const normaalHeader = document.querySelector('.section-head.normaal-head');
        const snuffelHeader = document.querySelector('.section-head.snuffel-head');

        function updateHeaderCount(header, count) {
            if (!header) return;
            const cell = header.querySelector('td');
            if (!cell) return;

            let badge = cell.querySelector('.wordcount');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'wordcount';
                cell.appendChild(badge);
            }
            badge.textContent = `(${count})`;
        }

        updateHeaderCount(normaalHeader, gecombineerd.normaal.length);
        updateHeaderCount(snuffelHeader, gecombineerd.snuffel.length);
    }

    function renderGrid(container, woorden, ankerNaam, type, extra) {
        if (!container) return;
        container.innerHTML = '';

        if (!woorden.length) {
            container.classList.add('empty');

            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = '(nog geen woorden)';

            const addCard = document.createElement('div');
            addCard.className = 'woord-chip add-card';
            addCard.textContent = '+';
            addCard.title = 'Nieuw woord toevoegen';
            addCard.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleInputRow(container, ankerNaam, type);
            });

            container.appendChild(emptyMsg);
            container.appendChild(addCard);
            return;
        }

        container.classList.remove('empty');

        const woordLog = JSON.parse(localStorage.getItem('woordlog') || '{}');
        const ankerId = ankerNaam
            .replace(/[^\w\s-]/g, '')
            .replace('Anker', '')
            .trim();

        const key = `${ankerId}-${type}`;
        const logData = woordLog[key] || {};

        woorden.forEach((woord) => {
            const chip = document.createElement('div');
            chip.className = 'woord-chip';
            chip.textContent = woord;

            if (extra[type].includes(woord)) chip.classList.add('extra');

            const count = logData[woord] || 0;
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'count-badge hidden';
                badge.textContent = count;
                chip.style.position = 'relative';
                chip.appendChild(badge);
            }

            if (extra[type].includes(woord)) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.textContent = '×';
                removeBtn.title = 'Verwijder woord';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeWord(ankerId, type, woord);
                });
                chip.appendChild(removeBtn);
            }

            container.appendChild(chip);
        });

        const addCard = document.createElement('div');
        addCard.className = 'woord-chip add-card';
        addCard.textContent = '+';
        addCard.title = 'Nieuw woord toevoegen';
        addCard.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleInputRow(container, ankerNaam, type);
        });
        container.appendChild(addCard);
    }

    // === Inline invoerveld ===
    function toggleInputRow(container, ankerNaam, type) {
        const bestaande = container.parentNode.querySelector('.input-row');
        if (bestaande) bestaande.remove();

        const inputRow = document.createElement('div');
        inputRow.className = 'input-row';
        inputRow.innerHTML = `
<input type="text" class="input-word" placeholder="Nieuw woord..." />
<div class="input-actions">
  <button class="btn-ebx" title="Opslaan">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <polyline points="5 13 9 17 19 7" fill="none" stroke="#01689B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <button class="btn-ebx" title="Annuleren">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
      <line x1="6" y1="6" x2="18" y2="18" stroke="#B91C1C" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="18" y1="6" x2="6" y2="18" stroke="#B91C1C" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  </button>
</div>
`;

        container.parentNode.insertBefore(inputRow, container.nextSibling);

        const input = inputRow.querySelector('.input-word');
        const okBtn = inputRow.querySelector('.btn-ebx[title="Opslaan"]');
        const cancelBtn = inputRow.querySelector('.btn-ebx[title="Annuleren"]');
        input.focus();

        const ankerId = ankerNaam.replace(/[^\w\s-]/g, '').replace('Anker', '').trim();

        okBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = input.value.trim();
            if (word) addWord(ankerId, type, word);
            inputRow.remove();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            inputRow.remove();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                okBtn.click();
            }
        });
    }

    // === Toevoegen/verwijderen ===
    function addWord(ankerNaam, type, woord) {
        const data = loadExtraWords();
        if (!data[ankerNaam]) data[ankerNaam] = { normaal: [], snuffel: [] };

        const bestaande = [
            ...(window.huidigAnker[type] || []),
            ...(data[ankerNaam][type] || [])
        ].map(w => w.toLowerCase());

        if (bestaande.includes(woord.toLowerCase())) {
            showEbxPopup(
                'Let op',
                'Het woord <strong>"' + woord + '"</strong> bestaat al in dit anker bij <em>' + type + '</em>.'
            );
            return;
        }

        data[ankerNaam][type].push(woord);
        saveExtraWords(data);
        renderWords(ankerNaam, window.huidigAnker.normaal, window.huidigAnker.snuffel);
        openPopup();
    }

    // === EBX popup
    function showEbxPopup(titel, boodschap) {
        const bestaand = document.getElementById('ebxPopup');
        if (bestaand) bestaand.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ebxPopup';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.3)';
        overlay.style.backdropFilter = 'blur(2px)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '10000';

        const box = document.createElement('div');
        box.style.background = '#fff';
        box.style.border = '1px solid #d0d7de';
        box.style.borderRadius = '10px';
        box.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        box.style.width = '340px';
        box.style.maxWidth = '90%';
        box.style.padding = '18px 20px 14px';
        box.style.textAlign = 'center';
        box.style.fontFamily = 'Segoe UI, Roboto, sans-serif';

        const title = document.createElement('h3');
        title.textContent = titel;
        title.style.marginTop = '0';
        title.style.marginBottom = '10px';
        title.style.color = '#01689B';
        title.style.fontSize = '18px';

        const message = document.createElement('div');
        message.innerHTML = boodschap;
        message.style.fontSize = '15px';
        message.style.color = '#333';
        message.style.marginBottom = '18px';

        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.background = '#01689B';
        okBtn.style.color = 'white';
        okBtn.style.border = 'none';
        okBtn.style.borderRadius = '6px';
        okBtn.style.padding = '7px 18px';
        okBtn.style.cursor = 'pointer';
        okBtn.style.fontSize = '15px';
        okBtn.addEventListener('click', () => overlay.remove());

        box.appendChild(title);
        box.appendChild(message);
        box.appendChild(okBtn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    function removeWord(ankerNaam, type, woord) {
        const data = loadExtraWords();
        if (data[ankerNaam] && data[ankerNaam][type]) {
            data[ankerNaam][type] = data[ankerNaam][type].filter(w => w !== woord);
            saveExtraWords(data);
            renderWords(ankerNaam, window.huidigAnker.normaal, window.huidigAnker.snuffel);
        }
    }

    function openAnkerWoordjes(ankerNaam, woordenNormaal = [], woordenSnuffel = []) {
        ensureStyleOnce();
        window.huidigAnkerNaam = ankerNaam;
        window.huidigAnker = { normaal: woordenNormaal, snuffel: woordenSnuffel };

        const titleEl = document.getElementById('testTitle');
        if (titleEl) {
            const cleanName = ankerNaam.replace(/^[^\w\d]+/, '').trim();
            titleEl.textContent = `📚 Woordenlijst van ${cleanName}`;
        }

        renderWords(ankerNaam, woordenNormaal, woordenSnuffel);
        openPopup();
    }

    window.openAnkerWoordjes = openAnkerWoordjes;
})();

// === Printfunctionaliteit ===
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.getElementById('printNormaalBtn');
    if (!printBtn) return;

    printBtn.addEventListener('click', () => {
        const ankerNaam = window.huidigAnkerNaam || 'Onbekend anker';

        function extractWordText(chip) {
            const clone = chip.cloneNode(true);
            clone.querySelectorAll('.count-badge, .remove-btn').forEach(el => el.remove());
            return clone.textContent.trim();
        }

        const normaal = Array.from(document.querySelectorAll('#normaalWoorden .woord-chip'))
            .map(extractWordText)
            .filter(w => w && w !== '+');
        const snuffel = Array.from(document.querySelectorAll('#snuffelWoorden .woord-chip'))
            .map(extractWordText)
            .filter(w => w && w !== '+');

        const printHTML = `
            <html><head><title>Anker woordenlijst – ${ankerNaam}</title>
            <style>
                @media print { @page { margin: 15mm; } body { -webkit-print-color-adjust: exact; } .snuffel-container { page-break-before: always; } }
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h2 { color: #01689B; border-bottom: 2px solid #01689B; padding-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline; }
                h3 { color: #555; margin-top: 25px; }
                .woord-container { display: grid; grid-template-columns: repeat(3, auto); gap: 8px 20px; margin-top: 10px; }
                .woord-card { background: #e8f0ff; border: 1px solid #d0d7de; border-left: 4px solid #005cbf; border-radius: 6px; padding: 6px 12px; font-weight: bold; }
                .snuffel-container .woord-card { background: #fff3e0; border-left-color: #ff9800; }
            </style></head>
            <body>
                <h2>Anker woordenlijst <span>${ankerNaam}</span></h2>
                <h3>Normaal</h3>
                <div class="woord-container">${normaal.map(w => `<div class="woord-card">${w}</div>`).join('')}</div>
                <div class="snuffel-container">
                    <h2>Anker woordenlijst <span>${ankerNaam}</span></h2>
                    <h3>Snuffel</h3>
                    <div class="woord-container">${snuffel.map(w => `<div class="woord-card">${w}</div>`).join('')}</div>
                </div>
            </body></html>`;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(printHTML);
        doc.close();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
    });
});
