import { IPlacement, TPlacementProps } from './placement'
import { Creative } from './creative'
import { setInterval, TimerSystem } from './timer'

const canvas = new UICanvas()

export class UIPlacement extends Entity implements IPlacement {
  public name: string
  private readonly _position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  private readonly _width: number = 0
  private readonly _height: number = 0
  private _background: UIContainerRect = new UIContainerRect(canvas)
  private _placement: UIImage = new UIImage(this._background, new Texture(''))
  private _infoBox: UIImage = new UIImage(this._placement, new Texture('https://assets.adshares.net/metaverse/watermark.png'))
  private _closeIcon: UIImage = new UIImage(this._placement, new Texture('https://decentraland.org/images/ui/dark-atlas-v3.png'))
  private _closeIconTimer: UIText = new UIText(this._placement)
  private closeInterval: TimerSystem = TimerSystem.createAndAddToEngine()

  constructor (name: string, position: 'top' | 'left' | 'right' | 'center') {
    super(name)
    this.name = name
    this._position = position

    switch (this._position) {
      case 'center':
        this._width = 500
        this._height = 500
        this._background.positionX = 0
        this._background.positionY = 0
        break

      case 'left':
        this._width = 100
        this._height = 500
        this._background.positionX = '-45%'
        this._background.positionY = 0
        break

      case 'right':
        this._width = 100
        this._height = 500
        this._background.positionX = '45%'
        this._background.positionY = 0
        break

      case 'top':
        this._width = 500
        this._height = 100
        this._background.positionX = 0
        this._background.positionY = '50%'
        break

      default:
        break
    }

    this._background.width = this._width
    this._background.height = this._height
    this._background.visible = false

    this._placement.hAlign = 'center'
    this._placement.vAlign = 'center'
    this._placement.positionY = 0
    this._placement.visible = false

    this._closeIcon.width = 24
    this._closeIcon.height = 24
    this._closeIcon.sourceWidth = 32
    this._closeIcon.sourceHeight = 32
    this._closeIcon.sourceLeft = 942
    this._closeIcon.sourceTop = 306
    this._closeIcon.visible = false

    this._closeIconTimer.fontSize = 12
    this._closeIconTimer.visible = false

    this._infoBox.width = 24
    this._infoBox.height = 24
    this._infoBox.sourceWidth = 128
    this._infoBox.sourceHeight = 128
    this._infoBox.visible = false
  }

  public getProps (): TPlacementProps {
    return {
      name: this.name || null,
      width: this._width,
      height: this._height,
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

    // this._background = new UIContainerRect(canvas)
    this._background.visible = true

    this._placement.source = new Texture(creative.serveUrl)
    this._placement.width = this._width * scale.x
    this._placement.height = this._height * scale.y
    this._placement.sourceWidth = parseInt(size[0])
    this._placement.sourceHeight = parseInt(size[1])
    this._placement.onClick = new OnClick(() => {
      openExternalURL(creative.clickUrl)
    })
    this._placement.visible = true

    // this._closeIcon = new UIImage(this._placement, new Texture('https://decentraland.org/images/ui/dark-atlas-v3.png'))
    this._closeIcon.positionX = parseInt(String(this._placement.width)) / 2 - 36
    this._closeIcon.positionY = parseInt(String(this._placement.height)) / 2 - 12
    this._closeIcon.onClick = new OnClick(() => {
      this.reset()
    })
    this._closeIcon.visible = false

    // this._closeIconTimer = new UIText(this._placement)
    this._closeIconTimer.positionX = parseInt(String(this._placement.width)) / 2 + 6
    this._closeIconTimer.positionY = parseInt(String(this._placement.height)) / 2 + 6
    this._closeIconTimer.value = '5'
    this.closeInterval = setInterval(this.name, () => {
      this._closeIconTimer.value = (parseInt(this._closeIconTimer.value) - 1).toString()
      if (parseInt(this._closeIconTimer.value) === 0) {
        this._closeIconTimer.visible = false
        this._closeIcon.visible = true
        this.closeInterval.clear(this.name)
      }
    }, 1000)
    this._closeIconTimer.visible = true
  }

  public renderInfoBox (url: string) {
    // this._infoBox = new UIImage(this._placement, new Texture('https://assets.adshares.net/metaverse/watermark.png'))
    this._infoBox.positionX = parseInt(String(this._placement.width)) / 2 - 12
    this._infoBox.positionY = parseInt(String(this._placement.height)) / 2 - 12
    this._infoBox.onClick = new OnClick(() => {
      openExternalURL(url)
    })
    this._infoBox.visible = true
  }

  public reset (): void {
    if (this._placement) {
      this._background.visible = false
      this._placement.visible = false
      this._closeIcon.visible = false
      this._closeIconTimer.visible = false
      this._infoBox.visible = false
      this.closeInterval.clear(this.name)
    }
  }

  protected calculateScaleFactor (originWidth: number, originHeight: number) {
    const scaleFactor = Math.min((this._width / originWidth), (this._height / originHeight))
    const localWidth = scaleFactor * originWidth
    const localHeight = scaleFactor * originHeight
    const scaleX = localWidth / this._width > 1 ? 1 : localWidth / this._width
    const scaleY = localHeight / this._height > 1 ? 1 : localHeight / this._height

    return {
      x: scaleX,
      y: scaleY
    }
  }
}