const {
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge
} = require('./player');
const { play } = require('./game');

const players = [
  new Warrior(0, 'Алёша'),
  new Archer(4, 'Леголас'),
  new Mage(8, 'Гендальф'),
  new Dwarf(12, 'Гимли'),
  new Crossbowman(16, 'Робин'),
  new Demiurge(20, 'Мерлин')
];

play(players);
