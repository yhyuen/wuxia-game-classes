class Stat {
  name: string
  experience: number
  experienceCap: number[]
  level: number

  grantExp(amount: number) {
    this.experience += amount

    while (this.experience >= this.experienceCap[this.level]) {
      this.experience -= this.experienceCap[this.level]
      this.level++
    }
  }

  grantLevel(amount: number) {
    this.level += amount
  }
}

export default Stat
