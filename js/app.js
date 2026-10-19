// WetterCheck
// Die Wetterdaten kommen von open-meteo.com

let wetter;
let vorschlaege = [];

// Koordinaten zu einem Ortsnamen suchen, dann das Wetter laden
async function ortSuchen(name) {
  try {
    let antwort = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=de&name=' + name);
    let daten = await antwort.json();

    if (daten.results == undefined) {
      document.getElementById('beschreibung').innerHTML = 'Ort nicht gefunden';
      return;
    }

    let ort = daten.results[0];
    wetterLaden(ort.name, ort.latitude, ort.longitude);
  } catch (fehler) {
    document.getElementById('beschreibung').innerHTML = 'Fehler beim Suchen vom Ort';
  }
}

async function wetterLaden(name, lat, lon) {
  document.getElementById('beschreibung').innerHTML = 'Wetter wird geladen...';
  document.getElementById('ortsname').innerHTML = name;

  try {
    let antwort = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon
      + '&current=temperature_2m,weather_code,wind_speed_10m'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      + '&timezone=auto');
    wetter = await antwort.json();
  } catch (fehler) {
    document.getElementById('beschreibung').innerHTML = 'Fehler beim Laden der Wetterdaten';
    return;
  }

  zeigeWetter();
  zeigeVorhersage();
  zeigeKleidung();
}

// prüft, ob die Eingabe ein Vorschlag aus der Liste ist
function findeVorschlag(text) {
  for (let i = 0; i < vorschlaege.length; i++) {
    if (vorschlaege[i].text == text) {
      return vorschlaege[i];
    }
  }
  return null;
}

function suchen() {
  let eingabe = document.getElementById('ort').value;
  if (eingabe == '') {
    return;
  }

  let vorschlag = findeVorschlag(eingabe);
  if (vorschlag != null) {
    wetterLaden(vorschlag.name, vorschlag.lat, vorschlag.lon);
  } else {
    ortSuchen(eingabe);
  }
}

// wird bei jeder Eingabe im Suchfeld aufgerufen
async function vorschlaegeLaden() {
  let eingabe = document.getElementById('ort').value;

  // wenn ein Vorschlag angeklickt wurde, gleich das Wetter laden
  let vorschlag = findeVorschlag(eingabe);
  if (vorschlag != null) {
    wetterLaden(vorschlag.name, vorschlag.lat, vorschlag.lon);
    return;
  }

  if (eingabe.length < 2) {
    return;
  }

  let antwort = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=de&name=' + eingabe);
  let daten = await antwort.json();

  let liste = document.getElementById('vorschlaege');
  liste.innerHTML = '';
  vorschlaege = [];

  if (daten.results == undefined) {
    return;
  }

  for (let i = 0; i < daten.results.length; i++) {
    let ort = daten.results[i];

    let text = ort.name;
    if (ort.admin1 != undefined) {
      text += ', ' + ort.admin1;
    }
    if (ort.country != undefined) {
      text += ', ' + ort.country;
    }

    vorschlaege.push({ text: text, name: ort.name, lat: ort.latitude, lon: ort.longitude });

    let option = document.createElement('option');
    option.value = text;
    liste.appendChild(option);
  }
}

function wetterText(code) {
  if (code == 0) {
    return 'Sonnig';
  } else if (code <= 2) {
    return 'Leicht bewölkt';
  } else if (code == 3) {
    return 'Bewölkt';
  } else if (code == 45 || code == 48) {
    return 'Nebel';
  } else if (code >= 71 && code <= 77) {
    return 'Schnee';
  } else if (code >= 95) {
    return 'Gewitter';
  } else {
    return 'Regen';
  }
}

function zeigeWetter() {
  let temp = Math.round(wetter.current.temperature_2m);
  let wind = Math.round(wetter.current.wind_speed_10m);
  let regen = wetter.daily.precipitation_probability_max[0];
  let code = wetter.current.weather_code;

  document.getElementById('temperatur').innerHTML = temp + '°';
  document.getElementById('beschreibung').innerHTML = wetterText(code);
  document.getElementById('details').innerHTML = 'Wind: ' + wind + ' km/h, Regen: ' + regen + ' %';

  // Hintergrund je nach Wetter
  if (code <= 2) {
    document.body.className = 'sonne';
  } else if (code <= 48) {
    document.body.className = 'wolken';
  } else if (code >= 71 && code <= 77) {
    document.body.className = 'schnee';
  } else {
    document.body.className = 'regen';
  }
}

function zeigeVorhersage() {
  let tage = document.getElementById('tage').value;
  document.getElementById('anzahl').innerHTML = tage;

  if (wetter == undefined) {
    return;
  }

  let wochentage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  let html = '<tr><th>Tag</th><th>Wetter</th><th>Min</th><th>Max</th><th>Regen</th></tr>';

  for (let i = 0; i < tage; i++) {
    let datum = new Date(wetter.daily.time[i]);
    let tag = wochentage[datum.getDay()];
    if (i == 0) {
      tag = 'Heute';
    }

    html += '<tr>';
    html += '<td>' + tag + '</td>';
    html += '<td>' + wetterText(wetter.daily.weather_code[i]) + '</td>';
    html += '<td>' + Math.round(wetter.daily.temperature_2m_min[i]) + ' °C</td>';
    html += '<td>' + Math.round(wetter.daily.temperature_2m_max[i]) + ' °C</td>';
    html += '<td>' + wetter.daily.precipitation_probability_max[i] + ' %</td>';
    html += '</tr>';
  }

  document.getElementById('vorhersage').innerHTML = html;
}

function zeigeKleidung() {
  let temp = wetter.daily.temperature_2m_max[0];
  let regen = wetter.daily.precipitation_probability_max[0];

  let html = '';
  html += kleidungsstueck('T-Shirt', temp >= 20);
  html += kleidungsstueck('Hoodie', temp >= 10 && temp < 20);
  html += kleidungsstueck('Jacke', temp < 10);
  html += kleidungsstueck('Lange Hose', temp < 22);
  html += kleidungsstueck('Kurze Hose', temp >= 22);
  html += kleidungsstueck('Regenschirm', regen >= 40);

  document.getElementById('kleidung').innerHTML = html;
}

function kleidungsstueck(name, passt) {
  if (passt) {
    return '<li class="gruen">' + name + ': <span>passt</span></li>';
  } else {
    return '<li class="rot">' + name + ': <span>passt nicht</span></li>';
  }
}

wetterLaden('Linz', 48.3064, 14.2861);
