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
  let flitsDurationMs = 500; // standaardwaarde in ms
  let idx = 0, score = 0, startTijd = 0, getoond = 0;
  let timerId = null, endTime = 0;
  let isHerkansing = false;
  let lockClose = false; // true terwijl bevestiging open is

  // ===== Highlight helpers =====
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
    if (idx >= items.length) { items = shuffle(items); idx = 0; }
    const el = document.getElementById('woord'); const item = items[idx] ?? '';

    const woordEl = document.getElementById('woord');
    woordEl.textContent = items[idx];

    // standaard weer resetten
    const card = document.querySelector('#page2 .card');
    card.classList.remove('zin-card');
    woordEl.classList.remove('zin-woord');

    // check oefentype lezen + categorie zinnetjes
    if (oefentype === 'lezen') {
      const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;
      if (cat === 'zinnetjes') {
        card.classList.add('zin-card');
        woordEl.classList.add('zin-woord');
      }
    }

    // standaard groot voor losse woorden
    woordEl.style.fontSize = 'clamp(48px, 14vw, 132px)';

    if (oefentype === 'ankers') {
      let gekozenAnker = parseInt(document.querySelector('input[name="anker"]:checked').value);
      // Controleer welk anker gekozen is
      if (gekozenAnker < 5 || gekozenAnker === 9) {
        // Anker 1–4 → klanken gekleurd
        el.innerHTML = kleurMetAlleKlinkers(item);
      } else {
        // Anker 5–8 → geen klankkleuring
        el.innerHTML = item;
      }
      // Klinkers dus   
    } else {
      if (klinkerSub === 'woorden') {
        const selectie = Array.from(document.querySelectorAll('#fieldset-klinkers input[type=checkbox]:checked')).map(cb => cb.value);
        el.innerHTML = kleurMetSelectie(item, selectie);
      } else {
        el.innerHTML = `<span style="color:var(--ebx);">${item}</span>`;
      }
    }


    if (oefentype === 'lezen') {
      const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;
      if (cat === 'zinnetjes') {
        // Gewoon platte tekst → altijd zwart
        el.textContent = item;
      } else {
        // mag blauw blijven
        el.innerHTML = `<span style="color:var(--ebx);">${item}</span>`;
      }
    }

    // standaard resetten
    card.classList.remove('zin-card');
    woordEl.classList.remove('zin-woord');

    // check oefentype lezen + categorie zinnetjes
    const cat = document.querySelector('input[name="lezenCat"]:checked')?.value;
    if (cat === 'zinnetjes') {
      card.classList.add('zin-card');
      woordEl.classList.add('zin-woord');
      woordEl.style.color = '#000';   // <-- directe override
      woordEl.style.fontSize = 'clamp(48px, 10vw, 132px)';
      //woordEl.style.lineHeight = '1.3';

    } else {
      woordEl.style.color = '';       // reset zodat functiewoorden weer blauw worden
    }


    const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
    if (flitslezen) {
      clearTimeout(flitsTimeoutId);
      flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
    }
    if (byWords) {
      document.getElementById('subInfo').innerHTML = `<span class="timer">${idx}/${items.length}</span>`;
    } else {
      //document.getElementById('subInfo').innerHTML = `<span class="timer"></span>`;
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
      let woorden = ankers[key];

      if (anker === '9') {
        // --- Herkansjes: woorden ophalen uit localStorage ---
        isHerkansing = true;

        const foutjes = JSON.parse(localStorage.getItem('fout_woordjes') || '[]');

        if (foutjes.length === 0) {
          alert('Er zijn momenteel geen oefenherkansjes.');
          return;
        }

        // unieker maken en sorteren (optioneel)
        const uniekeWoorden = Array.from(new Set(foutjes.map(f => f.woord)));
        woorden = uniekeWoorden;
      } else {
        // normaal anker
        woorden = ankers[key];
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
        if (!Number.isFinite(aantal) || aantal < 1 || aantal > 50) { if (err) err.textContent = 'Vul bij "Aantal items" 1..50 in.'; return; }
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
          if (!Number.isFinite(aantal) || aantal < 1 || aantal > 50) { if (err) err.textContent = 'Vul bij "Aantal items" 1..50 in.'; return; }

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
          if (!Number.isFinite(aantal) || aantal < 1 || aantal > 50) { if (err) err.textContent = 'Vul bij "Aantal items" 1..50 in.'; return; }
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
        if (!Number.isFinite(aantal) || aantal < 1 || aantal > 50) {
          if (err) err.textContent = 'Vul bij "Aantal items" 1..50 in.';
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

      voegFoutWoordToe(ankerNummer, modus, items[idx]);
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

    const container = document.getElementById('chartContainer');
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

      if (ankerPadded !== '09') {
        perAnker.push(record);
        localStorage.setItem(perAnkerKey, JSON.stringify(perAnker));

        //Teken de grafiek
        tekenResultaatGrafiek();

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
    document.getElementById('btnAll').addEventListener('click', () => {
      document.querySelectorAll('#fieldset-klinkers input[type=checkbox]').forEach(cb => cb.checked = true);
      prepareKlinkerSubVisibility();
    });
    document.getElementById('btnNone').addEventListener('click', () => {
      document.querySelectorAll('#fieldset-klinkers input[type=checkbox]').forEach(cb => cb.checked = false);
      // Alleen deselecteren; niets verbergen.
    });
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
    (function initAnkerVraagtekenPopup() {

      function openWoordenPopup(titel, woordenNormaal, woordenSnuffel) {
        const overlay = document.getElementById('woordenPopup');
        const titleEl = overlay.querySelector('#popupTitle');
        const closeBtn = overlay.querySelector('#closePopup');

        titleEl.textContent = titel;

        function maakTabelHTML(woorden) {
          if (!woorden || !woorden.length) {
            return '<tr><td><em>Geen woorden beschikbaar.</em></td></tr>';
          }
          const kolommen = 3;
          const totaal = woorden.length;
          const rijen = Math.ceil(totaal / kolommen);
          let html = '';
          for (let r = 0; r < rijen; r++) {
            html += '<tr>';
            for (let c = 0; c < kolommen; c++) {
              const index = c * rijen + r; // verticale volgorde
              const woord = woorden[index];
              html += `<td>${woord ? '<span>' + woord + '</span>' : ''}</td>`;
            }
            html += '</tr>';
          }
          return html;
        }

        // Tabelinhoud vullen
        const normaalTable = overlay.querySelector('#popupTableNormaal tbody');
        const snuffelTable = overlay.querySelector('#popupTableSnuffel tbody');

        const woordenNormaalSorted = (woordenNormaal || []).slice().sort((a, b) =>
          a.localeCompare(b, 'nl', { sensitivity: 'base' })
        );
        const woordenSnuffelSorted = (woordenSnuffel || []).slice().sort((a, b) =>
          a.localeCompare(b, 'nl', { sensitivity: 'base' })
        );

        normaalTable.innerHTML = maakTabelHTML(woordenNormaalSorted);
        snuffelTable.innerHTML = maakTabelHTML(woordenSnuffelSorted);

        overlay.style.display = 'flex';
        closeBtn.onclick = () => overlay.style.display = 'none';
        overlay.onclick = e => { if (e.target === overlay) overlay.style.display = 'none'; };
      }

      // Voeg vraagtekentje toe direct rechts van "Anker X"
      // Klik op "Anker X" opent de woordenlijst (geen vraagtekentje meer)
      document.querySelectorAll('.anker-tabel tbody tr[data-anker]').forEach(tr => {
        const nr = String(tr.getAttribute('data-anker'));
        if (nr === '9') return; // "Mijn herkansjes" overslaan

        const td = tr.querySelector('td:first-child');
        if (!td) return;

        // UI/Accessibility: maak de cel klik- en focusbaar
        td.classList.add('anker-naam');
        td.setAttribute('tabindex', '0');
        td.setAttribute('role', 'button');
        td.setAttribute('aria-label', 'Bekijk woordenlijst voor anker ' + nr);
        td.setAttribute('data-title', 'Bekijk woordenlijst (normaal + snuffel)');

        // 1 handler die we voor muis & toetsenbord hergebruiken
        const openWoorden = (evt) => {
          // Laat clicks op inputs/labels/links/knoppen in deze cel met rust
          if (evt?.target?.closest('input, button, svg')) return;

          const woordenNormaal = ankers[nr] || [];
          const woordenSnuffel = ankers[`${nr}-snuffel`] || [];
          openWoordenPopup(`Woordenlijst – Anker ${nr}`, woordenNormaal, woordenSnuffel);
        };

        td.addEventListener('click', openWoorden);
        td.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openWoorden(e);
          }
        });
      });


      // 'Mijn herkansjes' (data-anker="9"): linkerkolom klikbaar maken
      // "Herkansjes" (data-anker="9") dezelfde hover-hint + click-actie
      // "Mijn herkansjes" (data-anker="9"): klik op de tekst opent ook de popup
      (() => {
        const tr = document.querySelector('.anker-tabel tbody tr[data-anker="9"]');
        if (!tr) return;

        const td = tr.querySelector('td:first-child');
        if (!td) return;

        // Zelfde clickable affordance als bij Anker X
        td.classList.add('anker-naam', 'herkansjes-naam');
        td.setAttribute('tabindex', '0');
        td.setAttribute('role', 'button');
        td.setAttribute('aria-label', 'Open Mijn herkansjes');
        td.setAttribute('data-hint', 'Mijn herkansjes'); // subtiele pill-hint

        const openHerkansjes = (evt) => {
          // Alleen echte controls negeren; klik op tekst/label mag openen
          if (evt?.target?.closest('input, button, svg')) return;
          document.getElementById('mijnHerkansjesLink')?.click();
        };

        td.addEventListener('click', openHerkansjes);
        td.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHerkansjes(e); }
        });
      })();





      // (optioneel) als je eerder het vergrootglas dynamisch toevoegde, kun je dat codeblok verwijderen
      // of bestaande icon-knoppen in de DOM verbergen/verwijderen:
      document.querySelectorAll('.anker-search, .btnReset.anker-search').forEach(b => b.remove());


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

