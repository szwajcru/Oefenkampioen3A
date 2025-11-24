(function () {

  // Hover preview voor lezen categorieën UITGESCHAKELD
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.row.lezen-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.removeAttribute('title'); // geen tooltip tonen
      });
      row.addEventListener('mouseleave', () => {
        row.removeAttribute('title');
      });
    });
  });

  // ===== State =====
  let oefentype = 'ankers';
  let klinkerSub = 'puur';
  let woorden = []; let items = [];
  let toetsAfgebroken = false;
  let flitslezen = false;
  let flitsTimeoutId = null;
  let flitsDurationMs = 500;                 // standaardwaarde in ms
  let idx = 0;
  let score = 0;
  let startTijd = 0;
  let getoond = 0;
  let timerId = null;
  let endTime = 0;
  let isHerkansing = false;
  let item = null;

  window.ankerIndexClick = false;

  // ===== Highlight helpers =====                                                                     // globale vlag
  const VOWEL_COMBOS = ['aa', 'ee', 'oo', 'uu', 'ei', 'ij', 'ui', 'oe', 'ie', 'eu', 'ou', 'au'];
  const SINGLE_VOWELS = ['a', 'e', 'i', 'o', 'u'];
  const HIGHLIGHT_COLORS = ['#ef4444'];

  function kleurMetSelectie(woord, selectie) {
    const sel = [...selectie].sort((a, b) => b.length - a.length);
    let i = 0, html = '';

    while (i < woord.length) {
      let match = null;

      // 1. Eerst checken op klinkercombinaties
      for (let comb of VOWEL_COMBOS) {
        if (woord.substring(i, i + comb.length).toLowerCase() === comb) {
          match = comb;
          break;
        }
      }

      // 2. Dan checken op losse klinkers
      if (!match && SINGLE_VOWELS.includes(woord[i].toLowerCase())) {
        match = woord[i];
      }

      // 3. Dan checken op selectie, maar alleen als het géén medeklinker is
      if (!match) {
        for (let k of sel) {
          const isVowel = VOWEL_COMBOS.includes(k.toLowerCase()) || SINGLE_VOWELS.includes(k.toLowerCase());
          if (isVowel && woord.substring(i, i + k.length).toLowerCase() === k.toLowerCase()) {
            match = k;
            break;
          }
        }
      }

      // Resultaat: altijd klinkers kleuren, medeklinkers niet
      if (match) {
        const kleur = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
        html += `<span style="color:${kleur}">${woord.substr(i, match.length)}</span>`;
        i += match.length;
      } else {
        html += `<span style="color:#0f172a">${woord[i]}</span>`;
        i++;
      }
    }
    return html;
  }


  const HIGHLIGHT_COLOR = 'var(--ebx)'; // vaste blauwe kleur
  function kleurMetAlleKlinkers(woord) {
    let i = 0, html = '';
    while (i < woord.length) {
      let gevonden = null;
      for (let comb of VOWEL_COMBOS) {
        if (woord.substring(i, i + comb.length).toLowerCase() === comb) { gevonden = comb; break; }
      }
      if (gevonden) {
        const kleur = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
        html += `<span style="color:${kleur}">${woord.substr(i, gevonden.length)}</span>`;
        i += gevonden.length;
      } else {
        const letter = woord[i];
        if (SINGLE_VOWELS.includes(letter.toLowerCase())) {
          const kleur = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
          html += `<span style="color:${kleur}">${letter}</span>`;
        } else {
          html += `<span style="color:#0f172a">${letter}</span>`;
        }
        i++;
      }
    }
    return html;
  }

  // ===== UI utils =====
  window.showPage = function (n) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page' + n);
    if (pg) pg.classList.add('active');
    const again = document.getElementById('btnAgain');
    if (again) again.style.display = (n === 3) ? 'inline-block' : 'none';
  };
  function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }
  function formatMMSS(ms) { const t = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(t / 60), s = t % 60; return `${m}:${String(s).padStart(2, '0')}`; }
  function startTimer() { stopTimer(); timerId = setInterval(() => { const left = endTime - Date.now(); const b = document.getElementById('timerBadge'); if (b) b.textContent = formatMMSS(left); if (left <= 0) { stopTimer(); eindeToets(); } }, 200); }
  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    clearTimeout(flitsTimeoutId);
  }

  function scheduleFlitsHide() {
    try { clearTimeout(flitsTimeoutId); } catch (e) { }
    const inp = document.getElementById('flitsSeconden');
    let sec = parseFloat(inp && inp.value);
    if (!Number.isFinite(sec)) sec = 0.5;
    sec = Math.max(0.2, Math.min(5, sec));
    flitsTimeoutId = setTimeout(() => {
      const el = document.getElementById('woord');
      if (el) {
        el.innerHTML = '<span class="dots-icon" aria-hidden="true"><svg width="48" height="16" viewBox="0 0 48 16" fill="none"><circle cx="8" cy="8" r="4" fill="#0f172a"/><circle cx="24" cy="8" r="4" fill="#0f172a"/><circle cx="40" cy="8" r="4" fill="#0f172a"/></svg></span>';
      }
    }, Math.round(sec * 1000));
  }

  function getFlitsDurationMs() {
    const inp = document.getElementById('flitsSeconden');
    let sec = parseFloat(inp && inp.value);
    if (!Number.isFinite(sec)) sec = 0.5;
    sec = Math.max(0.2, Math.min(5, sec));
    return Math.round(sec * 1000);
  }

  function cancelToets() {
    try { stopTimer(); } catch (e) { }
    toetsAfgebroken = true;
    try { clearTimeout(flitsTimeoutId); } catch (e) { }
    const t = document.getElementById('toast'); if (t) t.classList.add('show');
    // niet meteen reloaden; ga terug naar pagina 1 en laat timers niet doorlopen
    if (typeof showPage === 'function') { showPage(1); }
  }
  window.cancelToets = cancelToets;


  // Hover tooltip for lists
  let hoverHideId = null;
  function showHover(el, lijst) {
    let card = document.getElementById('hoverCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'hoverCard';
      card.style.cssText = 'position:absolute;display:none;z-index:30;background:#fff;color:#0f172a;border:2px solid var(--ebx);border-radius:12px;box-shadow:0 16px 50px rgba(0,0,0,.25);padding:10px 12px;max-width:min(520px, 92vw);max-height:60vh;overflow:auto;';
      card.innerHTML = '<h3 style="margin:0 0 8px 0; font-size:16px;">Woorden</h3><div class="chips" id="hoverCardContent"></div>';
      document.body.appendChild(card);
    }
    const content = document.getElementById('hoverCardContent');
    content.innerHTML = lijst.length ? lijst.map(w => `<span class="chip" style="margin:4px;display:inline-flex;">${w}</span>`).join('') : '<em>Geen woordenlijst.</em>';
    const r = el.getBoundingClientRect(), pad = 8, cw = Math.min(520, window.innerWidth * 0.92);
    let left = r.left + window.scrollX; if (left + cw > window.innerWidth - 10) { left = window.innerWidth - cw - 10; }
    let top = r.bottom + window.scrollY + pad; const ch = Math.min(card.scrollHeight, window.innerHeight * 0.6);
    if (top + ch > window.scrollY + window.innerHeight) { top = r.top + window.scrollY - ch - pad; }
    card.style.left = left + 'px'; card.style.top = top + 'px'; card.style.display = 'block'; clearTimeout(hoverHideId);
  }
  function hideHoverSoon() { clearTimeout(hoverHideId); hoverHideId = setTimeout(() => { const c = document.getElementById('hoverCard'); if (c) c.style.display = 'none'; }, 120); }

  // Build klinker chips
  function renderKlinkers(checked = false) {
    const holder = document.getElementById('klinkerChips');
    holder.innerHTML = '';

    KLINKER_GROUPS.forEach(grp => {
      const col = document.createElement('div');
      col.className = 'klinker-col';

      // Header (titel + toggle)
      const header = document.createElement('div');
      header.className = 'klinker-col-header';

      const h = document.createElement('h4');
      h.textContent = grp.title;
      header.appendChild(h);

      // Toggle switch
      const toggleWrap = document.createElement('label');
      toggleWrap.className = 'switch klinker-toggle';
      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.setAttribute('data-toggle', grp.title);
      toggleInput.removeAttribute('value');

      const slider = document.createElement('span');
      slider.className = 'slider';
      toggleWrap.appendChild(toggleInput);
      toggleWrap.appendChild(slider);
      header.appendChild(toggleWrap);

      col.appendChild(header);

      // Event: alle checkboxes in dit blok aan/uit
      toggleInput.addEventListener('change', () => {
        const checkboxes = col.querySelectorAll('input[type=checkbox]');
        checkboxes.forEach(cb => cb.checked = toggleInput.checked);
      });

      // Klanken toevoegen
      grp.pairs.forEach(pair => {
        const wrap = document.createElement('div');
        wrap.className = 'pair';
        pair.forEach(k => {
          const id = 'klink_' + k;
          const label = document.createElement('label');
          label.className = 'chip';
          label.setAttribute('data-klink', k);
          label.innerHTML = `<input type="checkbox" id="${id}" value="${k}" ${checked ? 'checked' : ''}> <span>${k}</span>`;

          label.addEventListener('mouseenter', () => showHover(label, KLINKER_WOORDEN[k] || []));
          label.addEventListener('mouseleave', hideHoverSoon);
          label.addEventListener('focus', () => showHover(label, KLINKER_WOORDEN[k] || []));
          label.addEventListener('blur', hideHoverSoon);

          wrap.appendChild(label);
        });
        col.appendChild(wrap);
      });

      holder.appendChild(col);
    });
  }

  // Confetti + Fireworks (lazy init; example style)
  function startConfetti() {
    const canvas = document.getElementById('confetti-canvas'); if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; }; resize(); addEventListener('resize', resize);
    const rand = (min, max) => Math.random() * (max - min) + min;

    function Particle() { this.x = rand(0, canvas.width); this.y = rand(-canvas.height, 0); this.color = `hsl(${rand(0, 360)},100%,55%)`; this.size = rand(4, 9); this.speed = rand(2, 5); this.tilt = rand(-10, 10); }
    let parts = Array.from({ length: 160 }, () => new Particle());
    let active = true;
    (function step() {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        p.y += p.speed; p.x += Math.sin(p.tilt / 20);
        if (p.y > canvas.height) { p.y = rand(-20, 0); p.x = rand(0, canvas.width); }
      }
      requestAnimationFrame(step);
    })();

    setTimeout(() => { active = false; canvas.style.display = 'none'; }, 3000);
  }
  function runFireworks() {
    const canvas = document.getElementById('fireworks-canvas'); if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; }; resize(); addEventListener('resize', resize);
    let particles = [], active = true;
    function burst() {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height * 0.5 + canvas.height * 0.1;
      const count = 80;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2) * i / count;
        const speed = 2 + Math.random() * 3;
        particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 40 + Math.random() * 30, color: `hsl(${Math.floor(Math.random() * 360)},100%,60%)` });
      }
    }
    let bursts = 0; const timer = setInterval(() => { burst(); if (++bursts > 5) { clearInterval(timer); } }, 350);
    (function step() {
      if (!active && particles.length === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const next = [];
      for (const p of particles) {
        ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 2, 2);
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 1;
        if (p.life > 0) next.push(p);
      }
      particles = next;
      requestAnimationFrame(step);
    })();
    setTimeout(() => { active = false; canvas.style.display = 'none'; }, 3500);
  }

  // Core
  function updateTypeUI() {
    // Bepaalt welke velden zichtbaar zijn op basis van oefentype
    oefentype = document.querySelector('input[name="type"]:checked').value;
    const fsAnker = document.getElementById('fieldset-anker');
    const fsKlin = document.getElementById('fieldset-klinkers');
    const fsModus = document.getElementById('fieldset-modus');
    const fsSub = document.getElementById('fieldset-klinkers-submode');
    const fsLezen = document.getElementById('fieldset-lezen');

    if (oefentype === 'ankers') {
      fsAnker.style.display = '';
      fsKlin.style.display = 'none';
      fsLezen.style.display = 'none';
      fsModus.style.display = '';
      fsSub.style.display = 'none';
      document.getElementById('page2Title').textContent = 'Lees dit woordje hardop';
    } else if (oefentype === 'klinkers') {
      fsAnker.style.display = 'none';
      fsKlin.style.display = '';
      fsLezen.style.display = 'none';
      document.getElementById('page2Title').textContent = 'Lees deze klinker (klank) hardop';
    } else if (oefentype === 'lezen') {
      fsAnker.style.display = 'none';
      fsKlin.style.display = 'none';
      fsLezen.style.display = '';
      fsModus.style.display = '';
      fsSub.style.display = 'none';
      document.getElementById('page2Title').textContent = 'Lees dit hardop';
    }

    // Her-evalueer subvisibiliteit na elke wissel
    prepareKlinkerSubVisibility();

    // Toon/verberg de knop Resultaten wissen afhankelijk van oefentype
    const resetBtn = document.getElementById('btnReset');
    if (resetBtn) {
      if (oefentype === 'ankers') {
        resetBtn.style.display = 'inline-block';
      } else {
        resetBtn.style.display = 'none';
      }
    }

  }
  function prepareKlinkerSubVisibility() {
    const fsSub = document.getElementById('fieldset-klinkers-submode');
    const isKlinkers = document.querySelector('input[name="type"][value="klinkers"]').checked;

    // Toon het subkader direct zodra 'Klinkers' is geselecteerd
    if (isKlinkers) {
      fsSub.style.display = '';
    } else {
      fsSub.style.display = 'none';
    }
  }

  function showTap(ok) {
    const tf = document.getElementById('tapFeedback'); if (!tf) return;
    const b = tf.querySelector('.badge');
    b.textContent = ok ? '✓' : '✗';
    b.style.background = ok ? '#16a34a' : '#dc2626';
    tf.classList.add('show');
    setTimeout(() => tf.classList.remove('show'), 220);
  }

  function toonItem() {
    const el = document.getElementById('woord');
    const woordEl = document.getElementById('woord');
    const card = document.querySelector('#page2 .card');
    item = '';

    // 🔹 Reset basisstijl altijd bij een nieuw woord
    card.classList.remove('zin-card');
    woordEl.classList.remove('zin-woord');

    // 🔹 Volledige reset van inline stijlen (nodig na zinnetjes)
    woordEl.style.removeProperty('font-size');
    woordEl.style.removeProperty('line-height');
    woordEl.style.removeProperty('white-space');
    woordEl.style.removeProperty('word-break');
    woordEl.style.removeProperty('text-align');
    woordEl.style.removeProperty('display');
    woordEl.style.removeProperty('color');

    // 🔹 Herstel standaard EBX-stijl voor woorden
    woordEl.style.fontSize = 'clamp(64px, 14vw, 132px)';
    woordEl.style.lineHeight = '1.05';
    woordEl.style.letterSpacing = '1px';
    woordEl.style.textAlign = 'center';
    woordEl.style.color = '#0f172a';

    // --- Ophalen van het juiste item ---
    if (oefentype === 'ankers') {
      const gekozen = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;
      const ankerNummer = gekozen;
      const gekozenMode = document.querySelector(`input[name="mode"][value="${ankerNummer}-normaal"]:checked, input[name="mode"][value="${ankerNummer}-snuffel"]:checked`);
      const isSnuffel = gekozenMode && gekozenMode.value.endsWith('-snuffel');
      const key = isSnuffel ? `${ankerNummer}-snuffel` : `${ankerNummer}-normaal`;

      //herkansjes
      if (ankerNummer === '9') {
        item = getRandomHerkansingsWoord();
      } else {
        //overige ankers
        item = SessieManager.volgendWoord(ankerNummer, key);
      }

      //const items = getWoordenVoorAnker(ankerNummer, key);

    } else {
      if (idx >= items.length) {
        items = shuffle(items);
        idx = 0;
      }
      item = items[idx] ?? '';
    }

    // --- Toon het woord ---
    woordEl.textContent = item;
    el.innerHTML = item;

    // --- Kleur en stijl per oefentype ---
    if (oefentype === 'ankers') {
      const gekozenAnker = parseInt(document.querySelector('input[name="anker"]:checked').value);
      if (gekozenAnker < 5 || gekozenAnker === 9) {
        el.innerHTML = kleurMetAlleKlinkers(item);
      } else {
        el.innerHTML = item;
      }
    } else {
      if (klinkerSub === 'woorden') {
        const selectie = Array.from(document.querySelectorAll('#fieldset-klinkers input[type=checkbox]:checked'))
          .map(cb => cb.value);
        el.innerHTML = kleurMetSelectie(item, selectie);
      } else {
        el.innerHTML = `<span style="color:var(--ebx);">${item}</span>`;
      }
    }

    // --- Logica voor lezen (functiewoorden / zinnetjes) ---
    if (oefentype === 'lezen') {
      const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;
      if (cat === 'zinnetjes') {
        // 🔹 Speciale layout voor zinnetjes
        card.classList.add('zin-card');
        woordEl.classList.add('zin-woord');
        woordEl.style.color = '#000';
        woordEl.style.fontSize = 'clamp(28px, 5vw, 80px)';
        woordEl.style.lineHeight = '1.2';
        woordEl.style.whiteSpace = 'normal';
        woordEl.style.wordBreak = 'break-word';
        woordEl.style.textAlign = 'center';
        woordEl.style.display = 'block';
        el.textContent = item;
      } else {
        el.innerHTML = `<span style="color:var(--ebx);">${item}</span>`;
      }
    }

    // --- Flitsmodus (woord tijdelijk tonen) ---
    const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
    if (flitslezen) {
      clearTimeout(flitsTimeoutId);
      flitsTimeoutId = setTimeout(() => {
        document.getElementById('woord').innerHTML = '...';
      }, flitsDurationMs);
    }

    // --- Toon teller bij woordenmodus ---
    if (byWords) {
      document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
    }
  }




  function startToets() {

    flitsDurationMs = getFlitsDurationMs();

    const err = document.getElementById('errorMsg'); if (err) err.textContent = '';
    idx = 0; score = 0; getoond = 0; startTijd = Date.now(); items = [];
    toetsAfgebroken = false;
    toetsAfgebroken = false;
    flitslezen = document.getElementById('flitsInput')?.checked;

    if (oefentype === 'ankers') {

      const anker = document.querySelector('input[name="anker"]:checked')?.value;

      if (!anker) {
        toonOK('Er is geen anker geselecteerd.', () => { });
        return null;
      }
      const gekozen = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;
      const ankerNummer = gekozen;
      const gekozenMode = document.querySelector(`input[name="mode"][value="${ankerNummer}-normaal"]:checked, input[name="mode"][value="${ankerNummer}-snuffel"]:checked`);

      const isSnuffel = gekozenMode && gekozenMode.value.endsWith('-snuffel');
      const key = isSnuffel ? `${ankerNummer}-snuffel` : `${ankerNummer}`;
      let woorden = getWoordenVoorAnker(ankerNummer, key);

      if (anker === '9') {
        // --- Herkansjes: woorden ophalen uit localStorage ---
        woorden = getHerkansjesWoorden();

      } else {
        // normaal anker
        woorden = getWoordenVoorAnker(ankerNummer, key);
      }


      if (!woorden || woorden.length === 0) {
        toonOK('Er is geen anker geselecteerd.', () => { });
        return;
      }

      if (!gekozen) { if (err) err.textContent = 'Kies eerst een anker.'; return; }
      if (!woorden || !woorden.length) { if (err) err.textContent = 'Dit anker heeft nog geen woorden.'; return; }
      items = shuffle(woorden);

      const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
      if (flitslezen) {
        clearTimeout(flitsTimeoutId);
        scheduleFlitsHide()
        flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
      }
      if (byWords) {
        const aantal = parseInt(document.getElementById('aantalInput').value, 10);
        if (!Number.isFinite(aantal) || aantal < 1 || aantal > 100) { if (err) err.textContent = 'Vul bij "Aantal items" 1..100 in.'; return; }
        if (items.length < aantal) { const fill = []; while (fill.length < aantal) { fill.push(...shuffle(items)); } items = fill.slice(0, aantal); } else { items = items.slice(0, aantal); }
        document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
        showPage(2); toonItem();
      } else {
        const min = parseInt(document.getElementById('minutenInput').value, 10);
        if (!Number.isFinite(min) || min < 1 || min > 3) { if (err) err.textContent = 'Vul bij "Aantal minuten" 1..3 in.'; return; }
        endTime = Date.now() + min * 60 * 1000; startTimer();
        document.getElementById('subInfo').innerHTML = `<span class="timer" id="timerBadge" style="display:none;"></span>`;
        showPage(2); toonItem();
      }

    } else if (oefentype === 'klinkers') {
      // klinkers sectie
      const gekozen = Array.from(document.querySelectorAll('#fieldset-klinkers input[type=checkbox]:checked'))
        .filter(cb => !cb.dataset.toggle)  // sliders overslaan
        .map(cb => cb.value);

      if (!gekozen.length) { alert('Selecteer minstens één klank (bijv. a, aa, ui).'); return; }
      klinkerSub = document.querySelector('input[name="klinkerSub"]:checked').value;

      if (klinkerSub === 'puur') {
        items = shuffle(gekozen);

        // Controleer minuten of items
        const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
        if (flitslezen) {
          clearTimeout(flitsTimeoutId);
          flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
        }
        if (byWords) {
          const aantal = parseInt(document.getElementById('aantalInput').value, 10);
          if (!Number.isFinite(aantal) || aantal < 1 || aantal > 100) { if (err) err.textContent = 'Vul bij "Aantal items" 1..100 in.'; return; }

          if (items.length < aantal) { const fill = []; while (fill.length < aantal) { fill.push(...shuffle(items)); } items = fill.slice(0, aantal); } else { items = items.slice(0, aantal); }
          document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
          showPage(2); toonItem();
        } else {
          const min = parseInt(document.getElementById('minutenInput').value, 10);
          if (!Number.isFinite(min) || min < 1 || min > 3) { if (err) err.textContent = 'Vul bij "Aantal minuten" 1..3 in.'; return; }
          endTime = Date.now() + min * 60 * 1000; startTimer();
          document.getElementById('subInfo').innerHTML = `<span class="timer" id="timerBadge" style="display:none;"></span>`;
          showPage(2); toonItem();
        }

        // Woorden met gekozen klinkers
        document.getElementById('page2Title').textContent = 'Zeg de klank hardop';
      } else {
        // Woorden met gekozen klinkers
        let all = []; gekozen.forEach(k => { const pool = KLINKER_WOORDEN[k] || []; all.push(...pool); });
        if (!all.length) { if (err) err.textContent = 'De geselecteerde klanken hebben geen woorden.'; return; }
        items = shuffle(all);

        // Controleer minuten of items
        const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
        if (flitslezen) {
          clearTimeout(flitsTimeoutId);
          flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
        }
        if (byWords) {
          const aantal = parseInt(document.getElementById('aantalInput').value, 10);
          if (!Number.isFinite(aantal) || aantal < 1 || aantal > 100) { if (err) err.textContent = 'Vul bij "Aantal items" 1..100 in.'; return; }
          if (items.length < aantal) { const fill = []; while (fill.length < aantal) { fill.push(...shuffle(items)); } items = fill.slice(0, aantal); } else { items = items.slice(0, aantal); }
          document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
          showPage(2); toonItem();
        } else {
          const min = parseInt(document.getElementById('minutenInput').value, 10);
          if (!Number.isFinite(min) || min < 1 || min > 3) { if (err) err.textContent = 'Vul bij "Aantal minuten" 1..3 in.'; return; }
          endTime = Date.now() + min * 60 * 1000; startTimer();
          document.getElementById('subInfo').innerHTML = `<span class="timer" id="timerBadge" style="display:none;"></span>`;
          showPage(2); toonItem();
        }

        document.getElementById('page2Title').textContent = 'Lees dit woordje hardop';
      }

    } else if (oefentype === 'lezen') {
      const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;

      if (cat === 'zinnetjes' && LEZEN.zinnetjes) {
        // Combineer alle categorieën van zinnetjes
        woorden = Object.values(LEZEN.zinnetjes).flat();
      } else if (cat === 'functiewoorden' && LEZEN.functiewoorden) {
        // Combineer alle categorieën van functiewoorden
        woorden = Object.values(LEZEN.functiewoorden).flat();
      } else {
        // Voor alle andere categorieën blijft het hetzelfde
        woorden = LEZEN[cat] || [];
      }


      if (!woorden.length) { if (err) err.textContent = 'Geen woorden voor deze categorie.'; return; }
      items = shuffle(woorden);

      const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
      if (flitslezen) {
        clearTimeout(flitsTimeoutId);
        flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
      }

      if (byWords) {
        const aantal = parseInt(document.getElementById('aantalInput').value, 10);
        if (!Number.isFinite(aantal) || aantal < 1 || aantal > 100) {
          if (err) err.textContent = 'Vul bij "Aantal items" 1..100 in.';
          return;
        }
        if (items.length < aantal) {
          const fill = [];
          while (fill.length < aantal) { fill.push(...shuffle(items)); }
          items = fill.slice(0, aantal);
        } else {
          items = items.slice(0, aantal);
        }
        document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
        showPage(2); toonItem();
      } else {
        const min = parseInt(document.getElementById('minutenInput').value, 10);
        if (!Number.isFinite(min) || min < 1 || min > 3) {
          if (err) err.textContent = 'Vul bij "Aantal minuten" 1..3 in.';
          return;
        }
        endTime = Date.now() + min * 60 * 1000;
        startTimer();
        document.getElementById('subInfo').innerHTML = `<span class="timer" id="timerBadge" style="display:none;"></span>`;
        showPage(2); toonItem();
      }

      document.getElementById('page2Title').textContent = 'Lees dit hardop';
    }

  }

  function klikAntwoord(ok) {
    if (!flitslezen) { if (!flitslezen) { if (!flitslezen) { showTap(ok); } } }
    if (!flitslezen) { showTap(ok); }

    if (oefentype === 'ankers' && !ok && !isHerkansing) {
      const ankerNummer = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;
      const gekozenMode = document.querySelector(`input[name="mode"][value="${ankerNummer}-normaal"]:checked, input[name="mode"][value="${ankerNummer}-snuffel"]:checked`);
      const modus = (gekozenMode.value && gekozenMode.value.endsWith('-snuffel'))
        ? 'snuffel'
        : 'normaal';

      voegFoutWoordToe(ankerNummer, modus, item);
    }

    if (ok) score++; getoond++; idx++;
    if (oefentype === 'klinkers') {
      const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
      if (flitslezen) {
        clearTimeout(flitsTimeoutId);
        flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
      }
      if (byWords) { if (idx < items.length) { toonItem(); } else { eindeToets(); } }
      else { if (Date.now() >= endTime) { eindeToets(); } else { toonItem(); } }
      //Ankers
    } else {
      const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
      if (flitslezen) {
        clearTimeout(flitsTimeoutId);
        flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
      }
      if (byWords) { if (idx < items.length) { toonItem(); } else { eindeToets(); } }
      else { if (Date.now() >= endTime) { eindeToets(); } else { toonItem(); } }
    }
  }

  function eindeToets() {
    stopTimer();

    const container = document.getElementById('resultPageChart');
    if (!container) return;

    // Toon alleen grafiek bij ankers
    if (oefentype === 'ankers') {
      container.classList.remove('hidden');
      container.style.display = 'block';
    } else {
      container.classList.add('hidden');
      container.style.display = 'none';
    }

    // ✅ Gebruik het werkelijke aantal getoonde woorden, niet de lijstlengte
    const tijdMs = Date.now() - startTijd;
    const tijdSeconden = Math.round(tijdMs / 1000);
    const percentage = Math.round((score / getoond) * 100);
    const ipm = Math.round((score / tijdSeconden) * 60);
    const goed = score;
    const fout = getoond - goed;

    let msg = ''; if (percentage < 40) msg = 'Goed geprobeerd, herhalen helpt!'; else if (percentage < 70) msg = 'Mooi zo, je bent op de goede weg.'; else if (percentage < 90) msg = 'Top! Nog even oefenen en je hebt het helemaal.'; else msg = 'Geweldig! Erg knap gedaan.';

    // basisresultaattekst
    let tekst = msg + '<br><br>' +
      `Juist: ${score} van ${getoond} (${percentage}%)<br>` +
      `Tijd: ${tijdSeconden} seconden`;

    // categorie bepalen
    const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;

    // alleen snelheid tonen als het GEEN 'zinnetjes' betreft
    if (!(oefentype === 'lezen' && cat === 'zinnetjes')) {
      tekst += `<br>Snelheid: ${ipm} items per minuut`;
    }

    // resultaat tonen
    const resultaatDiv = document.getElementById('resultaat');
    resultaatDiv.innerHTML = tekst;

    // pillen bijwerken (tijd + evt snelheid)
    const pillTijd = document.getElementById('pill-tijd');
    if (pillTijd) {
      pillTijd.textContent = `Tijd: ${tijdSeconden} s`;
    }

    const pillSnel = document.getElementById('pill-snel');
    if (pillSnel) {
      if (oefentype === 'lezen' && cat === 'zinnetjes') {
        pillSnel.style.display = 'none';
      } else {
        pillSnel.style.display = '';
        pillSnel.textContent = `Snelheid: ${ipm} woorden per minuut`;
      }
    }

    // Alleen resultaten meten bij ankers 1 t/m 8 en herkansingen
    if (oefentype === 'ankers') {
      const gekozen = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;
      const ankerNummer = Number(gekozen); // 1..8
      const gekozenMode = document.querySelector(
        `input[name="mode"][value="${ankerNummer}-normaal"]:checked, input[name="mode"][value="${ankerNummer}-snuffel"]:checked`
      );
      const isSnuffel = gekozenMode && gekozenMode.value.endsWith('-snuffel');
      const modus = isSnuffel ? 'snuffel' : 'normaal';

      // Datum/tijd in nl-NL (zoals elders in je app)
      const datumStr = new Date().toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Eén compleet object voor deze meting
      const record = {
        datum: datumStr,
        type: 'ankers',
        ankerNummer,
        goed: goed,
        fout: fout,
        totaal: getoond,
        percentage,
        tijdSeconden,
        ipm
      };

      // Per-anker + per-modus wegschrijven
      //     Sleutelvorm: resultaten_anker_0{NN}_{modus}
      //     Voorbeeld:   resultaten_anker_02_normaal
      const ankerPadded = String(ankerNummer).padStart(2, '0');
      const perAnkerKey = `resultaten_anker_${ankerPadded}_${modus}`;
      const perAnker = JSON.parse(localStorage.getItem(perAnkerKey) || '[]');

      if (ankerPadded === '09') {
        // Verberg de grafiekcontainer in plaats van verwijderen
        const chartContainer = document.getElementById(resultPageChart);
        if (chartContainer) {
          chartContainer.style.display = 'none';
        }
      } else {
        // Zorg dat de grafiekcontainer weer zichtbaar is
        const chartContainer = document.getElementById(resultPageChart);
        if (chartContainer) {
          chartContainer.style.display = '';
        }

        perAnker.push(record);
        localStorage.setItem(perAnkerKey, JSON.stringify(perAnker));

        // Teken de grafiek
        tekenResultaatGrafiek(ankerNummer, modus);
      }
    }

    // toon resultaatpagina
    showPage(3);

    // confetti en vuurwerk (optioneel)
    startConfetti();
    runFireworks();
  }


  // Init bindings after DOM ready
  window.addEventListener('load', function () {
    // Flits seconds enable/disable
    const flitsToggle = document.getElementById('flitsInput');
    const flitsSecs = document.getElementById('flitsSeconden');
    if (flitsToggle && flitsSecs) {
      const syncFlitsUI = () => {
        const on = !!flitsToggle.checked;
        flitsSecs.disabled = !on;
        if (!on) flitsSecs.value = '0.5';
      };
      syncFlitsUI();
      flitsToggle.addEventListener('change', syncFlitsUI);
    }
    // Type switch
    document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', updateTypeUI));
    // Modus sync (robust)
    const rW = document.getElementById('modus-woorden');
    const rM = document.getElementById('modus-minuten');
    const ai = document.getElementById('aantalInput');
    const mi = document.getElementById('minutenInput');
    function sync() {
      if (rW.checked) { ai.disabled = false; mi.disabled = true; }
      else { ai.disabled = true; mi.disabled = false; }
    }
    rW.addEventListener('change', sync); rM.addEventListener('change', sync);
    ai.addEventListener('focus', () => { rW.checked = true; sync(); });
    ai.addEventListener('input', () => { rW.checked = true; sync(); });
    mi.addEventListener('focus', () => { rM.checked = true; sync(); });
    mi.addEventListener('input', () => { rM.checked = true; sync(); });
    document.getElementById('row-woorden').addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') { rW.checked = true; sync(); } });
    document.getElementById('row-minuten').addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') { rM.checked = true; sync(); } });
    sync();

    // Chips + select all/none
    renderKlinkers(false);
    document.getElementById('klinkerChips').addEventListener('change', prepareKlinkerSubVisibility);

    // Hover functionaliteit: direct reageren op hover over Normaal / Snuffel
    document.querySelectorAll('.toggle-segment label').forEach(label => {
      label.addEventListener('mouseenter', () => {
        const input = document.getElementById(label.getAttribute('for'));
        if (!input) return;

        // Bepaal het anker en of het snuffel of normaal is
        const [anker, type] = input.value.split('-');
        const key = type === 'snuffel' ? `${anker}-snuffel` : anker;

        // Zoek de rij voor positionering van hover-card
        const row = label.closest('tr');
        // showHover(row, ankers[key] || []);
      });

      label.addEventListener('mouseleave', hideHoverSoon);
    });

    // speciale hover variant voor 'Mijn herkansjes'
    const herkansLabel = document.querySelector('label[for="a9n"]');
    if (!herkansLabel) {
      herkansLabel.addEventListener('mouseleave', hideHoverSoon);
    }

    // Hover voor lezen-rijen volledig uitgeschakeld
    document.querySelectorAll('.row.lezen-row').forEach(row => {
      row.addEventListener('mouseenter', () => { });
      row.addEventListener('mouseleave', () => { });
      row.addEventListener('focus', () => { });
      row.addEventListener('blur', () => { });
    });


    // Buttons
    document.getElementById('btnStart').addEventListener('click', startToets);
    document.getElementById('btnQuit').addEventListener('click', () => { cancelToets(); });
    document.getElementById('btnAgain').addEventListener('click', () => showPage(1));
    document.getElementById('btnJuist').addEventListener('click', () => klikAntwoord(true));
    document.getElementById('btnOnjuist').addEventListener('click', () => klikAntwoord(false));

    // Keys
    window.addEventListener('keydown', (e) => {
      const onPage2 = document.getElementById('page2').classList.contains('active'); if (!onPage2) return;
      if (e.key.toLowerCase() === 'j') { klikAntwoord(true); }
      if (e.key.toLowerCase() === 'f') { klikAntwoord(false); }
      if (e.key === 'Escape') {
        cancelToets();
      }
    });


    // Toggle timer met 'T'
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't') {
        const badge = document.getElementById('timerBadge');
        if (badge) {
          badge.style.display = (badge.style.display === 'none' ? '' : 'none');
        }
      }
    });

    // Initial view
    updateTypeUI();
    prepareKlinkerSubVisibility();
    showPage(1);



    // --- Vraagtekentje rechts van Anker 1–8, opent woorden-popup ---
    /* === Kies-een-anker → gebruik dezelfde popup als hamburger-menu === */
    (function initAnkerVraagtekenPopup() {
      const hasPopup = typeof window.openAnkerWoordjes === 'function';
      if (!hasPopup) {
        console.warn('⚠️ openAnkerWoordjes() niet gevonden. Zorg dat ankerwoordjesPopup.js geladen is.');
      }

      // Compat-API: oude naam blijft werken; waarom: externe calls breken anders
      window.openWoordenPopup = function (titel, woordenNormaal, woordenSnuffel, ankerNummer) {
        if (!hasPopup) return;
        window.openAnkerWoordjes(titel, woordenNormaal, woordenSnuffel, ankerNummer);
      };

      function getTitel(tr, nr) {
        return '📚 Anker ' + nr;
      }


      // Maak alle anker-rijen klikbaar (behalve 9 = Mijn herkansjes)
      document.querySelectorAll('.anker-tabel tbody tr[data-anker]').forEach(tr => {
        const nr = String(tr.getAttribute('data-anker') || '');
        const isHerkansjes = nr === '9';

        const td = tr.querySelector('td:first-child');
        if (!td) return;

        td.classList.add('anker-naam');
        td.setAttribute('tabindex', '0');
        td.setAttribute('role', 'button');
        td.setAttribute('aria-label', isHerkansjes ? 'Open Mijn herkansjes' : `Bekijk woordenlijst voor anker ${nr}`);
        td.setAttribute('data-title', isHerkansjes ? 'Mijn herkansjes' : 'Bekijk woordenlijst (normaal + snuffel)');

        const open = (evt) => {
          // waarom: klik op bediening (radio/knop/icon) in dezelfde rij mag popup niet openen
          if (evt?.target?.closest('input, button, svg')) return;

          if (isHerkansjes) {
            document.getElementById('mijnHerkansjesLink')?.click();
            return;
          }
          const woordenNormaal = (window.ankers && window.ankers[nr]) || [];
          const woordenSnuffel = (window.ankers && window.ankers[`${nr}-snuffel`]) || [];
          const titel = getTitel(tr, nr);

          if (hasPopup) {
            window.ankerIndexClick = true;  // globale vlag
            window.openAnkerWoordjes(titel, woordenNormaal, woordenSnuffel, nr);
          } else {
            console.warn('openAnkerWoordjes() ontbreekt; popup kan niet geopend worden.');
          }
        };

        td.addEventListener('click', open);
        td.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); }
        });
      });

      // Ruim oude vraagteken-/zoek-iconen op
      document.querySelectorAll('.anker-search, .btnReset.anker-search').forEach(b => b.remove());

      // Optioneel: verwijder legacy DOM voor oude popup als aanwezig (voorkomt schaduw-UI)
      document.getElementById('woordenPopup')?.remove();
    })();


  });

  // Shine effect for result hero
  window.moveShine = function (e) {
    const hero = e.currentTarget;
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    hero.style.setProperty('--mx', `${x * 100}%`);
  };
})();



