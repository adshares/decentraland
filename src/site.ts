import { IPlacement } from './placement'
import Publisher from './publisher'
import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { getRandId, parseErrors, urlSafeBase64Encode } from './utils'

interface IHash {
  [details: string]: boolean;
}

let SignedFetch: Function
let isBuilder = false

async function importFetch (): Promise<any> {
  if (SignedFetch) {
    return SignedFetch
  }

  await import('@decentraland/SignedFetch').then((x: any) => {
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

export default class Site {
  public placements: IPlacement[] = []
  private bannerCounter: number = 0
  private impressionId: string | null = null
  private loadedUcps: IHash = {}

  public constructor (public publisher: Publisher) {
  }

  public addPlacement (...placements: IPlacement[]): Site {
    this.placements.push(...placements)
    return this
  }

  public spawn (): Promise<any> {
    const maxPlacements = this.getMaxPlacements()
    return new Promise((resolve, reject) => {
      this.find().then()

      this.placements.forEach((placement, index) => {
        log(index, placement.getProps())
        // this.bannerCounter++
        // if (this.bannerCounter > maxPlacements) {
        //   this.renderError(placement, [`To many placements, max ${maxPlacements}`])
        // } else {
        //   this.find().then()
        // }
      })
    })
  }

  private getMaxPlacements (): number {
    return 20
  }

  private renderError (placement: IPlacement, errors: string[]): void {
    placement.renderError([
      ...errors,
      '\nAdserver: ' + this.publisher.adserver + '\nPublisher: ' + this.publisher.id
    ])
  }

  private getSceneUrl (land: ILand): string {
    return 'https://scene-' +
      land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
        .replace(',', '-') + '.decentraland.org/'
  }

  private getImpressionId (): string {
    if (this.impressionId === null) {
      this.impressionId = urlSafeBase64Encode(getRandId(16))
    }
    return this.impressionId
  }

  private async registerUcp (url: string, stid: string | undefined): Promise<any> {
    if (!this.loadedUcps[url]) {
      const signedFetch = await importFetch()
      signedFetch(stid !== undefined ? `${url}&stid=${stid}` : url)
      this.loadedUcps[url] = true
    }
  }

  private async registerUser (userAccount: string | undefined): Promise<any> {
    const registerUrl = this.publisher.adserver + '/supply/register?iid=' + this.getImpressionId()
    await this.registerUcp(registerUrl, userAccount)
  }

  private async find (cleanup: boolean = false) {
    const userAccount = await getUserAccount()
    const parcel = await getParcel()

    this.registerUser(userAccount).then()

    const placements: any[] = []
    this.placements.forEach((placement, index) => {
      placements.push({ ...placement.getProps(), id: '' + index })
    })

    let request = {
      context: {
        iid: this.getImpressionId(),
        url: this.getSceneUrl(parcel.land),
        publisher: this.publisher.id,
        medium: 'metaverse',
        vendor: 'decentraland',
        uid: userAccount,
        metamask: userAccount !== undefined,
        version: '2.0.0',
      },
      placements
    }

    let response: any = {}

    try {
      let callUrl = this.publisher.adserver + '/supply/find'
      let callResponse = await fetch(callUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(request),
      })
      response = await callResponse.json()
      log(request, response)
    } catch (exception) {
      log('Failed to reach URL', exception)
    }

    const errors: string[] = response.success ? [] : parseErrors(response)
    this.placements.forEach((placement, index) => {
      if (cleanup) {
        placement.reset()
      }
      if (errors.length > 0) {
        this.renderError(placement, errors)
      } else {
        log('render banner')
      }
    })

// let banner
// if (response.banners) {
//   banner = response.banners[0]
//   if (banner) {
//     banner.cid = this.getCid()
//     let viewContext = {
//       page: {
//         iid: request.view_id,
//         url: request.context.site.url,
//         keywords: request.context.site.keywords,
//         metamask: request.context.site.metamask,
//       },
//       user: {
//         account: request.context.user.account,
//       },
//     }
//     banner.click_url = addUrlParam(banner.click_url,
//       {
//         cid: banner.cid,
//         ctx: UrlSafeBase64Encode(JSON.stringify(viewContext)),
//         iid: request.view_id,
//         stid: userAccount,
//       },
//     )
//     banner.view_url = addUrlParam(banner.view_url,
//       {
//         cid: banner.cid,
//         ctx: UrlSafeBase64Encode(JSON.stringify(viewContext)),
//         iid: request.view_id,
//         json: 1,
//         stid: userAccount,
//       })
//     await this.renderBanner(host, props, banner)
//
//     if (false !== banner.info_box) {
//       this.showWaterMark(host, props, request, banner)
//     }
//
//     try {
//       let loadedAdusers = this.loadedAdusers
//       signedFetch(banner.view_url).then(function (response: any) {
//         let object
//         if (response.text) {
//           object = JSON.parse(response.text)
//         } else {
//           object = response.json
//         }
//         if (object.aduser_url && !loadedAdusers[object.aduser_url]) {
//           signedFetch(object.aduser_url)
//           loadedAdusers[object.aduser_url] = true
//         }
//       })
//
//     } catch (e) {
//       // log('view log failed', e)
//     }
//   } else {
//     this.renderText(host, props, 'https://assets.adshares.net/metaverse/notfound.png',
//       'Banner not found\n\nImpression ID: ' + request.view_id +
//       '\n\nconfig: ' + JSON.stringify(props, null, '\t'))
//   }
// }
// if (!response.success) {
//   let errors: string[] = []
//   if (response.errors) {
//     let k: any
//     let v: any
//     for (k in response.errors) {
//       //errors.push(k)
//       v = response.errors[k]
//       if (typeof v !== 'object') {
//         v = Array(v)
//       }
//       v.forEach((text: string) => {
//         errors.push(text)
//       })
//       errors.push('')
//     }
//
//   }
//   errors.push('\nconfig: ' + JSON.stringify(props, null, '\t'))
//   this.renderError(host, props, errors)
//   }
//     setTimeout (() => {
//       this.find (host, props,!isBuilder)
//     }, banner && banner.refresh ? banner.refresh : 30000)
//   }
  }
}
