type ITimerComponent = {
  id?: string
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (components: ITimerComponent[], index: number) => void
}

export class TimerSystem implements ISystem {
  private static _instance: TimerSystem | null = null
  protected _components: ITimerComponent[] = []

  static createAndAddToEngine (): TimerSystem {
    if (this._instance == null) {
      this._instance = new TimerSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  public addComponent (comp: ITimerComponent) {
    this._components.push(comp)
  }

  private constructor () {
    TimerSystem._instance = this
  }

  clear (id: string) {
    this._components = this._components.filter(component => {
      if (!component.id) {
        return true
      }
      return component.id.indexOf(id) !== -1
    })
  }

  update (dt: number) {
    this._components.forEach((component, index) => {
      component.elapsedTime += dt
      if (component.elapsedTime >= component.targetTime) {
        component.onTargetTimeReached(this._components, index)
      }

    })
  }
}

export function setTimeout (fn: () => void, msecs: number) {
  let instance = TimerSystem.createAndAddToEngine()
  let timer: ITimerComponent = {
    elapsedTime: 0,
    targetTime: msecs / 1000,
    onTargetTimeReached: (components, index) => {
      fn()
      components.splice(index, 1)
    }
  }
  instance.addComponent(timer)
  return instance
}

export function setInterval (id: string, fn: () => void, msecs: number): TimerSystem {
  let instance = TimerSystem.createAndAddToEngine()
  let timer: ITimerComponent = {
    id: id + msecs.toString(),
    elapsedTime: 0,
    targetTime: msecs / 1000,
    onTargetTimeReached: (components, index) => {
      log(components)
      if (components[index]) components[index].elapsedTime = 0 // why undefined ???
      if (fn) fn()
    }
  }
  instance.addComponent(timer)
  return instance
}