document.addEventListener('DOMContentLoaded', function () {
  const quitBtn = document.getElementById('btnQuit');
  if (quitBtn) {
    quitBtn.addEventListener('click', function () {
      if (window.cancelToets) window.cancelToets();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('page2')?.classList.contains('active')) {
      if (window.cancelToets) window.cancelToets();
    }
  });
});


//Changelog
document.addEventListener('DOMContentLoaded', function () {
  const link = document.getElementById('changelogLink');
  const tip = document.getElementById('changelogTip');
  if (!link || !tip) return;

  const show = () => tip.classList.add('show');
  const hide = () => tip.classList.remove('show');

  // Desktop hover/toetsenbord
  link.addEventListener('mouseenter', show);
  //link.addEventListener('mouseleave', hide);
  link.addEventListener('focus', show);
  link.addEventListener('blur', hide);

  // ✅ Mobiel / algemeen: klik toggle
  link.addEventListener('click', (e) => {
    e.preventDefault();
    tip.classList.toggle('show');
  });

  // ✅ Sluiten bij klik buiten de tip
  document.addEventListener('click', (e) => {
    if (!tip.classList.contains('show')) return;
    const clickedLink = e.target === link || link.contains(e.target);
    const clickedTip = e.target === tip || tip.contains(e.target);
    if (!clickedLink && !clickedTip) hide();
  });
});

