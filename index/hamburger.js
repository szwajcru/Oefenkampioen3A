/**
 * Hamburger menu script
 * Auteur: RP Szwajcer
 * Doel: menu met Contact, Beheer (Data), Versie en koppeling naar changelog
 */

document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  const changelogTip = document.getElementById('changelogTip');
  const feedbackForm = document.getElementById('feedbackForm');
  const closeFeedbackBtn = document.getElementById('btnCloseFeedback');

  // --- Hoofdmenu openen/sluiten ---
  menuBtn.addEventListener('click', function () {
    // Menu open/dicht toggelen
    menuDropdown.classList.toggle('hidden');

    // --- Sluit alle andere overlay-schermen wanneer hamburger wordt geopend ---
    const changelogTip = document.getElementById('changelogTip');
    const feedbackForm = document.getElementById('feedbackForm');
    const hoeWerktOverlay = document.querySelector('.popup-overlay');
    const woordenPopup = document.getElementById('woordenPopup');

    if (!menuDropdown.classList.contains('hidden')) {
      // Menu is nu open → sluit alles wat zichtbaar kan zijn
      if (changelogTip) changelogTip.classList.remove('show');
      if (feedbackForm) feedbackForm.style.display = 'none';
      if (hoeWerktOverlay) hoeWerktOverlay.remove();
      if (woordenPopup) woordenPopup.style.display = 'none';
    }
  });

  // --- Submenu's openen/sluiten (ondersteunt meerdere niveaus) ---
  document.querySelectorAll('.has-sub').forEach(item => {
    item.addEventListener('click', function (e) {
      const submenu = item.querySelector(':scope > .submenu');
      if (!submenu) return;

      // sluit alleen submenu’s van hetzelfde niveau
      const siblings = item.parentElement.querySelectorAll(':scope > .has-sub');
      siblings.forEach(sib => {
        if (sib !== item) {
          const sibSub = sib.querySelector(':scope > .submenu');
          if (sibSub) sibSub.classList.add('hidden');
          sib.classList.remove('open');
        }
      });

      submenu.classList.toggle('hidden');
      item.classList.toggle('open');
      e.stopPropagation();

      //sluitAlleOverlays(); // ✅ sluit alles voordat submenu opent


    });
  });

  // --- Klik buiten menu sluit alles ---
  document.addEventListener('click', function (e) {
    if (!menuContainer.contains(e.target)) {
      menuDropdown.classList.add('hidden');
      document.querySelectorAll('.submenu').forEach(sub => sub.classList.add('hidden'));
      document.querySelectorAll('.has-sub').forEach(item => item.classList.remove('open'));
    }
  });

  /**
   * -----------------------
   * EXPORT / IMPORT
   * -----------------------
   */

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      try {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          allData[key] = localStorage.getItem(key);
        }

        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'oefen_resultaten.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Er ging iets mis bij het exporteren van de data.');
        console.error(err);
      }
    });
  }

  const importBtn = document.getElementById('importBtn');
  if (importBtn) {
    importBtn.addEventListener('click', function () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const importedData = JSON.parse(e.target.result);
            for (const key in importedData) {
              localStorage.setItem(key, importedData[key]);
            }
            alert('Gegevens succesvol geïmporteerd!');
          } catch (err) {
            alert('Ongeldig bestand of fout bij importeren.');
            console.error(err);
          }
        };
        reader.readAsText(file);
      });

      input.click();
    });
  }

  /**
   * -----------------------
   * RELEASENOTES (CHANGELOG)
   * -----------------------
   */

  const releaseNotesBtn = document.getElementById('releaseNotesBtn');
  if (releaseNotesBtn && changelogTip) {
    releaseNotesBtn.addEventListener('click', function () {
      changelogTip.classList.add('show');
      menuDropdown.classList.add('hidden');
    });
  }

  if (changelogTip) {
    document.addEventListener('click', function (e) {
      if (
        changelogTip.classList.contains('show') &&
        !changelogTip.contains(e.target) &&
        e.target.id !== 'releaseNotesBtn'
      ) {
        changelogTip.classList.remove('show');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        changelogTip.classList.remove('show');
      }
    });
  }

  /**
   * -----------------------
   * CONTACTFORMULIER
   * -----------------------
   */

  const feedbackBtn = document.getElementById('feedbackBtn');
  if (feedbackBtn && feedbackForm) {
    feedbackBtn.addEventListener('click', function () {
      feedbackForm.style.display = 'flex';
      menuDropdown.classList.add('hidden');
    });
  }

  if (closeFeedbackBtn && feedbackForm) {
    closeFeedbackBtn.addEventListener('click', function () {
      feedbackForm.style.display = 'none';
    });
  }

  // Sluiten bij klik buiten het contactformulier
  if (feedbackForm) {
    document.addEventListener('click', function (e) {
      if (
        feedbackForm.style.display === 'flex' &&
        !feedbackForm.contains(e.target) &&
        e.target.id !== 'feedbackBtn'
      ) {
        feedbackForm.style.display = 'none';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        feedbackForm.style.display = 'none';
      }
    });
  }

  // --- Hulpfunctie: sluit alle overlays/popups ---
  function sluitAlleOverlays() {
    const changelogTip = document.getElementById('changelogTip');
    const feedbackForm = document.getElementById('feedbackForm');
    const hoeWerktOverlay = document.querySelector('.popup-overlay');
    const woordenPopup = document.getElementById('woordenPopup');

    if (changelogTip) changelogTip.classList.remove('show');
    if (feedbackForm) feedbackForm.style.display = 'none';
    if (hoeWerktOverlay) hoeWerktOverlay.remove();   // ✅ sluit “Hoe werkt het”
    if (woordenPopup) woordenPopup.style.display = 'none';
  }



});

