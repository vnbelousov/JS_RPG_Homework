const {
  Arm,
  Bow,
  Sword,
  Knife,
  Staff,
  LongBow,
  Axe,
  StormStaff
} = require('./weapon');

class Player {
  constructor(position, name) {
    this.life = 100;
    this.magic = 20;
    this.speed = 1;
    this.attack = 10;
    this.agility = 5;
    this.luck = 10;
    this.description = 'Игрок';
    this.weapon = new Arm();
    this.position = position;
    this.name = name;
    this.maxLife = this.life;
    this.maxMagic = this.magic;
  }

  getLuck() {
    return (Math.random() * 100 + this.luck) / 100;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) {
      return 0;
    }

    return (this.attack + this.weapon.getDamage()) * this.getLuck() / distance;
  }

  takeDamage(damage) {
    this.life = Math.max(0, this.life - damage);
  }

  isDead() {
    return this.life === 0;
  }

  moveLeft(distance) {
    this.position -= Math.min(Math.abs(distance), this.speed);
  }

  moveRight(distance) {
    this.position += Math.min(Math.abs(distance), this.speed);
  }

  move(distance) {
    if (distance < 0) {
      this.moveLeft(-distance);
    } else {
      this.moveRight(distance);
    }
  }

  isAttackBlocked() {
    return this.getLuck() > (100 - this.luck) / 100;
  }

  dodged() {
    return this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
  }

  takeAttack(damage) {
    if (this.isAttackBlocked()) {
      this.weapon.takeDamage(damage);
      console.log(`${this.name} блокирует удар оружием.`);
      this.checkWeapon();
    } else if (this.dodged()) {
      console.log(`${this.name} уклоняется от атаки.`);
    } else {
      const oldLife = this.life;
      this.takeDamage(damage);
      const actualDamage = oldLife - this.life;

      console.log(`${this.name} получает ${actualDamage.toFixed(2)} урона. Здоровье: ${this.life.toFixed(2)}.`);
    }
  }

  checkWeapon() {
    if (!this.weapon.isBroken()) {
      return;
    }

    if (this.weapon instanceof Knife) {
      this.weapon = new Arm();
    } else if (!(this.weapon instanceof Arm)) {
      this.weapon = new Knife();
    }

    console.log(`${this.name} теперь использует оружие: ${this.weapon.name}.`);
  }

  tryAttack(enemy) {
    if (this.isDead() || enemy.isDead()) {
      return;
    }

    const distance = Math.max(1, Math.abs(this.position - enemy.position));
    if (distance > this.weapon.range) {
      console.log(`${this.name} не достаёт до ${enemy.name}.`);
      return;
    }

    this.weapon.takeDamage(10 * this.getLuck());
    let damage = this.getDamage(distance);

    if (this.position === enemy.position) {
      enemy.position += 1;
      damage *= 2;
      console.log(`${this.name} отбрасывает ${enemy.name} на одну позицию вправо.`);
    }

    console.log(`${this.name} атакует ${enemy.name} (${this.weapon.name}).`);
    enemy.takeAttack(damage);
    this.checkWeapon();
  }

  chooseEnemy(players) {
    let enemy = null;

    for (const player of players) {
      if (player === this || player.isDead()) {
        continue;
      }

      if (enemy === null || player.life < enemy.life) {
        enemy = player;
      }
    }

    return enemy;
  }

  moveToEnemy(enemy) {
    this.move(enemy.position - this.position);
    console.log(`${this.name} перемещается на позицию ${this.position}.`);
  }

  turn(players) {
    if (this.isDead()) {
      return;
    }

    const enemy = this.chooseEnemy(players);
    if (enemy === null) {
      return;
    }

    this.moveToEnemy(enemy);
    this.tryAttack(enemy);
  }
}

class Warrior extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 120;
    this.speed = 2;
    this.description = 'Воин';
    this.weapon = new Sword();
    this.maxLife = this.life;
  }

  takeDamage(damage) {
    if (this.life < this.maxLife / 2 && this.magic > 0 && this.getLuck() > 0.8) {
      this.magic = Math.max(0, this.magic - damage);
    } else {
      super.takeDamage(damage);
    }
  }
}

class Archer extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.magic = 35;
    this.attack = 5;
    this.agility = 10;
    this.description = 'Лучник';
    this.weapon = new Bow();
    this.maxLife = this.life;
    this.maxMagic = this.magic;
  }

  getDamage(distance) {
    if (distance > this.weapon.range) {
      return 0;
    }

    return (this.attack + this.weapon.getDamage()) * this.getLuck() * distance / this.weapon.range;
  }
}

class Mage extends Player {
  constructor(position, name) {
    super(position, name);
    this.life = 70;
    this.magic = 100;
    this.attack = 5;
    this.agility = 8;
    this.description = 'Маг';
    this.weapon = new Staff();
    this.maxLife = this.life;
    this.maxMagic = this.magic;
  }

  takeDamage(damage) {
    if (this.magic > this.maxMagic / 2) {
      this.magic = Math.max(0, this.magic - 12);
      super.takeDamage(damage / 2);
    } else {
      super.takeDamage(damage);
    }
  }
}

class Dwarf extends Warrior {
  constructor(position, name) {
    super(position, name);
    this.life = 130;
    this.attack = 15;
    this.luck = 20;
    this.description = 'Гном';
    this.weapon = new Axe();
    this.maxLife = this.life;
    this.hitsTaken = 0;
  }

  takeDamage(damage) {
    this.hitsTaken += 1;
    if (this.hitsTaken % 6 === 0 && this.getLuck() > 0.5) {
      damage /= 2;
    }

    super.takeDamage(damage);
  }
}

class Crossbowman extends Archer {
  constructor(position, name) {
    super(position, name);
    this.life = 85;
    this.attack = 8;
    this.agility = 20;
    this.luck = 15;
    this.description = 'Арбалетчик';
    this.weapon = new LongBow();
    this.maxLife = this.life;
  }
}

class Demiurge extends Mage {
  constructor(position, name) {
    super(position, name);
    this.life = 80;
    this.magic = 120;
    this.attack = 6;
    this.luck = 12;
    this.description = 'Демиург';
    this.weapon = new StormStaff();
    this.maxLife = this.life;
    this.maxMagic = this.magic;
  }

  getDamage(distance) {
    const damage = super.getDamage(distance);
    if (this.magic > 0 && damage > 0 && this.getLuck() > 0.6) {
      return damage * 1.5;
    }

    return damage;
  }
}

module.exports = {
  Player,
  Warrior,
  Archer,
  Mage,
  Dwarf,
  Crossbowman,
  Demiurge
};
