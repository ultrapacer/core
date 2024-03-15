import { sumBy } from 'lodash'

export class Factors {
  private _altitude: number = 1
  private _grade: number = 1
  private _terrain: number = 1
  private _heat: number = 1
  private _dark: number = 1
  private _fatigue: number = 1
  private _strategy: number = 1

  private _combined?: number

  constructor(value?: {
    altitude?: number
    grade?: number
    terrain?: number
    heat?: number
    dark?: number
    fatigue?: number
    strategy?: number
  }) {
    Object.assign(this, value)
  }

  init(val: number) {
    this._altitude = val
    this._grade = val
    this._terrain = val
    this._heat = val
    this._dark = val
    this._fatigue = val
    this._strategy = val
    return this
  }

  get altitude() {
    return this._altitude
  }
  set altitude(v) {
    this._altitude = v
    delete this._combined
  }
  get grade() {
    return this._grade
  }
  set grade(v) {
    this._grade = v
    delete this._combined
  }
  get terrain() {
    return this._terrain
  }
  set terrain(v) {
    this._terrain = v
    delete this._combined
  }
  get heat() {
    return this._heat
  }
  set heat(v) {
    this._heat = v
    delete this._combined
  }
  get dark() {
    return this._dark
  }
  set dark(v) {
    this._dark = v
    delete this._combined
  }
  get fatigue() {
    return this._fatigue
  }
  set fatigue(v) {
    this._fatigue = v
    delete this._combined
  }
  get strategy() {
    return this._strategy
  }
  set strategy(v) {
    this._strategy = v
    delete this._combined
  }

  get combined() {
    if (this._combined === undefined) {
      this._combined =
        this._altitude *
        this._grade *
        this._terrain *
        this._heat *
        this._dark *
        this._fatigue *
        this._strategy
    }
    return this._combined
  }

  /**
   * lookup a factor by name
   * @param name - factor name
   * @returns factor value
   */
  get(name: string): number {
    switch (name) {
      case 'altitude':
        return this.altitude
      case 'grade':
        return this.grade
      case 'terrain':
        return this.terrain
      case 'heat':
        return this.heat
      case 'dark':
        return this.dark
      case 'fatigue':
        return this.fatigue
      case 'strategy':
        return this.strategy

      default:
        throw new Error(`${name} is not a valid factor`)
    }
  }

  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(f: (val: number, factor2: number) => number, factors: Factors) {
    this._altitude = f(this._altitude, factors.altitude)
    this._grade = f(this._grade, factors.grade)
    this._terrain = f(this._terrain, factors.terrain)
    this._heat = f(this._heat, factors.heat)
    this._dark = f(this._dark, factors.dark)
    this._fatigue = f(this._fatigue, factors.fatigue)
    this._strategy = f(this._strategy, factors.strategy)
  }

  /**
   * scale each factor
   * @param scale - scale to apply
   */
  scaleEach(scale: number) {
    this._altitude *= scale
    this._grade *= scale
    this._terrain *= scale
    this._heat *= scale
    this._dark *= scale
    this._fatigue *= scale
    this._strategy *= scale

    delete this._combined

    return this
  }
}

export function rollupFactors(input: { factors: Factors; dist: number }[]) {
  const f = new Factors().init(0)
  input.forEach(({ factors, dist }) => {
    f.applyEach((v, b) => v + dist * b, factors)
  })
  f.scaleEach(1 / sumBy(input, 'dist'))
  return f
}
