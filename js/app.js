// WetterCheck
// Wetterdaten von open-meteo.com, Videos von pexels.com

let wetter;
let tag = 0;

let videos = {
  sonne: 'https://videos.pexels.com/video-files/4999931/4999931-hd_1280_720_30fps.mp4',
  wolken: 'https://videos.pexels.com/video-files/17499303/17499303-hd_1280_720_30fps.mp4',
  regen: 'https://videos.pexels.com/video-files/15419572/15419572-hd_1280_720_30fps.mp4',
  wind: 'https://videos.pexels.com/video-files/2530656/2530656-hd_1280_720_30fps.mp4'
};

function fehler(text) {
  document.getElementById('beschreibung').innerHTML = text;
}

async function ortSuchen(name) {
  let daten;
  try {
    let antwort = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=de&name=' + name);
    daten = await antwort.json();
  } catch (e) {
    fehler('Keine Verbindung. Bitte später nochmal versuchen.');
    return;
  }

  if (daten.results == undefined) {
    document.getElementById('beschreibung').innerHTML = 'Ort nicht gefunden';
    return;
  }

  let ort = daten.results[0];
  wetterLaden(ort.name, ort.latitude, ort.longitude);
}

async function wetterLaden(name, lat, lon) {
  document.getElementById('ortsname').innerHTML = name;
  fehler('Wetter wird geladen...');
  ortMerken(name, lat, lon);

  try {
    let antwort = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon
      + '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m'
      + '&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max'
      + '&timezone=auto');
    wetter = await antwort.json();
  } catch (e) {
    fehler('Keine Verbindung. Bitte später nochmal versuchen.');
    return;
  }

  zeigeWetter();
  tagAuswaehlen(0);
}

function suchen() {
  let eingabe = document.getElementById('ort').value;
  document.getElementById('vorschlaege').innerHTML = '';

  if (eingabe != '') {
    ortSuchen(eingabe);
  }
}

async function vorschlaegeLaden() {
  let eingabe = document.getElementById('ort').value;
  let liste = document.getElementById('vorschlaege');

  if (eingabe.length < 2) {
    liste.innerHTML = '';
    return;
  }

  let daten;
  try {
    let antwort = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=de&name=' + eingabe);
    daten = await antwort.json();
  } catch (e) {
    return;
  }
  liste.innerHTML = '';

  if (daten.results == undefined) {
    return;
  }

  for (let ort of daten.results) {
    let eintrag = document.createElement('li');
    eintrag.textContent = ort.name + ', ' + ort.country;
    eintrag.onclick = function () {
      document.getElementById('ort').value = '';
      wetterLaden(ort.name, ort.latitude, ort.longitude);
    };
    liste.appendChild(eintrag);
  }
}

function standortLaden() {
  if (!navigator.geolocation) {
    fehler('Dein Browser kann den Standort nicht abfragen.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      wetterLaden('Mein Standort', position.coords.latitude, position.coords.longitude);
    },
    function () {
      fehler('Standort nicht erlaubt. Bitte einen Ort eingeben.');
    }
  );
}

// Klick irgendwo schließt die Vorschläge
document.onclick = function () {
  document.getElementById('vorschlaege').innerHTML = '';
};

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
  let jetzt = wetter.current;
  let min = Math.round(wetter.daily.temperature_2m_min[0]);
  let max = Math.round(wetter.daily.temperature_2m_max[0]);

  document.getElementById('temperatur').innerHTML = Math.round(jetzt.temperature_2m) + ' °C';
  document.getElementById('beschreibung').innerHTML = wetterText(jetzt.weather_code);
  document.getElementById('details').innerHTML = 'Gefühlt ' + Math.round(jetzt.apparent_temperature) + ' °C, heute ' + min + ' bis ' + max + ' °C<br>'
    + 'Wind: ' + Math.round(jetzt.wind_speed_10m) + ' km/h, Regen: ' + wetter.daily.precipitation_probability_max[0] + ' %';
}

function zeigeVideo(code, wind) {
  let name = 'wolken';
  let text = wetterText(code);

  if (text == 'Sonnig' || text == 'Leicht bewölkt') {
    name = 'sonne';
  }
  if (wind >= 30) {
    name = 'wind';
  }
  if (text == 'Regen' || text == 'Gewitter') {
    name = 'regen';
  }

  let video = document.getElementById('hintergrund');
  if (video.src != videos[name]) {
    video.src = videos[name];
  }
}

