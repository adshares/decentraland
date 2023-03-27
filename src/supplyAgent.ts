import { IPlacement } from './placement'
import Creative from './creative'
import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { addUrlParam, parseErrors, uuidv4 } from './utils'
import setTimeout from './timer'
import { FlatFetchInit } from '@decentraland/SignedFetch'
import { IStand } from './stand'

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

export default class SupplyAgent {
  private readonly adserver: string
  private readonly publisherId: string
  private placements: IPlacement[] = []
  private bannerCounter: number = 0
  private readonly impressionId: string
  private loadedContexts: IHash = {}
  public readonly version = '2.1.0'

  public constructor (adserver: string, publisherId: string) {
    while (adserver.slice(-1) === '/') {
      adserver = adserver.slice(0, -1)
    }
    this.adserver = adserver
    this.publisherId = publisherId
    this.impressionId = uuidv4()
  }

  public static fromWallet (adserver: string, chain: 'ads' | 'bsc', address: string): SupplyAgent {
    return new SupplyAgent(adserver, `${chain}:${address.toLowerCase()}`)
  }

  public addPlacement (...placements: Array<IPlacement | IStand>): SupplyAgent {
    placements.forEach((item: IPlacement | IStand) => {
      if ('getPlacements' in item) {
        this.placements.push(...item.getPlacements())
      } else {
        this.placements.push(item)
      }
    })
    return this
  }

  public async spawn (): Promise<any> {
    this.renderInfo()
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
    message = message + '\n\nAdserver: ' + this.adserver + '\nPublisher: ' + this.publisherId + '\nVersion: ' + this.version
    if (placement !== null) {
      placement.renderMessage(message, icon)
    } else {
      this.placements.forEach(item => item.renderMessage(message, icon))
    }
  }

  private renderError (message: string, placement: IPlacement | null = null): void {
    this.renderMessage(message, 'error', placement)
  }

  private renderInfo (): void {
    const logo =
      '                                                  \n' +
      '                                      ,((((((((.  \n' +
      '                                      ,((((((((.  \n' +
      '                                      ,((((((((.  \n' +
      '            */(((((/*        .//(((((/*((((((((.  \n' +
      '        /(((((((((((((((/  ((((((((((((((((((((.  \n' +
      '     .(((((((((((((((((((((..((((((((((((((((((.  \n' +
      '    *(((((((((((((((((((((((/ (((((((((((((((((.  \n' +
      '   ,((((((((/       /((((((((,        (((((((((.  \n' +
      '   *((((((((         ((((((((/        ,((((((((.  \n' +
      '   .((((((((/        /((((((((,      .(((((((((   \n' +
      '    *(((((((((((((((/ ((((((((((((((((((((((((.   \n' +
      '     .(((((((((((((((/ *((((((((((((((((((((/     \n' +
      '        /((((((((((((((/ ,((((((((((((((((*       \n' +
      '            ,/(((((/,        .*((((((*.           \n' +
      '                                                  '
    log(
      `\n${logo}\n` +
      `Adshares DCL plugin v${this.version} https://adshares.net\n` +
      `Publisher: ${this.publisherId} ${this.adserver}`
    )
  }

  private getSceneUrl (land: ILand): string {
    return 'https://scene-' +
      land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
        .replace(',', '-') + '.decentraland.org/'
  }

  private getInfoUrl (impressionId: string, creative: Creative): string {
    return addUrlParam(this.adserver + '/supply/why', {
      iid: impressionId,
      bid: creative.creativeId,
      cid: creative.caseId,
      url: creative.serveUrl,
      // ctx: UrlSafeBase64Encode(JSON.stringify(request.context)),
    })
  }

  private async fetch (url: string, data?: any, isJson: boolean = true, fetchFunction?: Function): Promise<any> {
    if (!fetchFunction) {
      fetchFunction = fetch
    }
    let init: FlatFetchInit = {}
    if (isJson) {
      init.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
      init.responseBodyType = 'json'
    }
    if (data) {
      init.method = 'POST'
      init.body = JSON.stringify(data)
    }
    let callResponse = await fetchFunction(url, init)
    let response = null
    if (isJson) {
      response = typeof callResponse.json === 'function' ? await callResponse.json() : callResponse.json
      if (!callResponse.ok) {
        throw new Error(parseErrors(response).join('\n'))
      }
    } else {
      response = typeof callResponse.text === 'function' ? await callResponse.text() : callResponse.text
    }
    return response
  }

  private async signedFetch (url: string, data?: any, isJson: boolean = true): Promise<any> {
    return this.fetch(url, data, isJson, await importFetch())
  }

  private async fetchCreatives (userAccount?: string): Promise<Creative[]> {
    const parcel = await getParcel()
    const placements: any[] = []
    this.placements.forEach((placement, index) => {
      placements.push({ ...placement.getProps(), id: '' + index })
    })

    const request = {
      context: {
        iid: this.impressionId,
        url: this.getSceneUrl(parcel.land),
        publisher: this.publisherId,
        medium: 'metaverse',
        vendor: 'decentraland',
        uid: userAccount || '',
        metamask: userAccount !== null,
        version: this.version,
      },
      placements
    }

    const creatives: Creative[] = []
    const response = await this.fetch(`${this.adserver}/supply/find`, request)
    response.data.forEach((item: any) => {
      creatives.push(new Creative(item))
    })
    return creatives
  }

  private registerContext (url: string, seedTrackingId?: string): boolean {
    if (!this.loadedContexts[url]) {
      this.signedFetch(seedTrackingId ? addUrlParam(url, { stid: seedTrackingId }) : url, null, false).then()
      this.loadedContexts[url] = true
      return true
    }
    return false
  }

  private registerUser (userAccount?: string): boolean {
    const registerUrl = this.adserver + '/supply/register?iid=' + this.impressionId
    return this.registerContext(registerUrl, userAccount)
  }

  private async find (cleanup: boolean = false): Promise<Creative[]> {
    const userAccount = await getUserAccount()

    this.registerUser(userAccount)

    let creatives: Creative[] = []
    try {
      creatives = await this.fetchCreatives(userAccount)
    } catch (exception) {
      this.renderError('' + exception)
      throw exception
    }

    let refreshTime: number = 0
    this.placements.forEach((placement, index) => {
      if (cleanup) {
        placement.reset()
      }

      const creative: Creative = creatives.filter((item: any) => item.id === '' + index)[0]
      if (!creative) {
        this.renderMessage(`We can't match any creative.\n\nImpression ID: ${this.impressionId}`, 'notfound')
        return
      }
      refreshTime = Math.max(refreshTime, creative.refreshTime)
      placement.renderCreative(creative)
      if (creative.infoBox) {
        placement.renderInfoBox(this.getInfoUrl(this.impressionId, creative))
      }

      this.signedFetch(creative.viewUrl).then((response: any) => {
        if (response.context) {
          response.context.forEach((url: string) => {
            this.registerContext(url, userAccount)
          })
        }
      })
    })

    setTimeout(() => {
      this.find(!isBuilder)
    }, Math.max(refreshTime, 5000))

    return creatives
  }
}
