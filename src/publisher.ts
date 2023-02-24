import Creative from './creative'
import { Chain } from './enums'
import { addUrlParam } from './utils'

export default class Publisher {
  public adserver: string

  public constructor (adserver: string, public id: string) {
    while (adserver.slice(-1) === '/') {
      adserver = adserver.slice(0, -1)
    }
    this.adserver = adserver
  }

  public static fromWallet (adserver: string, chain: Chain, address: string) {
    return new Publisher(adserver, `${chain}:${address.toLowerCase()}`)
  }
}
