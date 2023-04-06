import { IPlacement, TPlacementProps } from './placement'
import { Creative } from './creative'
import { setInterval } from './timer'

const canvas = new UICanvas()

export class UIPlacement extends Entity implements IPlacement {
  name: string
  width: number = 500
  height: number = 500
  background: any
  placement: any
  closeIcon: any
  closeIconTimer: any
  infoBox: any
  closeInterval: any


  constructor (name: string) {
    super(name)
    this.name = name
  }

  public getProps (): TPlacementProps {
    return {
      name: this.name || null,
      width: this.width,
      height: this.height,
      depth: 0,
      no: null,
      types: null,
      mimes: null
    }
  }

  public renderMessage (message: string, icon: string) {
    log(message)
  }

  public renderCreative (creative: Creative) {
    const size = creative.scope.split('x')
    const scale = this.calculateScaleFactor(parseInt(size[0]), parseInt(size[1]))

    this.background = new UIContainerRect(canvas)
    // this.background.color = Color4.Red()
    this.background.width = this.width
    this.background.height = this.height
    this.background.positionY = 50
    this.background.visible = true

    this.placement = new UIImage(this.background, new Texture(creative.serveUrl))
    this.placement.hAlign = 'center'
    this.placement.vAlign = 'center'
    this.placement.width = this.width * scale.x
    this.placement.height = this.height * scale.y
    this.placement.sourceWidth = parseInt(size[0])
    this.placement.sourceHeight = parseInt(size[1])
    this.placement.positionY = 0
    this.placement.onClick = new OnClick(() => {
      openExternalURL(creative.clickUrl)
    })
    this.placement.visible = true

    this.closeIcon = new UIImage(this.placement, new Texture('https://decentraland.org/images/ui/dark-atlas-v3.png'))
    this.closeIcon.positionX = parseInt(String(this.placement.width)) / 2 - 36
    this.closeIcon.positionY = parseInt(String(this.placement.height)) / 2 - 12
    this.closeIcon.width = 24
    this.closeIcon.height = 24
    this.closeIcon.sourceWidth = 32
    this.closeIcon.sourceHeight = 32
    this.closeIcon.sourceLeft = 942
    this.closeIcon.sourceTop = 306
    this.closeIcon.onClick = new OnClick(() => {
      this.reset()
    })
    this.closeIcon.visible = false

    this.closeIconTimer = new UIText(this.placement)
    this.closeIconTimer.positionX = parseInt(String(this.placement.width)) / 2 + 6
    this.closeIconTimer.positionY = parseInt(String(this.placement.height)) / 2 + 6
    this.closeIconTimer.fontSize = 12
    this.closeIconTimer.value = '5'
    this.closeInterval = setInterval('closeInterval',() => {
      this.closeIconTimer.value = (parseInt(this.closeIconTimer.value) - 1).toString()
      if (parseInt(this.closeIconTimer.value) === 0) {
        this.closeIconTimer.visible = false
        this.closeIcon.visible = true
      }
    }, 5000)
    this.closeIconTimer.visible = true
  }

  public renderInfoBox (url: string) {
    this.infoBox = new UIImage(this.placement, new Texture('https://assets.adshares.net/metaverse/watermark.png'))
    this.infoBox.positionX = parseInt(String(this.placement.width)) / 2 - 12
    this.infoBox.positionY = parseInt(String(this.placement.height)) / 2 - 12
    this.infoBox.width = 24
    this.infoBox.height = 24
    this.infoBox.sourceWidth = 128
    this.infoBox.sourceHeight = 128
    this.infoBox.onClick = new OnClick(() => {
      openExternalURL(url)
    })
    this.infoBox.visible = true
  }

  public reset (): void {
    if (this.placement) {
      this.background.visible = false
      this.placement.visible = false
      this.closeIcon.visible = false
      this.closeIconTimer.visible = false
      this.infoBox.visible = false
      this.closeInterval.clear(this.name + 'clsBtnInterval')
    }
  }

  protected calculateScaleFactor (originWidth: number, originHeight: number) {
    const scaleFactor = Math.min((this.width / originWidth), (this.height / originHeight))
    const localWidth = scaleFactor * originWidth
    const localHeight = scaleFactor * originHeight
    const scaleX = localWidth / this.width > 1 ? 1 : localWidth / this.width
    const scaleY = localHeight / this.height > 1 ? 1 : localHeight / this.height

    return {
      x: scaleX,
      y: scaleY
    }
  }
}