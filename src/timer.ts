type ITimerComponent = {
    elapsedTime: number
    targetTime: number
    onTargetTimeReached: () => void
}

class TimerSystem implements ISystem {
    private static _instance: TimerSystem | null = null

    private _components: ITimerComponent[] = []

    static createAndAddToEngine(): TimerSystem {
        if (this._instance == null) {
            this._instance = new TimerSystem()
            engine.addSystem(this._instance)
        }
        return this._instance
    }

    public addComponent(comp: ITimerComponent) {
        this._components.push(comp)
    }

    private constructor() {
        TimerSystem._instance = this
    }

    update(dt: number) {
        this._components.forEach((component, index) => {
            component.elapsedTime += dt
            if (component.elapsedTime >= component.targetTime) {
                component.onTargetTimeReached()
                this._components.splice(index, 1)
            }
        })
    }
}

export function setTimeout(fn: () => void, msecs : number)
{
    let instance = TimerSystem.createAndAddToEngine()

    let timer: ITimerComponent = {
        elapsedTime: 0,
        targetTime: msecs / 1000,
        onTargetTimeReached: fn
    }

    instance.addComponent(timer)
}