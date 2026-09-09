(() => {
  'use strict';

  window.scrollToTimeline = function scrollToTimeline() {
    document.querySelector('.content-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.openEra = function openEra(event, tabId) {
    document.querySelectorAll('.era-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    event.currentTarget.classList.add('active');
  };

  window.openEraModal = function openEraModal(name, detail) {
    window.alert(`${name}\n${detail}`);
  };

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top < windowHeight - 100) {
        element.classList.add('active');
      }
    });
  }

  function updateBackButton() {
    const button = document.getElementById('btnBackToGame');
    if (!button) return;
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;
    button.style.opacity = nearBottom ? '1' : '0';
    button.style.pointerEvents = nearBottom ? 'auto' : 'none';
  }

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('scroll', updateBackButton);
  revealOnScroll();
  updateBackButton();
})();
