import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'

export type Props = {
  payout_network: string
  payout_address: string
  keywords: string
  zone_name: string
  adserver: string
  exclude: string
}

const b64ch =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_='
const b64chs = Array.prototype.slice.call(b64ch)

const UrlSafeBase64Encode = (bin: string) => {
  bin = unescape(encodeURIComponent(bin))
  let u32, c0, c1, c2, asc = ''
  const pad = bin.length % 3
  for (let i = 0; i < bin.length;) {
    if ((c0 = bin.charCodeAt(i++)) > 255 ||
      (c1 = bin.charCodeAt(i++)) > 255 ||
      (c2 = bin.charCodeAt(i++)) > 255) {
      throw new TypeError('invalid character found')
    }
    u32 = (c0 << 16) | (c1 << 8) | c2
    asc += b64chs[u32 >> 18 & 63]
      + b64chs[u32 >> 12 & 63]
      + b64chs[u32 >> 6 & 63]
      + b64chs[u32 & 63]
  }
  return pad ? asc.slice(0, pad - 3) : asc
}

const addUrlParam = function (url: string, names: any, value: any = null) {
  if (typeof names != 'object') {
    const tmp = names
    names = {}
    names[tmp] = value
  }
  for (let name in names) {
    value = names[name]
    let param = name + '=' + encodeURIComponent(value)
    const qPos = url.indexOf('?')
    if (qPos > -1) {
      url += (qPos < url.length ? '&' : '') + param
    } else {
      url += '?' + param
    }
  }
  return url
}

interface IHash {
  [details: string]: boolean;
}

export default class AdsharesBanner implements IScript<Props> {
  impressionId: string = ''
  bannerCounter: number = 0
  loadedAdusers: IHash = {}

  init () {
  }

  getRandId (bytes: Number): string {
    let d = new Date().getTime()

    let chars = []
    for (let i = 0; i < bytes; i++) {
      const r = (d + Math.random() * 256) % 256 | 0
      d = Math.floor(d / 256)
      chars.push(String.fromCharCode(r))
    }

    return chars.join('')
  }

  getImpressionId (): string {
    if (this.impressionId == '') {
      this.impressionId = UrlSafeBase64Encode(this.getRandId(16))
    }
    return this.impressionId
  }

  getSceneId (land: ILand): string {
    return 'scene-' +
      land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
        .replace(',', '-')
  }

  getSceneTags (land: ILand, extraTags: string[]): string {
    if (land.sceneJsonData.tags) {
      extraTags = extraTags.concat(land.sceneJsonData.tags)
    }
    return extraTags.join(',')
  }

  getCid () {
    let i, l, n
    let s = this.getRandId(15) + '\0'
    let o = ''
    for (i = 0, l = s.length; i < l; i++) {
      n = s.charCodeAt(i).toString(16)
      o += n.length < 2 ? '0' + n : n
    }
    return o
  }

  async find (host: Entity, props: Props) {

    const userAccount = await getUserAccount()
    const parcel = await getParcel()
    const transform = host.getComponent(Transform)

    if (this.impressionId == '') {
      fetch(
        (props.adserver + '/supply/register?iid=' + this.getImpressionId()) +
        '&stid=' + userAccount).then()
    }

    let request = {
      pay_to: props.payout_network + ':' + props.payout_address,
      view_id: this.getImpressionId(),
      zone_name: props.zone_name,
      width: transform.scale.x,
      height: transform.scale.y,
      min_dpi: 10,
      exclude: JSON.parse(props.exclude),
      type: ['image', 'video'],
      mime_type: ['image/jpeg', 'image/png', 'video/mp4'],
      context: {
        site: {
          url: 'https://' + this.getSceneId(parcel.land) + '.decentraland.org/',
          keywords: this.getSceneTags(parcel.land, props.keywords.split(',')),
          metamask: 1,
        },
        user: {
          account: userAccount,
        },
      },
      medium: 'metaverse',
      vendor: 'decentraland',
      version: '1.1.3',
    }

    let response: any = {}

    try {
      let callUrl = props.adserver + '/supply/anon?stid=' + userAccount
      let callResponse = await fetch(callUrl, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(request),
      })
      response = await callResponse.json()
      log(request, response)
    } catch (e) {
      log('failed to reach URL', e)
    }

