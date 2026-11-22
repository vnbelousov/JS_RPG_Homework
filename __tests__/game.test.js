const { Player } = require('../player');
const { play } = require('../game');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Поединки', () => {
  test('возвращается последний выживший', () => {
    const hero = new Player(0, 'Герой');
    const enemy = new Player(1, 'Противник');
    hero.turn = jest.fn(() => {
      enemy.life = 0;
    });
    enemy.turn = jest.fn();

    expect(play([hero, enemy])).toBe(hero);
    expect(hero.turn).toHaveBeenCalledTimes(1);
    expect(enemy.turn).not.toHaveBeenCalled();
  });

  test('один участник побеждает без боя', () => {
    const player = new Player(0, 'Герой');
    expect(play([player])).toBe(player);
  });

  test('пустой список не имеет победителя', () => {
    expect(play([])).toBe(null);
  });
});
