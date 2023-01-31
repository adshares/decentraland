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

  renderError (errors: string[]): void;

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
      types: this.types,
      mimes: this.mimes,
    }
  }

  public renderError (errors: string[]): void {
    const data = [
      ...errors,
      '\nProps: ' + JSON.stringify(this.getProps(), null, '\t')
    ]
    return this.renderText(
      'https://assets.adshares.net/metaverse/error.png',
      'ERROR\n\n' + data.join('\n')
    )
  }

  public reset (): void {
    for (let k in this.children) {
      let entity = this.children[k]
      entity.removeComponent(Transform)
      entity.removeComponent(PlaneShape)
      entity.removeComponent(Material)
      entity.removeComponent(OnClick)
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

    let QRTexture = new Texture(icon)
    QRMaterial.albedoTexture = QRTexture
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
