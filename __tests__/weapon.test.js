const {
  Weapon,
  Arm,
  Bow,
  Sword,
  Knife,
  Staff,
  LongBow,
  Axe,
  StormStaff
} = require('../weapon');

describe('Оружие', () => {
  test('базовый класс сохраняет характеристики', () => {
    const weapon = new Weapon('Старый меч', 20, 10, 1);

    expect(weapon.name).toBe('Старый меч');
    expect(weapon.attack).toBe(20);
    expect(weapon.initDurability).toBe(10);
    expect(weapon.range).toBe(1);
  });

  test('повреждение уменьшает прочность, но не ниже нуля', () => {
    const weapon = new Weapon('Старый меч', 20, 10, 1);
    weapon.takeDamage(5);
    expect(weapon.durability).toBe(5);

    weapon.takeDamage(50);
    expect(weapon.durability).toBe(0);
    expect(weapon.isBroken()).toBe(true);
  });

  test('урон уменьшается при прочности меньше 30%, а при поломке равен нулю', () => {
    const bow = new Bow();
    expect(bow.getDamage()).toBe(10);

    bow.takeDamage(140);
    expect(bow.getDamage()).toBe(10);

    bow.takeDamage(10);
    expect(bow.getDamage()).toBe(5);

    bow.takeDamage(100);
    expect(bow.getDamage()).toBe(0);
  });

  test('рука не ломается', () => {
    const arm = new Arm();
    arm.takeDamage(100000);

    expect(arm.durability).toBe(Infinity);
    expect(arm.isBroken()).toBe(false);
    expect(arm.getDamage()).toBe(1);
  });

  test.each([
    [Bow, 'Лук', 10, 200, 3],
    [Sword, 'Меч', 25, 500, 1],
    [Knife, 'Нож', 5, 300, 1],
    [Staff, 'Посох', 8, 300, 2],
    [LongBow, 'Длинный лук', 15, 200, 4],
    [Axe, 'Секира', 27, 800, 1],
    [StormStaff, 'Посох Бури', 10, 300, 3]
  ])('%s имеет характеристики из таблицы', (WeaponClass, name, attack, durability, range) => {
    const weapon = new WeaponClass();

    expect(weapon.name).toBe(name);
    expect(weapon.attack).toBe(attack);
    expect(weapon.durability).toBe(durability);
    expect(weapon.initDurability).toBe(durability);
    expect(weapon.range).toBe(range);
  });
});