document.getElementById('clCloseBtn')?.addEventListener('click', () => {
  document.getElementById('changelogTip')?.classList.remove('show');
});


document.addEventListener('click', function onceResume() {
  try { var ctx = getAudioCtx(); if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { }
  document.removeEventListener('click', onceResume);
}, { once: true });

/**
 * Initializes behavior for the results link, hover tooltip and "delete all results" button.
 *
 * - Shows all results when the results link is clicked.
 * - Hides the mini-chart tooltip when the mouse leaves.
 * - Asks for confirmation before deleting all stored results.
 * - Removes local storage data and destroys the active chart instance if present.
 *
 * This logic is activated once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', function () {

  // Fetch UI elements
  const resultatenLink = document.getElementById('resultatenLink');   // "Results" link
  const resultatenTip = document.getElementById('resultatenTip');     // Mini-chart tooltip
  const resultatenPopup = document.getElementById('resultatenPopup'); // Results popup

  /* =====================================================
     Hover behavior and clicking the "results" link
     ===================================================== */
  if (resultatenLink && resultatenTip) {

    // Clicking the results link → show results for all anchors
    resultatenLink.addEventListener('click', () => {
      showResultsAllAnchors();
    });

    // Mouse leaves the link → hide tooltip after a short delay
    resultatenLink.addEventListener('mouseleave', () => {
      window._resultatenHideTimer = setTimeout(() => {
        resultatenTip.style.display = 'none';
      }, 150);
    });

    // Mouse leaves the tooltip itself → hide immediately
    resultatenTip.addEventListener('mouseleave', () => {
      resultatenTip.style.display = 'none';
    });
  }

});