function tagName(i) {
  if (i == 0) {
    return 'heute';
  }
  if (i == 1) {
    return 'morgen';
  }

  let wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  let datum = new Date(wetter.daily.time[i]);
  return wochentage[datum.getDay()];
}

function tagAuswaehlen(i) {
  if (wetter == undefined) {
    return;
  }

  tag = i;
  zeigeVorhersage();
  zeigeKleidung();

  if (i == 0) {
    zeigeVideo(wetter.current.weather_code, wetter.current.wind_speed_10m);
  } else {
    zeigeVideo(wetter.daily.weather_code[i], wetter.daily.wind_speed_10m_max[i]);
  }
}

function zeigeVorhersage() {
  let tage = document.getElementById('tage').value;
  let d = wetter.daily;
  document.getElementById('anzahl').innerHTML = tage;

  let html = '<tr><th>Tag</th><th>Wetter</th><th>Min</th><th>Max</th><th>Regen</th></tr>';

  for (let i = 0; i < tage; i++) {
    let klasse = '';
    if (i == tag) {
      klasse = 'gewaehlt';
    }

    html += '<tr class="' + klasse + '" onclick="tagAuswaehlen(' + i + ')">'
      + '<td>' + tagName(i) + '</td>'
      + '<td>' + wetterText(d.weather_code[i]) + '</td>'
      + '<td>' + Math.round(d.temperature_2m_min[i]) + ' °C</td>'
      + '<td>' + Math.round(d.temperature_2m_max[i]) + ' °C</td>'
      + '<td>' + d.precipitation_probability_max[i] + ' %</td>'
      + '</tr>';
  }

  document.getElementById('vorhersage').innerHTML = html;
}

function zeigeKleidung() {
  let temp = wetter.daily.apparent_temperature_max[tag];
  let regen = wetter.daily.precipitation_probability_max[tag];
  let code = wetter.daily.weather_code[tag];

  document.getElementById('kleidung-titel').innerHTML = 'Kleidung für ' + tagName(tag);

  let teile = [
    ['T-Shirt', 'tshirt', temp >= 20],
    ['Hoodie', 'hoodie', temp >= 10 && temp < 20],
    ['Jacke', 'jacke', temp < 10],
    ['Haube', 'haube', temp < 5],
    ['Lange Hose', 'hose', temp < 22],
    ['Kurze Hose', 'kurzehose', temp >= 22],
    ['Regenschirm', 'regenschirm', regen >= 40],
    ['Sonnenbrille', 'sonnenbrille', code <= 1]
  ];

  let html = '';
  let passend = [];

  for (let teil of teile) {
    html += karte(teil[0], teil[1], teil[2]);
    if (teil[2]) {
      passend.push(teil[0]);
    }
  }

  document.getElementById('kleidung').innerHTML = html;
  document.getElementById('empfehlung').innerHTML = 'Gefühlt bis ' + Math.round(temp) + ' °C. Am besten: ' + passend.join(', ');
}

function karte(name, bild, passt) {
  let klasse = 'rot';
  let text = 'passt nicht';

  if (passt) {
    klasse = 'gruen';
    text = 'passt';
  }

  return '<li class="' + klasse + '"><img src="bilder/' + bild + '.svg" alt="' + name + '"><b>' + name + '</b><br>' + text + '</li>';
}

// manche Browser sperren localStorage, dann einfach ohne Merken weiter
function ortMerken(name, lat, lon) {
  try {
    localStorage.setItem('ort', JSON.stringify({ name: name, lat: lat, lon: lon }));
  } catch (e) {
  }
}

function gemerkterOrt() {
  try {
    return JSON.parse(localStorage.getItem('ort'));
  } catch (e) {
    return null;
  }
}

// Video erst zeigen, wenn es wirklich läuft
document.getElementById('hintergrund').onplaying = function () {
  this.style.opacity = 1;
};

// zuletzt gesuchten Ort laden, sonst Linz
let ort = gemerkterOrt();
if (ort) {
  wetterLaden(ort.name, ort.lat, ort.lon);
} else {
  wetterLaden('Linz', 48.31, 14.29);
}
