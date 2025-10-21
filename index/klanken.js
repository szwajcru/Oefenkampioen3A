  // ===== Data =====

  const KLINKER_GROUPS = [
    { title: 'Korte/Lange klanken', pairs: [['i'], ['e', 'o', 'a', 'u'], ['ee', 'oo', 'aa', 'uu']] },
    { title: 'Tweeteken klanken 1', pairs: [['ie', 'eu', 'oe']] },
    { title: 'Tweeteken klanken 2', pairs: [['ou', 'ei'], ['au', 'ij', 'ui']] },
    //        { title: 'Klanken', pairs: [['b', 'd', 'f', 'g', 'h', 'j',], ['k', 'l', 'm', 'n', 'p', 'r', 's', 't'], ['v', 'w', 'z']] },
    { title: 'Overige klanken', pairs: [['ng', 'nk'], ['ch', 'sch']] }
  ];


  const KLINKER_WOORDEN = {
    'a': ['kat', 'jas', 'bak', 'man', 'tak', 'bal', 'zak', 'pan', 'rat', 'pan'],
    'e': ['pen', 'bek', 'nek', 'net', 'bel', 'hek', 'mes', 'weg', 'pet', 'en'],
    'i': ['vis', 'lip', 'kip', 'tik', 'pit', 'pin', 'vin', 'zin', 'rit', 'ik'],
    'o': ['kop', 'bos', 'zon', 'pot', 'rok', 'hok', 'sok', 'vos', 'mol', 'kok'],
    'u': ['bus', 'mus', 'rug', 'hut', 'put', 'mug', 'kus', 'dus', 'pup', 'lus'],
    'aa': ['maan', 'kaas', 'haak', 'zaag', 'baan', 'vaas', 'haan', 'raam', 'taart', 'laan'],
    'ee': ['been', 'zeep', 'veer', 'teen', 'meer', 'neef', 'leeg', 'beet', 'beer', 'veeg'],
    'ie': ['vier', 'diep', 'riet', 'ziek', 'dier', 'lied', 'mier', 'kies', 'fiets', 'tien'],
    'oo': ['boom', 'boot', 'noot', 'zoon', 'room', 'boon', 'hoop', 'kool', 'brood', 'rook'],
    'uu': ['muur', 'buur', 'vuur', 'duur', 'huur', 'kuur', 'stuur', 'zuur', 'puur', 'uur'],
    'oe': ['boek', 'koek', 'hoed', 'doek', 'zoen', 'snoep', 'broek', 'roep', 'zoek', 'boer'],
    'eu': ['neus', 'reus', 'leuk', 'beuk', 'geur', 'keus', 'heus', 'deuk', 'zeur', 'deur'],
    'ei': ['ei', 'geit', 'zeil', 'reis', 'plein', 'sein', 'klei', 'hei', 'klein', 'kei'],
    'ij': ['blij', 'fijn', 'ijs', 'mij', 'rij', 'zij', 'pijl', 'wij', 'vijl', 'hijs'],
    'ui': ['huis', 'muis', 'duif', 'ruit', 'puin', 'buik', 'luik', 'kuil', 'ruim', 'fruit'],
    'ou': ['goud', 'hout', 'fout', 'bout', 'koud', 'jouw', 'bouw', 'touw', 'hou', 'vouw'],
    'au': ['auto', 'lauw', 'pauw', 'kauw', 'saus', 'gauw', 'dauw', 'rauw', 'flauw', 'nauw'],

    'b': ['bal', 'boom', 'bus', 'been', 'bak', 'bont', 'boog', 'bok'],
    'd': ['dak', 'doos', 'deur', 'duif', 'dus', 'dun', 'denk', 'droom'],
    'f': ['fles', 'fiets', 'fijn', 'foto', 'film', 'fout', 'fluit', 'friet'],
    'g': ['geit', 'goud', 'glas', 'gans', 'goed', 'graag', 'groen', 'groot'],
    'h': ['huis', 'hoed', 'hand', 'hok', 'hout', 'hoorn', 'heel', 'hond'],
    'j': ['jas', 'jaar', 'juf', 'jong', 'jurk', 'jawel', 'jeuk', 'jop'],
    'k': ['kat', 'kop', 'koe', 'kaas', 'kous', 'klein', 'krab', 'kroon'],
    'l': ['lip', 'lamp', 'leer', 'luik', 'laag', 'lief', 'lucht', 'luid'],
    'm': ['man', 'mes', 'muis', 'mug', 'molen', 'maan', 'meer', 'mooi'],
    'n': ['neus', 'net', 'naam', 'noot', 'nu', 'naar', 'neer', 'nest'],
    'p': ['pen', 'pot', 'pauw', 'peer', 'punt', 'puree', 'plant', 'paal'],
    'r': ['rat', 'rok', 'raam', 'rook', 'ruim', 'ruif', 'rood', 'rond'],
    's': ['sap', 'slot', 'sok', 'stoel', 'sneeuw', 'stil', 'slang', 'snel'],
    't': ['tak', 'tent', 'tong', 'tuin', 'taart', 'touw', 'trein', 'trom'],
    'v': ['vis', 'vuur', 'vork', 'vader', 'vlag', 'vrolijk', 'veel', 'vier'],
    'w': ['water', 'wiel', 'wip', 'wolk', 'woord', 'woud', 'wesp', 'wand'],
    'z': ['zak', 'zoon', 'zand', 'zeep', 'zeil', 'zomer', 'zout', 'zon'],

    'ng': ['ring', 'lang', 'tong', 'slang', 'zang', 'bang', 'jong', 'sprong', 'zing', 'vang'],
    'nk': ['bank', 'dank', 'plank', 'flink', 'denk', 'pink', 'klank', 'wenk', 'zink', 'klonk'],
    'ch': ['lach', 'pech', 'dicht', 'licht', 'bocht', 'tocht', 'acht', 'nacht', 'recht', 'echt'],
    'sch': ['schaap', 'school', 'schip', 'schaar', 'schoen', 'schuur', 'schrik', 'schrift', 'schrob', 'schrijf'],
  };
