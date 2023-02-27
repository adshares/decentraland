import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import setTimeout from './timer'

export type Props = {
  payout_network: string
  payout_address: string
  keywords: string
  zone_name: string
  adserver: string
  exclude: string
  hide_errors?: boolean
  onMaterial?: (material: Material) => void // use to customize ad sceeen material properties
}

interface IHash {
  [details: string]: boolean;
}

export default class AdsharesBanner {
  impressionId: string = ''
  bannerCounter: number = 0
  loadedAdusers: IHash = {}

  init (args?: any) {
  }

  getImpressionId (): string {
    if (this.impressionId == '') {
      this.impressionId = UrlSafeBase64Encode(this.getRandId(16))
    }
    return this.impressionId
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

  clearChildren (host: Entity) {
    for (let k in host.children) {
      let entity = host.children[k]
      entity.removeComponent(Transform)
      entity.removeComponent(PlaneShape)
      entity.removeComponent(Material)
      entity.removeComponent(OnClick)
      // engine.removeEntity(host.children[k])
      delete host.children[k]
    }
  }

  showWaterMark (host: Entity, props: Props, request: any, banner: any) {
    const hostScale = this.getCombinedScale(host)
    let url = 'https://assets.adshares.net/metaverse/watermark.png'

    let QRTexture = new Texture(url)

    let size = Math.sqrt(hostScale.x * hostScale.y) / 10
    let scale = {
      x: size / hostScale.x,
      y: size / hostScale.y,
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

    if (props.onMaterial) {
      props.onMaterial(QRMaterial)
    }

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

  async renderBanner (host: Entity, props: Props, banner: any) {
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
    let QRTexture: Texture | VideoTexture
    if (banner) {
      if (banner.type == 'image') {
        QRTexture = new Texture(banner.serve_url)
        QRMaterial.albedoTexture = QRTexture
      } else if (banner.type == 'video') {
        let video_url = banner.serve_url
        video_url += video_url.indexOf('?') == -1 ? '?' : '&'
        const video = new VideoClip(video_url + '/y.mp4')
        QRTexture = new VideoTexture(video)
        QRTexture.loop = true
        QRTexture.volume = 0
        QRMaterial.albedoTexture = QRTexture
        QRTexture.play()
      } else {
        this.renderError(host, props, ['Invalid banner format: ' + banner.type])
      }

    } else {
      QRMaterial.albedoColor = Color3.White()
    }

    if (props.onMaterial) {
      props.onMaterial(QRMaterial)
    }

    QRPlane.addComponent(QRMaterial)

    if (banner) {
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
          openExternalURL(banner.click_url)
        }),
      )
    }
  }

  spawn (host: Entity, props: Props, channel: any = null) {
    this.normalizeProps(props)
    this.bannerCounter++
    if (this.bannerCounter > 20) {
      this.renderError(host, props, ['To many banners, max 20'])
    } else {
      this.find(host, props).then()
    }
  }
}
