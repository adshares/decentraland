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
      mimes: this._mimes,
    })
    this._backPlacement = new PlainPlacement(`${this.name} back`, {
      position: new Vector3(0, 2.355, 0.288546),
      rotation: Quaternion.Euler(0, 180, 0),
      width: 1.65,
      ratio: '9:16',
      no: 2,
      types: this._types,
      mimes: this._mimes,
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
