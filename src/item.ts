import {getUserAccount} from '@decentraland/EthereumController'
import {getParcel, ILand} from '@decentraland/ParcelIdentity'
import {setTimeout} from './timer'

let SignedFetch: Function
let isBuilder = false

async function importFetch(): Promise<any> {
    if (SignedFetch) {
        return SignedFetch
    }

    await import("@decentraland/SignedFetch").then((x: any) => {
        if (typeof x === 'object') {
            x = x[0]
        }
        SignedFetch = x.signedFetch
    }, x => {
        SignedFetch = fetch
        isBuilder = true
    })
    return SignedFetch
}

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

export default class AdsharesBanner {
    impressionId: string = ''
    bannerCounter: number = 0
    loadedAdusers: IHash = {}

    init(args?: any) {
    }

    getRandId(bytes: Number): string {
        let d = new Date().getTime()

        let chars = []
        for (let i = 0; i < bytes; i++) {
            const r = (d + Math.random() * 256) % 256 | 0
            d = Math.floor(d / 256)
            chars.push(String.fromCharCode(r))
        }

        return chars.join('')
    }

    getImpressionId(): string {
        if (this.impressionId == '') {
            this.impressionId = UrlSafeBase64Encode(this.getRandId(16))
        }
        return this.impressionId
    }

    getSceneId(land: ILand): string {
        return 'scene-' +
            land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
                .replace(',', '-')
    }

    getSceneTags(land: ILand, extraTags: string[]): string {
        if (land.sceneJsonData.tags) {
            extraTags = extraTags.concat(land.sceneJsonData.tags)
        }
        return extraTags.join(',')
    }

    getCid() {
        let i, l, n
        let s = this.getRandId(15) + '\0'
        let o = ''
        for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i).toString(16)
            o += n.length < 2 ? '0' + n : n
        }
        return o
    }

    getCombinedScale(host: Entity): Vector3 {
        let scale = host.getComponent(Transform).scale
        let entity = host.getParent();

        while (entity) {
            if (entity.hasComponent(Transform)) {
                let pScale = entity.getComponent(Transform).scale

                scale = scale.multiply(pScale);

            }
            entity = entity.getParent();
        }

        return scale
    }

    async find(host: Entity, props: Props, cleanup: boolean = false) {
        const userAccount = await getUserAccount()
        const parcel = await getParcel()
        const scale = this.getCombinedScale(host)

        let signedFetch = await importFetch()

        if (this.impressionId == '') {
            const register_url = props.adserver + '/supply/register?iid=' + this.getImpressionId()
            signedFetch(register_url + '&stid=' + userAccount).then()
            this.loadedAdusers[register_url] = true
        }

        let request = {
            pay_to: props.payout_network + ':' + props.payout_address,
            view_id: this.getImpressionId(),
            zone_name: props.zone_name,
            width: scale.x,
            height: scale.y,
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
            version: '1.1.7',
        }

        let response: any = {}

        try {
            let callUrl = props.adserver + '/supply/anon?stid=' + userAccount
            let callResponse = await fetch(callUrl, {
                headers: {'Content-Type': 'application/json'},
                method: 'POST',
                body: JSON.stringify(request),
            })
            response = await callResponse.json()
            log(request, response)
        } catch (e) {
            log('failed to reach URL', e)
        }
        if(cleanup) {
            this.clearChildren(host)
        }
        let banner
        if (response.banners) {
            banner = response.banners[0]
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
                await this.renderBanner(host, props, banner)

                if (false !== banner.info_box) {
                    this.showWaterMark(host, props, request, banner)
                }

                try {
                    let loadedAdusers = this.loadedAdusers
                    signedFetch(banner.view_url).then(function (response: any) {
                        let object;
                        if (response.text) {
                            object = JSON.parse(response.text);
                        } else {
                            object = response.json;
                        }
                        if (object.aduser_url && !loadedAdusers[object.aduser_url]) {
                            signedFetch(object.aduser_url)
                            loadedAdusers[object.aduser_url] = true
                        }
                    })

                } catch (e) {
                    log('view log failed', e)
                }
            } else {
                this.renderText(host, props, 'https://assets.adshares.net/metaverse/notfound.png',
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
            this.renderError(host, props, errors)
        }


        setTimeout(() => {
            this.find(host, props, !isBuilder)
        }, banner && banner.refresh ? banner.refresh : 30000)
    }

    clearChildren(host: Entity) {
        for (let k in host.children) {
            let entity = host.children[k]
            entity.removeComponent(Transform)
            entity.removeComponent(PlaneShape)
            entity.removeComponent(Material)
            entity.removeComponent(OnClick)
            engine.removeEntity(host.children[k])
            delete host.children[k]
        }
    }

    showWaterMark(host: Entity, props: Props, request: any, banner: any) {
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

    renderText(host: Entity, props: Props, icon: string, message: string) {
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

        const hostScale = this.getCombinedScale(host)
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

    renderError(host: Entity, props: Props, errors: string[]) {
        this.renderText(host, props, 'https://assets.adshares.net/metaverse/error.png',
            'Banner ERROR\n\n' + errors.join('\n'))
    }

    async renderBanner(host: Entity, props: Props, banner: any) {
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
                            QRTexture.volume = 1;
                            return
                        } else {
                            QRTexture.volume = 0;
                        }
                    }
                    openExternalURL(banner.click_url)
                }),
            )
        }
    }

    normalizeProps(props: Props) {
        while(props.adserver.slice(-1) == '/') {
            props.adserver = props.adserver.slice(0, -1)
        }
    }

    spawn(host: Entity, props: Props, channel: any = null) {
        this.normalizeProps(props)
        this.bannerCounter++
        if (this.bannerCounter > 20) {
            this.renderError(host, props, ['To many banners, max 20'])
        } else {
            this.find(host, props).then()
        }
    }
}
