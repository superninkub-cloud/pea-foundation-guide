document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('cardContainer');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.getElementById('closeBtn');
  const themeToggle = document.getElementById('themeToggle');
  const htmlDoc = document.documentElement;

  // Render Cards
  foundationData.forEach((item) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p style="opacity: 0.8; font-size: 0.9rem;">คลิกเพื่อดูรายละเอียดเพิ่มเติม</p>
    `;
    
    card.addEventListener('click', () => {
      openModal(item);
    });

    cardContainer.appendChild(card);
  });

  // Modal Functions
  function openModal(data) {
    modalTitle.innerHTML = `${data.icon} ${data.title}`;
    
    const detailsHtml = data.details.map(detail => `<li>${detail}</li>`).join('');
    modalContent.innerHTML = `<ul>${detailsHtml}</ul>`;
    
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Theme Toggle Functionality
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlDoc.getAttribute('data-theme');
    if (currentTheme === 'light') {
      htmlDoc.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      htmlDoc.setAttribute('data-theme', 'light');
      themeToggle.textContent = '🌙';
    }
  });
});
