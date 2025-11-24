/** @type {any} */
var echarts;

/* ======================================================
   STATE
   ====================================================== */
let currentMode = 'normaal';
let currentAnchor = null;
let fullLabels = [];
let fullData = [];
let chart = null;
let fixedAnchor = null;       //Vast anker bij individueel anker rapport

/* =======
   HELPERS
   ======= */

// ANCHOR NUMBER + MODUS LABEL   
function getAnchorLabel() {
    let anchorLabel;

    if (currentAnchor === 'S') {
        anchorLabel = 'start';
    } else {
        anchorLabel = String(Number(currentAnchor));  // removes leading zero
    }

    return anchorLabel + ' - ' + currentMode;
}

//   ANCHOR LABEL
function getAnchorNormalized(anchor) {

    if (anchor === 'S' || anchor === '0' || anchor === '00') {
        return 'start';
    }

    // Verwijder voorloopnullen: "03" → "3"
    const normalized = String(parseInt(anchor, 10));

    // parseInt() kan NaN geven → fallback naar originele anchor
    return isNaN(normalized) ? anchor : normalized;
}


// STORAGE OBJECT KEY RESULTS PER ANCHOR + MODE   
function getAnchorKey() {
    const anchorCode = (currentAnchor === 'S') ? '00' : String(currentAnchor).padStart(2, '0');
    return 'resultaten_anker_' + anchorCode + '_' + currentMode;
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // 1) Check of embed een fixed anchor meegeeft
    const popup = document.getElementById('resultatenPopup');
    const popupFixed = popup ? popup.dataset.fixedAnchor : null;

    // 2) Check URL
    const paramFixed = getQueryParam("anker");

    // 3) Bepaal werkelijke fixedAnchor
    fixedAnchor = popupFixed || paramFixed || null;

    // Modusknoppen altijd zichtbaar
    setupModeDropdown();

    if (fixedAnchor) {
        // UITGEKLEDE MODUS
        document.getElementById('anchorBar').style.display = 'none';
        currentAnchor = fixedAnchor;
    } else {
        // VOLLEDIGE MODUS
        buildAnchorButtons();
        attachAnchorHandlers();
        currentAnchor = '1';
    }

    attachResetHandler();

    currentMode = 'normaal';
    loadChartData();
    updatePageHeaderTitle();
});


window.addEventListener('resize', () => {
    chart && chart.resize();
});

/* ======================================================
   ANKER KNOPPEN
   ====================================================== */
function buildAnchorButtons() {
    const bar = document.getElementById('anchorBar');

    ['S', '1', '2', '3', '4', '5', '6', '7', '8'].forEach(anchorDetail => {

        const btn = document.createElement('button');
        btn.className = 'nb';
        btn.dataset.anker = anchorDetail;

        // label voor op de knop verandert niet (dus 'S' blijft 'S')
        btn.textContent = anchorDetail;

        // maar tooltip vertaalt 'S' naar 'Start'
        const tooltipLabel = (anchorDetail === 'S') ? 'start' : anchorDetail;
        btn.title = 'Bekijk resultaten van anker ' + tooltipLabel;

        if (anchorDetail === '1') {
            btn.classList.add('active');
        }

        bar.appendChild(btn);
    });
}

/* ======================================================
   MODE KNOPPEN
   ====================================================== */
function setupModeToggle() {
    const btn = document.getElementById('modeToggle');

    if (!btn) return;

    // Default
    btn.textContent = "Normaal";
    btn.classList.remove("snuffel");
    btn.textContent = "Normaal";

    currentMode = "normaal";

    btn.addEventListener("click", () => {
        if (currentMode === "normaal") {
            currentMode = "snuffel";
            btn.textContent = "Snuffel";
            btn.classList.add("snuffel");
        } else {
            currentMode = "normaal";
            btn.textContent = "Normaal";
            btn.classList.remove("snuffel");
        }

        updatePageHeaderTitle();
        loadChartData();
    });
}

