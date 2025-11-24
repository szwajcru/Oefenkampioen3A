// === Feedback functionaliteit (popup + EmailJS + visuele bevestiging) ===
document.addEventListener('DOMContentLoaded', function () {
  const feedbackLink = document.getElementById('feedbackBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const closeBtn = document.getElementById('btnCloseFeedback');
  const form = document.getElementById('formFeedback');

  if (!feedbackLink || !feedbackForm || !closeBtn || !form) {
    console.warn('Feedback-elementen niet gevonden in DOM.');
    return;
  }

  // === Popup openen ===
  feedbackLink.addEventListener('click', e => {
    e.preventDefault();
    feedbackForm.style.display = 'block';
  });

  // === Popup sluiten ===
  closeBtn.addEventListener('click', () => {
    feedbackForm.style.display = 'none';
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
