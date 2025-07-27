document.addEventListener('DOMContentLoaded', function () {
  // Seu código inteiro vai aqui dentro

  const coverUpload = document.getElementById('coverUpload');
  const preview = document.getElementById('coverPreview');

  if (coverUpload && preview) {
    coverUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.match('image.*')) {
          alert('Por favor, selecione uma imagem (JPG ou PNG)');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter menos de 5MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          preview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" style="object-fit: cover; width: 100%; height: 100%;">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }


tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim()) {
        e.preventDefault();
        const tag = this.value.trim();

        if (!document.querySelector(`.tag[data-tag="${tag}"]`)) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag badge bg-primary py-2 px-3 d-flex align-items-center';
            tagElement.dataset.tag = tag;
            tagElement.innerHTML = `
                ${tag}
                <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remover"></button>
            `;

            tagElement.querySelector('button').addEventListener('click', () => tagElement.remove());
            tagContainer.appendChild(tagElement);
        }

        this.value = '';
    }
});

const textarea = document.getElementById('postContent');
textarea.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();

    const start = this.selectionStart;
    const end = this.selectionEnd;

    // Insere tabulação (4 espaços, por exemplo)
    const value = this.value;
    this.value = value.substring(0, start) + "    " + value.substring(end);

    // Move cursor após os espaços inseridos
    this.selectionStart = this.selectionEnd = start + 4;
  }
});
});
