document.addEventListener('DOMContentLoaded', function () {
  const feedbackForm = document.getElementById('feedbackForm');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const feedbackData = {
        type: document.getElementById('feedbackType').value,
        message: document.getElementById('feedbackMessage').value,
        email: document.getElementById('userEmail').value
      };

      fetch('/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      })
        .then(response => response.text())
        .then(data => {
          console.log(data);
          const submitBtn = feedbackForm.querySelector('button[type="submit"]');
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Obrigado pelo feedback!';
          submitBtn.style.backgroundColor = '#28a745';
          submitBtn.disabled = true;

          setTimeout(() => {
            feedbackForm.reset();
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Feedback';
            submitBtn.style.backgroundColor = '';
            submitBtn.disabled = false;
          }, 2000);
        })
        .catch(error => {
          alert('Erro ao enviar feedback. Tente novamente.');
          console.error('Erro:', error);
        });
    });
  }
});
