import { Ratio } from './enums'
import { IPlacement, TPlacementProps, TRatio } from './types'
import { Creative } from './creative'
import { sections, calculateUVParams, theme } from './theme'

declare type TConstructorParams = {
  position?: Vector3,
  rotation?: Quaternion,
  width?: number,
  ratio?: TRatio,
  no?: number,
  types?: TPlacementProps['types'],
  mimes?: TPlacementProps['mimes'],
  background?: Material | null,
}

const commonMaterials: {
  default?: Material,
  infobox: Material,
  text: Material,
} = {
  default: undefined,
  infobox: new Material(),
  text: new Material()
}

let messageInputText: UIInputText | undefined

export class PlainPlacement extends Entity implements IPlacement {
  private readonly _transform: Transform
  private readonly _width: number
  private readonly _ratio: TRatio
  private readonly _no: number | null
  private readonly _types: TPlacementProps['types']
  private readonly _mimes: TPlacementProps['mimes']
  private readonly _clickDistance: number = 50
  private _backgroundMaterial?: Material | null
  public name: string

  public constructor (
    name: string,
    params?: TConstructorParams
  ) {
    super(name)
    this.name = name
    this._width = params?.width - 0.05 || 1 - 0.05
    this._ratio = params?.ratio || '1:1'
    this._no = params?.no || null
    this._types = params?.types || null
    this._mimes = params?.mimes || null
    this._backgroundMaterial = params?.background
    this._transform = new Transform({
      scale: new Vector3(this._width, (this._width / Ratio[this._ratio]), 1),
      position: params?.position,
      rotation: params?.rotation
    })
    this.initDefaultShape()
  }

  public getProps (): TPlacementProps {
    const scale = this.getCombinedScale()
    return {
      name: this.name || null,
      width: scale.x * 100,
      height: scale.y * 100,
      depth: 0,
      no: this._no || null,
      types: this._types || null,
      mimes: this._mimes || null
    }
  }

  public renderMessage (message: string, icon: string): void {
    const data = [
      message,
      '\nProps: ' + JSON.stringify(this.getProps(), null, '\t')
    ]
    return this.renderText(
      icon,
      data.join('\n')
    )
  }

  public renderCreative (creative: Creative): void {

    const backgroundM = this.getBackgroundMaterial('default')
    if (backgroundM !== null) {
      this.addComponentOrReplace(new PlaneShape())
      this.addComponentOrReplace(backgroundM)
    }

    const size = creative.scope.split('x')
    const scaleFactor = this.calculateScaleFactor(parseInt(size[0]), parseInt(size[1]))

    const plane = new Entity()
    plane.setParent(this)
    plane.addComponent(new PlaneShape())
    plane.addComponent(
      new Transform({
        position: new Vector3(0, 0, -0.05),
        rotation: Quaternion.Euler(creative.type === 'image' ? 180 : 0, 180, 0),
        scale: new Vector3(scaleFactor.scaleX, scaleFactor.scaleY, 1)
      })
    )

    const material = new Material()
    material.metallic = 0
    material.roughness = 1
    material.specularIntensity = 0
    let texture: Texture | VideoTexture

    //TODO check content hash

    if (creative.type == 'image') {
      texture = new Texture(creative.serveUrl)
      material.albedoTexture = texture
    } else if (creative.type == 'video') {
      let videoUrl = creative.serveUrl
      videoUrl += videoUrl.indexOf('?') == -1 ? '?' : '&'
      const video = new VideoClip(videoUrl + '/y.mp4')
      texture = new VideoTexture(video)
      texture.loop = true
      texture.volume = 0
      material.albedoTexture = texture
      texture.play()
    } else {
      this.renderMessage(`Invalid banner format: ${creative.type}`, 'error')
    }

    plane.addComponent(material)
    plane.addComponent(
      new OnClick(() => {
        if (texture instanceof VideoTexture) {
          if (texture.volume == 0) {
            texture.volume = 1
            return
          } else {
            texture.volume = 0
          }
        }
        openExternalURL(creative.clickUrl)
      }, { distance: this._clickDistance })
    )

    this.renderFrame()
  }

  public renderInfoBox (url: string): void {
    const hostScale = this.getCombinedScale()

    const size = Math.sqrt(hostScale.x * hostScale.y) / 10
    const scale = {
      x: size / hostScale.x,
      y: size / hostScale.y
    }

    const plane = new Entity()
    const planeShape = new PlaneShape()
    planeShape.uvs = calculateUVParams(sections.logo)
    plane.setParent(this)
    plane.addComponent(planeShape)
    plane.addComponent(
      new Transform({
        position: new Vector3(0.5 - scale.x / 2, (1 - scale.y) / 2, -0.1    ),
        rotation: Quaternion.Euler(180, 180, 0),
        scale: new Vector3(scale.x, scale.y, 1)
      })
    )

    const material = commonMaterials.infobox
    material.metallic = 0
    material.roughness = 1
    material.specularIntensity = 0
    material.albedoTexture = theme

    plane.addComponent(material)
    plane.addComponent(
      new OnClick(() => {
        openExternalURL(url)
      }, { distance: this._clickDistance, hoverText: 'What is this?' })
    )
  }

