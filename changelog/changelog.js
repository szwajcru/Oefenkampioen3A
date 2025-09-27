// changelog.js: data + renderlogica

const changelog = [
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
      { type: 'Toegevoegd', description: 'Oefenen met woorden van geselecteerde klanken' }
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
      tdVersion.textContent = entry.version;
      tdVersion.rowSpan = entry.changes.length;
      tr.appendChild(tdVersion);
    }

    const tdType = document.createElement('td');
    tdType.textContent = change.type;
    tr.appendChild(tdType);

    const tdDesc = document.createElement('td');
    tdDesc.textContent = change.description;
    tr.appendChild(tdDesc);

    tbody.appendChild(tr);
  });
});
