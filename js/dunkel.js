// Dark Mode ein- und ausschalten

function dunkelUmschalten() {
  document.body.classList.toggle('dunkel');

  try {
    localStorage.setItem('dunkel', document.body.classList.contains('dunkel'));
  } catch (e) {
  }
}

// Einstellung vom letzten Besuch übernehmen
try {
  if (localStorage.getItem('dunkel') == 'true') {
    document.body.classList.add('dunkel');
  }
} catch (e) {
}