(function () {
  const link = document.getElementById('feedbackLink');
  const tip = document.getElementById('feedbackTip');
  if (link && tip) {
    function show() { tip.classList.add('show'); }
    function hide() { tip.classList.remove('show'); }
    link.addEventListener('mouseenter', show);
    link.addEventListener('mouseleave', hide);
    link.addEventListener('focus', show);
    link.addEventListener('blur', hide);
  }
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


document.addEventListener('DOMContentLoaded', function () {
  var link = document.getElementById('changelogLink');
  var tip = document.getElementById('changelogTip');
  if (link && tip) {
    function show() { tip.classList.add('show'); }
    function hide() { tip.classList.remove('show'); }
    link.addEventListener('mouseenter', show);
    link.addEventListener('mouseleave', hide);
    link.addEventListener('focus', show);
    link.addEventListener('blur', hide);
  }

});


document.addEventListener('click', function onceResume() {
  try { var ctx = getAudioCtx(); if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { }
  document.removeEventListener('click', onceResume);
}, { once: true });

document.addEventListener('DOMContentLoaded', function () {
  const resultatenLink = document.getElementById('resultatenLink');
  const resultatenTip = document.getElementById('resultatenTip');
  const wisBtn = document.getElementById('btnWisResultaten');

  // Hover mini-grafiek bij link
  if (resultatenLink && resultatenTip) {
    resultatenLink.addEventListener('mouseenter', () => {
      resultatenTip.style.display = 'block';
      tekenResultatenHoverGrafiek();
    });

    resultatenLink.addEventListener('mouseleave', () => {
      window._resultatenHideTimer = setTimeout(() => {
        // resultatenTip.style.display = 'none';
      }, 150);
    });

    resultatenTip.addEventListener('mouseenter', () => {
      clearTimeout(window._resultatenHideTimer);
    });

    resultatenTip.addEventListener('mouseleave', () => {
      resultatenTip.style.display = 'none';
    });

  }

  // 🗑️ Resultaten wissen met EBX-stijl bevestiging
  if (wisBtn) {
    wisBtn.addEventListener('click', function () {
      toonBevestiging('Weet je zeker dat je alle resultaten wilt wissen?', (bevestig) => {
        if (bevestig) {
          localStorage.removeItem('resultaten');
          if (window.resultatenChartInstance) {
            window.resultatenChartInstance.destroy();
          }
          toonMelding('Alle resultaten zijn gewist.');
          if (resultatenTip) resultatenTip.style.display = 'none';
        }
      });
    });
  }
});




function tekenResultatenHoverGrafiek() {
  renderResultaatGrafiekOp('resultatenChart', 'hoverChart');
}

function tekenResultaatGrafiek() {

  const gekozen = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;
  const ankerNummer = gekozen;
  const gekozenMode = document.querySelector(`input[name="mode"][value="${ankerNummer}-normaal"]:checked, input[name="mode"][value="${ankerNummer}-snuffel"]:checked`);

  const isSnuffel = gekozenMode && gekozenMode.value.endsWith('-snuffel');
  const key = isSnuffel ? `${ankerNummer}-snuffel` : `${ankerNummer}`;
  const mode = isSnuffel ? 'snuffel' : 'normaal';


  // ✅ geef gekozen anker en modus door
  renderResultaatGrafiekOp('resultChart', 'resultPageChart', ankerNummer, mode);

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

  // ✅ Alleen de laatste 50 metingen tonen
  const laatste = history.slice(-50);
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
        const chartContainer = document.getElementById('chartContainer');
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
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#fff; border-radius:14px; padding:22px 28px; max-width:360px; width: min(90vw, 360px);
    text-align:center; box-shadow:0 10px 30px rgba(0,0,0,.25);
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
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(true); });
  window.addEventListener('keydown', keyHandler);

  // focus
  setTimeout(() => okBtn.focus(), 0);
}


function toonMelding(boodschap) {
  const overlay = document.getElementById('meldingOverlay');
  const msg = document.getElementById('meldingMessage');
  const okBtn = document.getElementById('meldingOk');

  msg.textContent = boodschap;
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

// Event voor “Resultaten” knop in de topbalk
document.addEventListener('DOMContentLoaded', function () {
  const resultatenLink = document.getElementById('resultatenLink');
  const resultatenTip = document.getElementById('resultatenTip');
  if (!resultatenLink || !resultatenTip) return;

  // 0) Helper: staat de confirm open?
  function isConfirmOpen() {
    const ov = document.getElementById('confirmOverlay');
    return ov && ov.style.display !== 'none';
  }

  // 1) Kill alle bestaande mouseleave/mouseout-sluiters (capturing phase)
  ['mouseleave', 'mouseout'].forEach(ev => {
    resultatenLink.addEventListener(ev, e => e.stopImmediatePropagation(), true);
    resultatenTip.addEventListener(ev, e => e.stopImmediatePropagation(), true);
  });

  // 2) Openen: hover/focus/click op de link
  const openTip = () => { resultatenTip.style.display = 'block'; };
  resultatenLink.addEventListener('pointerenter', openTip);
  resultatenLink.addEventListener('focus', openTip, true);
  resultatenLink.addEventListener('click', (e) => { e.preventDefault(); openTip(); });

  // 3) Houd open wanneer je de popup in gaat
  resultatenTip.addEventListener('pointerenter', openTip);

  // 4) Sluiten: alleen bij klik/tap buiten (niet tijdens confirm)
  document.addEventListener('pointerdown', (e) => {
    if (isConfirmOpen()) return;
    const buiten = !resultatenTip.contains(e.target) && !resultatenLink.contains(e.target);
    if (buiten) resultatenTip.style.display = 'none';
  });

  // 5) Sluiten op Escape (niet tijdens confirm)
  document.addEventListener('keydown', (e) => {
    if (isConfirmOpen()) return;
    if (e.key === 'Escape') resultatenTip.style.display = 'none';
  });
});



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



// === Popup voor oefenherkansjes (op klikken, met verwijderfunctie) ===
document.addEventListener('DOMContentLoaded', function () {
  const herkansButton = document.getElementById('btnHerkansjes');
  const popup2 = document.getElementById('herkansjesPopup');

  if (herkansButton && popup2 && typeof vulMijnHerkansjes === 'function') {
    herkansButton.addEventListener('click', (e) => {
      e.stopPropagation(); // voorkomt dat de oude popup opent
      try {
        vulMijnHerkansjes();          // vul je lijst
        popup2.style.display = 'flex'; // toon de juiste popup
      } catch (err) {
        console.error('Fout bij openen herkansjes:', err);
      }
    });
  }
});

// === Mijn herkansjes popup (op klikken, zonder verwijderfunctie) ===
document.addEventListener('DOMContentLoaded', function () {
  const popup = document.getElementById('herkansjesPopup');
  const link = document.getElementById('mijnHerkansjesLink');
  const foutjesLijst = document.getElementById('herkansjesList');
  const btnSluiten = document.getElementById('btnMijnHerkansjesSluiten');

  // Controleer of alle elementen aanwezig zijn
  if (!popup || !link || !foutjesLijst || !btnSluiten) {
    console.warn('Popup, link of knop niet gevonden.');
    return;
  }

  /**
   * Hulpfunctie om datums netjes te formatteren.
   */
  function formatteerDatum(ts) {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Bouwt de popup-inhoud op basis van localStorage en sorteert alles netjes.
   */
  function vulPopup() {
    const opslag = localStorage.getItem('fout_woordjes');
    let foutjes = [];

    if (opslag) {
      try {
        foutjes = JSON.parse(opslag);
      } catch (e) {
        console.warn('Kon fout_woordjes niet als JSON parsen:', e);
      }
    }

    if (!foutjes || foutjes.length === 0) {
      foutjesLijst.innerHTML =
        '<p class="popup-empty">Geen fout gelezen woordjes gevonden.</p>';
      popup.style.display = 'flex';
      return;
    }

    // ✅ Sorteer op aantal (desc), anker (asc), woord (asc)
    foutjes.sort((a, b) => {
      if (b.aantal !== a.aantal) return b.aantal - a.aantal;
      if (a.anker !== b.anker)
        return a.anker.localeCompare(b.anker, 'nl', { numeric: true });
      return a.woord.localeCompare(b.woord, 'nl', { numeric: true });
    });

    // ✅ Groepeer per anker
    const gegroepeerd = {};
    foutjes.forEach(f => {
      if (!gegroepeerd[f.anker]) gegroepeerd[f.anker] = [];
      gegroepeerd[f.anker].push(f);
    });

    // ✅ Bouw HTML
    let html = '';
    for (const anker in gegroepeerd) {
      const lijst = gegroepeerd[anker];
      html += '<h4>Anker ' + anker + '</h4>';
      html +=
        '<table><thead><tr>' +
        '<th>Modus</th>' +
        '<th>Woordje</th>' +
        '<th>Aantal</th>' +
        '<th>Tijdstippen</th>' +
        '<th></th>' + // kolom voor verwijderknop
        '</tr></thead><tbody>';

      lijst.forEach(f => {
        const tijden = (f.tijden || []).map(formatteerDatum);
        html +=
          '<tr>' +
          '<td>' + (f.modus || '-') + '</td>' +
          '<td>' + (f.woord || '-') + '</td>' +
          '<td style="text-align:center;">' + (f.aantal || 1) + '</td>' +
          '<td><small>' + (tijden.length > 0 ? tijden.join('<br>') : '-') + '</small></td>' +
          '<td style="text-align:center;">' +
          '<button class="btn-delete" title="Klik om woordje uit lijst te verwijderen" ' +
          'data-anker="' + anker + '" ' +
          'data-modus="' + (f.modus || '-') + '" ' +
          'data-woord="' + (f.woord || '-') + '">🗑️</button>' +
          '</td>' +
          '</tr>';
      });

      html += '</tbody></table>';
    }

    foutjesLijst.innerHTML = html;
    popup.style.display = 'flex';

    // ✅ Eventlisteners koppelen aan elke verwijderknop
    foutjesLijst.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        // Lees sleutel uit data-attributen (stabieler dan kolomindexen)
        var anker = btn.getAttribute('data-anker');
        var modus = btn.getAttribute('data-modus');
        var woord = btn.getAttribute('data-woord');

        // Update storage
        var lijst = JSON.parse(localStorage.getItem('fout_woordjes') || '[]');
        lijst = lijst.filter(function (f) {
          return !(String(f.anker) === String(anker) &&
            String(f.modus || '-') === String(modus || '-') &&
            String(f.woord || '-') === String(woord || '-'));
        });
        localStorage.setItem('fout_woordjes', JSON.stringify(lijst));

        // Verwijder de zichtbare rij
        var tr = btn.closest('tr');
        var tbody = tr && tr.parentNode;
        var table = tbody && tbody.parentNode;
        tr && tr.parentNode && tr.parentNode.removeChild(tr);

        // Als deze groep leeg is: verwijder de hele tabel + bijbehorende h4
        if (tbody && !tbody.querySelector('tr')) {
          // verwijder tabel
          if (table) table.parentNode.removeChild(table);
          // verwijder direct voorafgaande h4 (groeptitel), indien aanwezig
          var prev = table && table.previousElementSibling;
          if (prev && prev.tagName && prev.tagName.toLowerCase() === 'h4') {
            prev.parentNode.removeChild(prev);
          }
        }

        // Als er helemaal geen tabellen meer zijn → leeg-melding tonen
        if (!foutjesLijst.querySelector('table')) {
          foutjesLijst.innerHTML =
            '<p class="popup-empty">Geen fout gelezen woordjes gevonden.</p>';
          popup.style.display = 'flex';
        }
      });
    });
  }

  /**
   * Klik op “Mijn herkansjes” opent popup.
   */
  link.addEventListener('click', function () {
    vulPopup();
    popup.style.display = 'flex';
  });

  /**
   * OK-knop sluit popup.
   */
  btnSluiten.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  /**
   * Klik buiten popup sluit popup.
   */
  popup.addEventListener('click', e => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });

  /**
   * Escape-toets sluit popup.
   */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      popup.style.display = 'none';
    }
  });

  link.addEventListener('click', function () {
    vulPopup();
    popup.style.display = 'flex';
  });
  // 🔹 Laat ook de knop bij anker 9 hetzelfde doen
  const btnHerkansjes = document.getElementById('btnHerkansjes');
  if (btnHerkansjes) {
    btnHerkansjes.addEventListener('click', function () {
      link.click(); // Simuleert klik op "Mijn herkansjes"
    });
  }


});