// ============================
// MODE DROPDOWN
// ============================
function setupModeDropdown() {
    const btn = document.getElementById("modeDropdownBtn");
    const menu = document.getElementById("modeDropdownMenu");

    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
    });

    // Klik op optie
    menu.querySelectorAll("div").forEach(item => {
        item.addEventListener("click", () => {
            const mode = item.getAttribute("data-mode");
            currentMode = mode;

            btn.textContent = (mode === "normaal" ? "Normaal" : "Snuffel") + " ▾";

            menu.classList.add("hidden");

            loadChartData(); // grafiek opnieuw tekenen
        });
    });

    // Klik buiten dropdown → sluiten
    document.addEventListener("click", () => {
        menu.classList.add("hidden");
    });
}


/* ======================================================
   EVENT HANDLERS
   ====================================================== */
function attachAnchorHandlers() {
    document.querySelectorAll('.nb').forEach(btn => {
        btn.addEventListener('click', () => {
            currentAnchor = btn.dataset.anker;

            document.querySelectorAll('.nb').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');

            loadChartData();
            updatePageHeaderTitle();
        });
    });
}

function attachResetHandler() {
    const btn = document.getElementById("resetZoomBtn");
    if (!btn) return; // voorkomt crash
    btn.addEventListener("click", () => {
        if (chart) chart.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    });
}


function updatePageHeaderTitle() {
    const headerTitle = document.querySelector('.popupHeaderTitle');
    if (!headerTitle) return;

    const nr = String(currentAnchor).padStart(2, '0');
    headerTitle.textContent = `Resultaten van Anker ${nr}`;
}


/* ======================================================
   ANCHOR SPECIFIC LOAD OF CHART
   ====================================================== */
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get('anker');
}

/* ======================================================
   LOAD DATA
   ====================================================== */
function loadChartData() {
    const key = getAnchorKey();
    const results = JSON.parse(localStorage.getItem(key) || '[]');

    if (results.length === 0) {
        showNoDataMessage(chart, getAnchorNormalized(currentAnchor), false);
        return;
    }

    fullLabels = results.map((_, i) => i + 1);
    fullData = results.map(r => r.ipm);

    renderChart(fullLabels, fullData);
}

/* ===================================================
   NO-DATA MESSAGE, (when there is no data to display)
   =================================================== */
function showNoDataMessage(chartInstance, anchorText, isInline) {

    // Zoom hint alleen verbergen in popup-modus
    if (!isInline) {
        const hint = document.getElementById('zoomHint');
        if (hint) hint.style.display = 'none';
    }

    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 14 : 20;

    chartInstance.setOption({
        xAxis: {
            show: true,
            type: 'category',
            data: []
        },
        yAxis: {
            show: true,
            type: 'value'
        },
        series: [],
        dataZoom: [],
        graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
                text: 'Er zijn nog geen resultaten voor anker ' + anchorText,
                fill: '#01689B',
                fontSize: fontSize,
                fontWeight: 600
            }
        }
    }, { notMerge: true });
}


//ACTIONS
// MENU openen/sluiten
document.getElementById("actionsBtn").addEventListener("click", () => {
    document.getElementById("actionsMenu").classList.toggle("hidden");
});

// Buiten menu klikken → sluiten
document.addEventListener("click", function (e) {
    if (!e.target.closest(".actionsContainer")) {
        document.getElementById("actionsMenu").classList.add("hidden");
    }
});

function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// VERWIJDER ALLE RESULTATEN knop
document.getElementById("removeAllBtn").addEventListener("click", () => {
    const key = getAnchorKey();
    const currentAnchorLabel = getAnchorLabel(currentAnchor);

    /* =====================================================
       Delete all results (with confirmation dialog)
       ===================================================== */
    toonBevestiging(
        'Weet je zeker dat je alle resultaten van dit anker ' + currentAnchorLabel + ' wilt wissen?',
        (bevestig) => {

            if (bevestig) {

                // Remove all stored results
                localStorage.removeItem(key);

                // Destroy existing chart instance if present
                if (window.resultatenChartInstance) {
                    window.resultatenChartInstance.destroy();
                }

                // Show user feedback
                toonMelding('Alle resultaten zijn gewist.');

                // Hide tooltip if it was visible
                if (resultatenTip) {
                    resultatenTip.style.display = 'none';
                }
                loadChartData();
            }

        }
    );

});

//API CALL
window.startEmbeddedGrafiek = function (anker) {
    fixedAnchor = anker;
    currentAnchor = anker;
    currentMode = 'normaal';

    document.getElementById('anchorBar').style.display = 'none';

    updatePageHeaderTitle();
    loadChartData();
};