document.addEventListener('DOMContentLoaded', function () {
  const popup = document.getElementById('resultatenPopup');
  const card = popup?.querySelector('.popupCard');
  const resultatenBtn = document.getElementById('resultatenLink');

  // Bevestigings-popup elementen
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmBox = document.getElementById('confirmBox');

  if (!popup || !card) return;

  // Helper: is popup zichtbaar?
  function isPopupOpen() {
    return getComputedStyle(popup).display !== 'none';
  }

  // Resultaten popup openen via knop
  if (resultatenBtn) {
    resultatenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      popup.style.display = 'flex';
    });
  }

  // Binnen de popup klikken → NIET sluiten
  card.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });

  // ----------------------------------------------
  //   DETECTEER klik BUITEN de popup om te sluiten
  // ----------------------------------------------
  document.addEventListener('pointerdown', (e) => {
    if (!isPopupOpen()) return;

    const meldingOverlay = document.getElementById('meldingOverlay');

    const klikInPopup =
      (popup.contains(e.target) && card.contains(e.target)) ||
      (confirmOverlay && confirmOverlay.contains(e.target)) ||
      (confirmBox && confirmBox.contains(e.target)) ||
      (document.getElementById('okOnlyModal') &&
        document.getElementById('okOnlyModal').contains(e.target)) ||
      (meldingOverlay && meldingOverlay.contains(e.target));   // <-- DIT IS DE FIX

    if (!klikInPopup) {
      popup.style.display = 'none';
    }

  });

  // Sluiten op Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPopupOpen()) {
      popup.style.display = 'none';
    }
  });
});

