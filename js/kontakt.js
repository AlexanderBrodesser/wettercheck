// Kontaktformular
// GitHub Pages kann selbst keine Mails verschicken,
// deshalb wird das E-Mail-Programm mit der Nachricht geöffnet.

function nachrichtSenden() {
  let name = document.getElementById('name').value;
  let betreff = document.getElementById('betreff').value;
  let nachricht = document.getElementById('nachricht').value;

  let text = nachricht + '\n\nViele Grüße\n' + name;

  window.location.href = 'mailto:alexander.brodesser@tfs-haslach.at,lukas.gruber@tfs-haslach.at'
    + '?subject=' + encodeURIComponent(betreff)
    + '&body=' + encodeURIComponent(text);
}
