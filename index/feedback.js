// === Feedback functionaliteit (popup + EmailJS) ===
document.addEventListener('DOMContentLoaded', function () {
  const feedbackLink = document.getElementById('feedbackLink');
  const feedbackForm = document.getElementById('feedbackForm');
  const closeBtn = document.getElementById('btnCloseFeedback');
  const form = document.getElementById('formFeedback');

  if (!feedbackLink || !feedbackForm || !closeBtn || !form) {
    console.warn('Feedback-elementen niet gevonden in DOM.');
    return;
  }

  // Voeg een meldingselement toe (inline succes/foutmelding)
  const messageBox = document.createElement('div');
  messageBox.id = 'feedbackMessageBox';
  messageBox.style.display = 'none';
  feedbackForm.querySelector('.popup-content')?.appendChild(messageBox);

  // === Popup openen ===
  feedbackLink.addEventListener('click', e => {
    e.preventDefault();
    feedbackForm.style.display = 'block';
    messageBox.style.display = 'none';
    messageBox.textContent = '';
  });

  // === Popup sluiten ===
  closeBtn.addEventListener('click', () => {
    feedbackForm.style.display = 'none';
  });

  // === Formulier verzenden met EmailJS ===
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

    // Disable knoppen tijdelijk
    form.querySelectorAll('button').forEach(b => (b.disabled = true));

    emailjs.send('service_v6m2jaa', 'tmpl_feedback_8060i6f', templateParams)
      .then(() => {
        // Inline succesmelding tonen
        messageBox.textContent = '✔ Bedankt voor je feedback!';
        messageBox.className = 'feedback-success';
        messageBox.style.display = 'block';

        form.reset();

        // Popup na korte tijd automatisch sluiten
        setTimeout(() => {
          feedbackForm.style.display = 'none';
          messageBox.style.display = 'none';
        }, 2000);
      })
      .catch((error) => {
        console.error('Fout bij versturen:', error);
        messageBox.textContent = '⚠ Er ging iets mis bij het versturen. Probeer later opnieuw.';
        messageBox.className = 'feedback-error';
        messageBox.style.display = 'block';
      })
      .finally(() => {
        form.querySelectorAll('button').forEach(b => (b.disabled = false));
      });
  });
});

// === Klik buiten popup om te sluiten ===
document.addEventListener('click', e => {
  const popup = document.getElementById('feedbackForm');
  const content = popup?.querySelector('.popup-content');
  const link = document.getElementById('feedbackLink');

  if (!popup || popup.style.display !== 'block') return;

  const klikBinnenPopup = content?.contains(e.target);
  const klikOpLink = link?.contains(e.target);

  if (!klikBinnenPopup && !klikOpLink) {
    popup.style.display = 'none';
  }
});
