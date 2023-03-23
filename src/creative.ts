import { addUrlParam, uuidv4 } from './utils'

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

export declare type TCustomCommand = {
  teleportTo?: string,
  openExternalURL?: string,
  delay?: number,
}
