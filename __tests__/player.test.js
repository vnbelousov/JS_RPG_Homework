const { Arm, Bow, Sword, Knife, Staff, LongBow, Axe, StormStaff } = require('../weapon');
const { Player, Warrior, Archer, Mage, Dwarf, Crossbowman, Demiurge } = require('../player');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Персонажи', () => {
  test('базовые характеристики и удача', () => {
    const player = new Player(10, 'Герой');

    expect(player.life).toBe(100);
    expect(player.magic).toBe(20);
    expect(player.speed).toBe(1);
    expect(player.attack).toBe(10);
    expect(player.agility).toBe(5);
    expect(player.luck).toBe(10);
    expect(player.description).toBe('Игрок');
    expect(player.weapon).toBeInstanceOf(Arm);
    expect(player.position).toBe(10);
    expect(player.name).toBe('Герой');
    expect(player.getLuck()).toBeCloseTo(0.6);
  });

  test.each([
    [Warrior, 120, 20, 2, 10, 5, 10, 'Воин', Sword],
    [Archer, 80, 35, 1, 5, 10, 10, 'Лучник', Bow],
    [Mage, 70, 100, 1, 5, 8, 10, 'Маг', Staff],
    [Dwarf, 130, 20, 2, 15, 5, 20, 'Гном', Axe],
    [Crossbowman, 85, 35, 1, 8, 20, 15, 'Арбалетчик', LongBow],
    [Demiurge, 80, 120, 1, 6, 8, 12, 'Демиург', StormStaff]
  ])('%s имеет нужные характеристики', (PlayerClass, life, magic, speed, attack, agility, luck, description, WeaponClass) => {
    const player = new PlayerClass(5, 'Герой');

    expect(player.life).toBe(life);
    expect(player.magic).toBe(magic);
    expect(player.speed).toBe(speed);
    expect(player.attack).toBe(attack);
    expect(player.agility).toBe(agility);
    expect(player.luck).toBe(luck);
    expect(player.description).toBe(description);
    expect(player.weapon).toBeInstanceOf(WeaponClass);
  });

  test('обычный удар зависит от расстояния и дальности', () => {
    const player = new Player(0, 'Герой');

    expect(player.getDamage(1)).toBeCloseTo(6.6);
    expect(player.getDamage(2)).toBe(0);
  });

  test('здоровье не становится отрицательным', () => {
    const player = new Player(0, 'Герой');
    player.takeDamage(20);

    expect(player.life).toBe(80);
    expect(player.isDead()).toBe(false);

    player.takeDamage(200);
    expect(player.life).toBe(0);
    expect(player.isDead()).toBe(true);
  });

  test('движение ограничено скоростью, поддерживает оба направления', () => {
    const warrior = new Warrior(6, 'Воин');
    warrior.moveLeft(5);
    expect(warrior.position).toBe(4);

    warrior.moveRight(2);
    expect(warrior.position).toBe(6);

    warrior.move(-3);
    expect(warrior.position).toBe(4);

    warrior.move(1);
    expect(warrior.position).toBe(5);
  });

  test('блок и уклонение зависят от удачи', () => {
    const player = new Player(0, 'Герой');
    player.getLuck = jest.fn().mockReturnValue(1);

    expect(player.isAttackBlocked()).toBe(true);
    expect(player.dodged()).toBe(true);

    player.getLuck.mockReturnValue(0);
    expect(player.isAttackBlocked()).toBe(false);
    expect(player.dodged()).toBe(false);
  });

  test('при блокировании повреждается оружие', () => {
    const warrior = new Warrior(0, 'Воин');
    warrior.isAttackBlocked = jest.fn().mockReturnValue(true);
    warrior.takeAttack(30);

    expect(warrior.life).toBe(120);
    expect(warrior.weapon.durability).toBe(470);
  });

  test('уклонение полностью отменяет урон', () => {
    const warrior = new Warrior(0, 'Воин');
    warrior.isAttackBlocked = jest.fn().mockReturnValue(false);
    warrior.dodged = jest.fn().mockReturnValue(true);
    warrior.takeAttack(30);

    expect(warrior.life).toBe(120);
    expect(warrior.weapon.durability).toBe(500);
  });

  test('обычная атака снимает здоровье', () => {
    const warrior = new Warrior(0, 'Воин');
    warrior.isAttackBlocked = jest.fn().mockReturnValue(false);
    warrior.dodged = jest.fn().mockReturnValue(false);
    warrior.takeAttack(30);

    expect(warrior.life).toBe(90);
  });

  test('сломанное оружие сменяется на нож, а нож на руку', () => {
    const player = new Warrior(0, 'Воин');
    player.weapon.durability = 0;
    player.checkWeapon();
    expect(player.weapon).toBeInstanceOf(Knife);

    player.weapon.durability = 0;
    player.checkWeapon();
    expect(player.weapon).toBeInstanceOf(Arm);

    player.checkWeapon();
    expect(player.weapon).toBeInstanceOf(Arm);
  });

  test('сломанное от блока оружие сразу меняется', () => {
    const player = new Warrior(0, 'Воин');
    player.weapon.durability = 5;
    player.isAttackBlocked = jest.fn().mockReturnValue(true);
    player.takeAttack(10);

    expect(player.weapon).toBeInstanceOf(Knife);
  });

  test('атака за пределами дальности не наносит урон', () => {
    const warrior = new Warrior(0, 'Воин');
    const enemy = new Player(5, 'Противник');
    enemy.takeAttack = jest.fn();
    warrior.tryAttack(enemy);

    expect(enemy.takeAttack).not.toHaveBeenCalled();
    expect(warrior.weapon.durability).toBe(500);
  });

  test('атака из допустимой позиции изнашивает оружие', () => {
    const warrior = new Warrior(0, 'Воин');
    const enemy = new Player(1, 'Противник');
    enemy.takeAttack = jest.fn();
    warrior.tryAttack(enemy);

    expect(enemy.takeAttack).toHaveBeenCalledWith(21);
    expect(warrior.weapon.durability).toBe(494);
    expect(enemy.position).toBe(1);
  });

  test('атака в одной клетке наносит двойной урон и отбрасывает врага', () => {
    const warrior = new Warrior(1, 'Воин');
    const enemy = new Player(1, 'Противник');
    enemy.takeAttack = jest.fn();
    warrior.tryAttack(enemy);

    expect(enemy.takeAttack).toHaveBeenCalledWith(42);
    expect(enemy.position).toBe(2);
  });

  test('мёртвый персонаж не атакует и не ходит', () => {
    const warrior = new Warrior(0, 'Воин');
    const enemy = new Player(1, 'Противник');
    warrior.life = 0;
    enemy.takeAttack = jest.fn();
    warrior.tryAttack(enemy);
    warrior.turn([warrior, enemy]);

    expect(enemy.takeAttack).not.toHaveBeenCalled();
  });

  test('мёртвого противника не атакуют', () => {
    const warrior = new Warrior(0, 'Воин');
    const enemy = new Player(1, 'Противник');
    enemy.life = 0;
    enemy.takeAttack = jest.fn();
    warrior.tryAttack(enemy);

    expect(enemy.takeAttack).not.toHaveBeenCalled();
  });

  test('выбирается живой противник с минимальным здоровьем', () => {
    const player = new Player(0, 'Герой');
    const wounded = new Player(1, 'Раненый');
    const healthy = new Player(2, 'Здоровый');
    const dead = new Player(3, 'Мёртвый');
    wounded.life = 20;
    dead.life = 0;

    expect(player.chooseEnemy([dead, player, healthy, wounded])).toBe(wounded);
    expect(player.chooseEnemy([player, dead])).toBe(null);
  });

  test('движение к противнику и последовательность хода', () => {
    const player = new Warrior(0, 'Герой');
    const enemy = new Player(6, 'Противник');
    player.moveToEnemy(enemy);
    expect(player.position).toBe(2);

    const move = jest.spyOn(player, 'moveToEnemy');
    const attack = jest.spyOn(player, 'tryAttack').mockImplementation(() => {});
    player.turn([player, enemy]);

    expect(move).toHaveBeenCalledWith(enemy);
    expect(attack).toHaveBeenCalledWith(enemy);
    expect(player.position).toBe(4);
  });

  test('воин при низком здоровье иногда тратит ману вместо здоровья', () => {
    const warrior = new Warrior(0, 'Воин');
    warrior.life = 50;
    warrior.getLuck = jest.fn().mockReturnValue(0.9);
    warrior.takeDamage(5);

    expect(warrior.life).toBe(50);
    expect(warrior.magic).toBe(15);

    warrior.getLuck.mockReturnValue(0.2);
    warrior.takeDamage(7);
    expect(warrior.life).toBe(43);

    warrior.magic = 0;
    warrior.getLuck.mockReturnValue(0.9);
    warrior.takeDamage(8);
    expect(warrior.life).toBe(35);
  });

  test('у лучника урон зависит от расстояния по специальной формуле', () => {
    const archer = new Archer(0, 'Лучник');

    expect(archer.getDamage(1)).toBeCloseTo(3);
    expect(archer.getDamage(3)).toBeCloseTo(9);
    expect(archer.getDamage(4)).toBe(0);
  });

  test('маг с достаточной маной получает половину урона', () => {
    const mage = new Mage(0, 'Маг');
    mage.takeDamage(50);
    expect(mage.life).toBe(45);
    expect(mage.magic).toBe(88);

    mage.magic = 50;
    mage.takeDamage(10);
    expect(mage.life).toBe(35);
    expect(mage.magic).toBe(50);
  });

  test('каждый шестой удар гнома ослабляется при достаточной удаче', () => {
    const dwarf = new Dwarf(0, 'Гном');
    dwarf.getLuck = jest.fn().mockReturnValue(0.6);

    for (let i = 0; i < 5; i++) {
      dwarf.takeDamage(10);
    }
    expect(dwarf.life).toBe(80);

    dwarf.takeDamage(10);
    expect(dwarf.life).toBe(75);
    expect(dwarf.hitsTaken).toBe(6);
  });

  test('шестой удар гнома не уменьшается при неудаче', () => {
    const dwarf = new Dwarf(0, 'Гном');
    dwarf.getLuck = jest.fn().mockReturnValue(0.3);

    for (let i = 0; i < 6; i++) {
      dwarf.takeDamage(5);
    }
    expect(dwarf.life).toBe(100);
  });

  test('демиург иногда увеличивает урон в полтора раза', () => {
    const demiurge = new Demiurge(0, 'Демиург');
    demiurge.getLuck = jest.fn().mockReturnValue(0.8);

    expect(demiurge.getDamage(1)).toBeCloseTo(19.2);

    demiurge.magic = 0;
    expect(demiurge.getDamage(1)).toBeCloseTo(12.8);

    demiurge.magic = 120;
    demiurge.getLuck.mockReturnValue(0.5);
    expect(demiurge.getDamage(1)).toBeCloseTo(8);
    expect(demiurge.getDamage(4)).toBe(0);
  });

  test('улучшенные персонажи наследуют специальные методы', () => {
    const dwarf = new Dwarf(0, 'Гном');
    const crossbowman = new Crossbowman(0, 'Арбалетчик');
    const demiurge = new Demiurge(0, 'Демиург');

    expect(dwarf).toBeInstanceOf(Warrior);
    expect(crossbowman).toBeInstanceOf(Archer);
    expect(demiurge).toBeInstanceOf(Mage);
    expect(crossbowman.getDamage(4)).toBeCloseTo(14.95);

    demiurge.takeDamage(20);
    expect(demiurge.life).toBe(70);
    expect(demiurge.magic).toBe(108);
  });
});
