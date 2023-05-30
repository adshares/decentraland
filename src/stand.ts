import { PlainPlacement } from './plainPlacement'
import { IPlacement, IStand, TPlacementProps, TRatio } from './types'

const commonMaterials: {
  default: Material | undefined,
} = {
  default: undefined,
}

export class PlainStand extends Entity implements IStand {
  private readonly _width: number
  private readonly _types: string[] | null
  private readonly _mimes: string[] | null
  private readonly _frameMaterial?: Material
  private readonly _plainPlacement: IPlacement

  constructor (name: string, params?: {
    position?: Vector3,
    rotation?: Quaternion,
    width?: number,
    ratio?: TRatio,
    no?: number,
    types?: TPlacementProps['types'],
    mimes?: TPlacementProps['mimes'],
    frameMaterial?: Material,
  }) {
    super(name)
    this.addComponent(new Transform({
      position: params?.position || undefined,
      rotation: params?.rotation || undefined
    }))
    this._width = (params?.width || 1) - 0.02
    this._frameMaterial = params?.frameMaterial
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this._plainPlacement = new PlainPlacement(name, {
      position: new Vector3(0, 0, -0.01),
      rotation: Quaternion.Euler(0, 0, 0),
      width: this._width,
      ratio: params?.ratio,
      no: params?.no,
      types: this._types,
      mimes: this._mimes
    })
    this._plainPlacement.setParent(this)
    this.renderFrame()
  }

  public getPlacements (): IPlacement[] {
    return [
      this._plainPlacement,
    ]
  }

  protected getBackgroundMaterial (): Material {
    if (this._frameMaterial === undefined) {
      return this.getDefaultMaterial()
    }
    return this._frameMaterial
  }

  protected getDefaultMaterial (): Material {
    if (commonMaterials.default === undefined) {
      commonMaterials.default = new Material()
      commonMaterials.default.specularIntensity = 0
      commonMaterials.default.metallic = 0
      commonMaterials.default.roughness = 1
      commonMaterials.default.albedoColor = Color3.Black()
    }
    return commonMaterials.default
  }

  public renderFrame (): void {
    const material = this.getBackgroundMaterial()
    const plainDimension = this._plainPlacement.getComponent(Transform).scale
    const frame = new Entity()

    const bg = new Entity()
    bg.addComponent(new PlaneShape())
    bg.addComponent(new Transform({
      position: new Vector3(0, 0, 0),
      scale: new Vector3(plainDimension.x, plainDimension.y, plainDimension.z)
    }))
    bg.addComponent(material)
    bg.setParent(frame)

    const rightBoard = new Entity()
    rightBoard.addComponent(new BoxShape())
    rightBoard.addComponent(new Transform({
      position: new Vector3((plainDimension.x / 2), 0, -0.009),
      scale: new Vector3(0.01, plainDimension.y, 0.018)
    }))
    rightBoard.addComponent(material)
    rightBoard.setParent(frame)

    const leftBoard = new Entity()
    leftBoard.addComponent(new BoxShape())
    leftBoard.addComponent(new Transform({
      position: new Vector3(-(plainDimension.x / 2), 0, -0.009),
      scale: new Vector3(0.01, plainDimension.y, 0.018)
    }))
    leftBoard.addComponent(material)
    leftBoard.setParent(frame)

    const topBoard = new Entity()
    topBoard.addComponent(new BoxShape())
    topBoard.addComponent(new Transform({
      position: new Vector3(0, (plainDimension.y / 2), -0.009),
      scale: new Vector3(plainDimension.x + 0.01, 0.01, 0.018)
    }))
    topBoard.addComponent(material)
    topBoard.setParent(frame)

    const bottomBoard = new Entity()
    bottomBoard.addComponent(new BoxShape())
    bottomBoard.addComponent(new Transform({
      position: new Vector3(0, -(plainDimension.y / 2), -0.009),
      scale: new Vector3(plainDimension.x + 0.01, 0.01, 0.018)
    }))
    bottomBoard.addComponent(material)
    bottomBoard.setParent(frame)

    frame.setParent(this)
  }
}

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
    this._frontPlacement = new PlainPlacement(`${this.name} front`, {
      position: new Vector3(0, 2.355, -0.277),
      width: 1.65,
      ratio: '9:16',
      no: 1,
      types: this._types,
      mimes: this._mimes
    })
    this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 6.19396, -0.2715),
          width: 6,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 4.65903, -0.267),
          width: 6.8,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 6.55398, -0.267),
          width: 4.53,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 4.54934, -0.2975),
          width: 8.65,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 5.43059, -0.267),
          width: 6.15,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
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
    this._placement_1 = new PlainPlacement(`${this.name} 1`, {
      position: new Vector3(0, 1.46, -0.662),
      width: 1.1,
      ratio: '9:16',
      no: 1,
      types: this._types,
      mimes: this._mimes
    })
    this._placement_3 = new PlainPlacement(`${this.name} 3`, {
      position: new Vector3(0, 1.46, 0.662),
      rotation: Quaternion.Euler(0, 180, 0),
      width: 1.1,
      ratio: '9:16',
      no: 2,
      types: this._types,
      mimes: this._mimes
    })

    this._placement_2 = new PlainPlacement(`${this.name} 2`, {
      position: new Vector3(-0.662, 1.46, 0),
      rotation: Quaternion.Euler(0, 90, 0),
      width: 1.1,
      ratio: '9:16',
      no: 3,
      types: this._types,
      mimes: this._mimes
    })
    this._placement_4 = new PlainPlacement(`${this.name} 4`, {
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
