import { BasePlacement } from './plainPlacement'
import { IPlacement, IStand, TRatio } from './types'

export class Totem extends Entity implements IStand {
  private readonly _types: string[] | null
  private readonly _mimes: string[] | null
  private readonly _frontPlacement: IPlacement
  private readonly _backPlacement: IPlacement

  public constructor (
    name: string,
    params?: {
      types?: string[] | null,
      mimes?: string[] | null,
    }
  ) {
    super(name)
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this._frontPlacement = new BasePlacement(`${this.name} front`, {
      position: new Vector3(0, 2.355, -0.277),
      width: 1.65,
      ratio: '9:16',
      no: 1,
      types: this._types,
      mimes: this._mimes
    })
    this._backPlacement = new BasePlacement(`${this.name} back`, {
      position: new Vector3(0, 2.355, 0.277),
      rotation: Quaternion.Euler(0, 180, 0),
      width: 1.65,
      ratio: '9:16',
      no: 2,
      types: this._types,
      mimes: this._mimes
    })
    this.addComponent(new GLTFShape('models/@adshares/ads_totem_9_16.glb'))
    this._frontPlacement.setParent(this)
    this._backPlacement.setParent(this)
  }

  public getPlacements (): IPlacement[] {
    return [
      this._frontPlacement,
      this._backPlacement
    ]
  }
}

export class Billboard extends Entity implements IStand {
  private readonly _ratio: TRatio
  private readonly _types: string[] | null
  private readonly _mimes: string[] | null
  private readonly _frontPlacement: IPlacement
  private readonly _backPlacement: IPlacement

  public constructor (
    name: string,
    params?: {
      ratio?: TRatio
      types?: string[] | null,
      mimes?: string[] | null,
    }
  ) {
    super(name)
    this._ratio = params?.ratio || '1:1'
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    switch (this._ratio) {
      case '3:4':
        this.addComponent(new GLTFShape('models/@adshares/ads_billboard_3_4.glb'))
        this._frontPlacement = new BasePlacement(`${this.name} front`, {
          position: new Vector3(0, 6.19396, -0.2715),
          width: 6,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new BasePlacement(`${this.name} back`, {
          position: new Vector3(0, 6.19396, 0.2715),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 6,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '4:3':
        this.addComponent(new GLTFShape('models/@adshares/ads_billboard_4_3.glb'))
        this._frontPlacement = new BasePlacement(`${this.name} front`, {
          position: new Vector3(0, 4.65903, -0.267),
          width: 6.8,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new BasePlacement(`${this.name} back`, {
          position: new Vector3(0, 4.65903, 0.267),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 6.8,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '9:16':
        this.addComponent(new GLTFShape('models/@adshares/ads_billboard_9_16.glb'))
        this._frontPlacement = new BasePlacement(`${this.name} front`, {
          position: new Vector3(0, 6.55398, -0.267),
          width: 4.53,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new BasePlacement(`${this.name} back`, {
          position: new Vector3(0, 6.55398, 0.267),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 4.53,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '16:9':
        this.addComponent(new GLTFShape('models/@adshares/ads_billboard_16_9.glb'))
        this._frontPlacement = new BasePlacement(`${this.name} front`, {
          position: new Vector3(0, 4.54934, -0.2975),
          width: 8.65,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new BasePlacement(`${this.name} back`, {
          position: new Vector3(0, 4.54934, 0.2975),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 8.65,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '1:1':
      default:
        this.addComponent(new GLTFShape('models/@adshares/ads_billboard_1_1.glb'))
        this._frontPlacement = new BasePlacement(`${this.name} front`, {
          position: new Vector3(0, 5.43059, -0.267),
          width: 6.15,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new BasePlacement(`${this.name} back`, {
          position: new Vector3(0, 5.43059, 0.267),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 6.15,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break
    }
    this._frontPlacement.setParent(this)
    this._backPlacement.setParent(this)
  }

  public getPlacements (): IPlacement[] {
    return [
      this._frontPlacement,
      this._backPlacement
    ]
  }
}

export class Citylight extends Entity implements IStand {
  private readonly _types: string[] | null
  private readonly _mimes: string[] | null
  private readonly _placement_1: IPlacement
  private readonly _placement_2: IPlacement
  private readonly _placement_3: IPlacement
  private readonly _placement_4: IPlacement

  public constructor (
    name: string,
    params?: {
      types?: string[] | null,
      mimes?: string[] | null,
      rotation?: boolean
    },
    private adsRotationSystem = new AdsRotationSystem()
  ) {
    super(name)
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this.addComponent(new GLTFShape('models/@adshares/ads_citylight_9_16.glb'))
    this._placement_1 = new BasePlacement(`${this.name} 1`, {
      position: new Vector3(0, 1.46, -0.662),
      width: 1.1,
      ratio: '9:16',
      no: 1,
      types: this._types,
      mimes: this._mimes
    })
    this._placement_3 = new BasePlacement(`${this.name} 3`, {
      position: new Vector3(0, 1.46, 0.662),
      rotation: Quaternion.Euler(0, 180, 0),
      width: 1.1,
      ratio: '9:16',
      no: 2,
      types: this._types,
      mimes: this._mimes
    })

    this._placement_2 = new BasePlacement(`${this.name} 2`, {
      position: new Vector3(-0.662, 1.46, 0),
      rotation: Quaternion.Euler(0, 90, 0),
      width: 1.1,
      ratio: '9:16',
      no: 3,
      types: this._types,
      mimes: this._mimes
    })
    this._placement_4 = new BasePlacement(`${this.name} 4`, {
      position: new Vector3(0.662, 1.46, 0),
      rotation: Quaternion.Euler(0, -90, 0),
      width: 1.1,
      ratio: '9:16',
      no: 4,
      types: this._types,
      mimes: this._mimes
    })
    this._placement_1.setParent(this)
    this._placement_2.setParent(this)
    this._placement_3.setParent(this)
    this._placement_4.setParent(this)

    if (params?.rotation || params?.rotation === undefined) adsRotationSystem.add([this])
  }

  public getPlacements (): IPlacement[] {
    return [
      this._placement_1,
      this._placement_2,
      this._placement_3,
      this._placement_4
    ]
  }
}

class AdsRotationSystem implements ISystem {
  private _entities: Entity[] = []

  constructor () {
    engine.addSystem(this)
  }

  public update () {
    this._entities.forEach(e => {
      !e.hasComponent(Transform) && e.addComponent(new Transform())
      let transform = e.getComponent(Transform)
      transform.rotate(Vector3.Up(), 0.5)
    })
  }

  public add (entities: Entity[]) {
    this._entities = [...this._entities, ...entities]
  }
}