//1: TOON GRAFIEK, ALLE ANKERS (CLICK)
function showResultsAllAnchors() {

  const popup = document.getElementById('resultatenPopup');

  popup.classList.remove('hidden');
  popup.classList.add('show');

  openResultsPopupForAllAnchors();

  setTimeout(() => {
    openResultsPopupForAllAnchors();
    window.dispatchEvent(new Event('resize')); //  <-- belangrijke fix
  }, 10);

}

//2: TOON GRAFIEK (NA OEFENING)
function tekenResultaatGrafiek(anker, modus) {

  const ankerNummer = anker;

  console.log("📊 tekenResultaatGrafiek → anker:", ankerNummer, "modus:", modus);

  // Inline grafiek tekenen op resultaat pagina
  renderChartInline("resultPageChart", ankerNummer, modus);
}


// ===== Voortgangsgrafiek tonen =====
function toonVoortgang() {
  const canvas = document.getElementById('resultChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const history = JSON.parse(localStorage.getItem('resultaten') || '[]')
    .filter(r => r.type === 'ankers');

  if (history.length === 0) {
    toonBevestiging('Nog geen resultaten opgeslagen.', () => { });
    return;
  }

  // ✅ Sorteer resultaten op datum (oud → nieuw)
  history.sort((a, b) => {
    const [dagA, maandA, jaarA] = a.datum.split(',')[0].trim().split('-');
    const [dagB, maandB, jaarB] = b.datum.split(',')[0].trim().split('-');
    const tijdA = (a.datum.split(',')[1] || '').trim();
    const tijdB = (b.datum.split(',')[1] || '').trim();
    const da = new Date(`${jaarA}-${maandA}-${dagA}T${tijdA}`);
    const db = new Date(`${jaarB}-${maandB}-${dagB}T${tijdB}`);
    return da - db;
  });

  // ✅ Alleen de laatste 80 metingen tonen
  const laatste = history.slice(-80);
  const labels = laatste.map((_, i) => i + 1);

  if (window.resultChartInstance) {
    window.resultChartInstance.destroy();
  }

  const chartData = laatste.map(d => d.ipm || 0);

  window.resultChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Snelheid (IPM)',
        data: chartData,
        borderColor: '#01689B',
        backgroundColor: 'rgba(1,104,155,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#01689B',
        pointHoverBackgroundColor: 'red',
        pointHoverBorderColor: '#ff6666',
        pointHoverBorderWidth: 3
      }],
      fullData: laatste
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Metingnummer' },
          ticks: { autoSkip: true, maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Woordjes per minuut' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          displayColors: false,
          backgroundColor: '#01689B',
          titleColor: '#fff',
          bodyColor: '#fff',
          footerColor: '#ffcccc',
          footerFont: { size: 11, weight: 'bold' },
          footerAlign: 'center',
          padding: 12,
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const d = tooltipItems[0].chart.data.fullData[index];
              return d ? d.datum : '';
            },
            label: (context) => {
              const d = context.chart.data.fullData[context.dataIndex];
              if (!d) return '';
              const goed = d.goed ?? 0;
              const fout = d.fout ?? 0;
              const totaal = goed + fout;
              const ipm = d.ipm ?? 0;
              const perc = totaal > 0 ? Math.round((goed / totaal) * 100) : 0;
              return [
                `Woordjes per minuut-2: ${ipm}`,
                `Juist: ${goed}`,
                `Fout: ${fout}`,
                `Totaal: ${totaal}`,
                `Percentage: ${perc}%`
              ];
            },
            footer: () => 'Klik om meting te verwijderen'
          },
          external: (context) => {
            const tooltipEl = context.tooltip;
            if (tooltipEl && tooltipEl.footer && tooltipEl.opacity !== 0) {
              tooltipEl.footer = tooltipEl.footer; // noop, triggert rendering
            }
          }
        }
      },
      onHover: (e, els, chart) =>
        (chart.canvas.style.cursor = els.length ? 'pointer' : 'default'),
      onClick: (evt, activeEls, chart) => {
        if (!activeEls.length) return;
        const idx = activeEls[0].index;
        const geselecteerde = laatste[idx];

        toonBevestiging(
          `Weet je zeker dat je meting #${idx + 1} (${geselecteerde.datum}, ${geselecteerde.ipm} wpm) wilt verwijderen?`,
          (ja) => {
            if (!ja) return;
            let alle = JSON.parse(localStorage.getItem('resultaten') || '[]');

            // Zorg dat we op datum en ipm matchen
            const echteIndex = alle.findIndex(
              (r) =>
                r.datum === geselecteerde.datum &&
                r.ipm === geselecteerde.ipm &&
                r.type === 'ankers'
            );

            if (echteIndex >= 0) {
              alle.splice(echteIndex, 1);
              localStorage.setItem('resultaten', JSON.stringify(alle));
              chart.data.datasets[0].data.splice(idx, 1);
              chart.data.labels.splice(idx, 1);
              chart.update();
              toonOK(`Meting van ${geselecteerde.datum} is verwijderd.`);
            } else {
              toonBevestiging('Kon de juiste meting niet vinden.', () => { }, true);
            }
          }
        );
      }
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  // Zoek alle varianten (popup, resultatenpagina, oude id)
  const resetBtns = [
    document.getElementById('btnResetResultaat'),
    document.getElementById('btnReset')
  ].filter(Boolean);

  // Koppel de klikfunctie aan alle resetknoppen
  resetBtns.forEach((resetBtn) => {
    resetBtn.addEventListener('click', () => {
      // Bevestiging tonen
      toonBevestiging('Weet je zeker dat je alle resultaten wilt wissen?', (bevestig) => {
        if (!bevestig) {
          return;
        }

        // 1) Verwijder opgeslagen resultaten
        localStorage.removeItem('resultaten');

        // 2) Vernietig beide Chart.js instanties (resultatenpagina + hover)
        if (window.resultChartInstance) {
          window.resultChartInstance.destroy();
          window.resultChartInstance = null;
        }
        if (window.resultatenChartInstance) {
          window.resultatenChartInstance.destroy();
          window.resultatenChartInstance = null;
        }

        // 3) Canvassen leegmaken (voorkomt oude pixels)
        const resultChartCanvas = document.getElementById('resultChart');
        if (resultChartCanvas && resultChartCanvas.getContext) {
          const ctx = resultChartCanvas.getContext('2d');
          ctx.clearRect(0, 0, resultChartCanvas.width, resultChartCanvas.height);
        }

        const hoverChartCanvas = document.getElementById('resultatenChart');
        if (hoverChartCanvas && hoverChartCanvas.getContext) {
          const hctx = hoverChartCanvas.getContext('2d');
          hctx.clearRect(0, 0, hoverChartCanvas.width, hoverChartCanvas.height);
        }

        // 4) Hoverpopup verbergen
        const tip = document.getElementById('resultatenTip');
        if (tip) {
          tip.style.display = 'none';
        }

        // 5) Container met grafiek verbergen (optioneel)
        const chartContainer = document.getElementById(resultPageChart);
        if (chartContainer) {
          chartContainer.classList.add('hidden');
        }

        // 6) Terugkoppeling
        toonMelding('Alle resultaten zijn gewist.');
      });
    });
  });
});



