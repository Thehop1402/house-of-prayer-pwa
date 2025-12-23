function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');
}

// PWA install support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
