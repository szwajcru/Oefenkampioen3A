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
        const popup = document.getElementById(IDS.popup);
        if (popup) popup.style.display = 'flex';
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

        // alleen armeren als de klik kwam van een opener (name="Anker")
        // ⛳ Negeer de allereerste document-click na openen (de opener zelf)
        const target = (e.target && e.target.nodeType === 1) ? e.target : e.target?.parentElement;
        if (!popup._armedOnce && window.ankerIndexClick) {
            popup._armedOnce = true;
            return; // deze eerste klik overslaan
        }

        // Backdrop-klik -> sluiten
        if (e.target === popup) { popup._closeArmed = false; closePopup(); return; }

        // Zorg dat target een Element is
        if (!target) return;

        const content = popup.querySelector('.popup-content');
        const insideContent = content ? content.contains(target) : false;

        // Elementen die als 'binnen' tellen
        const isException = typeof target.closest === 'function' &&
            (target.closest('.woord-chip') ||
                target.closest('.confirm-buttons') ||
                target.closest('.input-row') ||
                target.closest('button')) ||
            target.name === 'Anker';

        if (!insideContent && !isException) {
            popup._closeArmed = false;
            popup._armedOnce = false;
            window.ankerIndexClick = false; // reset globale vlag
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
        .replace(/[^\w\s-]/g, '')   // verwijder emoji’s en speciale tekens
        .replace('Anker', '')       // verwijder het woord 'Anker '
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

        // Zoek de echte <td> binnen de header
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
        //console.log('🧩 renderGrid aangeroepen voor:', type, 'ankerNaam:', ankerNaam);
        if (!container) return;
        container.innerHTML = '';

        // ✅ Altijd add-card tonen, ook bij lege lijst
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

        // ✅ Voeg + kaart toe (ook als er wél woorden zijn)
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
                <button class="btn-ok" title="Opslaan">✔️</button>
                <button class="btn-cancel" title="Annuleren">✖️</button>
            </div>
        `;

        container.parentNode.insertBefore(inputRow, container.nextSibling);

        const input = inputRow.querySelector('.input-word');
        const ok = inputRow.querySelector('.btn-ok');
        const cancel = inputRow.querySelector('.btn-cancel');
        input.focus();

        const ankerId = ankerNaam
            .replace(/[^\w\s-]/g, '')   // verwijder emoji’s en speciale tekens
            .replace('Anker', '')      // verwijder het woord 'Anker '
            .trim();

        ok.addEventListener('click', () => {
            const word = input.value.trim();
            if (word) addWord(ankerId, type, word);
            inputRow.remove();
        });

        cancel.addEventListener('click', () => inputRow.remove());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                ok.click();
            }
        });
    }

    // === Toevoegen/verwijderen ===
    function addWord(ankerNaam, type, woord) {
        const data = loadExtraWords();
        if (!data[ankerNaam]) data[ankerNaam] = { normaal: [], snuffel: [] };
        if (!data[ankerNaam][type].includes(woord)) {
            data[ankerNaam][type].push(woord);
            saveExtraWords(data);
        }
        renderWords(ankerNaam, window.huidigAnker.normaal, window.huidigAnker.snuffel);
        openPopup();
    }

    function removeWord(ankerNaam, type, woord) {
        const data = loadExtraWords();
        if (data[ankerNaam] && data[ankerNaam][type]) {
            data[ankerNaam][type] = data[ankerNaam][type].filter(w => w !== woord);
            saveExtraWords(data);
            renderWords(ankerNaam, window.huidigAnker.normaal, window.huidigAnker.snuffel);
        }
    }

    // === Open popup ===
    function openAnkerWoordjes(ankerNaam, woordenNormaal = [], woordenSnuffel = []) {
        ensureStyleOnce();

        // Bewaar huidige anker
        window.huidigAnkerNaam = ankerNaam;
        window.huidigAnker = { normaal: woordenNormaal, snuffel: woordenSnuffel };

        // Titel updaten
        const titleEl = document.getElementById('testTitle');
        if (titleEl) {
            // Verwijder emoji of andere niet-alfanumerieke prefixen uit de naam
            const cleanName = ankerNaam.replace(/^[^\w\d]+/, '').trim();
            titleEl.textContent = `📚 Woordenlijst van ${cleanName}`;
        }

        // Woorden renderen
        renderWords(ankerNaam, woordenNormaal, woordenSnuffel);

        // Popup tonen
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

/**
 * 🟦 Oefenteller zichtbaar maken met info-knop
 * Klik op de ℹ️-knop om het aantal keer geoefend per woord te tonen.
 */
document.addEventListener('DOMContentLoaded', () => {
    const infoBtn = document.getElementById('infoBtn');
    if (!infoBtn) return;

    // Zet EBX-achtig informatie-icoon
    infoBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="#01689B">
      <circle cx="12" cy="12" r="10" stroke="#01689B" stroke-width="1.5" fill="white"/>
      <text x="12" y="17" text-anchor="middle" fill="#01689B" font-size="14" font-family="Arial" font-weight="bold">i</text>
    </svg>`;

    let infoVisible = false;
    //console.log('ℹ️ Info-knop actief voor oefenteller');

    infoBtn.addEventListener('click', () => {
        infoVisible = !infoVisible;
        infoBtn.classList.toggle('active', infoVisible);

        // Toggle alle count-badges
        document.querySelectorAll('#ankerwoordjesForm .woord-chip .count-badge').forEach(badge => {
            badge.classList.toggle('hidden', !infoVisible);
        });
    });
});