function toonBevestiging(boodschap, callback) {
  const overlay = document.getElementById('confirmOverlay');
  const msg = document.getElementById('confirmMessage');
  const jaBtn = document.getElementById('confirmJa');
  const neeBtn = document.getElementById('confirmNee');

  msg.textContent = boodschap;
  overlay.style.display = 'flex';

  const sluit = () => overlay.style.display = 'none';

  jaBtn.onclick = () => {
    sluit();
    callback(true);
  };

  neeBtn.onclick = () => {
    sluit();
    callback(false);
  };
}

// OK-only modal (EBX-stijl)
function toonOK(boodschap, onOk) {
  // sluit bestaande modal als die er is
  const bestaand = document.getElementById('okOnlyModal');
  if (bestaand) bestaand.remove();

  const overlay = document.createElement('div');
  overlay.id = 'okOnlyModal';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 100000;              /* ⭐ HIER verhoogd */
    background: rgba(0,0,0,.45);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#fff;
    border-radius:14px;
    padding:22px 28px;
    max-width:360px;
    width: min(90vw, 360px);
    text-align:center;
    box-shadow:0 10px 30px rgba(0,0,0,.25);
  `;
  box.innerHTML = `
    <p style="margin-bottom:20px;font-size:16px;">${boodschap}</p>
    <div style="display:flex; justify-content:center;">
      <button id="okOnlyBtn" class="btn">OK</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const okBtn = box.querySelector('#okOnlyBtn');

  function close(ok = true) {
    overlay.remove();
    if (typeof onOk === 'function' && ok) onOk();
    window.removeEventListener('keydown', keyHandler);
  }

  function keyHandler(e) {
    if (e.key === 'Enter' || e.key === 'Escape') close(true);
  }

  okBtn.addEventListener('click', () => close(true));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(true);
  });

  window.addEventListener('keydown', keyHandler);

  // focus
  setTimeout(() => okBtn.focus(), 0);
}

// Melding tonen (OK knop)
function toonMelding(boodschap) {
  const overlay = document.getElementById('meldingOverlay');
  const msg = document.getElementById('meldingMessage');
  const okBtn = document.getElementById('meldingOk');

  msg.textContent = boodschap;

  // Ensure the overlay is above every popup
  overlay.style.zIndex = '100000';    // <-- added line

  overlay.style.display = 'flex';

  okBtn.onclick = () => {
    overlay.style.display = 'none';
  };
}


function wisResultaten() {
  if (!confirm('Weet je zeker dat je alle resultaten wilt wissen?')) return;

  try {
    localStorage.removeItem('resultaten');
    localStorage.removeItem('statistieken');
  } catch (e) {
    console.error('Kon resultaten niet wissen:', e);
  }

  // visueel resetten
  const resultaatEl = document.getElementById('resultaat');
  if (resultaatEl) resultaatEl.textContent = '';

  const pillTijd = document.getElementById('pill-tijd');
  const pillSnel = document.getElementById('pill-snel');
  if (pillTijd) pillTijd.textContent = 'Tijd: -- s';
  if (pillSnel) pillSnel.textContent = 'Snelheid: -- ipm';

  alert('Resultaten zijn gewist.');
}

// ===== COOKIE / RESULTAAT CORRECTIE =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    const key = 'resultaten';
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    let aangepast = 0;

    data.forEach(r => {
      if (r.type === 'ankers') {
        let goed = Number(r.goed) || 0;
        let fout = Number(r.fout) || 0;
        let totaal = Number(r.totaal) || 0;
        let huidigPerc = Number(r.percentage) || 0;
        let gewijzigd = false;

        // 1️⃣ Controleer of totaal klopt met goed + fout
        const berekendTotaal = goed + fout;
        if (totaal !== berekendTotaal) {
          // als totaal kleiner is dan goed, verhogen we totaal
          if (totaal < goed) {
            totaal = berekendTotaal;
          } else if (totaal > berekendTotaal && fout === 0) {
            // als totaal groter is dan goed maar fout 0, stel fout = totaal - goed
            fout = totaal - goed;
          } else {
            totaal = berekendTotaal;
          }
          r.totaal = totaal;
          r.fout = fout;
          gewijzigd = true;
        }

        // 2️⃣ Controleer of fout klopt met totaal - goed
        const berekendFout = totaal - goed;
        if (fout !== berekendFout) {
          fout = berekendFout;
          r.fout = fout;
          gewijzigd = true;
        }

        // 3️⃣ Herbereken percentage
        const correctPerc = totaal > 0 ? Math.round((goed / totaal) * 100) : 0;
        if (huidigPerc !== correctPerc) {
          r.percentage = correctPerc;
          gewijzigd = true;
        }

        if (gewijzigd) aangepast++;
      }
    });

    if (aangepast > 0) {
      localStorage.setItem(key, JSON.stringify(data, null, 2));
      console.log(`✔️ ${aangepast} meting(en) in localStorage gecorrigeerd.`);
    }
  } catch (err) {
    console.error('Fout bij cookiecorrectie:', err);
  }
});

document.querySelectorAll('.toggle-segment input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const anker = e.target.closest('.toggle-segment').dataset.anker;
    const ankerRadio = document.querySelector(`input[name="anker"][value="${anker}"]`);
    if (ankerRadio) {
      ankerRadio.checked = true;
      ankerRadio.dispatchEvent(new Event('change'));
    }
  });
});

// === Fout gelezen woorden (cookie/localStorage) ===
let foutGelezen = [];

/**
* Registreert een fout gelezen woordje in localStorage.
* Structuur per item:
* {
*   anker: 1,
*   modus: 'normaal',
*   woord: 'meer',
*   aantal: 1,
*   tijden: ['2025-10-12T16:00:34.000Z']
* }
*/
function voegFoutWoordToe(anker, modus, woord) {

  if (!woord || typeof woord !== 'string' || woord.trim() === '') {
    fconsole.warn('Leeg of ongeldig woord genegeerd bij toevoegen fout woord:', woord);
    return;
  }

  const opslagNaam = 'fout_woordjes';
  let foutjes = [];

  // Bestaande lijst ophalen
  const opgeslagen = localStorage.getItem(opslagNaam);
  if (opgeslagen) {
    try {
      foutjes = JSON.parse(opgeslagen);
    } catch (e) {
      console.warn('Kon fout_woordjes niet als JSON parsen:', e);
    }
  }

  const tijdstip = new Date().toISOString();

  // Zoeken of dezelfde combinatie al bestaat
  const bestaande = foutjes.find(f =>
    f.anker === anker && f.modus === modus && f.woord === woord
  );

  if (bestaande) {
    bestaande.aantal = (bestaande.aantal || 1) + 1;
    if (!bestaande.tijden) bestaande.tijden = [];
    bestaande.tijden.push(tijdstip);
  } else {
    foutjes.push({
      anker: anker,
      modus: modus,
      woord: woord,
      aantal: 1,
      tijden: [tijdstip]
    });
  }

  localStorage.setItem(opslagNaam, JSON.stringify(foutjes));
}

function laadFoutWoordjes() {
  const data = localStorage.getItem('fout_woordjes');
  foutGelezen = data ? JSON.parse(data) : [];
}

function toonResultaten() {
  laadFoutWoordjes();
  const container = document.getElementById('resultatenList');

  if (!foutGelezen.length) {
    container.innerHTML = '<p style="color:#64748b;">Nog geen fout gelezen woordjes opgeslagen.</p>';
    return;
  }

  const lijst = foutGelezen
    .map(w => `<span class="chip" style="margin:4px; display:inline-block;">${w}</span>`)
    .join('');
  container.innerHTML = `<div style="display:flex;flex-wrap:wrap;justify-content:center;">${lijst}</div>`;
}

function wisFoutWoordjes() {
  foutGelezen = [];
  localStorage.removeItem('fout_woordjes');
  toonResultaten();
}

/**
 * Formatteert een ISO-datum naar 'dd-MM-yyyy HH:mm:ss' (lokale tijd).
 */
