// resultaten.js
// Exporteert window.renderResultaatGrafiekOp(canvasId, instanceKey)

(function () {

  function renderResultaatGrafiekOp(canvasId, instanceKey = '_chart', startAnker = '1', startMode = 'normaal') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof Chart === 'undefined') return;

    const pad2 = n => String(n).padStart(2, '0');
    const isResultPage = instanceKey === 'resultPageChart' || canvas.dataset.compact === 'true';
    const isPopup = instanceKey === 'hoverChart' || !!canvas.closest('.resultaten-popup');

    // ---------- DOM ----------
    let wrapper = canvas.parentElement;
    if (!wrapper || !wrapper.classList.contains('resultWrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'resultWrapper';
      canvas.replaceWith(wrapper);
      wrapper.appendChild(canvas);
    }

    let toolbar = wrapper.previousElementSibling;
    if (!toolbar || !toolbar.classList.contains('resultToolbar')) {
      toolbar = document.createElement('div');
      toolbar.className = 'resultToolbar';
      wrapper.parentElement.insertBefore(toolbar, wrapper);
    } else toolbar.replaceChildren();

    let footer = wrapper.nextElementSibling;
    if (!footer || !footer.classList.contains('resultFooter')) {
      footer = document.createElement('div');
      footer.className = 'resultFooter';
      wrapper.parentElement.insertBefore(footer, wrapper.nextSibling);
    } else footer.innerHTML = '';

    // ---------- Toolbar ----------
    let numberBar = null;
    if (!isResultPage) {
      numberBar = document.createElement('div');
      numberBar.className = 'numberBar';
      for (let i = 1; i <= 8; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'nb';
        b.textContent = i;
        b.dataset.anker = String(i);
        numberBar.appendChild(b);
      }
      toolbar.appendChild(numberBar);
      const spacer = document.createElement('div');
      spacer.className = 'spacer';
      toolbar.appendChild(spacer);
    }

    // ---------- Modusknoppen ----------
    const modeBar = document.createElement('div');
    modeBar.className = 'modeBar';
    const ICON = 24;
    const svgGaugeBase = `
      <svg class="gauge" width="${ICON}" height="${ICON}" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 0 1 9 9v2a1 1 0 0 1-2 0v-2a7 7 0 1 0-14 0v2a1 1 0 1 1-2 0v-2a9 9 0 0 1 9-9Z"/>
        <circle cx="12" cy="14" r="1.8" />
        <path class="needle" d="M12 13.8V7.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <text class="glabel" x="12" y="22" text-anchor="middle" textLength="20" lengthAdjust="spacingAndGlyphs">—</text>
      </svg>`;
    const setGaugeVisual = (btn, mode) => {
      const n = btn.querySelector('.needle');
      const t = btn.querySelector('.glabel');
      if (n) n.style.transform = (mode === 'snuffel') ? 'rotate(35deg)' : 'rotate(0deg)';
      if (t) t.textContent = (mode === 'snuffel') ? 'Snuffel' : 'Normaal';
    };

    const btnNormaal = document.createElement('button');
    btnNormaal.className = 'icon';
    btnNormaal.dataset.mode = 'normaal';
    btnNormaal.innerHTML = svgGaugeBase;
    setGaugeVisual(btnNormaal, 'normaal');

    const btnSnuffel = document.createElement('button');
    btnSnuffel.className = 'icon';
    btnSnuffel.dataset.mode = 'snuffel';
    btnSnuffel.innerHTML = svgGaugeBase;
    setGaugeVisual(btnSnuffel, 'snuffel');

    modeBar.appendChild(btnNormaal);
    modeBar.appendChild(btnSnuffel);
    toolbar.appendChild(modeBar);

    // ---------- Wis-knop alleen bij popupvariant ----------
    if (isResultPage) {
      // Resultatenpagina → geen knop
      const bestaandeKnop = document.getElementById('btnReset');
      if (bestaandeKnop && bestaandeKnop.parentElement) {
        bestaandeKnop.parentElement.removeChild(bestaandeKnop);
      }
    } else {
      // Popupvariant (individuele ankers)
      let btnReset = document.getElementById('btnReset');
      if (!btnReset) {
        btnReset = document.createElement('button');
        btnReset.id = 'btnReset';
        btnReset.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="margin-right:6px;">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
      </svg>
      Wis resultaten`;

        // EBX-look knopstijl
        btnReset.style.display = 'inline-flex';
        btnReset.style.alignItems = 'center';
        btnReset.style.gap = '6px';
        btnReset.style.padding = '6px 12px';
        btnReset.style.backgroundColor = 'transparent';
        btnReset.style.color = '#01689B';
        btnReset.style.border = '2px solid transparent';
        btnReset.style.borderRadius = '6px';
        btnReset.style.cursor = 'pointer';
        btnReset.style.fontWeight = '600';
        btnReset.style.fontSize = '15px';
        btnReset.style.marginTop = '12px';
        btnReset.style.transition = 'color 0.15s ease, transform 0.15s ease, border-color 0.15s ease';

        if (window.innerWidth <= 720) {
          btnReset.style.alignSelf = 'flex-start';
          btnReset.style.marginLeft = '0';
          btnReset.style.marginRight = 'auto';
        }


        // Hover & focus
        btnReset.onmouseover = () => {
          btnReset.style.color = '#014b73';
          btnReset.style.transform = 'scale(1.05)';
        };
        btnReset.onmouseout = () => {
          btnReset.style.color = '#01689B';
          btnReset.style.transform = 'scale(1.0)';
          btnReset.style.borderColor = 'transparent';
        };
        btnReset.onblur = () => { btnReset.style.borderColor = 'transparent'; };

        footer.appendChild(btnReset);
      }

      // ✅ Wis alleen de resultaten van het huidige anker (normaal + snuffel)
      if (!btnReset.dataset.bound) {
        btnReset.addEventListener('click', () => {
          toonBevestiging(
            `Weet je zeker dat je alle resultaten wilt wissen voor Anker ${state.anker}?`,
            (ok) => {
              if (!ok) return;

              // verwijder alleen de 2 sleutels van dit anker
              const keyNormaal = `resultaten_anker_${state.anker}_normaal`;
              const keySnuffel = `resultaten_anker_${state.anker}_snuffel`;
              localStorage.removeItem(keyNormaal);
              localStorage.removeItem(keySnuffel);

              toonOK(`Resultaten van Anker ${state.anker} zijn gewist.`);
              render();
            }
          );
        });
        btnReset.dataset.bound = 'true';
      }
    }




    // ---------- ✅ State met gekozen anker & modus ----------
    const state = {
      anker: pad2(startAnker),
      mode: startMode || 'normaal'
    };

    // ---------- Helpers ----------
    function read(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch { return []; }
    }
    function parseDatum(datumStr) {
      if (!datumStr) return 0;
      const [datum, tijdRaw] = datumStr.split(',');
      const [dag, maand, jaar] = datum.trim().split('-');
      const tijd = (tijdRaw || '00:00').trim();
      return new Date(`${jaar}-${maand}-${dag}T${tijd}:00`).getTime();
    }
    function buildSeries(anker, mode) {
      const keyN = `resultaten_anker_${anker}_normaal`;
      const keyS = `resultaten_anker_${anker}_snuffel`;
      const normaal = read(keyN).sort((a, b) => parseDatum(a.datum) - parseDatum(b.datum));
      const snuffel = read(keyS).sort((a, b) => parseDatum(a.datum) - parseDatum(b.datum));
      const src = mode === 'snuffel' ? snuffel : normaal;
      const labels = src.map((_, i) => i + 1);
      const active = src.map(d => d.ipm);
      const inactive = Array(labels.length).fill(null);
      return {
        labels,
        indexToData: src,
        dataNormaal: mode === 'snuffel' ? inactive : active,
        dataSnuffel: mode === 'snuffel' ? active : inactive
      };
    }

    const highlightNumbers = () => {
      if (!numberBar) return;
      numberBar.querySelectorAll('.nb').forEach(b => {
        b.classList.toggle('active', pad2(b.dataset.anker) === state.anker);
      });
    };

    const updateModeButtons = () => {
      [btnNormaal, btnSnuffel].forEach(b => {
        b.dataset.active = (b.dataset.mode === state.mode) ? 'true' : 'false';
        setGaugeVisual(b, b.dataset.mode);
      });
    };

    // ---------- Chart render ----------
    window._chartsById = window._chartsById || {};
    let chart = window._chartsById[instanceKey];

    function render() {
      const { labels, indexToData, dataNormaal, dataSnuffel } = buildSeries(state.anker, state.mode);
      const modeLabel = state.mode === 'snuffel' ? 'Snuffel' : 'Normaal';

      if (!labels.length) {
        if (chart) { chart.destroy(); chart = null; window._chartsById[instanceKey] = null; }
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.font = '16px Arial'; ctx.fillStyle = '#444';
        ctx.textAlign = 'center';
        ctx.fillText(`Nog geen resultaten voor anker ${state.anker}`, w / 2, h / 2);
        return;
      }

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = dataNormaal;
        chart.data.datasets[1].data = dataSnuffel;
        chart.indexToData = indexToData;
        chart.options.scales.x.title.text = `Meetmoment # – Anker ${state.anker} (${modeLabel})`;
        chart.update();
        return;
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Snelheid (IPM)',
              data: dataNormaal,
              borderColor: '#01689B',
              backgroundColor: 'rgba(1,104,155,0.15)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHitRadius: 12,
              pointHoverBackgroundColor: '#dc2626', // 🔴 rood bij hover
              pointHoverBorderColor: '#ff6666',
              pointHoverBorderWidth: 3
            },
            {
              label: 'Snuffel (IPM)',
              data: dataSnuffel,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245,158,11,0.15)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHitRadius: 12,
              pointHoverBackgroundColor: '#dc2626', // 🔴 rood bij hover
              pointHoverBorderColor: '#ff6666',
              pointHoverBorderWidth: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'nearest', intersect: true },
          elements: { point: { radius: 4, hitRadius: 10, hoverRadius: 6 } },
          onHover: (e, els) => {
            e.native.target.style.cursor = els?.length ? 'pointer' : 'default';
          },
          scales: {
            x: {
              title: { display: true, text: `Meetmoment # – Anker ${state.anker} (${modeLabel})` },
              grid: { display: false }
            },
            y: { beginAtZero: true, title: { display: true, text: 'Woordjes per minuut' } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              displayColors: false,
              backgroundColor: '#01689B',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 10,
              cornerRadius: 8,
              caretSize: 6,
              caretPadding: 20, // extra afstand t.o.v. het punt
              titleFont: { weight: '700' },
              bodyFont: { weight: '500' },
              callbacks: {
                title: (items) => {
                  const d = chart.indexToData?.[items[0].dataIndex];
                  return d ? d.datum : '';
                },
                label: (ctx) => {
                  const d = chart.indexToData?.[ctx.dataIndex];
                  if (!d) return '';
                  const goed = d.goed ?? 0;
                  const fout = d.fout ?? 0;
                  const totaal = goed + fout;
                  const ipm = d.ipm ?? 0;
                  const perc = totaal ? Math.round((goed / totaal) * 100) : 0;
                  return [
                    `Woordjes per minuut: ${ipm}`,
                    `Juist: ${goed}`,
                    `Fout: ${fout}`,
                    `Totaal: ${totaal}`,
                    `Percentage: ${perc}%`,
                    'Dubbelklik om meting te verwijderen' // 👈 aangepaste hint
                  ];
                }
              }
            }
          },

          // Klik = selecteren (tooltip tonen), géén verwijderen
          onClick: (evt, activeEls) => {
            if (!activeEls.length) return;
            const idx = activeEls[0].index;

            chart.setActiveElements([
              { datasetIndex: 0, index: idx },
              { datasetIndex: 1, index: idx }
            ]);
            // Toon tooltip netjes bij het geselecteerde punt
            chart.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
            chart.update();
          }
        }
      });

      chart.indexToData = indexToData;
      window._chartsById[instanceKey] = chart;

      // ===== Dubbelklik (desktop) + double-tap (mobiel) om te verwijderen =====
      if (!chart._dblBound) {
        const cvs = chart.canvas;

        // Gedeelde verwijder-handler voor dblclick / double-tap
        const handleDelete = (evt) => {
          const pts = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: false }, true);
          if (!pts.length) return;

          const { index: idx } = pts[0];
          const d = chart.indexToData?.[idx];
          if (!d) return;

          // 👇 Nieuw: modus uit UI i.p.v. datasetIndex/state
          const activeBtn =
            modeBar.querySelector('button.icon[data-active="true"]') ||
            document.querySelector('.resultToolbar .modeBar button.icon[data-active="true"]');


          // Leid de modus af uit de zichtbare dataset op de geklikte index
          const titleText = chart?.options?.scales?.x?.title?.text || '';

          // Haal "Anker NN (Snuffel|Normaal)" uit de titel
          const m = titleText.match(/Anker\s+(\d+)\s*\(\s*(Snuffel|Normaal)\s*\)/i);

          let ankerPadded, modeForDelete;
          if (m) {
            const ankerNum = parseInt(m[1], 10);
            ankerPadded = String(ankerNum).padStart(2, '0');   // bv. "02"
            modeForDelete = m[2].toLowerCase();                  // "snuffel" of "normaal"
          } else {
            // Fallbacks als de titel onverhoopt afwijkt
            ankerPadded = state.anker;
            // desnoods afleiden uit datasets:
            const dsN = chart.data.datasets[0]?.data || [];
            const dsS = chart.data.datasets[1]?.data || [];
            modeForDelete = (Number.isFinite(dsS[idx]) && !Number.isFinite(dsN[idx])) ? 'snuffel' : 'normaal';
          }


          const key = `resultaten_anker_${m[1]}_${modeForDelete}`;

          toonBevestiging(
            `Weet je zeker dat je meting #${idx + 1} (${d.datum}, ${d.ipm} wpm) wilt verwijderen?`,
            (ok) => {
              if (!ok) return;

              const arr = read(key);
              const sorted = arr.slice().sort((a, b) => parseDatum(a.datum) - parseDatum(b.datum));
              const target = sorted[idx];
              if (!target) return;

              const realIdx = arr.findIndex(r =>
                (r.datum || '').trim() === (target.datum || '').trim() &&
                Number(r.ipm) === Number(target.ipm)
              );
              if (realIdx < 0) return;

              arr.splice(realIdx, 1);
              localStorage.setItem(key, JSON.stringify(arr));

              chart.data.labels.splice(idx, 1);
              chart.data.datasets[0].data.splice(idx, 1);
              chart.data.datasets[1].data.splice(idx, 1);
              chart.indexToData.splice(idx, 1);
              chart.update();

              toonOK(`Meting van ${d.datum} is verwijderd.`);
            }
          );
        };


        // Desktop: dubbelklik
        cvs.addEventListener('dblclick', handleDelete);

        // Mobiel: double-tap (±350ms)
        let lastTap = 0;
        cvs.addEventListener('pointerdown', (evt) => {
          const now = Date.now();
          if (now - lastTap < 350) {
            handleDelete(evt);
            lastTap = 0;
          } else {
            lastTap = now;
          }
        });

        chart._dblBound = true; // niet dubbel binden
      }

    }


    // ---------- Events ----------
    if (numberBar) {
      numberBar.addEventListener('click', e => {
        const btn = e.target.closest('.nb');
        if (!btn) return;
        const nr = parseInt(btn.dataset.anker, 10);
        state.anker = pad2(nr);
        highlightNumbers();
        render();
      });
    }

    modeBar.addEventListener('click', e => {
      const btn = e.target.closest('button.icon[data-mode]');
      if (!btn) return;
      state.mode = btn.dataset.mode;
      updateModeButtons();
      render();
    });

    updateModeButtons();
    highlightNumbers();
    render();
  }

  // Exporteer functie
  window.renderResultaatGrafiekOp = renderResultaatGrafiekOp;

})();
