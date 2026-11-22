function play(players) {
  for (let round = 1; round <= 1000; round++) {
    const alivePlayers = players.filter((player) => !player.isDead());
    if (alivePlayers.length <= 1) {
      break;
    }

    console.log(`\nРаунд ${round}`);

    for (const player of players) {
      if (player.isDead()) {
        continue;
      }

      const fighters = players.filter((fighter) => !fighter.isDead());
      if (fighters.length <= 1) {
        break;
      }

      player.turn(fighters);
    }
  }

  const survivors = players.filter((player) => !player.isDead());
  if (survivors.length === 1) {
    console.log(`\nПобедитель: ${survivors[0].name}!`);
    return survivors[0];
  }

  console.log('\nПобедителя нет.');
  return null;
}

module.exports = { play };
