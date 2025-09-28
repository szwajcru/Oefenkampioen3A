(function () {
      // ===== Data =====
      const ankers = {
        1: ['rek', 'maak', 'sik', 'aas', 'baas', 'meer', 'sip', 'been', 'vis', 'vaar', 'boon', 'paar', 'roos', 'kook', 'bek', 'rook', 'voor', 'boor', 'naar', 'peer', 'kaak', 'oom', 'mis', 'ree', 'naam', 'ik', 'mes', 'raam', 'kaas', 'saar', 'beer', 'sep', 'nep', 'meen'],
        2: [], 3: []
      };
      const KLINKER_GROUPS = [
        { title: 'Korte/Lange klanken', pairs: [['i'], ['e', 'o', 'a', 'u'], ['ee', 'oo', 'aa', 'uu']] },
        { title: 'Tweeklanken 1', pairs: [['ie', 'eu', 'oe']] },
        { title: 'Tweeklanken 2', pairs: [['ou', 'ei'], ['au', 'ij', 'ui']] },
//        { title: 'Klanken', pairs: [['b', 'd', 'f', 'g', 'h', 'j',], ['k', 'l', 'm', 'n', 'p', 'r', 's', 't'], ['v', 'w', 'z']] },
        { title: 'Clusters', pairs: [['ng', 'nk'], ['ch', 'sch']] }
      ];
      const KLINKER_WOORDEN = {
        'a': ['kat', 'jas', 'bak', 'man', 'tak', 'bal', 'zak', 'pan', 'rat', 'kap'],
        'e': ['pen', 'bed', 'nek', 'net', 'bel', 'hek', 'mes', 'weg', 'pet', 'tent'],
        'i': ['vis', 'lip', 'kip', 'tik', 'pit', 'pin', 'vin', 'zin', 'rit', 'min'],
        'o': ['kop', 'bos', 'zon', 'pot', 'rok', 'hok', 'bom', 'vos', 'mol', 'kok'],
        'u': ['bus', 'mus', 'rug', 'hut', 'put', 'mug', 'kus', 'tuk', 'pup', 'dus'],
        'aa': ['maan', 'kaas', 'haak', 'zaag', 'baan', 'vaas', 'haan', 'raam', 'taart', 'laan'],
        'ee': ['been', 'zeep', 'veer', 'teen', 'meer', 'neef', 'leeg', 'beet', 'beer', 'veeg'],
        'ie': ['vier', 'diep', 'riet', 'ziek', 'dier', 'lied', 'mier', 'kies', 'fiets', 'tien'],
        'oo': ['boom', 'boot', 'noot', 'zoon', 'room', 'boon', 'hoop', 'kool', 'brood', 'rook'],
        'uu': ['muur', 'buur', 'vuur', 'duur', 'huur', 'kuur', 'stuur', 'zuur', 'puur', 'uur'],
        'oe': ['boek', 'koek', 'hoed', 'doek', 'zoen', 'snoep', 'broek', 'roep', 'zoek', 'boer'],
        'eu': ['neus', 'reus', 'leuk', 'beuk', 'geur', 'keus', 'heus', 'deuk', 'zeur', 'deur'],
        'ei': ['ei', 'geit', 'zeil', 'reis', 'plein'],
        'ij': ['blij', 'fijn', 'ijs', 'mij', 'rij'],
        'ui': ['huis', 'muis', 'duif', 'ruit', 'puin', 'buik', 'luik', 'kuil', 'ruim', 'fruit'],
        'ou': ['goud', 'hout', 'fout', 'bout', 'koud', 'jouw'],
        'au': ['auto', 'lauw', 'pauw', 'kauw'],


        'b': ['bal', 'boom', 'bus', 'been', 'bak', 'bont', 'boog', 'bok'],
        'd': ['dak', 'doos', 'deur', 'duif', 'dus', 'dun', 'denk', 'droom'],
        'f': ['fles', 'fiets', 'fijn', 'foto', 'film', 'fout', 'fluit', 'friet'],
        'g': ['geit', 'goud', 'glas', 'gans', 'goed', 'graag', 'groen', 'groot'],
        'h': ['huis', 'hoed', 'hand', 'hok', 'hout', 'hoorn', 'heel', 'hond'],
        'j': ['jas', 'jaar', 'juf', 'jong', 'jurk', 'jawel', 'jeuk', 'jop'],
        'k': ['kat', 'kop', 'koe', 'kaas', 'kous', 'klein', 'krab', 'kroon'],
        'l': ['lip', 'lamp', 'leer', 'luik', 'laag', 'lief', 'lucht', 'luid'],
        'm': ['man', 'mes', 'muis', 'mug', 'molen', 'maan', 'meer', 'mooi'],
        'n': ['neus', 'net', 'naam', 'noot', 'nu', 'naar', 'neer', 'nest'],
        'p': ['pen', 'pot', 'pauw', 'peer', 'punt', 'puree', 'plant', 'paal'],
        'r': ['rat', 'rok', 'raam', 'rook', 'ruim', 'ruif', 'rood', 'rond'],
        's': ['sap', 'slot', 'sok', 'stoel', 'sneeuw', 'stil', 'slang', 'snel'],
        't': ['tak', 'tent', 'tong', 'tuin', 'taart', 'touw', 'trein', 'trom'],
        'v': ['vis', 'vuur', 'vork', 'vader', 'vlag', 'vrolijk', 'veel', 'vier'],
        'w': ['water', 'wiel', 'wip', 'wolk', 'woord', 'woud', 'wesp', 'wand'],
        'z': ['zak', 'zoon', 'zand', 'zeep', 'zeil', 'zomer', 'zout', 'zon'],

        'ng': ['ring', 'lang', 'tong', 'slang', 'zang', 'bang', 'jong', 'sprong'],
        'nk': ['bank', 'dank', 'plank', 'flink', 'denk', 'pink', 'klank', 'schenk'],
        'ch': ['lach', 'pech', 'dicht', 'licht', 'bocht', 'tocht', 'acht', 'nacht'],
        'sch': ['schaap', 'school', 'schip', 'schaar', 'schoen', 'schuur', 'schrik', 'schrift']
      };

      // ===== State =====
      let oefentype = 'ankers';    // 'ankers' | 'klinkers'
      let klinkerSub = 'puur';     // 'puur' | 'woorden'
      let woorden = []; let items = [];
      let toetsAfgebroken = false;
      let flitslezen = false;
      let flitsTimeoutId = null;
      let flitsDurationMs = 500; // standaardwaarde in ms
      let idx = 0, score = 0, startTijd = 0, getoond = 0;
      let timerId = null, endTime = 0;

      // ===== Highlight helpers =====
      const VOWEL_COMBOS = ['aa', 'ee', 'oo', 'uu', 'ei', 'ij', 'ui', 'oe', 'ie', 'eu', 'ou', 'au'];
      const SINGLE_VOWELS = ['a', 'e', 'i', 'o', 'u'];
      const HIGHLIGHT_COLORS = ['#ef4444', '#16a34a', '#2563eb', '#a855f7', '#f59e0b'];

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
        const holder = document.getElementById('klinkerChips'); holder.innerHTML = '';
        KLINKER_GROUPS.forEach(grp => {
          const col = document.createElement('div'); col.className = 'klinker-col';
          const h = document.createElement('h4'); h.textContent = grp.title; col.appendChild(h);

          //if (grp.title === 'Korte/Lange klanken') { col.classList.add('fullrow'); }
          //if (grp.title === 'Klanken') { col.classList.add('fullrow'); }

          // Two-column layout for Tweeklanken groups by grouping pairs two per row
          grp.pairs.forEach(pair => {
            const wrap = document.createElement('div'); wrap.className = 'pair';
            pair.forEach(k => {
              const id = 'klink_' + k, label = document.createElement('label'); label.className = 'chip'; label.setAttribute('data-klink', k);
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

        if (oefentype === 'ankers') {
          fsAnker.style.display = '';
          fsKlin.style.display = 'none';
          fsModus.style.display = '';
          fsSub.style.display = 'none'; // subkader verbergen bij Ankers
          document.getElementById('page2Title').textContent = 'Lees dit woordje hardop';
        } else {
          fsAnker.style.display = 'none';
          fsKlin.style.display = '';
          //fsModus.style.display = 'none';
          // fsSub niet forceren; prepareKlinkerSubVisibility() bepaalt zichtbaarheid
          document.getElementById('page2Title').textContent = 'Lees deze klinker (klank) hardop';
        }

        // Her-evalueer subvisibiliteit na elke wissel
        prepareKlinkerSubVisibility();
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
        if (oefentype === 'ankers') {
          //klinkerSub = 'woorden'  //TODO: nodig?
          el.innerHTML = kleurMetAlleKlinkers(item);

          // Klinkers dus   
        } else {
          if (klinkerSub === 'woorden') {
            const selectie = Array.from(document.querySelectorAll('#fieldset-klinkers input[type=checkbox]:checked')).map(cb => cb.value);
            el.innerHTML = kleurMetSelectie(item, selectie);
          } else {
            el.innerHTML = `<span style="color:var(--ebx);">${item}</span>`;
          }
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
          const gekozen = document.querySelector('input[name="anker"]:checked')?.value;
          if (!gekozen) { if (err) err.textContent = 'Kies eerst een anker.'; return; }
          woorden = ankers[gekozen];
          if (!woorden || !woorden.length) { if (err) err.textContent = 'Dit anker heeft nog geen woorden.'; return; }
          items = shuffle(woorden);

          const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
          if (flitslezen) {
            clearTimeout(flitsTimeoutId);   //TODO wat doet dit?
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
        } else {
          // klinkers sectie
          const gekozen = Array.from(document.querySelectorAll('#fieldset-klinkers input[type=checkbox]:checked')).map(cb => cb.value);
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

        }
      }

      function klikAntwoord(ok) {
        if (!flitslezen) { if (!flitslezen) { if (!flitslezen) { showTap(ok); } } }
        if (!flitslezen) { showTap(ok); }
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
        if (toetsAfgebroken) return;
        if (toetsAfgebroken) return;
        if (timerId) { clearInterval(timerId); timerId = null; }
        clearTimeout(flitsTimeoutId);
        const duurSec = Math.max(1, Math.round((Date.now() - startTijd) / 1000));
        const byWords = document.querySelector('input[name="modus"]:checked')?.value === 'woorden';
        if (flitslezen) {
          clearTimeout(flitsTimeoutId);
          flitsTimeoutId = setTimeout(() => { document.getElementById('woord').innerHTML = '...'; }, flitsDurationMs);
        }
        const totaal = (oefentype === 'ankers' && byWords) ? items.length : getoond;
        const wpm = Math.round(((totaal || 0) / duurSec) * 60);
        const pct = totaal > 0 ? Math.round((score / totaal) * 100) : 0;
        let msg = ''; if (pct < 40) msg = 'Goed geprobeerd, herhalen helpt!'; else if (pct < 70) msg = 'Mooi zo, je bent op de goede weg.'; else if (pct < 90) msg = 'Top! Nog even oefenen en je hebt het helemaal.'; else msg = 'Geweldig! Erg knap gedaan.';
        document.getElementById('resultaat').innerHTML = `${msg}<br><br>Juist: <strong>${score}</strong> van <strong>${totaal}</strong> (${pct}%)<br>Tijd: <strong>${duurSec}</strong> seconden<br>Snelheid: <strong>${wpm}</strong> items per minuut`;
        document.getElementById('pill-tijd').textContent = `Tijd: ${duurSec} s`;
        document.getElementById('pill-snel').textContent = `Snelheid: ${wpm} ipm`;
        showPage(3);
        startConfetti(); runFireworks();
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

        // Hover for anker rows
        document.querySelectorAll('.anker-row').forEach(row => {
          row.addEventListener('mouseenter', () => showHover(row, ankers[row.getAttribute('data-anker')] || []));
          row.addEventListener('mouseleave', hideHoverSoon);
          row.addEventListener('focus', () => showHover(row, ankers[row.getAttribute('data-anker')] || []));
          row.addEventListener('blur', hideHoverSoon);
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
          if (e.key === 'Escape') { cancelToets(); }
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
      var quitBtn = document.getElementById('btnQuit');
      if (quitBtn) {
        quitBtn.addEventListener('click', function () {
          if (typeof stopTimer === "function") { stopTimer(); }
          if (typeof score !== "undefined") { score = 0; }
          if (typeof idx !== "undefined") { idx = 0; }
          if (typeof getoond !== "undefined") { getoond = 0; }
          toetsAfgebroken = true;
          if (typeof showPage === "function") { showPage(1); }
        });
      }
    });

document.addEventListener('DOMContentLoaded', function () {
      // Escape key for abort
      document.addEventListener('keydown', function (e) {
        if (e.key === "Escape" && document.getElementById('page2') && document.getElementById('page2').classList.contains('active')) {
          if (typeof stopTimer === "function") stopTimer();
          if (typeof score !== "undefined") { score = 0; }
          if (typeof idx !== "undefined") { idx = 0; }
          if (typeof getoond !== "undefined") { getoond = 0; }
          toetsAfgebroken = true;
          if (typeof showPage === "function") { showPage(1); }
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