function formatteerDatum(isoString) {
  try {
    const d = new Date(isoString);
    const pad = n => (n < 10 ? '0' + n : n);
    return (
      pad(d.getDate()) + '-' +
      pad(d.getMonth() + 1) + '-' +
      d.getFullYear() + ' ' +
      pad(d.getHours()) + ':' +
      pad(d.getMinutes()) + ':' +
      pad(d.getSeconds())
    );
  } catch (e) {
    return isoString;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const btnZinnetjes = document.getElementById('btnZinnetjes');
  const popup = document.getElementById('zinnetjesPopup');
  const listBody = document.getElementById('zinnetjesList');
  const closeBtn = document.getElementById('btnSluitZinnetjes');

  if (!btnZinnetjes || !popup || !listBody || !closeBtn) {
    console.warn('Zinnetjes-popup elementen niet gevonden.');
    return;
  }

  // Klik op vergrootglas → toon popup
  btnZinnetjes.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Nieuwe structuur: categorieën in LEZEN.zinnetjes
      const categorieen = (typeof LEZEN !== 'undefined' && LEZEN.zinnetjes)
        ? LEZEN.zinnetjes
        : null;

      listBody.innerHTML = '';

      if (!categorieen) {
        listBody.innerHTML = '<tr><td colspan="2"><em>Geen zinnetjes gevonden.</em></td></tr>';
      } else {
        Object.keys(categorieen).forEach(cat => {
          // Categorie-header
          const headerRow = document.createElement('tr');
          headerRow.innerHTML = `<td colspan="2" style="font-weight:bold; padding-top:8px; border-top:1px solid #ccc;">${cat}</td>`;
          listBody.appendChild(headerRow);

          // Zinnetjes alfabetisch sorteren
          const zinnen = [...categorieen[cat]].sort((a, b) =>
            a.localeCompare(b, 'nl', { sensitivity: 'base' })
          );

          // Elk zinnetje op een aparte rij
          zinnen.forEach((zin, i) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td style="vertical-align: top; width: 30px;">${i + 1}</td>
              <td style="white-space: normal; line-height: 1.6em; padding: 4px 8px;">${zin}</td>
            `;
            listBody.appendChild(row);
          });

          // Extra lege rij voor wat lucht tussen categorieën
          const spacer = document.createElement('tr');
          spacer.innerHTML = '<td colspan="2" style="height: 6px;"></td>';
          listBody.appendChild(spacer);
        });
      }

      popup.style.display = 'block'; // popup tonen
    } catch (err) {
      console.error('Fout bij tonen van zinnetjes:', err);
    }
  });

  // Klik op sluitknop → verberg popup
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Klik buiten popup → verberg popup
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });
});


// ===== Popup Functiewoordjes =====
document.addEventListener('DOMContentLoaded', function () {
  const popup = document.getElementById('functiewoordjesPopup');
  const btnSluit = document.getElementById('btnSluitFunctiewoordjes');
  const tbody = document.getElementById('functiewoordjesList');
  const btnOpen = document.getElementById('btnFunctiewoordjes'); // vergrootglas-knop

  if (!popup || !btnSluit || !tbody || !btnOpen) return;

  // Popup vullen en tonen
  function toonFunctiewoordjes() {
    tbody.innerHTML = '';

    // Controleer of data bestaat
    if (typeof LEZEN === 'undefined' || !LEZEN.functiewoorden) {
      const rij = document.createElement('tr');
      rij.innerHTML = '<td colspan="2"><em>Geen functiewoordjes gevonden.</em></td>';
      tbody.appendChild(rij);
      popup.style.display = 'flex';
      return;
    }

    const categorieen = LEZEN.functiewoorden;

    // Loop door alle categorieën
    Object.keys(categorieen).forEach(cat => {
      // Categorie-titel
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="2" style="font-weight:bold; padding-top:8px; border-top:1px solid #ccc;">${cat.replace(/_/g, ' ')}</td>`;
      tbody.appendChild(headerRow);

      // Sorteer en voeg woorden toe
      const woorden = [...categorieen[cat]].sort((a, b) => a.localeCompare(b, 'nl', { sensitivity: 'base' }));
      woorden.forEach((woord, i) => {
        const rij = document.createElement('tr');
        rij.innerHTML = `<td style="width:40px;">${i + 1}</td><td>${woord}</td>`;
        tbody.appendChild(rij);
      });
    });

    popup.style.display = 'flex'; // toon popup
  }

  // Popup sluiten
  function sluitFunctiewoordjes() {
    popup.style.display = 'none';
  }

  // Alleen openen bij klik op vergrootglas-knop
  btnOpen.addEventListener('click', function (e) {
    e.stopPropagation(); // voorkom dat iets anders triggert
    toonFunctiewoordjes();
  });

  // Sluitknop
  btnSluit.addEventListener('click', sluitFunctiewoordjes);

  // Klik buiten popup sluit ook
  popup.addEventListener('click', function (e) {
    if (e.target === popup) sluitFunctiewoordjes();
  });

  // Escape-toets sluit ook
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup.style.display === 'flex') sluitFunctiewoordjes();
  });
});



