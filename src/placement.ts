import Creative from './creative'
import { Ratio } from './enums'

export declare interface IPlacement extends IEntity {
  getProps (): PlacementProps;

  renderMessage (message: string, icon: string): void;

  renderCreative (creative: Creative): void;

  renderInfoBox (url: string): void;

  reset (): void;
}

declare type PlacementProps = {
  name: string | null,
  width: number,
  height: number,
  depth: number | null,
  types: string[] | null,
  mimes: string[] | null,
}
declare type TRatio = '9:16' | '3:4' | '1:1' | '4:3' | '16:9'
declare type TBackgroundColor = `#${string}`
declare type TConstructorParams = {
  position?: Vector3,
  rotation?: Quaternion,
  width?: number,
  ratio?: TRatio,
  types?: PlacementProps['types'],
  mimes?: PlacementProps['mimes'],
}

const commonMaterials = {
  default: new Material(),
  infobox: new Material(),
  text: new Material()
}

const commonTextures = {
  infobox: new Texture('https://assets.adshares.net/metaverse/watermark.png')
}


export class PlainPlacement extends Entity implements IPlacement {
  private readonly _transform: Transform
  private readonly _width: number
  private readonly _ratio: TRatio
  private readonly _types: PlacementProps['types']
  private readonly _mimes: PlacementProps['mimes']
  private readonly _backgroundColor: TBackgroundColor = '#757575'

  public constructor (
    name: string,
    params?: TConstructorParams
  ) {
    super(name)
    this._width = params?.width || 1
    this._ratio = params?.ratio || '1:1'
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this._transform = new Transform({
      scale: new Vector3(this._width, (this._width / Ratio[this._ratio]), 1),
      position: params?.position,
      rotation: params?.rotation,
    })
    this.initDefaultShape()
  }

  private initDefaultShape () {
    this.addComponent(this._transform)
    this.addComponent(new PlaneShape())
    const material = commonMaterials.default
    commonMaterials.default.specularIntensity = 0
    commonMaterials.default.metallic = 0
    commonMaterials.default.roughness = 1
    commonMaterials.default.albedoColor = Color3.White()
    material.albedoColor = Color3.FromHexString(this._backgroundColor)
    this.addComponent(material)
  }

  public getProps (): PlacementProps {
    const scale = this.getCombinedScale()
    return {
      name: this.name || null,
      width: scale.x,
      height: scale.y,
      depth: scale.z,
      types: this._types || null,
      mimes: this._mimes || null,
    }
  }

  public renderMessage (message: string, icon: string): void {
    const data = [
      message,
      '\nProps: ' + JSON.stringify(this.getProps(), null, '\t')
    ]
    return this.renderText(
      `https://assets.adshares.net/metaverse/${icon}.png`,
      data.join('\n')
    )
  }

  public renderCreative (creative: Creative): void {
    const size = creative.scope.split('x')
    const scaleFactor = this.calculateScaleFactor(parseInt(size[0]), parseInt(size[1]))

    let QRPlane = new Entity()
    QRPlane.setParent(this)
    QRPlane.addComponent(new PlaneShape())
    QRPlane.addComponent(
      new Transform({
        position: new Vector3(0, 0, -0.01),
        rotation: Quaternion.Euler(creative.type === 'image' ? 180 : 0, 180, 0),
        scale: new Vector3(scaleFactor.scaleX, scaleFactor.scaleY, 1),
      }),
    )

    let QRMaterial = new Material()
    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    let QRTexture: Texture | VideoTexture

    //TODO check content hash

    if (creative.type == 'image') {
      QRTexture = new Texture(creative.serveUrl)
      QRMaterial.albedoTexture = QRTexture
    } else if (creative.type == 'video') {
      let video_url = creative.serveUrl
      video_url += video_url.indexOf('?') == -1 ? '?' : '&'
      const video = new VideoClip(video_url + '/y.mp4')
      QRTexture = new VideoTexture(video)
      QRTexture.loop = true
      QRTexture.volume = 0
      QRMaterial.albedoTexture = QRTexture
      QRTexture.play()
    } else {
      this.renderMessage(`Invalid banner format: ${creative.type}`, 'error')
    }

    QRPlane.addComponent(QRMaterial)
    QRPlane.addComponent(
      new OnClick(() => {
        if (QRTexture instanceof VideoTexture) {
          if (QRTexture.volume == 0) {
            QRTexture.volume = 1
            return
          } else {
            QRTexture.volume = 0
          }
        }
        openExternalURL(creative.clickUrl)
      }, { distance: 50 }),
    )

    if(!commonMaterials.default.albedoColor){
      commonMaterials.default.albedoColor = Color3.FromHexString(this._backgroundColor)
    }
  }

