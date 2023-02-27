import Creative from './creative'

declare type PlacementProps = {
  name: string | null,
  width: number,
  height: number,
  depth: number | null,
  types: string[] | null,
  mimes: string[] | null,
}

export declare interface IPlacement extends IEntity {
  getProps (): PlacementProps;

  renderMessage (message: string, icon: string): void;

  renderCreative (creative: Creative): void;

  renderInfoBox (url: string): void;

  reset (): void;
}

export class PlainPlacement extends Entity implements IPlacement {
  public constructor (
    name: string,
    protected types: string[] | null = null,
    protected mimes: string[] | null = null
  ) {
    super(name)
  }

  public getProps (): PlacementProps {
    const scale = this.getCombinedScale()
    return {
      name: this.name || null,
      width: scale.x,
      height: scale.y,
      depth: scale.z,
      types: this.types || null,
      mimes: this.mimes || null,
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

  renderCreative (creative: Creative): void {
    let QRPlane = new Entity()
    QRPlane.setParent(this)
    QRPlane.addComponent(new PlaneShape())
    QRPlane.addComponent(
      new Transform({
        position: new Vector3(0, 0.5, 0),
        rotation: Quaternion.Euler(creative.type == 'image' ? 180 : 0, 0, 0),
        scale: new Vector3(1, 1, 1),
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

    // if (props.onMaterial) {
    //   props.onMaterial(QRMaterial)
    // }

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
      }),
    )
  }

  public renderInfoBox (url: string): void {
    const hostScale = this.getCombinedScale()
    let assetUrl = 'https://assets.adshares.net/metaverse/watermark.png'
    let QRTexture = new Texture(assetUrl)

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
        position: new Vector3(-0.5 + scale.x / 2, 1 - scale.y / 2, 0.01),
        rotation: Quaternion.Euler(180, 0, 0),
        scale: new Vector3(scale.x, scale.y, 1),
      }),
    )

    let QRMaterial = new Material()

    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    QRMaterial.albedoTexture = QRTexture

    // if (props.onMaterial) {
    //   props.onMaterial(QRMaterial)
    // }

    QRPlane.addComponent(QRMaterial)

    QRPlane.addComponent(
      new OnClick(() => {
        openExternalURL(url)
      }),
    )
  }

  public reset (): void {
    for (let k in this.children) {
      let entity = this.children[k]
      // entity.removeComponent(Transform)
      // entity.removeComponent(PlaneShape)
      // delete entity.getComponent(Material).albedoTexture
      // entity.getComponent(Material).albedoTexture = undefined
      // entity.removeComponent(Material)
      // entity.removeComponent(OnClick)
      // entity.hasComponent(Texture) && entity.removeComponent(Texture)
      // entity.hasComponent(VideoTexture) && entity.removeComponent(VideoTexture)
      engine.removeEntity(this.children[k])
      delete this.children[k]
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
    return scale
  }

  protected renderText (icon: string, message: string): void {
    let QRPlane2 = new Entity()
    QRPlane2.setParent(this)
    QRPlane2.addComponent(new PlaneShape())
    QRPlane2.addComponent(
      new Transform({
        position: new Vector3(0, 0.5, 0),
        rotation: Quaternion.Euler(180, 0, 0),
        scale: new Vector3(1, 1, 1),
      }),
    )

    let QRMaterial2 = new Material()

    QRMaterial2.metallic = 0
    QRMaterial2.roughness = 1
    QRMaterial2.specularIntensity = 0

    QRMaterial2.albedoColor = Color3.White()
    QRPlane2.addComponent(QRMaterial2)

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
        position: new Vector3(0, 0.5, 0.01),
        rotation: Quaternion.Euler(180, 180, 0),
        scale: new Vector3(scale.x, scale.y, 1),
      }),
    )

    let QRMaterial = new Material()
    QRMaterial.albedoColor = Color3.White()
    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0

    QRMaterial.albedoTexture = new Texture(icon)
    QRPlane.addComponent(QRMaterial)

    QRPlane.addComponent(
      new OnPointerDown(() => {
        const canvas = new UICanvas()
        canvas.visible = false

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
      }),
    )
  }
}
