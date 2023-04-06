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

  public clear (id: string) {
    const componentIndex = this._components.map(c => c.id).indexOf(id)
    if (componentIndex !== -1) {
      this._components.splice(componentIndex, 1)
    }
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

export function setTimeout ( fn: () => void, msecs: number) {
  let id = Math.random().toString()
  let instance = TimerSystem.createAndAddToEngine()
  let timer: ITimerComponent = {
    id,
    elapsedTime: 0,
    targetTime: msecs / 1000,
    onTargetTimeReached: (components, index) => {
      fn()
      components.splice(index, 1)
    }
  }
  instance.addComponent(timer)
  return id
}

export function setInterval ( fn: () => void, msecs: number) {
  let id = Math.random().toString()
  let instance = TimerSystem.createAndAddToEngine()
  let timer: ITimerComponent = {
    id: id,
    elapsedTime: 0,
    targetTime: msecs / 1000,
    onTargetTimeReached: (components, index) => {
      if (components[index]) components[index].elapsedTime = 0 // why undefined ???
      if (fn) fn()
    }
  }
  instance.addComponent(timer)
  return id
}