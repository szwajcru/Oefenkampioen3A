// ===== Data =====
const ankers = {
  1: ['rek', 'maak', 'sik', 'aas', 'baas', 'meer', 'sip', 'been', 'vis', 'vaar', 'boon', 'paar', 'roos', 'kook', 'bek', 'rook', 'voor', 'boor', 'naar', 'peer', 'kaak', 'oom', 'mis', 'ree', 'naam', 'veer', 'mes', 'raam', 'kaas', 'kraak', 'snik', 'prik', 'smaak', 'spook'],
  2: ['roer', 'moes', 'sap', 'pak', 'dip', 'teen', 'dijk', 'oen', 'zin', 'das', 'baan', 'mus', 'hoop', 'bus', 'hap', 'toen', 'vik', 'zus', 'pit', 'zoen', 'man', 'hoop', 'vis', 'zeer', 'voer', 'zoet', 'rijp', 'buk', 'doet', 'troep', 'hark', 'moest', 'bukt', 'prijs'],
  3: ['woon', 'heus', 'veer', 'mok', 'waak', 'baas', 'huur', 'soep', 'biet', 'waas', 'hun', 'buur', 'was', 'sok', 'haar', 'pier', 'lus', 'wiel', 'neus', 'hiel', 'vuur', 'keus', 'heer', 'jet', 'poes', 'loon', 'wiek', 'rook', 'leuk', 'pomp', 'buurt', 'stuur', 'blaas', 'stoer'],
  4: ['saus', 'ring', 'jouw', 'geef', 'tang', 'gek', 'reus', 'paul', 'wieg', 'fop', 'zeep', 'zus', 'lach', 'paus', 'fout', 'vang', 'mouw', 'bang', 'acht', 'dier', 'hei', 'beuk', 'lauw', 'auto', 'geit', 'muis', 'ijs', 'guur', 'pijl', 'blauw', 'graaf', 'slang', 'nacht', 'fiets'],
  5: ['schat', 'dief', 'scheur', 'wang', 'duif', 'schoot', 'voetbal', 'schaap', 'deur', 'schoen', 'berg', 'wolk', 'schip', 'wolf', 'buurman', 'denk', 'nacht', 'friet', 'kwijt', 'zondag', 'hart', 'brief', 'pink', 'schijn', 'klei', 'gips', 'plons', 'stamp', 'klont', 'sport', 'zwempak', 'zeilboot', 'zand', 'hond'],
  6: ['schroef', 'koprol', 'tuinbank', 'vloed', 'schoenzool', 'spons', 'schelp', 'boompje', 'stoeltje', 'klomp', 'schuur', 'feestje', 'dagboek', 'kroontje', 'sla', 'glad', 'jurk', 'slang', 'mond', 'jaszak', 'worst', 'spruit', 'schrift', 'drink', 'ronde', 'oogje', 'halve', 'minder', 'broeken', 'trouwring', 'pillen', 'poppen', 'bakker', 'kopen', 'mogen', 'neushoorn', 'eettafel', 'olifant'],
  7: ['maai', 'hooi', 'duimpje', 'ruggen', 'krijtje', 'goud', 'kippen', 'duikbril', 'loopfiets', 'hondje', 'huren', 'gebak', 'beloof', 'verhaal', 'rollen', 'geluid', 'ruw', 'nieuw', 'geeuw', 'kleurtje', 'beeld', 'verlies', 'bezoek', 'aanrecht', 'klussen', 'vlinder', 'feestmuts', 'dromen', 'sparen', 'voeten', 'leuning', 'haring', 'oordop', 'koeken', 'stukken', 'speeltuin', 'schommel', 'kieuw'],
  8: ['voeding', 'botsing', 'leunen', 'sierlijk', 'zonnig', 'nodig', 'getallen', 'verdriet', 'versieren', 'betalen', 'onkruid', 'bloempje', 'kraantje', 'dorst', 'standbeeld', 'telling', 'drukker', 'pinken', 'vlucht', 'brengen', 'steiger', 'zomer', 'tikkertje', 'propjes', 'groei', 'draai', 'klimmen', 'schuif', 'beestje', 'bessen', 'struiken', 'knappe', 'zitten', 'sporttas', 'bedankt', 'egels', 'vrienden', 'jaren'],
  "1-snuffel": [],
  "2-snuffel": ['klink', 'ruit', 'poets', 'geel', 'stomp', 'voordoen', 'tuinman', 'pink', 'web', 'sterk', 'buurman', 'voortuin', 'zink', 'nicht', 'gang', 'bult', 'schijn', 'klauw', 'prik', 'schuim', 'wacht', 'meid', 'krans', 'steunt', 'Teun', 'Hans', 'wasbak', 'sleep', 'stamp', 'sport'],
  "3-snuffel": [],
  "4-snuffel": [],
  "5-snuffel": [],
  "6-snuffel": [],
  "7-snuffel": [],
  "8-snuffel": [],

  9: ['Herhaal de woordjes die je eerder lastig vond.']  // wordt dynamisch gevuld
};  
window.ankers = ankers;