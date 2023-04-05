import { IPlacement } from './placement'
import { Creative, CustomCommand } from './creative'
import { getUserAccount } from '@decentraland/EthereumController'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { addUrlParam, parseErrors, uuidv4 } from './utils'
import setTimeout from './timer'
import { FlatFetchInit } from '@decentraland/SignedFetch'
import { IStand } from './stand'
import { UIPlacement } from './UIPlacement'

enum PlacementType {
  PLAIN = 'plain',
  UI = 'ui'
}

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
  private uiPlacements: IPlacement[] = []
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
    this.renderInfo()
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
    this.bannerCounter += this.placements.length
    const maxPlacements = this.getMaxPlacements()
    if (this.bannerCounter > maxPlacements) {
      const message = `To many placements, you can add up to ${maxPlacements} placements.`
      this.renderError(message)
      throw new Error(message)
    } else {
      this.find(PlacementType.PLAIN)
      return this
    }
  }

  allowUIPlacements (...position: Array<'top' | 'bottom' | 'left' | 'right' | 'center'>) {
    position.forEach(pos => {
      if (pos === 'center') {
        const leftUI = new UIPlacement('UICenter')
        this.uiPlacements.push(leftUI)
      } else if (pos === 'top') {
        this.uiPlacements.push()
      } else if (pos === 'bottom') {
        this.uiPlacements.push()
      } else if (pos === 'left') {
        this.uiPlacements.push()
      } else if (pos === 'right') {
        this.uiPlacements.push()
      }
    })
    log(this.uiPlacements)
    this.find(PlacementType.UI)
    return this
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

  private async fetchCreatives (type: PlacementType.UI | PlacementType.PLAIN, userAccount?: string): Promise<{ creatives: Creative[], customCommands: CustomCommand[] }> {
    const parcel = await getParcel()
    const placements: any[] = []

    if (type === PlacementType.PLAIN) {
      this.placements.forEach((placement, index) => {
        placements.push({ ...placement.getProps(), id: type + index })
      })
    }

    if (type === PlacementType.UI) {
      this.uiPlacements.forEach((placement, index) => {
        placements.push({ ...placement.getProps(), id: type + index })
      })
    }

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
    const customCommands: CustomCommand[] = []
    const response = await this.fetch(`${this.adserver}/supply/find`, request)
    response.data.forEach((item: any) => {
      creatives.push(new Creative(item))
    })
    if (response.custom) {
      customCommands.push(new CustomCommand(response.custom))
    }
    return { creatives, customCommands }
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

  private async find (type: PlacementType): Promise<{ creatives: Creative[], customCommands: CustomCommand[] }> {
    const userAccount = await getUserAccount()
    let creatives: Creative[] = []
    let customCommands: CustomCommand[] = []
    try {
      const response = await this.fetchCreatives(type, userAccount)
      creatives = response.creatives
      customCommands = response.customCommands
    } catch (exception) {
      this.renderError('' + exception)
      throw exception
    }

    let refreshTime: number = 0
    switch (type) {
      case PlacementType.PLAIN:
        this.registerUser(userAccount)
        this.placements.forEach((placement, index) => {
          placement.reset()
          const creative: Creative = creatives.filter((item: any) => item.id === type + index)[0]
          refreshTime = Math.max(refreshTime, creative.refreshTime)
          this.renderCreative(placement, creative, userAccount)
        })
        setTimeout(() => {
          this.find(type)
        }, Math.max(refreshTime, 5000))
        break

      case PlacementType.UI:
        this.registerUser(userAccount)
        this.uiPlacements.forEach((placement, index) => {
          placement.reset()
          const creative: Creative = creatives.filter((item: any) => item.id === type + index)[0]
          refreshTime = Math.max(refreshTime, creative.refreshTime)
          this.renderCreative(placement, creative, userAccount)
        })
        setTimeout(() => {
          this.find(type)
        }, Math.max(refreshTime, 5000))
        break

      default:
        break
    }

    if (customCommands.length > 0) {
      customCommands.forEach(command => command.executeCustomCommand())
    }

    return { creatives, customCommands }
  }

  renderCreative (placement, creative, userAccount) {
    if (!creative) {
      this.renderMessage(`We can't match any creative.\n\nImpression ID: ${this.impressionId}`, 'notfound', placement)
      return
    }
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
  }
}
