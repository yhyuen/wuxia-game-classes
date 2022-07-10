import Fightable from '../interfaces/fightable.js'
import { randChance, randRange } from '../utils/random.js'

class BattleStatus {
  fightable: Fightable
  completion: number

  tick(timeDelta: number): boolean {
    this.completion += this.fightable.rate * timeDelta

    if (this.completion >= 100) {
      return true
    }

    return false
  }

  reset() {
    this.completion = 0
  }
}

class Battle {
  player: Fightable
  playerStatus: BattleStatus
  enemy: Fightable
  enemyStatus: BattleStatus

  attacker: Fightable
  defender: Fightable
  
  completion: number

  // callback: () => void
  
  static BATTLE_STATE = { BATTLING: 0, WIN: 1, LOSE: 2 }
  static ROUND_STATE = { HIT: 0, SUPPRESS: 1, PARRY: 2, DODGE: 3, TURNAROUND: 4, DROP: 5 }
  static ATTACK_STAMINA = 3
  static PARRY_STAMINA = 2
  static DODGE_STAMINA = 1
  static DROP_STAMINA = 1

  constructor(player: Fightable, enemy: Fightable) {
    this.player = player
    this.enemy = enemy
  }
  
  end(state: number) {
    console.log(state)
    return true
  }

  tick(timeDelta: number) {
    this.completion += timeDelta

    while (this.completion >= 2000) {
      if (this.player.health <= 0) {
        this.end(Battle.BATTLE_STATE.LOSE)

        return true
      }
      if (this.enemy.health <= 0) {
        this.end(Battle.BATTLE_STATE.WIN)
        
        return true
      }
    }

    return false
  }

  decideAttacker() {
    const characterAttackRate = 0.5

    if (randChance(characterAttackRate)) {
      this.attacker = this.player
      this.defender = this.enemy
    } else {
      this.attacker = this.enemy
      this.defender = this.player
    }
  }

  decideSwitchAttacker() {
    if (this.attacker.rate <= 0.8) {
      [this.attacker, this.defender] = [this.defender, this.attacker]
    }
  }

  dealDamage(reciever: Fightable, damage: number) {
    reciever.health -= damage
    // for (var type in damage) {
    //   if (reciever.defense[type]) {
    //     reciever.currentHealth -= reciever.defense[type] >= damage[type] ? 0 : damage[type] - reciever.defense[type]
    //   } else {
    //     reciever.currentHealth -= damage[type]
    //   }
    //   if (reciever.currentHealth <= 0) {
    //     reciever.currentHealth = 0
    //     break
    //   }
    // }
  }

  useStamina(user: Fightable, stamina: number) {
    user.stamina = Math.max(0, user.stamina - stamina)
  }

  executeRound() {
    const result = this.attack(this.attacker, this.defender)
    console.log(result.state)
    switch (result.state) {
    case Battle.ROUND_STATE.HIT: // -Both stamina, -Defender currentHealth
      this.useStamina(this.attacker, Battle.ATTACK_STAMINA)
      this.useStamina(this.defender, Battle.PARRY_STAMINA)
      this.dealDamage(this.defender, result.damage)
      break
    case Battle.ROUND_STATE.SUPPRESS: // -Both Stamina, -Defender currentHealth
      this.useStamina(this.attacker, Battle.ATTACK_STAMINA)
      this.useStamina(this.defender, Battle.PARRY_STAMINA)
      this.dealDamage(this.defender, result.damage)
      break
    case Battle.ROUND_STATE.PARRY: // -Both Stamina
      this.useStamina(this.attacker, Battle.ATTACK_STAMINA)
      this.useStamina(this.defender, Battle.PARRY_STAMINA)
      break
    case Battle.ROUND_STATE.DODGE: // -Both Stamina
      this.useStamina(this.attacker, Battle.ATTACK_STAMINA)
      this.useStamina(this.defender, Battle.DODGE_STAMINA)
      break
    case Battle.ROUND_STATE.TURNAROUND: // -Both Stamina
      this.useStamina(this.attacker, Battle.ATTACK_STAMINA)
      this.useStamina(this.defender, Battle.ATTACK_STAMINA)
      this.dealDamage(this.attacker, result.damage)
      break
    case Battle.ROUND_STATE.DROP:
      this.useStamina(this.attacker, Battle.DROP_STAMINA)
      break
    }
    this.decideSwitchAttacker()
    return result
  }

  // ATTACK RELATED

  getAttackCompletionRate(attacker: Fightable) { //TEMP
    // if (attacker.skill) return this.minmaxRandom(Skill.levelCompletion[attacker.skill.level])
    // else return this.minmaxRandom({ min: 0, max: 1.0 })
    return randRange(0, 1)
  }

  getDefendCompletionRate(defender: Fightable) { //TEMP
    // if (defender.skill) return this.minmaxRandom(Skill.levelCompletion[defender.skill.level])
    // else return this.minmaxRandom({ min: 0, max: 1.0 })
    return randRange(0, 1)
  }

  getAttackDropRate(attacker: Fightable) { //TEMP
    // if (attacker.skillCompletion < 0.5) return 1 - attacker.skillCompletion
    // else return 0
    return 0
  }

  getTurnaroundRate(attacke: Fightable, defender: Fightable) { //TEMP
    return 0.5
  }

  getTurnaroundDamage(attacker: Fightable, defender: Fightable) {
    // Defender attacks here
    return defender.damage
  }

  getDodgeRate(attacker: Fightable, defender: Fightable) {
    return 0.3
  }

  getParryRate(attacker: Fightable, defender: Fightable) {
    return 0.3
  }

  getDamage(attacker: Fightable, defender: Fightable) {
    return attacker.damage
  }

  getSuppress(attacker: Fightable, defender: Fightable) {
    return randChance(0.15)
  }

  getSuppressDamage(attacker: Fightable, defender: Fightable) {
    return attacker.damage
  }

  attack(attacker: Fightable, defender: Fightable) {
    const attackerSkillCompletion = this.getAttackCompletionRate(attacker)
    const attackDropRate = this.getAttackDropRate(attacker)
    const defenderSkillCompletion = this.getDefendCompletionRate(defender)
    const turnaroundRate = this.getTurnaroundRate(attacker, defender)

    if (!randChance(turnaroundRate)) { // Fails to Turnaround

      if (!randChance(attackDropRate)) { // Attacks
        const dodgeRate = this.getDodgeRate(attacker, defender)

        if (!randChance(dodgeRate)) { // Hit
          const parryRate = this.getParryRate(attacker, defender)

          if (!randChance(parryRate)) { // Hit
            return { state: Battle.ROUND_STATE.HIT, damage: this.getDamage(attacker, defender) }
          } else { // Parry
            if (this.getSuppress(attacker, defender)) { // Suppress
              return { state: Battle.ROUND_STATE.SUPPRESS, damage: this.getSuppressDamage(attacker, defender) }
            } else { // Parry
              return { state: Battle.ROUND_STATE.PARRY }
            }
          }
        } else { // Dodge
          return { state: Battle.ROUND_STATE.DODGE }
        }
      } else { // Drops attack
        return { state: Battle.ROUND_STATE.DROP }
      }
    } else { // Turnaround
      return { state: Battle.ROUND_STATE.TURNAROUND, damage: this.getTurnaroundDamage(attacker, defender) }
    }
  }
}

export default Battle