// Sluiten
document.querySelector('#resultatenPopup .popup-close')
    .addEventListener('click', () => {
        document.getElementById('resultatenPopup').style.display = 'none';
    });

window.addEventListener('resize', function () {
    if (window.chartInstance) {
        window.chartInstance.resize();
    }
});


// ======================================================================
//   Initializes and displays the full results popup, with all anchors, resets state,
//   rebuilds the UI (anchors, mode toggle), reloads chart data,
//   and updates the page title.
// ======================================================================
function openResultsPopupForAllAnchors() {

    fixedAnchor = null;
    currentAnchor = '1';
    currentMode = 'normaal';

    // Reset anchor bar
    document.getElementById('anchorBar').innerHTML = '';
    document.getElementById('anchorBar').style.display = 'flex';

    // Reset chart instance
    chart = null;

    // Rebuild UI
    buildAnchorButtons();
    attachAnchorHandlers();

    // New toggle mode button
    setupModeDropdown();

    // Attach reset button handler
    attachResetHandler();

    // Load data and update title
    loadChartData();
    updatePageHeaderTitle();
}

// ================================================================
// This is to open the total results chart - VERIFIED
// ================================================================
function renderChart(labels, data) {
    const container = document.getElementById('grafiekEChart');
    chart = renderChartUnified(container, labels, data, currentMode);

    attachDoubleClickDelete(chart);
}

// ================================================================
// This is to open the chart inline after the excersize. - VERIFIED
// ================================================================
function renderChartInline(containerId, anker, mode) {
    currentAnchor = anker;
    currentMode = mode;

    const key = getAnchorKey();
    const results = JSON.parse(localStorage.getItem(key) || '[]');

    const labels = results.map((_, i) => i + 1);
    const data = results.map(r => r.ipm);

    const container = document.getElementById(containerId);

    const chartInstance = renderChartUnified(container, labels, data, mode);

    if (results.length === 0) {
        showNoDataMessage(chartInstance, getAnchorNormalized(anker), true);
        return;
    }
    // Attach double click delete
    attachDoubleClickDelete(chartInstance);

    // Store simple refresh function on the chart instance
    chartInstance._refreshInline = () => {
        renderChartInline(containerId, anker, mode);
    };

    return chartInstance;
}



function getBaseChartOptions(labels, data, lineColor) {
    const total = data.length;
    let visibleCount = (window.innerWidth < 768) ? 20 : 50;
    let startVal = (total > visibleCount) ? total - visibleCount : 0;
    let endVal = total - 1;

    return {
        animation: false,

        grid: {
            left: 45,
            right: 10,
            top: 60,
            bottom: 80
        },

        tooltip: {
            trigger: 'axis',
            backgroundColor: '#015a8c',
            borderColor: '#015a8c',
            textStyle: { color: '#fff', fontSize: 11 },
            extraCssText: 'padding:8px;',
            position: function (point, params, dom, rect, size) {
                return [
                    point[0] - size.contentSize[0] / 2,
                    point[1] + 25
                ];
            },
            formatter: function (params) {
                const p = params[0];
                const index = p.dataIndex;
                const results = JSON.parse(localStorage.getItem(getAnchorKey()) || '[]');
                const r = results[index];
                if (!r) return '';

                return (
                    '<strong>' + r.datum + '</strong><br/>' +
                    'Woordjes per minuut: ' + r.ipm + '<br/>' +
                    'Goed: ' + r.goed + '<br/>' +
                    'Fout: ' + r.fout + '<br/>' +
                    'Totaal: ' + r.totaal + '<br/>' +
                    'Percentage: ' + r.percentage + '%<br/><br/>' +
                    '<i>(Dubbelklik om te verwijderen)</i>'
                );
            }
        },

        xAxis: {
            type: 'category',
            data: labels,
            name: 'Meetmoment # ',
            nameLocation: 'middle',
            nameGap: 22,
            axisLabel: { fontSize: 10, color: '#444', margin: 6 },
            nameTextStyle: { fontSize: 11, color: '#444', fontWeight: 'normal' }
        },

        yAxis: {
            type: 'value',
            min: 10,
            name: 'Woordjes per minuut',
            nameLocation: 'middle',
            nameGap: 28,
            axisLabel: { fontSize: 10, color: '#444' },
            nameTextStyle: { fontSize: 11, color: '#444', fontWeight: 'normal' },
            splitLine: { show: true, lineStyle: { color: '#eee' } }
        },

        dataZoom: [
            {
                type: 'inside',
                startValue: startVal,
                endValue: endVal
            },
            {
                type: 'slider',
                height: 20,
                bottom: 0,
                startValue: startVal,
                endValue: endVal,
                textStyle: { fontSize: 9 }
            }
        ],

        series: [{
            data,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,

            itemStyle: {
                color: lineColor,
                borderColor: lineColor,
                borderWidth: 1.5
            },

            emphasis: {
                scale: true,
                symbolSize: 9,
                itemStyle: {
                    color: 'red',
                    borderColor: 'red',
                    borderWidth: 2
                }
            },

            lineStyle: {
                color: lineColor,
                width: 2
            },

            areaStyle: {
                color: lineColor + '30'
            },

            markPoint: {
                symbol: 'path://M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
                symbolSize: 12,
                symbolOffset: [0, -25],
                itemStyle: {
                    color: lineColor,
                    borderColor: '#014F75',
                    borderWidth: 1
                },
                label: { show: false },
                data: [{ type: 'max' }]
            }
        }]
    };
}

