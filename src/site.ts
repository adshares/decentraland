import { IPlacement } from './placement'
import Publisher from './publisher'
import Creative from './creative'
import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { uuidv4, parseErrors, addUrlParam } from './utils'

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
  private impressionId: string
  private loadedUcps: IHash = {}

  public constructor (public publisher: Publisher) {
    this.impressionId = uuidv4()
  }

  public addPlacement (...placements: IPlacement[]): Site {
    this.placements.push(...placements)
    return this
  }

  public async start (): Promise<any> {
    this.bannerCounter += this.placements.length
    const maxPlacements = this.getMaxPlacements()
    if (this.bannerCounter > maxPlacements) {
      const message = `To many placements, you can add up to ${maxPlacements} placements.`
      this.renderError(message)
      throw new Error(message)
    } else {
      return this.find()
    }
  }

  private getMaxPlacements (): number {
    return 20
  }

  private renderMessage (message: string, icon: string, placement: IPlacement | null = null): void {
    message = message + '\n\nAdserver: ' + this.publisher.adserver + '\nPublisher: ' + this.publisher.id
    if (placement !== null) {
      placement.renderMessage(message, icon)
    } else {
      this.placements.forEach(item => item.renderMessage(message, icon))
    }
  }

  private renderError (message: string, placement: IPlacement | null = null): void {
    this.renderMessage(message, 'error', placement)
  }

  private getSceneUrl (land: ILand): string {
    return 'https://scene-' +
      land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
        .replace(',', '-') + '.decentraland.org/'
  }

  private async registerUcp (url: string, stid: string | null): Promise<boolean> {
    if (!this.loadedUcps[url]) {
      const signedFetch = await importFetch()
      signedFetch(stid !== null ? `${url}&stid=${stid}` : url)
      this.loadedUcps[url] = true
      return true
    }
    return false
  }

  private async registerUser (userAccount: string | null): Promise<boolean> {
    const registerUrl = this.publisher.adserver + '/supply/register?iid=' + this.impressionId
    return this.registerUcp(registerUrl, userAccount)
  }

  private getInfoUrl (impressionId: string, creative: Creative): string {
    return addUrlParam(this.publisher.adserver + '/supply/why', {
      iid: impressionId,
      bid: creative.creativeId,
      cid: creative.caseId,
      url: creative.serveUrl,
      // ctx: UrlSafeBase64Encode(JSON.stringify(request.context)),
    })
  }

  private async fetch (url: string, data: any) {
    try {
      let callResponse = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      })
      const response = await callResponse.json()
      if (!callResponse.ok) {
        throw new Error(parseErrors(response).join('\n'))
      }
      return response
    } catch (exception) {
      throw new Error(`Failed to reach URL ${url}`)
    }
  }

  private async fetchCreatives (userAccount: string | null): Promise<Creative[]> {

    const parcel = await getParcel()
    const placements: any[] = []
    this.placements.forEach((placement, index) => {
      placements.push({ ...placement.getProps(), id: '' + index })
    })

    const request = {
      context: {
        iid: this.impressionId,
        url: this.getSceneUrl(parcel.land),
        publisher: this.publisher.id,
        medium: 'metaverse',
        vendor: 'decentraland',
        uid: userAccount || '',
        metamask: userAccount !== null,
        version: '2.0.0',
      },
      placements
    }

    const creatives: Creative[] = []
    const response = await this.fetch(`${this.publisher.adserver}/supply/find`, request)
    response.data.forEach((item: any) => { creatives.push(new Creative(item)) })
    return creatives
  }

  private async find (cleanup: boolean = false): Promise<Creative[]> {
    const userAccount = await getUserAccount() || null

    this.registerUser(userAccount)

    let creatives: Creative[] = []
    try {
      creatives = await this.fetchCreatives(userAccount)
    } catch (exception) {
      this.renderError('' + exception)
      throw exception
    }

    this.placements.forEach((placement, index) => {
      if (cleanup) {
        placement.reset()
      }
      const creative: Creative = creatives.filter((item: any) => item.id === '' + index)[0]
      if (!creative) {
        this.renderMessage(`We can't match any creative.\n\nImpression ID: ${this.impressionId}`, 'notfound')
        return
      }
      placement.renderCreative(creative)
      if (creative.infoBox) {
        placement.renderInfoBox(this.getInfoUrl(this.impressionId, creative))
      }
    })

    return creatives

    // let banner
    // if (response.banners) {
    //   banner = response.banners[0]
    //   if (banner) {
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
    //   } 
    // }

    //     setTimeout (() => {
    //       this.find (host, props,!isBuilder)
    //     }, banner && banner.refresh ? banner.refresh : 30000)
    //   
  }
}
