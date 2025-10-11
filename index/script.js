(function () {
  // ===== Data =====
  const ankers = {
    1: ['rek', 'maak', 'sik', 'aas', 'baas', 'meer', 'sip', 'been', 'vis', 'vaar', 'boon', 'paar', 'roos', 'kook', 'bek', 'rook', 'voor', 'boor', 'naar', 'peer', 'kaak', 'oom', 'mis', 'ree', 'naam', 'veer', 'mes', 'raam', 'kaas', 'kraak', 'snik', 'prik', 'smaak', 'spook'],
    2: ['roer', 'moes', 'sap', 'pak', 'dip', 'teen', 'dijk', 'oen', 'zin', 'das', 'baan', 'mus', 'hoop', 'bus', 'hap', 'toen', 'vik', 'zus', 'pit', 'zoen', 'man', 'hoop', 'vis', 'zeer', 'voer', 'zoet', 'rijp', 'buk', 'doet', 'troep', 'hark', 'moest', 'bukt', 'prijs'],
    3: ['woon', 'heus', 'veer', 'mok', 'waak', 'baas', 'huur', 'soep', 'biet', 'waas', 'hun', 'buur', 'was', 'sok', 'haar', 'pier', 'lus', 'wiel', 'neus', 'hiel', 'vuur', 'keus', 'heer', 'jet', 'poes', 'loon', 'wiek', 'rook', 'leuk', 'pomp', 'buurt', 'stuur', 'blaas', 'stoer'],
    4: ['saus', 'ring', 'jouw', 'geef', 'tang', 'gek', 'reus', 'paul', 'wieg', 'fop', 'zeep', 'zus', 'lach', 'paus', 'fout', 'vang', 'mouw', 'bang', 'acht', 'dier', 'hei', 'beuk', 'lauw', 'auto', 'geit', 'muis', 'ijs', 'guur', 'pijl', 'blauw', 'graaf', 'slang', 'nacht', 'fiets'],
    5: ['schat', 'dief', 'scheur', 'wang', 'duif', 'schoot', 'voetbal', 'schaap', 'deur', 'schoen', 'berg', 'wolk', 'schip', 'wolf', 'buurman', 'denk', 'nacht', 'friet', 'kwijt', 'zondag', 'hart', 'brief', 'pink', 'schijn', 'klei', 'gips', 'plons', 'stamp', 'klont', 'sport', 'zwempak', 'zeilboot', 'zand', 'hond'],
    6: ['schroef', 'koprol', 'tuinbank', 'vloed', 'schoenzool', 'spons', 'schelp', 'boompje', 'stoeltje', 'klomp', 'schuur', 'feestje', 'dagboek', 'kroontje', 'sla', 'glad', 'jurk', 'slang', 'mond', 'jaszak', 'worst', 'spruit', 'schrift', 'drink', 'ronde', 'oogje', 'halve', 'minder', 'broeken', 'trouwring', 'pillen', 'poppen', 'bakker', 'kopen', 'mogen', 'neushoorn', 'eettafel', 'olifant'],
    7: ['maai', 'hooi', 'duimpje', 'ruggen', 'krijtje', 'goud', 'kippen', 'duikbril', 'loopfiets', 'hondje', 'huren', 'gebak', 'beloof', 'verhaal', 'rollen', 'geluid', 'ruw', 'nieuw', 'geeuw', 'kleurtje', 'beeld', 'verlies', 'bezoek', 'aanrecht', 'klussen', 'vlinder', 'feestmuts', 'dromen', 'sparen', 'voeten', 'leuning', 'haring', 'oordop', 'koeken', 'stukken', 'speeltuin', 'schommel', 'kieuw'],
    8: ['voeding', 'botsing', 'leunen', 'sierlijk', 'zonnig', 'nodig', 'getallen', 'verdriet', 'versieren', 'betalen', 'onkruid', 'bloempje', 'kraantje', 'dorst', 'standbeeld', 'telling', 'drukker', 'pinken', 'vlucht', 'brengen', 'steiger', 'zomer', 'tikkertje', 'propjes', 'groei', 'draai', 'klimmen', 'schuif', 'beestje', 'bessen', 'struiken', 'knappe', 'zitten', 'sporttas', 'bedankt', 'egels', 'vrienden', 'jaren']
  };

  const LEZEN = {

    functiewoorden: [
      // lidwoorden
      'de', 'het', 'een',

      // aanwijzende vnw
      'dit', 'dat', 'die', 'deze',

      // voorzetsels
      'in', 'op', 'aan', 'bij', 'met', 'van', 'uit', 'om', 'tot',

      // persoonlijke/bezittelijke vnw
      'ik', 'jij', 'hij', 'zij', 'ze', 'het', 'we', 'wij',

      // kleine hulpwerkwoorden
      'is', 'ben', 'was', 'heeft', 'heb', 'had',

      // voegwoorden
      'en', 'maar', 'of', 'als', 'want', 'dus', 'toen', 'omdat',

      // bijwoorden
      'er', 'daar', 'nu', 'al'],

    zinnetjes: [
      // school
      'ik zit in de klas',
      'de juf is lief',
      'ik lees een boek',
      'de bel gaat',
      'ik ben ik',
      'jij bent jij',
      'ik maak een som',
      'ik pak mijn pen',
      'ik schrijf mijn naam',
      'ik tel tot tien',
      'ik speel op het plein',
      'we zingen een lied',
      'ik werk in het boek',
      'ik zit naast jou',
      'ik krijg een stempel',
      'de meester lacht',
      'ik zwaai dag juf',

      // dieren
      'de kat zit op de stoel',
      'de hond rent hard',
      'de muis eet kaas',
      'de koe zegt boe',
      'een mier is klein',
      'ik zoek beer',
      'de vis zwemt snel',
      'de vogel vliegt hoog',
      'de eend zegt kwak',
      'de kikker springt ver',
      'het schaap is wit',
      'het varken rolt in de modder',
      'de geit eet gras',
      'de uil is wakker',
      'de haan kraait',
      'de bij zoemt',
      'de slak kruipt',
      'het paard rent',

      // extra
      'klein is fijn!',
      'ik ben zes!',
      'kom je spelen?',
      'mijn zadel is nat',
      'de bal is rond',
      'fietsen is leuk',
      'een braam is lekker',
      'hoe oud ben jij',
      'ik kan dat!',
      'dat is knap!',
      'ik ben blij!',
      'ik ben jarig!',
      'kom je mee?',
      'ik tel mee',
      'ik zie jou',
      'we gaan naar buiten',
      'het regent zacht',
      'de zon schijnt',
      'dat is mijn tas',
      'ik heb dorst',

      // verzorging
      'was je handen',
      'poets je tanden',
      'kam je haren',
      'doe je jas aan',
      'strik je veters',
      'trek je sokken aan',
      'ruim je tas op',
      'neem een slok water',
      'veeg je mond',
      'snuit je neus',
      'doe je pyjama aan',
      'ga op tijd naar bed',
      'pak je kam',
      'smeer je in',
      'knip je nagels',
    ]
  }

  // Hover preview voor lezen categorieën
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.row.lezen-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        const cat = row.getAttribute('data-lezen');
        const lijst = LEZEN[cat] || [];
        const voorbeeld = lijst.slice(0, 10).join(', ');
        row.title = voorbeeld;
      });
      row.addEventListener('mouseleave', () => {
        row.removeAttribute('title');
      });
    });
  });


  const KLINKER_GROUPS = [
    { title: 'Korte/Lange klanken', pairs: [['i'], ['e', 'o', 'a', 'u'], ['ee', 'oo', 'aa', 'uu']] },
    { title: 'Tweeteken klanken 1', pairs: [['ie', 'eu', 'oe']] },
    { title: 'Tweeteken klanken 2', pairs: [['ou', 'ei'], ['au', 'ij', 'ui']] },
    //        { title: 'Klanken', pairs: [['b', 'd', 'f', 'g', 'h', 'j',], ['k', 'l', 'm', 'n', 'p', 'r', 's', 't'], ['v', 'w', 'z']] },
    { title: 'Overige klanken', pairs: [['ng', 'nk'], ['ch', 'sch']] }
  ];


  const KLINKER_WOORDEN = {
    'a': ['kat', 'jas', 'bak', 'man', 'tak', 'bal', 'zak', 'pan', 'rat', 'pan'],
    'e': ['pen', 'bek', 'nek', 'net', 'bel', 'hek', 'mes', 'weg', 'pet', 'en'],
    'i': ['vis', 'lip', 'kip', 'tik', 'pit', 'pin', 'vin', 'zin', 'rit', 'ik'],
    'o': ['kop', 'bos', 'zon', 'pot', 'rok', 'hok', 'sok', 'vos', 'mol', 'kok'],
    'u': ['bus', 'mus', 'rug', 'hut', 'put', 'mug', 'kus', 'dus', 'pup', 'lus'],
    'aa': ['maan', 'kaas', 'haak', 'zaag', 'baan', 'vaas', 'haan', 'raam', 'taart', 'laan'],
    'ee': ['been', 'zeep', 'veer', 'teen', 'meer', 'neef', 'leeg', 'beet', 'beer', 'veeg'],
    'ie': ['vier', 'diep', 'riet', 'ziek', 'dier', 'lied', 'mier', 'kies', 'fiets', 'tien'],
    'oo': ['boom', 'boot', 'noot', 'zoon', 'room', 'boon', 'hoop', 'kool', 'brood', 'rook'],
    'uu': ['muur', 'buur', 'vuur', 'duur', 'huur', 'kuur', 'stuur', 'zuur', 'puur', 'uur'],
    'oe': ['boek', 'koek', 'hoed', 'doek', 'zoen', 'snoep', 'broek', 'roep', 'zoek', 'boer'],
    'eu': ['neus', 'reus', 'leuk', 'beuk', 'geur', 'keus', 'heus', 'deuk', 'zeur', 'deur'],
    'ei': ['ei', 'geit', 'zeil', 'reis', 'plein', 'sein', 'klei', 'hei', 'klein', 'kei'],
    'ij': ['blij', 'fijn', 'ijs', 'mij', 'rij', 'zij', 'pijl', 'wij', 'vijl', 'hijs'],
    'ui': ['huis', 'muis', 'duif', 'ruit', 'puin', 'buik', 'luik', 'kuil', 'ruim', 'fruit'],
    'ou': ['goud', 'hout', 'fout', 'bout', 'koud', 'jouw', 'bouw', 'touw', 'hou', 'vouw'],
    'au': ['auto', 'lauw', 'pauw', 'kauw', 'saus', 'gauw', 'dauw', 'rauw', 'flauw', 'nauw'],

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

    'ng': ['ring', 'lang', 'tong', 'slang', 'zang', 'bang', 'jong', 'sprong', 'zing', 'vang'],
    'nk': ['bank', 'dank', 'plank', 'flink', 'denk', 'pink', 'klank', 'wenk', 'zink', 'klonk'],
    'ch': ['lach', 'pech', 'dicht', 'licht', 'bocht', 'tocht', 'acht', 'nacht', 'recht', 'echt'],
    'sch': ['schaap', 'school', 'schip', 'schaar', 'schoen', 'schuur', 'schrik', 'schrift', 'schrob', 'schrijf'],
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
      if (gekozenAnker < 5) {
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

      const gekozen = document.querySelector('#fieldset-anker input[name="anker"]:checked')?.value;

      if (!gekozen) { if (err) err.textContent = 'Kies eerst een anker.'; return; }
      woorden = ankers[gekozen];
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
      woorden = LEZEN[cat] || [];
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

    // Alleen resultaten meten bij ankers 1 t/m 8
    if (oefentype === 'ankers') {

      // Resultaat opslaan in localStorage
      const history = JSON.parse(localStorage.getItem('resultaten') || '[]');
      history.push({
        datum: new Date().toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: oefentype,
        goed: goed,
        fout: fout,
        totaal: getoond,
        percentage,
        tijdSeconden,
        ipm
      });
      localStorage.setItem('resultaten', JSON.stringify(history));
      //slaResultaatOp(score, items.length, tijdSeconden, ipm);

      // Toon grafiek
      tekenResultaatGrafiek();
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

    // Hover for anker rows
    document.querySelectorAll('.anker-row').forEach(row => {
      row.addEventListener('mouseenter', () => showHover(row, ankers[row.getAttribute('data-anker')] || []));
      row.addEventListener('mouseleave', hideHoverSoon);
      row.addEventListener('focus', () => showHover(row, ankers[row.getAttribute('data-anker')] || []));
      row.addEventListener('blur', hideHoverSoon);
    });

    // Hover voor lezen-rijen met eigen hoverCard
    document.querySelectorAll('.row.lezen-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        const cat = row.getAttribute('data-lezen');
        showHover(row, LEZEN[cat] || []);   // gebruik dezelfde hoverCard
      });
      row.addEventListener('mouseleave', hideHoverSoon);
      row.addEventListener('focus', () => {
        const cat = row.getAttribute('data-lezen');
        showHover(row, LEZEN[cat] || []);
      });
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

function tekenResultaatGrafiek() {
  renderResultaatGrafiekOp('resultChart', 'resultPageChart');
}

function renderResultaatGrafiekOp(canvasId, instanceKey = '_chart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // zelfde bron & filter als de hover-variant
  const history = JSON.parse(localStorage.getItem('resultaten') || '[]')
    .filter(r => r.type === 'ankers');
  if (history.length === 0) return;

  const laatste = history.slice(-50);
  const labels = laatste.map((_, i) => i + 1);

  // per-canvas instance opslaan zodat hover en pagina 3 elkaar niet slopen
  window._chartsById = window._chartsById || {};
  if (window._chartsById[instanceKey]) {
    window._chartsById[instanceKey].destroy();
  }

  const total = labels.length;
  // dynamische stapgroottes voor de x-as
  const stap = total <= 10 ? 1 : Math.ceil(total / 10);

  window._chartsById[instanceKey] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Snelheid (IPM)',
        data: laatste.map(d => d.ipm || 0),
        borderColor: '#01689B',
        backgroundColor: 'rgba(1,104,155,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#01689B',
        pointHoverBackgroundColor: 'red',
        pointHoverBorderColor: '#ff6666',
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          min: 1,
          max: total,
          title: { display: true, text: 'Meetmoment #' },
          ticks: {
            autoSkip: total > 10,            // geen autoskip bij weinig data
            maxTicksLimit: 10,
            maxRotation: 0,
            minRotation: 0,
            font: { size: 11 },
            callback: (value) => {
              // toon altijd eerste en laatste en verder per stap
              if (value === 1 || value === total || value % stap === 0) {
                return value;
              }
              return '';
            }
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Woordjes per minuut' },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
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
              const d = laatste[items[0].dataIndex];
              return d ? d.datum : '';
            },
            label: (ctx) => {
              const d = laatste[ctx.dataIndex];
              if (!d) return '';
              const goed = d.goed ?? 0;
              const fout = d.fout ?? 0;
              const totaal = goed + fout;
              const ipm = d.ipm ?? 0;
              const perc = d.percentage ?? 0;
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
      layout: { padding: { right: 20 } },
      onClick: (evt, activeEls, chart) => {
        if (!activeEls.length) return;
        const idx = activeEls[0].index;

        // verwijder dezelfde meting uit storage en uit de grafiek (zelfde gedrag als hover)
        let alleResultaten = JSON.parse(localStorage.getItem('resultaten') || '[]');
        const subset = alleResultaten.filter(r => r.type === 'ankers').slice(-50);
        const geselecteerde = subset[idx];
        if (!geselecteerde) return;

        toonBevestiging(
          `Weet je zeker dat je meting #${idx + 1} (${geselecteerde.datum}, ${geselecteerde.ipm} wpm) wilt verwijderen?`,
          (bevestig) => {
            if (!bevestig) return;
            const echteIndex = alleResultaten.findIndex(r =>
              r.type === geselecteerde.type &&
              r.datum === geselecteerde.datum &&
              r.ipm === geselecteerde.ipm
            );
            if (echteIndex === -1) {
              toonBevestiging('Kon de juiste meting niet vinden.', () => {}, true);
              return;
            }
            alleResultaten.splice(echteIndex, 1);
            localStorage.setItem('resultaten', JSON.stringify(alleResultaten));
            chart.data.datasets[0].data.splice(idx, 1);
            chart.data.labels.splice(idx, 1);
            chart.update();
            toonOK(`Meting van ${geselecteerde.datum} is verwijderd.`);
          }
        );
      },
      onHover: (e, els, chart) => chart.canvas.style.cursor = els.length ? 'pointer' : 'default'
    }
  });
}

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
        resultatenTip.style.display = 'none';
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

  const laatste = history.slice(-50);
  const labels = laatste.map((_, i) => i + 1);

  if (window.resultChartInstance) window.resultChartInstance.destroy();

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
          displayColors: false,   // verplicht voor footer
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
                `Woordjes per minuut: ${ipm}`,
                `Juist: ${goed}`,
                `Fout: ${fout}`,
                `Totaal: ${totaal}`,
                `Percentage: ${perc}%`
              ];
            },
            // ✅ BELANGRIJK: dit dwingt footerweergave af
            footer: (items) => {
              if (!items.length) return '';
              return 'Klik om meting te verwijderen';
            }
          },
          // ✅ Extra truc om footer te forceren
          external: (context) => {
            const tooltipEl = context.tooltip;
            if (tooltipEl && tooltipEl.footer && tooltipEl.opacity !== 0) {
              tooltipEl.footer = tooltipEl.footer; // noop, maar triggert rendering
            }
          }
        }
      },

      onHover: (e, els, chart) => chart.canvas.style.cursor = els.length ? 'pointer' : 'default',
      onClick: (evt, activeEls, chart) => {
        if (!activeEls.length) return;
        const idx = activeEls[0].index;
        const geselecteerde = laatste[idx];
        toonBevestiging(
          `Weet je zeker dat je meting #${idx + 1} (${geselecteerde.datum}, ${geselecteerde.ipm} wpm) wilt verwijderen?`,
          (ja) => {
            if (!ja) return;
            let alle = JSON.parse(localStorage.getItem('resultaten') || '[]');
            const echteIndex = alle.findIndex(r => r.datum === geselecteerde.datum && r.ipm === geselecteerde.ipm);
            if (echteIndex >= 0) {
              alle.splice(echteIndex, 1);
              localStorage.setItem('resultaten', JSON.stringify(alle));
              chart.data.datasets[0].data.splice(idx, 1);
              chart.data.labels.splice(idx, 1);
              chart.update();

              toonOK(`Meting van ${geselecteerde.datum} is verwijderd.`);
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
    document.getElementById('btnResetPopup'),
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
    } else {
      console.log('✅ Alle metingen in localStorage zijn al correct.');
    }
  } catch (err) {
    console.error('Fout bij cookiecorrectie:', err);
  }
});