function verwijderFoutje(anker, modus, woord) {
  let foutjes = JSON.parse(localStorage.getItem('fout_woordjes') || '[]');
  foutjes = foutjes.filter(f => !(f.anker === anker && f.modus === modus && f.woord === woord));
  localStorage.setItem('fout_woordjes', JSON.stringify(foutjes));

  // Herlaad popup variant 1: popupHerkansjes
  const popup1 = document.getElementById('popupHerkansjes');
  if (popup1 && typeof vulPopup === 'function') {
    try { vulPopup(); } catch (e) { /* negeren als niet geladen */ }
  }

  // Herlaad popup variant 2: herkansjesPopup
  const popup2 = document.getElementById('herkansjesPopup');
  if (popup2 && typeof vulMijnHerkansjes === 'function') {
    try { vulMijnHerkansjes(); } catch (e) { /* negeren */ }
  }
}

function vulMijnHerkansjes() {
  const foutjesLijst = document.getElementById('popupHerkansjesContent');
  const opslag = localStorage.getItem('fout_woordjes');
  let foutjes = [];

  if (opslag) {
    try {
      foutjes = JSON.parse(opslag);
    } catch (e) {
      console.warn('Kon fout_woordjes niet als JSON parsen:', e);
    }
  }

  if (!foutjes || foutjes.length === 0) {
    foutjesLijst.innerHTML =
      '<p class="popup-empty">Geen fout gelezen woordjes gevonden.</p>';
    popup.style.display = 'flex';
    return;
  }

  // zelfde tabel als jouw vulPopup, maar met 🗑️-knop
  foutjes.sort((a, b) => {
    if (b.aantal !== a.aantal) return b.aantal - a.aantal;
    if (a.anker !== b.anker) return a.anker.localeCompare(b.anker, 'nl', { numeric: true });
    return a.woord.localeCompare(b.woord, 'nl', { numeric: true });
  });

  let html = '<table><thead><tr><th>Modus</th><th>Woord</th><th>Aantal</th><th></th></tr></thead><tbody>';
  foutjes.forEach(f => {
    html += `
      <tr>
        <td>${f.modus || '-'}</td>
        <td>${f.woord || '-'}</td>
        <td style="text-align:center;">${f.aantal || 1}</td>
        <td style="text-align:center;">
          <button class="btn-delete" data-anker="${f.anker}" data-modus="${f.modus}" data-woord="${f.woord}">🗑️</button>
        </td>
      </tr>`;
  });
  html += '</tbody></table>';
  foutjesLijst.innerHTML = html;

  foutjesLijst.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const anker = btn.getAttribute('data-anker');
      const modus = btn.getAttribute('data-modus');
      const woord = btn.getAttribute('data-woord');
      verwijderFoutje(anker, modus, woord);
    });
  });
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