// === Hoe werkt het (iframe-versie, werkt ook bij file://) ===
const hoeWerktHetBtn = document.getElementById('hoeWerktHetBtn');

if (hoeWerktHetBtn) {
  hoeWerktHetBtn.addEventListener('click', () => {
    // Overlay maken
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9998;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Popup maken
    const popup = document.createElement('div');
    popup.classList.add('popup-content');
    popup.style.cssText = `
      background: white;
      max-width: 900px;
      width: 90%;
      max-height: 85vh;
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      position: relative;
      z-index: 9999;
      overflow: hidden;
    `;

    // Iframe toevoegen
    popup.innerHTML = `
      <button id="btnCloseHoeWerktHet" style="
        position:absolute;
        top:10px;
        right:10px;
        background:#01689B;
        color:white;
        border:none;
        border-radius:6px;
        padding:6px 12px;
        cursor:pointer;
        z-index: 10000;
      ">Sluiten</button>
      <iframe src="/index/instructies.html" style="
        width:100%;
        height:80vh;
        border:none;
        border-radius:0 0 12px 12px;
      "></iframe>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Sluiten
    const closeBtn = document.getElementById('btnCloseHoeWerktHet');
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
  });
}

// === Popup bij klikken op Anker 1 ===
// === Anker woordjes via bestaande popup ===
document.addEventListener('DOMContentLoaded', function () {
  // Event delegation: luistert op alle submenu ankerknoppen
  document.querySelectorAll('.submenu-item.anker-menu').forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();

      const nummer = item.getAttribute('data-anker');

      // Controleer of de popupfunctie beschikbaar is
      if (typeof window.openWoordenPopup === 'function' && window.ankers) {
        const woordenNormaal = window.ankers[String(nummer)] || [];
        const woordenSnuffel = window.ankers[`${nummer}-snuffel`] || [];

        // Roep de bestaande popup aan
        window.openWoordenPopup(`Woordenlijst – anker ${nummer}`, woordenNormaal, woordenSnuffel, nummer);

        // Menu sluiten
        document.getElementById('menuDropdown')?.classList.add('hidden');
      } else {
        console.warn('⚠️ openWoordenPopup niet beschikbaar of ankers niet geladen.');
      }
    });
  });
});

