// === Feedback functionaliteit (popup + EmailJS + visuele bevestiging) ===
document.addEventListener('DOMContentLoaded', function () {
  const feedbackLink = document.getElementById('feedbackBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const form = document.getElementById('formFeedback');

  if (!feedbackLink || !feedbackForm || !form) {
    console.warn('Feedback-elementen niet gevonden in DOM.');
    return;
  }

  // === Popup openen ===
  feedbackLink.addEventListener('click', e => {
    e.preventDefault();
    feedbackForm.style.display = 'block';

    // X-knop zoals ankerwoordjes-popup
    injectContactCloseX();
  });

  // === Formulier verzenden ===
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

    // Knoppen tijdelijk uitschakelen
    form.querySelectorAll('button').forEach(b => (b.disabled = true));

    emailjs.send('service_v6m2jaa', 'tmpl_feedback_8060i6f', templateParams)
      .then(() => {
        toonFeedbackMelding('✔ Bedankt voor je feedback!', 'success');
        form.reset();
        setTimeout(() => { feedbackForm.style.display = 'none'; }, 1800);
      })
      .catch((error) => {
        console.error('Fout bij versturen:', error);
        toonFeedbackMelding('⚠ Er ging iets mis bij het versturen. Probeer later opnieuw.', 'error');
      })
      .finally(() => {
        form.querySelectorAll('button').forEach(b => (b.disabled = false));
      });
  });

  // Klik buiten popup om te sluiten
  document.addEventListener('click', e => {
    const content = feedbackForm.querySelector('.popup-content');
    const klikBinnenPopup = content?.contains(e.target);
    const klikOpLink = feedbackLink?.contains(e.target);
    if (feedbackForm.style.display === 'block' && !klikBinnenPopup && !klikOpLink) {
      feedbackForm.style.display = 'none';
    }
  });

  // === Visuele melding tonen ===
  function toonFeedbackMelding(tekst, type) {
    let melding = document.createElement('div');
    melding.className = 'feedback-toast ' + (type === 'success' ? 'toast-success' : 'toast-error');
    melding.textContent = tekst;
    document.body.appendChild(melding);
    setTimeout(() => melding.classList.add('show'), 10);
    setTimeout(() => melding.classList.remove('show'), 2800);
    setTimeout(() => melding.remove(), 3400);
  }
});


// === Injecteer X-knop (identiek aan ankerwoordjes popup) ===
function injectContactCloseX() {
  const popup = document.getElementById('feedbackForm');
  if (!popup) return;

  // oude X verwijderen (voorkomt duplicaten)
  const old = popup.querySelector('#closeContactX');
  if (old) old.remove();

  // nieuwe X-knop
  const closeBtn = document.createElement('button');
  closeBtn.id = 'closeContactX';
  closeBtn.innerHTML = '×';
  closeBtn.title = 'Sluiten';

  // exacte styling zoals JIJ wilde
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

  // toevoegen aan titelbalk
  const titleCell = popup.querySelector('thead th[colspan]');
  if (titleCell) {
    titleCell.style.position = 'relative';
    titleCell.appendChild(closeBtn);
  }

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    popup.style.display = 'none';
  });
}
