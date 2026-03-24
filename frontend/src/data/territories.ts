export const TERRITORIES_DATA = [
  // MIDGARD (12)
  { id: 'prontera', name: 'Prontera', kingdom: 'Midgard', coords: { x: 400, y: 500 }, connections: ['izlude', 'geffen', 'payon', 'aldebaran'] },
  { id: 'izlude', name: 'Izlude', kingdom: 'Midgard', coords: { x: 450, y: 550 }, connections: ['prontera', 'alberta', 'byalan'] },
  { id: 'geffen', name: 'Geffen', kingdom: 'Midgard', coords: { x: 300, y: 450 }, connections: ['prontera', 'glastheim', 'orc_village'] },
  { id: 'morroc', name: 'Morroc', kingdom: 'Midgard', coords: { x: 350, y: 700 }, connections: ['prontera', 'comodo', 'sphinx_depths'] },
  { id: 'aldebaran', name: 'Al De Baran', kingdom: 'Midgard', coords: { x: 400, y: 350 }, connections: ['prontera', 'yggdrasil_root', 'lutie'] },
  { id: 'payon', name: 'Payon', kingdom: 'Midgard', coords: { x: 550, y: 600 }, connections: ['prontera', 'alberta', 'amatsum'] },
  { id: 'alberta', name: 'Alberta', kingdom: 'Midgard', coords: { x: 600, y: 650 }, connections: ['izlude', 'payon', 'kunlun'] },
  { id: 'orc_village', name: 'Orc Village', kingdom: 'Midgard', coords: { x: 250, y: 500 }, connections: ['geffen', 'umbala'] },
  { id: 'lutie', name: 'Lutie', kingdom: 'Midgard', coords: { x: 500, y: 250 }, connections: ['aldebaran', 'ice_dungeon'] },
  { id: 'comodo', name: 'Comodo', kingdom: 'Midgard', coords: { x: 200, y: 750 }, connections: ['morroc', 'umbala'] },
  { id: 'umbala', name: 'Umbala', kingdom: 'Midgard', coords: { x: 250, y: 650 }, connections: ['comodo', 'orc_village', 'yggdrasil_root'] },
  { id: 'lasagna', name: 'Lasagna', kingdom: 'Midgard', coords: { x: 700, y: 700 }, connections: ['alberta'] },

  // ASGARD (9)
  { id: 'valhalla', name: 'Valhalla Shrine', kingdom: 'Asgard', coords: { x: 800, y: 100 }, connections: ['odins_temple', 'asgard_fields'] },
  { id: 'odins_temple', name: 'Odin\'s Temple', kingdom: 'Asgard', coords: { x: 850, y: 150 }, connections: ['valhalla', 'bifrost'] },
  { id: 'yggdrasil_root', name: 'Yggdrasil Root', kingdom: 'Asgard', coords: { x: 350, y: 250 }, connections: ['aldebaran', 'umbala', 'vanaheim_gate'] },
  { id: 'vanaheim_gate', name: 'Vanaheim Gate', kingdom: 'Asgard', coords: { x: 900, y: 200 }, connections: ['yggdrasil_root', 'alfheim_city'] },
  { id: 'asgard_fields', name: 'Asgard Fields', kingdom: 'Asgard', coords: { x: 800, y: 200 }, connections: ['valhalla', 'midgard_bridge'] },
  { id: 'bifrost', name: 'Bifrost', kingdom: 'Asgard', coords: { x: 850, y: 250 }, connections: ['odins_temple', 'midgard_bridge'] },
  { id: 'midgard_bridge', name: 'Midgard Bridge', kingdom: 'Asgard', coords: { x: 750, y: 300 }, connections: ['asgard_fields', 'bifrost', 'prontera'] },
  { id: 'alfheim_city', name: 'Alfheim', kingdom: 'Asgard', coords: { x: 950, y: 250 }, connections: ['vanaheim_gate', 'jotunheim_border'] },
  { id: 'jotunheim_border', name: 'Jotunheim Border', kingdom: 'Asgard', coords: { x: 950, y: 350 }, connections: ['alfheim_city', 'ice_dungeon'] },

  // NIFLHEIM (5)
  { id: 'niflheim_city', name: 'Niflheim City', kingdom: 'Niflheim', coords: { x: 900, y: 800 }, connections: ['hels_gate', 'niflheim_dungeon'] },
  { id: 'hels_gate', name: 'Hel\'s Gate', kingdom: 'Niflheim', coords: { x: 850, y: 850 }, connections: ['niflheim_city', 'umbala'] },
  { id: 'niflheim_dungeon', name: 'Nifflheim Dungeon', kingdom: 'Niflheim', coords: { x: 950, y: 850 }, connections: ['niflheim_city', 'niflheim_swamp'] },
  { id: 'niflheim_swamp', name: 'Nifflheim Swamp', kingdom: 'Niflheim', coords: { x: 900, y: 900 }, connections: ['niflheim_dungeon', 'yggdrasil_seed'] },
  { id: 'yggdrasil_seed', name: 'Yggdrasil Seed', kingdom: 'Niflheim', coords: { x: 950, y: 950 }, connections: ['niflheim_swamp'] },

  // MUSPELHEIM (7)
  { id: 'magma_dungeon', name: 'Magma Dungeon', kingdom: 'Muspelheim', coords: { x: 100, y: 400 }, connections: ['fire_cave', 'biolabs'] },
  { id: 'fire_cave', name: 'Fire Cave', kingdom: 'Muspelheim', coords: { x: 50, y: 450 }, connections: ['magma_dungeon', 'thor_volcano'] },
  { id: 'biolabs', name: 'Biolabs', kingdom: 'Muspelheim', coords: { x: 150, y: 450 }, connections: ['magma_dungeon', 'thanatos_tower'] },
  { id: 'thanatos_tower', name: 'Thanatos Tower', kingdom: 'Muspelheim', coords: { x: 100, y: 300 }, connections: ['biolabs', 'glastheim'] },
  { id: 'thor_volcano', name: 'Thor Volcano', kingdom: 'Muspelheim', coords: { x: 50, y: 600 }, connections: ['fire_cave', 'sphinx_depths'] },
  { id: 'sphinx_depths', name: 'Sphinx Depths', kingdom: 'Muspelheim', coords: { x: 150, y: 700 }, connections: ['thor_volcano', 'morroc'] },
  { id: 'glastheim', name: 'Glast Heim', kingdom: 'Muspelheim', coords: { x: 100, y: 500 }, connections: ['thanatos_tower', 'geffen'] },

  // ALFHEIM (5)
  { id: 'louyang', name: 'Louyang', kingdom: 'Alfheim', coords: { x: 800, y: 500 }, connections: ['kunlun', 'ayothaya'] },
  { id: 'kunlun', name: 'Kunlun', kingdom: 'Alfheim', coords: { x: 750, y: 550 }, connections: ['louyang', 'alberta'] },
  { id: 'ayothaya', name: 'Ayothaya', kingdom: 'Alfheim', coords: { x: 850, y: 550 }, connections: ['louyang', 'amatsu'] },
  { id: 'amatsu', name: 'Amatsu', kingdom: 'Alfheim', coords: { x: 800, y: 600 }, connections: ['ayothaya', 'dewata', 'payon'] },
  { id: 'dewata', name: 'Dewata', kingdom: 'Alfheim', coords: { x: 850, y: 650 }, connections: ['amatsu'] },

  // JOTUNHEIM (4)
  { id: 'ice_dungeon', name: 'Ice Dungeon', kingdom: 'Jotunheim', coords: { x: 700, y: 200 }, connections: ['lutie', 'jotunheim_border', 'lutie_north'] },
  { id: 'lutie_north', name: 'Lutie North', kingdom: 'Jotunheim', coords: { x: 650, y: 150 }, connections: ['ice_dungeon', 'gonryun'] },
  { id: 'gonryun', name: 'Gonryun', kingdom: 'Jotunheim', coords: { x: 600, y: 100 }, connections: ['lutie_north', 'niflheim_tundra'] },
  { id: 'niflheim_tundra', name: 'Nifflheim Tundra', kingdom: 'Jotunheim', coords: { x: 750, y: 100 }, connections: ['gonryun'] },
];

export const KINGDOMS_DATA = {
  'Midgard': { bonus: 7, territories: 12 },
  'Asgard': { bonus: 5, territories: 9 },
  'Niflheim': { bonus: 2, territories: 5 },
  'Muspelheim': { bonus: 4, territories: 7 },
  'Alfheim': { bonus: 3, territories: 5 },
  'Jotunheim': { bonus: 3, territories: 4 },
};
