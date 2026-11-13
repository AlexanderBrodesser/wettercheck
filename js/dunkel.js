// Dark Mode ein- und ausschalten

function buttonTextAktualisieren() {
  let btn = document.getElementById('dunkel-btn');
  if (btn) {
    if (document.body.classList.contains('dunkel')) {
      btn.textContent = 'White Mode';
    } else {
      btn.textContent = 'Dark Mode';
    }
  }
}

function dunkelUmschalten() {
  document.body.classList.toggle('dunkel');
  buttonTextAktualisieren();

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

buttonTextAktualisieren();