function renderChartUnified(container, labels, data, mode) {

    const chart = echarts.init(container);
    const key = getAnchorKey();
    const results = JSON.parse(localStorage.getItem(key) || '[]');


    // Case: no data → show message
    if (results.length === 0) {
        chart.setOption({
            graphic: {
                type: 'text',
                left: 'center',
                top: 'middle',
                style: {
                    text: 'Er zijn nog geen resultaten voor dit anker',
                    fill: '#01689B',
                    fontSize: (window.innerWidth < 768 ? 14 : 20),
                    fontWeight: 600
                }
            }
        });
        return chart;
    }

    // Case: wél data → verwijder oude "geen data" melding
    chart.setOption({ graphic: [] }, { notMerge: true });

    const lineColor = (mode === 'snuffel') ? '#F59E0B' : '#01689B';
    const options = getBaseChartOptions(labels, data, lineColor);

    chart.setOption(options);

    return chart;
}


/**
 * Adds double-click delete behavior to an ECharts chart.
 * When the user double-clicks a datapoint, a confirmation dialog appears.
 * If confirmed, the result is removed from storage and the chart is reloaded.
 */
function attachDoubleClickDelete(chart) {

    // Remove all old handlers
    chart.off('dblclick');
    chart.off('click');

    // Desktop double-click
    chart.on('dblclick', function (event) {
        if (event.componentType !== 'series') return;
        handleDelete(event.dataIndex);
    });

    // Mobile: single tap equals delete
    let lastTapTime = 0;

    chart.on('click', function (event) {

        // Desktop → ignore single click
        if (!isMobileDevice()) return;

        if (event.componentType !== 'series') return;

        const now = Date.now();
        const delta = now - lastTapTime;

        // ≤ 300ms → double tap!
        if (delta > 50 && delta < 300) {
            handleDelete(event.dataIndex);
        }

        lastTapTime = now;
    });


    function handleDelete(idx) {
        const key = getAnchorKey();
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const d = arr[idx];
        if (!d) return;

        toonBevestiging(
            `Weet je zeker dat je meting #${idx + 1} (${d.datum}, ${d.ipm} ipm) wilt verwijderen?`,
            (ok) => {
                if (!ok) return;

                // Remove exact match
                const realIdx = arr.findIndex(r =>
                    (r.datum || '').trim() === (d.datum || '').trim() &&
                    Number(r.ipm) === Number(d.ipm)
                );

                if (realIdx < 0) return;

                arr.splice(realIdx, 1);
                localStorage.setItem(key, JSON.stringify(arr));

                toonOK(`Meting van ${d.datum} is verwijderd.`);

                // Inline refresh
                if (chart._refreshInline) {
                    chart._refreshInline();
                } else {
                    loadChartData();
                }
            }
        );
    }

    function isMobileDevice() {
        // 1. Heeft touch?
        const hasTouch = (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );

        // 2. Is de viewport klein / compact? (Chrome DevTools geeft juiste waarde)
        const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;

        // 3. Detecteer geen laptop met touchscreen
        const isNotDesktopLike = !navigator.userAgent.includes("Windows");

        return hasTouch && isSmallScreen && isNotDesktopLike;
    }

}