document.addEventListener('DOMContentLoaded', function () {
  const feedbackLink = document.getElementById('feedbackLink'); // knop of icoon om te openen
  const feedbackPopup = document.getElementById('feedbackForm');
  const feedbackContent = feedbackPopup.querySelector('.popup-content');
  const closeBtn = document.getElementById('btnCloseFeedback');
  const form = document.getElementById('formFeedback');

  if (!feedbackPopup || !form) return;

  // Openen van popup
  if (feedbackLink) {
    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      feedbackPopup.style.display = 'block';
    });
  }

  // Sluiten via knop
  closeBtn.addEventListener('click', () => {
    feedbackPopup.style.display = 'none';
  });

  // ✅ Sluiten bij klik buiten het witte frame
  document.addEventListener('click', (e) => {
    const isClickInside = feedbackContent.contains(e.target) || (feedbackLink && feedbackLink.contains(e.target));
    if (!isClickInside && feedbackPopup.style.display === 'block') {
      feedbackPopup.style.display = 'none';
    }
  });

  // Sluiten met Escape-toets
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && feedbackPopup.style.display === 'block') {
      feedbackPopup.style.display = 'none';
    }
  });

  // Formulier verzenden met EmailJS
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const now = new Date().toLocaleString('nl-NL', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const templateParams = {
      user_name: form.user_name.value,
      user_email: form.user_email.value,
      message: form.message.value,
      time: now
    };

    emailjs.send('service_v6m2jaa', 'tmpl_feedback_8060i6f', templateParams)
      .then(() => {
        alert('Bedankt voor je feedback!');
        feedbackPopup.style.display = 'none';
        form.reset();
      })
      .catch((error) => {
        console.error('Fout bij versturen:', error);
        alert('Er ging iets mis bij het versturen. Probeer later opnieuw.');
      });
  });

});


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
    btn.addEventListener('click', () => openResultatenPopupVoorAnker(ankerNummer));

    // Tooltip bij hover
    btn.addEventListener('mouseenter', e => {
      showTooltip(e.target, `Bekijk resultaten van Anker ${String(ankerNummer).padStart(2, '0')}`);
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
  const overlay = ensureResultatenPopup();
  const card = overlay.querySelector('.popup-card');
  const canvas = overlay.querySelector('canvas');
  const titel = overlay.querySelector('.popupTitle');
  const closeBtn = overlay.querySelector('.popup-close');

  if (!canvas) { console.error('Canvas ontbreekt'); return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('Geen 2D context'); return; }
  if (typeof Chart === 'undefined') { alert('Chart.js niet geladen'); return; }

  // ▼ Vernietig altijd een eventuele vorige chart op dit canvas
  if (window.ankerResultChart) {
    try { window.ankerResultChart.destroy(); } catch { }
    window.ankerResultChart = null;
  }

  const nrStr = String(nr).padStart(2, '0');
  titel.textContent = `Resultaten – Anker ${nrStr}`;

  const keyNormaal = `resultaten_anker_${nrStr}_normaal`;
  const keySnuffel = `resultaten_anker_${nrStr}_snuffel`;

  const read = (key) => {
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn('Fout bij lezen van', key, e);
      return [];
    }
  };

  let normaalAll = read(keyNormaal).sort((a, b) => new Date(a.datum) - new Date(b.datum)).slice(-50);
  let snuffelAll = read(keySnuffel).sort((a, b) => new Date(a.datum) - new Date(b.datum)).slice(-50);

  // ✅ Extra veiligheid: filter records op ankerNummer (indien ingevuld)
  const sameAnker = (r) => {
    if (r == null) return false;
    // als geen ankerNummer in record → toestaan (achterwaartse compatibiliteit)
    return (r.ankerNummer == null) || (String(r.ankerNummer).padStart(2, '0') === nrStr);
  };
  normaalAll = normaalAll.filter(sameAnker);
  snuffelAll = snuffelAll.filter(sameAnker);

  // Debug-info naar console
  console.info('[Anker popup]', {
    anker: nrStr,
    keyNormaal, keySnuffel,
    len: { normaal: normaalAll.length, snuffel: snuffelAll.length },
    voorbeeldNormaal: normaalAll[0],
    voorbeeldSnuffel: snuffelAll[0],
  });

  // popup zichtbaar vóór render (hitbox/layout ok)
  overlay.style.display = 'flex';

  // --- GEEN DATA PAD ---
  if (!normaalAll.length && !snuffelAll.length) {
    // ▼ extra zekerheid: zorg dat er géén chart meer leeft
    if (window.ankerResultChart) {
      try { window.ankerResultChart.destroy(); } catch { }
      window.ankerResultChart = null;
    }

    // ▼ (optioneel) leeg ook de modeBar zodat er geen oude knoppen blijven staan
    let modeBarEmpty = card.querySelector('.modeBar');
    if (modeBarEmpty) modeBarEmpty.replaceChildren();

    // Canvas schoon en boodschap tekenen
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.fillText(`Nog geen resultaten beschikbaar voor anker ${nrStr}`, w / 2, h / 2);

    overlay.onclick = e => {
      if (!card.contains(e.target) || e.target === closeBtn) overlay.style.display = 'none';
    };
    return;
  }

  // Gauge-icoon (blauw) met label in de SVG — tekst past altijd binnen viewBox
  const ICON = 24; // zet op 32/48 als je groter wilt
  const svgGaugeBase = `
      <svg class="gauge" width="${ICON}" height="${ICON}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <!-- halve boog / bezel -->
        <path d="M12 3a9 9 0 0 1 9 9v2a1 1 0 0 1-2 0v-2a7 7 0 1 0-14 0v2a1 1 0 1 1-2 0v-2a9 9 0 0 1 9-9Z"/>
        <!-- as + naald -->
        <circle cx="12" cy="14" r="1.8" />
        <path class="needle" d="M12 13.8V7.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <!-- label onder de meter: altijd passend binnen de viewBox -->
        <text class="glabel"
              x="12" y="22" text-anchor="middle"
              textLength="20" lengthAdjust="spacingAndGlyphs">—</text>
      </svg>
    `;
  const setGaugeVisual = (btn, mode) => {
    const needle = btn.querySelector('.needle');
    const t = btn.querySelector('.glabel');
    if (needle) needle.style.transform = `rotate(${mode === 'snuffel' ? 35 : 0}deg)`;
    if (t) t.textContent = (mode === 'snuffel') ? 'Snuffel' : 'Normaal';
  };

  // ModeBar altijd opnieuw opbouwen (voorkomt state-lek tussen ankers)
  let modeBar = card.querySelector('.modeBar');
  if (!modeBar) {
    modeBar = document.createElement('div');
    modeBar.className = 'modeBar';
    titel.insertAdjacentElement('afterend', modeBar);
  } else {
    modeBar.replaceChildren();
  }

  const mkIconBtn = (mode, active) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.mode = mode;  // 'normaal' | 'snuffel'
    b.className = 'icon';
    b.title = mode === 'snuffel' ? 'Snuffel' : 'Normaal';
    b.setAttribute('aria-label', b.title);
    b.innerHTML = svgGaugeBase;
    if (active) b.dataset.active = 'true';
    return b;
  };

  const btnNormaal = mkIconBtn('normaal', true);
  const btnSnuffel = mkIconBtn('snuffel', false);
  setGaugeVisual(btnNormaal, 'normaal');
  setGaugeVisual(btnSnuffel, 'snuffel');
  modeBar.appendChild(btnNormaal);
  modeBar.appendChild(btnSnuffel);

  // --- STATE OBJECT ipv currentMode (voorkomt redeclare-conflict) ---
  const ankerState = { mode: 'normaal' };

  const updateButtons = () => {
    modeBar.querySelectorAll('button.icon[data-mode]').forEach(b => {
      const active = b.dataset.mode === ankerState.mode;
      b.dataset.active = active ? 'true' : 'false';
      setGaugeVisual(b, b.dataset.mode);
    });
  };

  function buildDataFor(mode) {
    const isSnuf = (mode === 'snuffel');
    const src = isSnuf ? snuffelAll : normaalAll;
    const labels = src.map((_, i) => i + 1);
    const active = src.map(d => d.ipm);
    const inactive = Array(labels.length).fill(null);
    const hidden = isSnuf ? { ds0: true, ds1: false } : { ds0: false, ds1: true };
    return {
      labels,
      indexToData: src,
      dataNormaalSet: isSnuf ? inactive : active,
      dataSnuffelSet: isSnuf ? active : inactive,
      hidden
    };
  }

  function renderChart(mode) {
    if (window.ankerResultChart) {
      try { window.ankerResultChart.destroy(); } catch { }
      window.ankerResultChart = null;
    }

    const { labels, indexToData, dataNormaalSet, dataSnuffelSet, hidden } = buildDataFor(mode);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Snelheid (IPM)',
            data: dataNormaalSet,
            borderColor: '#01689B',
            backgroundColor: 'rgba(1,104,155,0.15)',
            fill: true,
            tension: 0.4,
            hidden: hidden.ds0,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHitRadius: 12,
            pointBackgroundColor: '#01689B',
            pointHoverBackgroundColor: '#e74c3c',
            pointHoverBorderColor: '#ff6666',
            pointHoverBorderWidth: 3
          },
          {
            label: 'Snuffel (IPM)',
            data: dataSnuffelSet,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.15)',
            fill: true,
            tension: 0.4,
            hidden: hidden.ds1,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHitRadius: 12,
            pointBackgroundColor: '#f59e0b',
            pointHoverBackgroundColor: '#e74c3c',
            pointHoverBorderColor: '#ff6666',
            pointHoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: true, axis: 'xy' },
        scales: {
          x: { title: { display: true, text: 'Meetmoment #' }, grid: { display: false } },
          y: { beginAtZero: true, title: { display: true, text: 'Woordjes per minuut' }, grid: { color: 'rgba(0,0,0,0.05)' } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#01689B',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              title: (items) => {
                const c = items?.[0]?.chart;
                const d = c?.indexToData?.[items[0].dataIndex];
                return d ? d.datum : '';
              },
              label: (ctx) => {
                const d = ctx.chart.indexToData?.[ctx.dataIndex];

                if (!d) return '';
                const goed = d.goed ?? 0;
                const fout = d.fout ?? 0;
                const totaal = goed + fout;
                const ipm = d.ipm ?? 0;
                const perc = totaal > 0 ? Math.round((goed / totaal) * 100) : 0;
                return [
                  `Woordjes per minuut: ${ipm}`,
                  `Juist: ${goed}`,
                  `Fout: ${fout}`,
                  `Totaal: ${totaal}`,
                  `Percentage: ${perc}%`
                ];


              },
              afterBody: () => ['Klik om meting te verwijderen']
            }
          }
        },
        onHover: (evt, activeEls, c) => {
          c.canvas.style.cursor = activeEls?.length ? 'pointer' : 'default';
        },
        onClick: (evt, activeEls, c) => {
          if (!activeEls?.length) return;
          const idx = activeEls[0].index;
          const d = c.indexToData?.[idx];
          if (!d) return;

          // klik alleen op punt in de actieve dataset
          const dsIndexActive = (ankerState.mode === 'snuffel') ? 1 : 0;
          const valueHere = c.data.datasets[dsIndexActive].data[idx];
          if (valueHere == null) return;

          toonBevestiging(
            `Weet je zeker dat je meting #${idx + 1} (${d.datum}, ${d.ipm} wpm) wilt verwijderen?`,
            (ok) => {
              if (!ok) return;

              const key = (ankerState.mode === 'snuffel') ? keySnuffel : keyNormaal;
              const lijst = JSON.parse(localStorage.getItem(key) || '[]');
              const i = lijst.findIndex(r =>
                String(r.datum) === String(d.datum) &&
                Number(r.ipm) === Number(d.ipm) &&
                Number(r.goed) === Number(d.goed) &&
                Number(r.fout) === Number(d.fout)
              );
              if (i >= 0) {
                lijst.splice(i, 1);
                localStorage.setItem(key, JSON.stringify(lijst));
              }

              // optioneel ook uit 'resultaten'
              const alle = JSON.parse(localStorage.getItem('resultaten') || '[]');
              const j = alle.findIndex(r =>
                String(r.datum) === String(d.datum) &&
                Number(r.ipm) === Number(d.ipm) &&
                Number(r.goed) === Number(d.goed) &&
                Number(r.fout) === Number(d.fout) &&
                String(r.ankerNummer || nr) === String(nr) &&
                Boolean(r.snuffel) === Boolean(ankerState.mode === 'snuffel')
              );
              if (j >= 0) {
                alle.splice(j, 1);
                localStorage.setItem('resultaten', JSON.stringify(alle));
              }

              // UI bijwerken
              c.data.labels.splice(idx, 1);
              c.data.datasets.forEach(ds => ds.data.splice(idx, 1));
              c.indexToData.splice(idx, 1);
              c.update();

              toonOK(`Meting van ${d.datum} is verwijderd.`);

              // bron opnieuw inlezen (+ filter)
              if (ankerState.mode === 'snuffel') {
                snuffelAll = read(keySnuffel)
                  .sort((a, b) => new Date(a.datum) - new Date(b.datum))
                  .slice(-50).filter(sameAnker);
              } else {
                normaalAll = read(keyNormaal)
                  .sort((a, b) => new Date(a.datum) - new Date(b.datum))
                  .slice(-50).filter(sameAnker);
              }

              safeResizeChart(c, overlay);
              setTimeout(() => renderChart(ankerState.mode), 100);
            }
          );
        }
      }
    });

    chart.indexToData = indexToData;
    window.ankerResultChart = chart;
    safeResizeChart(chart, overlay);
  }

  // init
  renderChart(ankerState.mode);
  updateButtons();

  // wisselen
  modeBar.addEventListener('click', (e) => {
    const btn = e.target.closest('button.icon[data-mode]');
    if (!btn) return;
    const nextMode = btn.dataset.mode;
    if (nextMode === ankerState.mode) return;
    ankerState.mode = nextMode;
    updateButtons();
    renderChart(ankerState.mode);
  });

  // sluiten
  overlay.onclick = e => {
    if (!card.contains(e.target) || e.target === closeBtn) overlay.style.display = 'none';
  };

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
  const OLD_KEY   = 'resultaten';
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
