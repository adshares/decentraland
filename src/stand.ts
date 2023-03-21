import { IPlacement, PlainPlacement } from './placement'

export declare interface IStand extends IEntity {
  getPlacements (): IPlacement[];
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
      position: new Vector3(0, 2.355, -0.288546),
      width: 1.65,
      ratio: '9:16',
      no: 1,
      types: this._types,
      mimes: this._mimes
    })
    this._backPlacement = new PlainPlacement(`${this.name} back`, {
      position: new Vector3(0, 2.355, 0.27),
      rotation: Quaternion.Euler(0, 180, 0),
      width: 1.65,
      ratio: '9:16',
      no: 2,
      types: this._types,
      mimes: this._mimes
    })
    this.addComponent(new GLTFShape('models/ads_totem_9_16.glb'))
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
  private readonly _ratio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16'
  private readonly _types: string[] | null
  private readonly _mimes: string[] | null
  private _frontPlacement: IPlacement
  private _backPlacement: IPlacement

  public constructor (
    name: string,
    params?: {
      ratio?: '16:9' | '4:3' | '1:1' | '3:4' | '9:16'
      types?: string[] | null,
      mimes?: string[] | null,
    }
  ) {
    super(name)
    this._ratio = params?.ratio || '1:1'
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this.initBillboard()
  }

  initBillboard () {
    switch (this._ratio) {
      case '3:4':
        this.addComponent(new GLTFShape('models/ads_billboard_3_4.glb'))
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 6.19396, -0.27),
          width: 6,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
          position: new Vector3(0, 6.19396, 0.27),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 6,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '4:3':
        this.addComponent(new GLTFShape('models/ads_billboard_4_3.glb'))
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 4.65903, -0.27),
          width: 6.8,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
          position: new Vector3(0, 4.65903, 0.27),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 6.8,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '9:16':
        this.addComponent(new GLTFShape('models/ads_billboard_9_16.glb'))
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 6.55398, -0.27),
          width: 4.53,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
          position: new Vector3(0, 6.55398, 0.27),
          rotation: Quaternion.Euler(0, 180, 0),
          width: 4.53,
          ratio: this._ratio,
          no: 2,
          types: this._types,
          mimes: this._mimes
        })
        break

      case '16:9':
        this.addComponent(new GLTFShape('models/ads_billboard_16_9.glb'))
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 4.54934, -0.29),
          width: 8.65,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
          position: new Vector3(0, 4.54934, 0.29),
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
        this.addComponent(new GLTFShape('models/ads_billboard_1_1.glb'))
        this._frontPlacement = new PlainPlacement(`${this.name} front`, {
          position: new Vector3(0, 5.43059, -0.259),
          width: 6.15,
          ratio: this._ratio,
          no: 1,
          types: this._types,
          mimes: this._mimes
        })
        this._backPlacement = new PlainPlacement(`${this.name} back`, {
          position: new Vector3(0, 5.43059, 0.259),
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