// ===========================================
// EBX-stijl tooltip (stabiel, zonder knipperen of verdwijnen)
// ===========================================
(function () {
  let tooltip;
  let activeEl = null;
  let showTimer = null;
  let hideTimer = null;

  function showTooltip(el) {
    const tekst = el.dataset.tiptekst || el.getAttribute('title');
    if (!tekst) return;

    // Cache de tekst zodat title niet meer nodig is
    if (!el.dataset.tiptekst && el.hasAttribute('title')) {
      el.dataset.tiptekst = tekst;
      el.removeAttribute('title');
    }

    // Annuleer eventuele hide-timer
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

})();

// ==================== EBX-tooltips voor grafiekknoppen ====================

// Tooltip helpers
// Dynamische tooltip die altijd correct blijft bij scroll


function initAnkerResultaatGrafieken() {
  document.querySelectorAll('tr[data-anker]').forEach(tr => {
    const ankerNummer = tr.getAttribute('data-anker');
    const td = tr.querySelector('td:last-child');

    // Veiligheidscheck
    if (!ankerNummer || !td) {
      console.warn('Geen geldige cel gevonden voor anker:', ankerNummer);
      return;
    }

    // ⛔ Sla anker 09 ("Herkansjes") over
    if (ankerNummer === '9' || ankerNummer === 9) {
      return;
    }

    // Maak de knop
    const btn = document.createElement('button');
    btn.className = 'btnResultGrafiek';
    btn.style.cssText = `
      background:none;
      border:none;
      padding:6px;
      border-radius:8px;
      cursor:pointer;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      color:#01689B;
    `;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
           viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 3v18h18v-2H5V3H3zm16 10h2v5h-2v-5zm-4-3h2v8h-2v-8zm-4 2h2v6H11v-6zm-4-4h2v10H7V8z"/>
      </svg>
    `;
    td.appendChild(btn);

    // Klikactie
    btn.addEventListener('click', () =>
      openResultatenPopupVoorAnker(ankerNummer)
    );

    // Tooltip bij hover (maak onderscheid tussen Start en andere ankers)
    btn.addEventListener('mouseenter', e => {
      let label;

      if (ankerNummer === '0') {
        label = '(0) Start';
      } else {
        label = String(ankerNummer).padStart(2, '0');
      }
      showTooltip(e.target, `Bekijk resultaten van Anker ${label}`);
    });

    btn.addEventListener('mouseleave', hideTooltip);
  });
}



// Start na DOM load
document.addEventListener('DOMContentLoaded', initAnkerResultaatGrafieken);


/**
 * Verbergt de 'Snuffel'-optie bij elk anker als er geen snuffelwoorden bestaan.
 */
function controleerSnuffelBeschikbaarheidVoorAlleAnkers() {
  // Loop over alle segmenten (1–8)
  document.querySelectorAll('.toggle-segment').forEach(segment => {
    const ankerNummer = segment.dataset.anker || '1';
    const snuffelLabel = segment.querySelector(`label[for="a${ankerNummer}s"]`);
    const snuffelInput = segment.querySelector(`#a${ankerNummer}s`);
    if (!snuffelLabel || !snuffelInput) {
      return;
    }

    // ✅ Controleer of er snuffelwoorden bestaan voor dit specifieke anker
    const key = `${ankerNummer}-snuffel`;
    const snuffelWoorden = (window.ankers && window.ankers[key]) || [];
    let woorden = ankers[key];

    // ✅ Toon of verberg afhankelijk van beschikbaarheid
    if (woorden.length > 0) {
      // doe niks
    } else {
      snuffelLabel.style.display = 'none';
      snuffelInput.style.display = 'none';
    }
  });
}

// ✅ Uitvoeren na laden van de pagina
document.addEventListener('DOMContentLoaded', controleerSnuffelBeschikbaarheidVoorAlleAnkers);


// Tooltip voor Snuffel-knoppen
document.querySelectorAll('label[for$="s"]').forEach(label => {
  label.addEventListener('mouseenter', e => {
    const tip = document.createElement('div');
    tip.className = 'tooltip-bubble show';
    tip.textContent = 'meer uitdaging? kies snuffelwoordjes';
    document.body.appendChild(tip);

    const rect = e.target.getBoundingClientRect();
    const top = Math.max(8, rect.top + window.scrollY - tip.offsetHeight - 8);
    const left = rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2;

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  });

  label.addEventListener('mouseleave', () => {
    document.querySelectorAll('.tooltip-bubble').forEach(el => el.remove());
  });
});


function openResultatenPopupVoorAnker(nr) {
  const nrStr = String(nr).padStart(2, '0');

  const popup = document.getElementById('resultatenPopup');

  if (popup.classList.contains('show')) {
    // van show → hidden
    popup.style.display = 'flex';
    popup.classList.remove('hidden');
    popup.classList.add('show');
  } else {
    // van hidden OR display:none → show
    popup.classList.remove('hidden');
    popup.classList.add('show');
  }


  const btn = document.getElementById("modeDropdownBtn");
  btn.textContent = "Normaal ▾";

  window.startEmbeddedGrafiek(nrStr);

  setTimeout(() => {
    startEmbeddedGrafiek(String(nrStr));
    window.dispatchEvent(new Event('resize')); //  <-- belangrijke fix
  }, 10);

}

// ===============================
// Helpers
// ===============================
function safeResizeChart(chart, overlayEl) {
  if (!chart || chart._destroyed) return;
  const canvas = chart.canvas;
  if (!canvas || !document.body.contains(canvas)) return;

  const isHidden = (el) =>
    !el || el.style.display === 'none' || el.offsetParent === null;

  if (overlayEl && isHidden(overlayEl)) return;
  const parent = canvas.parentElement;
  if (!parent || isHidden(parent)) return;

  requestAnimationFrame(() => {
    try { chart.resize(); chart.update('none'); }
    catch (e) { console.warn('safeResizeChart: resize overgeslagen:', e); }
  });
}

function ensureResultatenPopup() {
  let overlay = document.getElementById('resultatenPopup');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'resultatenPopup';
    overlay.style.cssText = `
        position: fixed; inset: 0; display: none;
        align-items: center; justify-content: center;
        background: rgba(0,0,0,0.35); z-index: 9999;
      `;
    overlay.innerHTML = `
        <div class="popup-card" style="
          width: clamp(320px, 90vw, 980px);
          height: clamp(300px, 82vh, 660px);
          background: #fff; border-radius: 14px; padding: 14px 14px 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25); position: relative; display:flex; flex-direction:column;">
          <button class="popup-close" aria-label="Sluiten" title="Sluiten" style="
            position:absolute; top:8px; right:8px; border:none; background:transparent;
            font-size:20px; line-height:1; cursor:pointer;">×</button>
          <h3 class="popupTitle" style="margin:0 0 8px 0; font-weight:700;">Resultaten</h3>
          <div class="popup-toolbar"></div>
          <div style="flex:1; min-height: 220px; position:relative;">
            <canvas></canvas>
          </div>
        </div>
      `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

// éénmalig styles voor de gauge-knoppen
(function ensureGaugeStyles() {
  if (document.getElementById('gauge-blue-inline-label-style')) return;
  const st = document.createElement('style');
  st.id = 'gauge-blue-inline-label-style';
  st.textContent = `
      .modeBar{display:flex;gap:8px;align-items:center;margin:6px 0 8px;}
      .modeBar button.icon{
        background:none;border:none;padding:6px 8px;border-radius:10px;
        display:inline-flex;align-items:center;justify-content:center;
        cursor:pointer;color:#01689B;transition:background-color .15s ease, transform .04s ease;
      }
      .modeBar button.icon:hover{background:rgba(1,104,155,.08)}
      .modeBar button.icon[data-active="true"]{background:rgba(1,104,155,.12)}
      .modeBar button.icon:active{transform:scale(.97)}
      .gauge .needle{transition:transform 180ms ease; transform-origin:12px 14px}
      .gauge .glabel{
        font: 700 8px/1 ui-sans-serif,-apple-system,Segoe UI,Roboto,Helvetica,Arial;
        letter-spacing:.2px; user-select:none;
      }
    `;
  document.head.appendChild(st);
})();


// ───────────────────────────────
// Tooltipfunctie voor Snuffelknoppen
// ───────────────────────────────
let actieveTooltip = null;
let tooltipTarget = null;

function showTooltip(target, text) {
  hideTooltip();

  tooltipTarget = target;
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip-floating';
  tooltip.textContent = text;
  document.body.appendChild(tooltip);
  actieveTooltip = tooltip;

  const positionTooltip = () => {
    if (!actieveTooltip || !tooltipTarget) return;

    const rect = tooltipTarget.getBoundingClientRect();
    const margin = 8; // ruimte tussen tooltip en target
    const tooltip = actieveTooltip;

    // bereken startpositie
    let top = rect.top - tooltip.offsetHeight - margin;
    let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

    // corrigeer als tooltip te ver naar links of rechts gaat
    const maxLeft = window.innerWidth - tooltip.offsetWidth - margin;
    if (left < margin) left = margin;
    if (left > maxLeft) left = maxLeft;

    // als tooltip boven het scherm valt, plaats hem onder de knop
    if (top < margin) {
      top = rect.bottom + margin;
    }

    // pas definitieve positie toe
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  };


  // Eerst laten tekenen, dan positioneren
  requestAnimationFrame(() => {
    positionTooltip();
    // extra update na een fractie van een seconde
    setTimeout(positionTooltip, 60);
  });

  // herpositioneren bij scroll en resize zolang tooltip zichtbaar is
  const handleMove = () => requestAnimationFrame(positionTooltip);
  window.addEventListener('scroll', handleMove);
  window.addEventListener('resize', handleMove);
  tooltip._cleanup = () => {
    window.removeEventListener('scroll', handleMove);
    window.removeEventListener('resize', handleMove);
  };
}

function hideTooltip() {
  if (actieveTooltip) {
    if (actieveTooltip._cleanup) actieveTooltip._cleanup();
    actieveTooltip.remove();
    actieveTooltip = null;
  }
  tooltipTarget = null;
}


function isConfirmOpen() {
  const ov = document.getElementById('confirmOverlay');
  return ov && ov.style.display !== 'none';
}

// --- MIGRATIE: alleen uitvoeren als 'resultaten' bestaat en
// 'resultaten_anker_01_normaal' nog NIET bestaat. Draait idempotent. ---
(function migrateAnker01IfNeeded() {
  const OLD_KEY = 'resultaten';
  const NEW_N_KEY = 'resultaten_anker_01_normaal';
  const NEW_S_KEY = 'resultaten_anker_01_snuffel';

  if (!localStorage.getItem(OLD_KEY)) return;
  if (localStorage.getItem(NEW_N_KEY)) {
    return;
  }

  try {
    const raw = localStorage.getItem(OLD_KEY);
    const old = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(old) || !old.length) return;

    // eenmalige backup
    if (!localStorage.getItem('backup_resultaten_voor_migratie_anker01')) {
      localStorage.setItem('backup_resultaten_voor_migratie_anker01', raw);
    }

    // filter uitsluitend ANKER 01
    const isAnker01 = (r) => {
      if (!r) return false;
      if (r.anker != null) return String(r.anker).padStart(2, '0') === '01';
      // fallback op oude structuur
      return r.type === 'ankers';
    };

    const anker01Data = old.filter(isAnker01);
    if (!anker01Data.length) return;

    const normaal = anker01Data.filter(r => !r?.snuffel);
    const snuffel = anker01Data.filter(r => !!r?.snuffel);

    localStorage.setItem(NEW_N_KEY, JSON.stringify(normaal));
    localStorage.setItem(NEW_S_KEY, JSON.stringify(snuffel));

    console.log('Migratie anker 01 voltooid ✅');
  } catch (e) {
    console.error('Migratie anker 01 mislukt:', e);
  }
})();

function updateWoordLog(anker, woord) {
  const key = 'woordlog';
  const log = JSON.parse(localStorage.getItem(key)) || {};

  if (!log[anker]) log[anker] = {};
  if (!log[anker][woord]) log[anker][woord] = 0;

  log[anker][woord] += 1;
  localStorage.setItem(key, JSON.stringify(log));
}

/**
 * Combineert woorden uit ankers.js met eventuele extra woorden
 * opgeslagen in localStorage onder 'ExtraAnkerWoordjes'.
 */
function getWoordenVoorAnker(ankerNummer, ankerKey) {
  // 1. Basiswoorden uit ankers.js
  let basis = [];
  const isSnuffel = ankerKey.toLowerCase().includes('snuffel');
  if (isSnuffel) {
    basis = ankers[ankerKey];
  } else {
    basis = ankers[ankerNummer];
  }

  // 2. Extra woorden uit localStorage (indien aanwezig)
  const extraData = JSON.parse(localStorage.getItem('ExtraAnkerWoordjes') || '{}');
  const extra = extraData[ankerNummer] || { normaal: [], snuffel: [] };

  // 3. Kies juiste categorie (snuffel of normaal)
  const extraWoorden = isSnuffel ? (extra.snuffel || []) : (extra.normaal || []);

  // 4. Combineer basis met juiste extra-lijst (zonder duplicaten)
  const gecombineerd = Array.from(new Set([...(basis || []), ...extraWoorden]));

  return gecombineerd;
}

function getHerkansjesWoorden() {
  isHerkansing = true;
  const foutjes = (JSON.parse(localStorage.getItem('fout_woordjes') || '[]') || [])
    .map(f => f.woord)
    .filter(Boolean);

  if (foutjes.length === 0) {
    alert('Er zijn momenteel geen oefenherkansjes.');
    return;
  }


  const uniekeWoorden = [];
  while (uniekeWoorden.length < foutjes.length) {
    const willekeurig = foutjes[Math.floor(Math.random() * foutjes.length)];
    if (willekeurig) {
      uniekeWoorden.push(willekeurig);
    }
  }

  // Resultaat gebruiken
  woorden = uniekeWoorden;
  return woorden;
}

/**
 * Geef één willekeurig woord uit de herkansingslijst.
 * Bron: localStorage.fout_woordjes
 */
let laatsteHerkansWoord = null;

function getRandomHerkansingsWoord() {
  const data = JSON.parse(localStorage.getItem('fout_woordjes') || '[]');
  const foutjes = data.map(f => f.woord).filter(Boolean);

  if (foutjes.length === 0) {
    alert('Er zijn momenteel geen oefenherkansjes.');
    return null;
  }

  const unieke = Array.from(new Set(foutjes));

  // Filter laatste woord eruit als er meer opties zijn
  const beschikbare = (laatsteHerkansWoord && unieke.length > 1)
    ? unieke.filter(w => w !== laatsteHerkansWoord)
    : unieke;

  const index = Math.floor(Math.random() * beschikbare.length);
  const woord = beschikbare[index];
  laatsteHerkansWoord = woord;

  return woord;
}

// 🔍 Verberg vergrootglas bij 'Anker Start'
function updateIconVisibility() {
  const isMobile = window.matchMedia('(max-width: 640px)').matches;

  document.querySelectorAll('.anker-tabel td.anker-naam span').forEach(span => {
    const td = span.closest('td');
    if (span.textContent.trim() === 'Anker Start') {
      if (isMobile) {
        td.classList.add('no-icon');   // mobiel → verberg icoon
      } else {
        td.classList.remove('no-icon'); // desktop → toon icoon
      }
    }
  });
}

// bij laden en bij resize uitvoeren
updateIconVisibility();
window.addEventListener('resize', updateIconVisibility);

// ✅ Stabiele selectie zonder verschuiving
document.addEventListener('DOMContentLoaded', function () {
  const lezenRijen = document.querySelectorAll('#fieldset-lezen .anker-tabel tbody tr');

  lezenRijen.forEach(rij => {
    rij.addEventListener('click', (e) => {
      // negeer klikken op knoppen
      if (e.target.closest('button')) return;

      // verwijder eerdere selectie
      lezenRijen.forEach(r => r.classList.remove('selected'));

      // markeer de huidige rij
      rij.classList.add('selected');

      // update de bijbehorende radio
      const radio = rij.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
});


