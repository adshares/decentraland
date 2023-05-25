import { IPlacement, IStand } from './types'
import { Creative, CustomCommand } from './creative'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { addUrlParam, parseErrors, uuidv4 } from './utils'
import { setInterval, setTimeout } from './timer'
import { FlatFetchInit } from '@decentraland/SignedFetch'
import { UIPlacement } from './UIPlacement'
import { getUserData } from '@decentraland/Identity'
import { getPlayersInScene } from '@decentraland/Players'
import { Placement } from './enums'
import { BasePlacement } from './plainPlacement'

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
  private plainPlacements: IPlacement[] = []
  private UIPlacements: IPlacement[] = []
  private bannerCounter: number = 0
  private readonly impressionId: string
  private loadedContexts: IHash = {}
  public readonly version = '2.2.0'

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
    return this
  }

  async spawn (): Promise<any> {
    const maxPlacements = this.getMaxPlacements()

    this.placements.forEach((placement, index) => {
      if (placement instanceof UIPlacement) {
        const indexInState = this.UIPlacements.map(p => p.position).indexOf(placement.position)
        if (indexInState !== -1) {
          throw new Error(`Multiple attempts to add UI placements in the same position: ${placement.name} - ${placement.position}`)
        }
        this.UIPlacements.push(placement)
      } else if (placement instanceof BasePlacement) {
        this.bannerCounter += 1
        if (this.bannerCounter > maxPlacements) {
          const message = `To many placements, you can add up to ${maxPlacements} placements.`
          this.renderError(message)
          throw new Error(message)
        }
        this.plainPlacements.push(placement)
      }
    })
    this.placements = []

    await this.preparePlacements()
  }

  private getMaxPlacements (): number {
    return 20
  }

  private renderMessage (message: string, icon: string, placement: IPlacement | IPlacement[] | null = null): void {
    message = message + '\n\nAdserver: ' + this.adserver + '\nPublisher: ' + this.publisherId + '\nVersion: ' + this.version
    if (placement !== null) {
      if (Array.isArray(placement)){
        placement.forEach(placement => placement.renderMessage(message, icon))
        return
      }
      placement.renderMessage(message, icon)
    } else {
      this.placements.forEach(item => item.renderMessage(message, icon))
    }
  }

  private renderError (message: string, placement: IPlacement | IPlacement[] | null = null): void {
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

  private async fetchCreatives (type: Placement, placements: IPlacement[], userAccount: string | null): Promise<{ creatives: Creative[], customCommands: CustomCommand[] }> {
    const parcel = await getParcel()

    const request = {
      context: {
        iid: this.impressionId,
        url: this.getSceneUrl(parcel.land),
        publisher: this.publisherId,
        medium: 'metaverse',
        vendor: 'decentraland',
        uid: userAccount,
        metamask: userAccount !== null,
        version: this.version,
      },
      placements: placements.map(placement => ({ ...placement.getProps(), id: type + '-' + placement.getProps().name }))
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

  private registerContext (url: string, seedTrackingId: string | null): boolean {
    if (!this.loadedContexts[url]) {
      this.signedFetch(seedTrackingId ? addUrlParam(url, { stid: seedTrackingId }) : url, null, false).then()
      this.loadedContexts[url] = true
      return true
    }
    return false
  }

  private registerUser (userAccount: string | null): boolean {
    const registerUrl = this.adserver + '/supply/register?iid=' + this.impressionId
    return this.registerContext(registerUrl, userAccount)
  }

  private async preparePlacements (): Promise<any> {
    const userData = await getUserData()
    const userAccount: string | null = userData?.userId || null
    if (this.plainPlacements.length > 0) {
      this.renderCreatives(Placement.PLAIN, [...this.plainPlacements], userAccount)
      this.plainPlacements = []
    }

    let isPlayerInScene = false
    setInterval(async () => {
      const playersInScene = await getPlayersInScene()
      const checkResult = userAccount ? playersInScene.map(p => p.userId).indexOf(userAccount) !== -1 : false
      if (checkResult === isPlayerInScene) {
        return
      }
      isPlayerInScene = checkResult

      if (isPlayerInScene) {
        if (this.UIPlacements.length > 0) {
          this.renderCreatives(Placement.UI, [...this.UIPlacements], userAccount)
          this.UIPlacements = []
        }
      }
    }, 500)
  }

  private async renderCreatives (type: Placement, placements: IPlacement[], userAccount: string | null): Promise<any> {
    if (!placements.length) return

    let creatives: Creative[] = []
    let customCommands = []
    try {
      const response = await this.fetchCreatives(type, placements, userAccount)
      creatives = response.creatives
      customCommands = response.customCommands
    } catch (exception) {
      this.renderError('' + exception, placements)
      throw exception
    }

    this.registerUser(userAccount)
    let refreshTime = 0

    placements.forEach((placement, index) => {
      placement.reset()

      const creative: Creative = creatives.filter((item: any) => item.id === type + '-' + placement.getProps().name)[0]

      if (!creative) {
        this.renderMessage(`We can't match any creative.\n\nImpression ID: ${this.impressionId}`, 'notfound', placement)
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
    if (customCommands.length > 0) {
      customCommands.forEach(command => command.executeCustomCommand())
    }

    if (type !== Placement.UI) {
      setTimeout(() => {
        this.renderCreatives(type, placements, userAccount)
      }, Math.max(refreshTime, 5000))
    }

    return { creatives, customCommands }
  }
}
