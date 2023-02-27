import { addUrlParam, uuidv4 } from './utils'

export default class Creative {
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

  public constructor (data: any) {
    this.caseId = uuidv4()
    for (var key in data) {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key]
      }
    }
    this.viewUrl = addUrlParam(this.viewUrl,
      {
        cid: this.caseId,
      }
    )
    this.clickUrl = addUrlParam(this.clickUrl,
      {
        cid: this.caseId,
      },
    )
  }
}
