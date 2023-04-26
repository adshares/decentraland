import { TCustomCommand } from './types'
import { addUrlParam, uuidv4 } from './utils'
import { setTimeout } from './timer'

export class Creative {
  clickUrl: string = ''
  creativeId: string = ''
  demandServer: string = ''
  hash: string = ''
  id: string = ''
  infoBox: boolean = true
  placementId: string = ''
  publisherId: string = ''
  rpm: number = 0
  scope: string = ''
  serveUrl: string = ''
  supplyServer: string = ''
  type: string = ''
  viewUrl: string = ''
  zoneId: string = ''
  caseId: string
  refreshTime: number = 30000

  public constructor (data: any) {
    this.caseId = uuidv4()
    for (const key in data) {
      if (this.hasOwnProperty(key)) {
        // @ts-ignore
        this[key] = data[key]
      }
    }
    this.viewUrl = addUrlParam(this.viewUrl, { cid: this.caseId })
    this.clickUrl = addUrlParam(this.clickUrl, { cid: this.caseId })
  }
}

export class CustomCommand {
  teleportTo: TCustomCommand['teleportTo'] = undefined

  constructor (customCommand: TCustomCommand) {
    for (const key in customCommand) {
      if (this.hasOwnProperty(key)) {
        // @ts-ignore
        this[key] = customCommand[key]
      }
    }
  }

  executeCustomCommand () {
    if (this.teleportTo) {
      setTimeout(() => {
        // @ts-ignore
        teleportTo(this.teleportTo.coordinates)
      }, this.teleportTo.delay || 0)
      return
    }
  }
}
