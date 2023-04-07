import { IPlacement } from './placement'
import { Creative, CustomCommand } from './creative'
import { getParcel, ILand } from '@decentraland/ParcelIdentity'
import { addUrlParam, parseErrors, uuidv4 } from './utils'
import { setInterval, setTimeout, TimerSystem } from './timer'
import { FlatFetchInit } from '@decentraland/SignedFetch'
import { IStand } from './stand'
import { UIPlacement } from './UIPlacement'
import { getUserData } from '@decentraland/Identity'
import { getPlayersInScene } from '@decentraland/Players'

enum PlacementType {
  PLAIN = 'plainPlacement',
  UI = 'UIPlacement'
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
  private plainPlacements: IPlacement[] = []
  private UIPlacements: IPlacement[] = []
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
        this.plainPlacements.push(...item.getPlacements())
      } else {
        this.plainPlacements.push(item)
      }
    })
    this.bannerCounter += this.plainPlacements.length
    const maxPlacements = this.getMaxPlacements()
    if (this.bannerCounter > maxPlacements) {
      const message = `To many placements, you can add up to ${maxPlacements} placements.`
      this.renderError(message)
      throw new Error(message)
    } else {
      this.checkPlacements(PlacementType.PLAIN)
      return this
    }
  }

  allowUIPlacements (...position: Array<'top' /*| 'bottom' */ | 'left' | 'right' | 'center'>) {
    position.forEach(pos => {
      if (pos === 'center') {
        const centerUI = new UIPlacement('UICenter', 'center')
        this.UIPlacements.push(centerUI)
      } else if (pos === 'top') {
        const topUI = new UIPlacement('UITop', 'top')
        this.UIPlacements.push(topUI)
      } else if (pos === 'left') {
        const leftUI = new UIPlacement('UILeft', 'left')
        this.UIPlacements.push(leftUI)
      } else if (pos === 'right') {
        const rightUI = new UIPlacement('UIRight', 'right')
        this.UIPlacements.push(rightUI)
      }
    })
    this.checkPlacements(PlacementType.UI)
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
      this.plainPlacements.forEach(item => item.renderMessage(message, icon))
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

  private async fetchCreatives (type: PlacementType.UI | PlacementType.PLAIN, userAccount: string | null): Promise<{ creatives: Creative[], customCommands: CustomCommand[] }> {
    const parcel = await getParcel()
    const placements: any[] = []

    if (type === PlacementType.PLAIN) {
      this.plainPlacements.forEach((placement, index) => {
        placements.push({ ...placement.getProps(), id: type + '-' + placement.getProps().name })
      })
    }

    if (type === PlacementType.UI) {
      this.UIPlacements.forEach((placement, index) => {
        placements.push({ ...placement.getProps(), id: type + '-' + placement.getProps().name })
      })
    }

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

  private async checkPlacements (type: PlacementType): Promise<any> /*: Promise<{ creatives: Creative[], customCommands: CustomCommand[] }>*/ {
    const userData = await getUserData()
    const userAccount: string | null = userData?.userId || null

    switch (type) {
      case PlacementType.PLAIN:
        this.renderCreative(type, this.plainPlacements, userAccount)
        break

      case PlacementType.UI:
        let isPlayerInScene = false

        /* check is player on scene */
        setInterval(async () => {
          const playersInScene = await getPlayersInScene()
          const checkResult = userAccount ? playersInScene.map(p => p.userId).indexOf(userAccount) !== -1 : false
          if (checkResult === isPlayerInScene) {
            return
          }
          isPlayerInScene = checkResult

          if (isPlayerInScene) {
            this.renderCreative(PlacementType.UI, this.UIPlacements, userAccount)
          }

        }, 500)
        break

      default:
        break
    }
  }

  private async renderCreative (type: PlacementType, placements: IPlacement[], userAccount: string | null): Promise<any> {
    if (placements.length === 0) return
    const placementsToRender = [...placements]
    let creatives: Creative[] = []
    let customCommands = []
    try {
      const response = await this.fetchCreatives(type, userAccount)
      creatives = response.creatives
      customCommands = response.customCommands
    } catch (exception) {
      this.renderError('' + exception)
      throw exception
    }

    this.registerUser(userAccount)

    placementsToRender.forEach((placement, index) => {
      const creative: Creative = creatives.filter((item: any) => item.id === type + '-' + placement.getProps().name)[0]
      if (!creative || type === PlacementType.UI && creative?.type === 'video') {
        this.renderMessage(`We can't match any creative.\n\nImpression ID: ${this.impressionId}`, 'notfound', placement)
        return
      }
      placement.reset()
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

      const indexInState = placements.map(p => p.name).indexOf(placement.name)
      if (indexInState !== -1) {
        placements.splice(indexInState, 1)
      }

      setTimeout(() => {
        if (indexInState === -1) {
          return
        }
        placements.push(placement)

        this.renderCreative(type, placements, userAccount)
      }, Math.max(creative.refreshTime, 5000))
    })

    if (customCommands.length > 0) {
      customCommands.forEach(command => command.executeCustomCommand())
    }
    return { creatives, customCommands }
  }
}
