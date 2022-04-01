import { Spawner } from '../node_modules/decentraland-builder-scripts/spawner'
import AdsharesBanner, { Props } from './item'

const banner = new AdsharesBanner()
const spawner = new Spawner<Props>(banner)

spawner.spawn(
  'banner',
  new Transform({
    position: new Vector3(4, 0, 8),
    scale: new Vector3(2, 2, 0.1),
  }),
  {
    payout_network: 'ads',
    payout_address: '0001-000000F1-6451',
    keywords: 'decentraland,metaverse',
    zone_name: 'default',
    adserver: 'https://adserver.priv',
    exclude: '{"quality": ["low"], "category": ["adult"]}',
  },
)

spawner.spawn(
  'banner',
  new Transform({
    position: new Vector3(6, 0, 6),
    scale: new Vector3(2, 2, 0.1),
  }),
  {
    payout_network: 'ads',
    payout_address: '0001-000000F1-6451',
    keywords: 'decentraland,metaverse',
    zone_name: 'default',
    adserver: 'https://adserver.priv',
    exclude: '{"quality": ["low"], "category": ["adult"]}',
  },
)