// =============================================================
// EVENT: Ensure the chart resizes correctly before printing
// This helps prevent clipped or misaligned charts in print mode
// =============================================================
window.addEventListener('beforeprint', () => {
    if (chart) chart.resize();
});

// ===========================
// HANDLER: Main print routine
// - Mobile → generate downloadable PDF
// - Desktop → open new window and auto-print
// ===========================
document.getElementById("printBtn").addEventListener("click", () => {

    const imgData = chart.getDataURL({
        type: "png",
        pixelRatio: 3,
        backgroundColor: "#FFFFFF"
    });

    const titleEl = document.getElementById("resultatenHeaderTitle");
    const title = titleEl?.innerText
        .replace(/Anker/gi, "anker")      // hoofdletter A → a
        .replace(/\b0+(\d+)/g, "$1")      // voorloopnullen verwijderen
        + " - " + currentMode;

    // ---------------------------------------------------------
    // MOBILE MODE → create and download a landscape PDF instead
    // ---------------------------------------------------------
    if (isMobile()) {
        generateLandscapePDF(title, imgData);
        return;
    }

    // ---------------------------------------------------------
    // DESKTOP MODE → build print page via Blob and auto-trigger print
    // ---------------------------------------------------------
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                @page { size: A4 portrait; margin: 12mm; }
                body { margin: 0; font-family: Arial; text-align: center; }
                h1 { margin-top: 8mm; font-size: 24px; color: #01689B; }
                img { width: 100%; height: auto; margin-top: 10mm; }
            </style>

            <script>
                // ---------------------------------------------------
                // AUTO-PRINT HANDLER inside popup
                // Ensures printing only starts once DOM is ready
                // ---------------------------------------------------
                document.addEventListener("DOMContentLoaded", function() {
                    console.log("📄 Popup DOM ready");

                    setTimeout(() => {
                        console.log("🖨️ Printing…");
                        window.print();

                        // Close after print or cancel
                        window.onafterprint = () => window.close();

                        // Extra fallback close
                        setTimeout(() => window.close(), 1000);

                    }, 150);
                });
            </script>
        </head>

        <body>
            <h1>${title}</h1>
            <img src="${imgData}">
        </body>
        </html>
    `;

    // Create Blob → convert to object URL → open popup
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "width=900,height=1200");
});



// ======================================================================
// FUNCTION: generateLandscapePDF
// Creates a high-quality landscape PDF for mobile devices
// Uses jsPDF and scales the chart to fit an A4 landscape page
// ======================================================================
async function generateLandscapePDF(title, imgData) {
    const { jsPDF } = window.jspdf;

    // Create A4 landscape document
    const pdf = new jsPDF('l', 'mm', 'a4');

    const margin = 10;
    const fullWidth = pdf.internal.pageSize.getWidth();
    const fullHeight = pdf.internal.pageSize.getHeight();

    const pageWidth = fullWidth - margin * 2;
    const pageHeight = fullHeight - margin * 2;

    // ---------------------------
    // Render centered page title
    // ---------------------------
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");

    pdf.text(
        title,
        fullWidth / 2,   // horizontally centered
        margin + 8,      // slight offset from top
        { align: "center" }
    );

    // -------------------------------------------------------
    // Load PNG and calculate scaling to fit landscape layout
    // -------------------------------------------------------
    const img = new Image();
    img.src = imgData;
    await img.decode();

    const imgW = img.width;
    const imgH = img.height;

    // Contain-fit inside available space
    const scale = Math.min(
        pageWidth / imgW,
        (pageHeight - 25) / imgH
    );

    const renderW = imgW * scale;
    const renderH = imgH * scale;

    const posX = (fullWidth - renderW) / 2;
    const posY = margin + 18; // position below title

    // ---------------------------
    // Add chart image to the PDF
    // ---------------------------
    pdf.addImage(
        imgData,
        "PNG",
        posX,
        posY,
        renderW,
        renderH,
        undefined,
        "FAST"
    );

    // ---------------------------
    // Save the generated PDF file
    // ---------------------------
    pdf.save("grafiek_landscape.pdf");
}
