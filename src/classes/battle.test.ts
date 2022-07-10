import Battle from './battle.js'
import Enemy from './enemy.js'

describe('Battles', () => {
  test('Fight', () => {
    const enemy = new Enemy()
    enemy.health = 100
    enemy.damage = 10
    enemy.stamina = 20

    const player = {
      health: 100,
      qiAmount: 100,
      stamina: 30,
      damage: 20,
      rate: 10,
      accuracy: 10,
      dodge: 10,
      parry: 10,
      defense: 10,
    }

    const battle = new Battle(player, enemy)

    while(!battle.tick(1)) {
      console.log(player.health, enemy.health)
    }
  })
})
