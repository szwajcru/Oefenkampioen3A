// changelog.js: data + renderlogica

const changelog = [
  {
    version: '2.00',
    changes: [
      { type: 'Toegevoegd', description: 'Centraal menu venster' },
      { type: 'Toegevoegd', description: 'Je kunt nu per anker zien welke woordjes hoe vaak zijn aangeboden.' },
    ]
  },
  {
    version: '1.17',
    changes: [
      { type: 'Toegevoegd', description: 'Oefensite maakt gebruik van serviceworker, voor betere UI ervaring' },
    ]
  },
  {
    version: '1.16',
    changes: [
      { type: 'Bugfix', description: 'Contact formulier uitlijning' },
    ]
  },
  {
    version: '1.15',
    changes: [
      { type: 'Toegevoegd', description: 'Individuele resultaten (grafieken) per anker' },
      { type: 'Toegevoegd', description: 'Snuffel woordjes bij anker 2' },
    ]
  },
  {
    version: '1.14',
    changes: [
      { type: 'Toegevoegd', description: 'Registratie van fout gelezen woordjes per meting' },
      { type: 'Toegevoegd', description: 'Mogelijkheid om te oefenen met de woordjes uit "Mijn herkansjes"' },
      { type: 'Toegevoegd', description: 'Optie om individuele woordjes te verwijderen uit "Mijn herkansjes"' },
    ]
  },
  {
    version: '1.13',
    changes: [
      { type: 'Toegevoegd', description: 'Optie om foute metingen te verwijderen.' },
    ]
  },
  {
    version: '1.12',
    changes: [
      { type: 'Toegevoegd', description: 'Gebruikers zien nu hun voortgang in een grafiek bij oefentype "ankers".' },
    ]
  },
  {
    version: '1.11',
    changes: [
      { type: 'Toegevoegd', description: 'Anker woordjes voor anker 2 tm 8' },
      { type: 'Toegevoegd', description: 'Klank woordjes om mee te oefenen van de juffen' }
    ]
  },
  {
    version: '1.10',
    changes: [
      { type: 'Bugfix', description: 'Klank selectie niet responsief' },
    ]
  },
  {
    version: '1.09',
    changes: [
      { type: 'Toegevoegd', description: 'Sliders bij klank secties om snel aan en uit te kunnen zetten' },
    ]
  },
  {
    version: '1.08',
    changes: [
      { type: 'Gewijzigd', description: 'Geen timer bij flitsen' },
      { type: 'Gewijzigd', description: 'Klinkers hernoemd naar klanken' },
      { type: 'Toegevoegd', description: 'Ontbrekende klanken' }
    ]
  },
  {
    version: '1.07',
    changes: [
      { type: 'Bugfix', description: 'Dynamische header woordjes/klanken bij start toets' }
    ]
  },
  {
    version: '1.06',
    changes: [
      { type: 'Toegevoegd', description: 'Flitslezen waarbij snelheid instelbaar is' }
    ]
  },
  {
    version: '1.05',
    changes: [
      { type: 'Toegevoegd', description: 'Extra uitdaging optie voor flitslezen' }
    ]
  },
  {
    version: '1.04',
    changes: [
      { type: 'Toegevoegd', description: 'Optie voor woordjes maken met de gekozen klanken' }
    ]
  },
  {
    version: '1.03',
    changes: [
      { type: 'Toegevoegd', description: 'Onderscheid oefenen met "puur" klanken of "woorden met klanken"' }
    ]
  },
  {
    version: '1.01',
    changes: [
      { type: 'Toegevoegd', description: 'Oefenen met klanken' }
    ]
  },
  {
    version: '1.00',
    changes: [
      { type: 'Toegevoegd', description: 'Oefenen met ankers' }
    ]
  }
];

// Tabel vullen
const tbody = document.querySelector('#changelogTable tbody');

changelog.forEach(entry => {
  entry.changes.forEach((change, index) => {
    const tr = document.createElement('tr');

    // versie alleen in de eerste rij tonen
    if (index === 0) {
      const tdVersion = document.createElement('td');
      tdVersion.className = 'version-cell';        // 👈 voeg deze toe
      tdVersion.textContent = entry.version;
      tdVersion.rowSpan = entry.changes.length;
      tr.appendChild(tdVersion);
    }


    // Type-kolom
    const tdType = document.createElement('td');
    tdType.classList.add('type-cell');
    const rawType = (change.type || '').trim();
    const normType = rawType.toLowerCase();           // 'toegevoegd' | 'gewijzigd' | 'bugfix'
    tdType.dataset.type = normType;                   // bepaalt icoon via CSS
    tdType.setAttribute('title', rawType);            // tooltip op hover
    tdType.textContent = '';                          // geen tekst tonen (compact)
    tr.appendChild(tdType);


    const tdDesc = document.createElement('td');
    tdDesc.textContent = change.description;
    tr.appendChild(tdDesc);

    tbody.appendChild(tr);
  });
});