  public renderInfoBox (url: string): void {
    const hostScale = this.getCombinedScale()

    let size = Math.sqrt(hostScale.x * hostScale.y) / 10
    let scale = {
      x: size / hostScale.x,
      y: size / hostScale.y,
    }

    let QRPlane = new Entity()
    QRPlane.setParent(this)
    QRPlane.addComponent(new PlaneShape())
    QRPlane.addComponent(
      new Transform({
        position: new Vector3(0.5 - scale.x / 2, (1 - scale.y) / 2, -0.02),
        rotation: Quaternion.Euler(180, 0, 0),
        scale: new Vector3(scale.x, scale.y, 1),
      }),
    )

    let QRMaterial = commonMaterials.infobox

    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    QRMaterial.albedoTexture = commonTextures.infobox

    QRPlane.addComponent(QRMaterial)

    QRPlane.addComponent(
      new OnClick(() => {
        openExternalURL(url)
      }, { distance: 50 }),
    )
  }

  public reset (): void {
    for (let k in this.children) {
      engine.removeEntity(this.children[k])
      delete this.children[k]
    }
  }

  protected calculateScaleFactor (originWidth: number, originHeight: number) {
    const maxScale = this.getComponent(Transform).scale
    const scaleFactor = Math.min((maxScale.x / originWidth), (maxScale.y / originHeight))
    const localWidth = scaleFactor * originWidth
    const localHeight = scaleFactor * originHeight

    const scaleX = localWidth / maxScale.x > 1 ? 1 : localWidth / maxScale.x
    const scaleY = localHeight / maxScale.y > 1 ? 1 : localHeight / maxScale.y

    return {
      scaleX,
      scaleY
    }
  }

  protected getCombinedScale (): Vector3 {
    let scale = this.getComponent(Transform).scale
    let entity = this.getParent()
    while (entity) {
      if (entity.hasComponent(Transform)) {
        let pScale = entity.getComponent(Transform).scale
        scale = scale.multiply(pScale)
      }
      entity = entity.getParent()
    }
    scale.z = 1
    return scale
  }

  protected renderText (icon: string, message: string): void {
    let QRPlane = new Entity()
    QRPlane.setParent(this)
    QRPlane.addComponent(new PlaneShape())

    const hostScale = this.getCombinedScale()
    let size = Math.sqrt(hostScale.x * hostScale.y) / 2
    let scale = {
      x: size / hostScale.x,
      y: size / hostScale.y,
    }

    QRPlane.addComponent(
      new Transform({
        position: new Vector3(0, 0, -0.01),
        rotation: Quaternion.Euler(180, 180, 0),
        scale: new Vector3(scale.x, scale.y, 1),
      }),
    )

    let QRMaterial = commonMaterials.text
    QRMaterial.albedoColor = Color3.White()
    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    commonMaterials.default.albedoColor = Color3.White()

    QRMaterial.albedoTexture = new Texture(icon)
    QRPlane.addComponent(QRMaterial)

    const canvas = new UICanvas()
    canvas.visible = false
    QRPlane.addComponent(
      new OnPointerDown(() => {
        const textInput = new UIInputText(canvas)
        textInput.width = '30%'
        textInput.height = '70%'
        textInput.vAlign = 'center'
        textInput.hAlign = 'right'
        textInput.fontSize = 10
        textInput.paddingLeft = textInput.paddingRight = textInput.paddingTop = textInput.paddingBottom = 10
        textInput.placeholder = message
        textInput.color = Color4.White()
        textInput.positionX = '-5%'
        textInput.isPointerBlocker = false
        textInput.hTextAlign = 'left'
        textInput.vTextAlign = 'top'
        canvas.visible = true
      }, {distance: 50, hoverText: 'WTF?'}),
    )
    QRPlane.addComponent(
      new OnPointerHoverExit(() => {
        canvas.visible = false
      })
    )
  }
}