  public reset (): void {
    for (let k in this.children) {
      if (this.children[k].isAddedToEngine()) {
        engine.removeEntity(this.children[k])
      }
      delete this.children[k]
    }
  }

  public renderFrame (): void {
    const backgroundM = this.getBackgroundMaterial('default')
    const frame = new Entity()
    
    const rightBoard = new Entity()
    rightBoard.addComponent(new BoxShape())
    rightBoard.addComponent(new Transform({
      position: new Vector3(0.5005,0,-0.05),
      scale: new Vector3(0.001, 1, 0.1)
    }))
    rightBoard.addComponent(backgroundM)
    rightBoard.setParent(frame)

    const leftBoard = new Entity()
    leftBoard.addComponent(new BoxShape())
    leftBoard.addComponent(new Transform({
      position: new Vector3(-0.5005,0,-0.05),
      scale: new Vector3(0.001, 1, 0.1)
    }))
    leftBoard.addComponent(backgroundM)
    leftBoard.setParent(frame)

    const topBoard = new Entity()
    topBoard.addComponent(new BoxShape())
    topBoard.addComponent(new Transform({
      position: new Vector3(0,0.5005,-0.05),
      scale: new Vector3(1.002, 0.001, 0.1)
    }))
    topBoard.addComponent(backgroundM)
    topBoard.setParent(frame)

    const bottomBoard = new Entity()
    bottomBoard.addComponent(new BoxShape())
    bottomBoard.addComponent(new Transform({
      position: new Vector3(0,-0.5005,-0.05),
      scale: new Vector3(1.002, 0.001, 0.1)
    }))
    bottomBoard.addComponent(backgroundM)
    bottomBoard.setParent(frame)

    frame.setParent(this)
  }

  protected getBackgroundMaterial (material: string): Material | null {
    if (this._backgroundMaterial === undefined) {
      return this.getDefaultMaterial(material)
    }
    return this._backgroundMaterial
  }

  protected getDefaultMaterial (material: string): Material {
    if (commonMaterials[material] === undefined) {
      commonMaterials[material] = new Material()
      commonMaterials[material].specularIntensity = 0
      commonMaterials[material].metallic = 0
      commonMaterials[material].roughness = 1
      commonMaterials[material].albedoColor = Color3.Black()
    }
    return commonMaterials[material]
  }

  protected initDefaultShape () {
    this.addComponent(this._transform)
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
    scale.z = 0.1
    return scale
  }

  protected showMessageCanvas (message: string): void {
    if (messageInputText === undefined) {
      const canvas = new UICanvas()
      messageInputText = new UIInputText(canvas)
      messageInputText.width = '30%'
      messageInputText.height = '70%'
      messageInputText.vAlign = 'center'
      messageInputText.hAlign = 'right'
      messageInputText.fontSize = 10
      messageInputText.paddingLeft = messageInputText.paddingRight = messageInputText.paddingTop = messageInputText.paddingBottom = 10
      messageInputText.color = Color4.White()
      messageInputText.positionX = '-5%'
      messageInputText.isPointerBlocker = false
      messageInputText.hTextAlign = 'left'
      messageInputText.vTextAlign = 'top'
    }
    messageInputText.placeholder = message
    messageInputText.visible = true
  }

  protected hideMessageCanvas (): void {
    if (messageInputText !== undefined) {
      messageInputText.visible = false
    }
  }

  protected renderText (icon: string, message: string): void {

    this.reset()
    const material = this.getDefaultMaterial('text')
    material.albedoColor = Color3.White()

    this.addComponentOrReplace(new PlaneShape())

    const plane = new Entity()
    const planeShape = new PlaneShape()
    planeShape.uvs = icon === 'notfound' && calculateUVParams(sections.notFoundIcon) || icon === 'error' && calculateUVParams(sections.errorIcon) || undefined
    plane.setParent(this)
    plane.addComponent(planeShape)

    const hostScale = this.getCombinedScale()
    const size = Math.sqrt(hostScale.x * hostScale.y) / 2
    const scale = {
      x: size / hostScale.x,
      y: size / hostScale.y
    }

    plane.addComponent(
      new Transform({
        position: new Vector3(0, 0, -0.01),
        rotation: Quaternion.Euler(180, 180, 0),
        scale: new Vector3(scale.x, scale.y, 1)
      })
    )

    const iconMaterial = commonMaterials.text
    iconMaterial.albedoColor = Color3.White()
    iconMaterial.metallic = 0
    iconMaterial.roughness = 1
    iconMaterial.specularIntensity = 0
    iconMaterial.albedoTexture = theme

    plane.addComponent(iconMaterial)
    plane.addComponent(
      new OnPointerDown(() => {
        this.showMessageCanvas(message)
      }, { distance: this._clickDistance, hoverText: 'Why am I seeing this?' })
    )
    plane.addComponent(
      new OnPointerHoverExit(() => {
        this.hideMessageCanvas()
      })
    )
  }
}