    if (response.banners) {
      let banner = response.banners[0]
      if (banner) {
        banner.cid = this.getCid()
        let viewContext = {
          page: {
            iid: request.view_id,
            url: request.context.site.url,
            keywords: request.context.site.keywords,
            metamask: request.context.site.metamask,
          },
          user: {
            account: request.context.user.account,
          },
        }
        banner.click_url = addUrlParam(banner.click_url,
          {
            cid: banner.cid,
            ctx: UrlSafeBase64Encode(JSON.stringify(viewContext)),
            iid: request.view_id,
            stid: userAccount,
          },
        )
        banner.view_url = addUrlParam(banner.view_url,
          {
            cid: banner.cid,
            ctx: UrlSafeBase64Encode(JSON.stringify(viewContext)),
            iid: request.view_id,
            json: 1,
            stid: userAccount,
          })
        await this.renderBanner(host, banner)
        this.showWaterMark(host, props, request, banner)

        try {
          let loadedAdusers = this.loadedAdusers
          fetch(banner.view_url).then(function (response) {
            response.json().then(function (object) {
              if (object.aduser_url && !loadedAdusers[object.aduser_url]) {
                fetch(addUrlParam(object.aduser_url, 'stid', userAccount))
                loadedAdusers[object.aduser_url] = true
              }
            })
          })

        } catch (e) {
          log('view log failed', e)
        }
      } else {
        this.renderText(host, 'https://assets.adshares.net/metaverse/notfound.png',
          'Banner not found\n\nImpression ID: ' + request.view_id +
          '\n\nconfig: ' + JSON.stringify(props, null, '\t'))
      }
    }
    if (!response.success) {
      let errors: string[] = []
      if (response.errors) {
        let k: any
        let v: any
        for (k in response.errors) {
          //errors.push(k)
          v = response.errors[k]
          if (typeof v !== 'object') {
            v = Array(v)
          }
          v.forEach((text: string) => {
            errors.push(text)
          })
          errors.push('')
        }

      }
      errors.push('\nconfig: ' + JSON.stringify(props, null, '\t'))
      this.renderError(host, errors)
    }
  }

  showWaterMark (host: Entity, props: Props, request: any, banner: any) {
    const transform = host.getComponent(Transform)
    let url = 'https://assets.adshares.net/metaverse/watermark.png'

    let QRTexture = new Texture(url)

    let size = Math.sqrt(transform.scale.x * transform.scale.y) / 10
    let scale = {
      x: size / transform.scale.x,
      y: size / transform.scale.y,
    }

    let QRPlane = new Entity()
    QRPlane.setParent(host)
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
    QRPlane.addComponent(QRMaterial)

    QRPlane.addComponent(
      new OnClick(() => {
        let url = addUrlParam(props.adserver + '/supply/why', {
          bid: banner.id,
          cid: banner.cid,
          iid: request.view_id,
          url: banner.serve_url,
          ctx: UrlSafeBase64Encode(JSON.stringify(request.context)),
        })
        openExternalURL(url)
      }),
    )
  }

  renderText (host: Entity, icon: string, message: string) {
    let QRPlane2 = new Entity()
    QRPlane2.setParent(host)
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
    QRPlane.setParent(host)
    QRPlane.addComponent(new PlaneShape())

    const transform = host.getComponent(Transform)
    let size = Math.sqrt(transform.scale.x * transform.scale.y) / 2
    let scale = {
      x: size / transform.scale.x,
      y: size / transform.scale.y,
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

    QRPlane.addComponent(
      new OnPointerDown(() => {
        canvas.visible = !canvas.visible
        canvas.isPointerBlocker = canvas.visible
      }),
    )
  }

  renderError (host: Entity, errors: string[]) {
    this.renderText(host, 'https://assets.adshares.net/metaverse/error.png',
      'Banner ERROR\n\n' + errors.join('\n'))
  }

  async renderBanner (host: Entity, banner: any) {
    let QRPlane = new Entity()
    QRPlane.setParent(host)
    QRPlane.addComponent(new PlaneShape())
    QRPlane.addComponent(
      new Transform({
        position: new Vector3(0, 0.5, 0),
        rotation: Quaternion.Euler(banner.type == 'image' ? 180 : 0, 0, 0),
        scale: new Vector3(1, 1, 1),
      }),
    )

    let QRMaterial = new Material()

    QRMaterial.metallic = 0
    QRMaterial.roughness = 1
    QRMaterial.specularIntensity = 0
    let QRTexture
    if (banner) {
      if (banner.type == 'image') {
        QRTexture = new Texture(banner.serve_url)
      } else if (banner.type == 'video') {
        let video_url = banner.serve_url
        video_url += video_url.indexOf('?') == -1 ? '?' : '&'
        const video = new VideoClip(video_url + '/y.mp4')
        QRTexture = new VideoTexture(video)
        QRTexture.loop = true
        QRTexture.play()
      } else {
        this.renderError(host, ['Invalid banner format: ' + banner.type])
      }
      QRMaterial.albedoTexture = QRTexture
    } else {
      QRMaterial.albedoColor = Color3.White()
    }
    QRPlane.addComponent(QRMaterial)

    if (banner) {
      QRPlane.addComponent(
        new OnClick(() => {
          openExternalURL(banner.click_url)
        }),
      )
    }
  }

  spawn (host: Entity, props: Props, channel: IChannel) {
    this.bannerCounter++
    if (this.bannerCounter > 20) {
      this.renderError(host, ['To many banners, max 20'])
    } else {
      this.find(host, props).then()
    }
  }
}
