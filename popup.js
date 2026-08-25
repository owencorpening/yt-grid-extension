const DEFAULTS = { cardWidth: 320, maxAgeDays: 0 };

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(DEFAULTS, (s) => {
    document.getElementById('cardWidth').value = s.cardWidth;
    document.getElementById('maxAgeDays').value = s.maxAgeDays;
  });
});

document.getElementById('save').addEventListener('click', () => {
  const cardWidth = parseInt(document.getElementById('cardWidth').value, 10) || DEFAULTS.cardWidth;
  const maxAgeDays = parseInt(document.getElementById('maxAgeDays').value, 10) || 0;
  chrome.storage.sync.set({ cardWidth, maxAgeDays }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved — refresh YouTube to apply';
    setTimeout(() => (status.textContent = ''), 2000);
  });
});
