import AdsharesBanner from './item'

const adsharesBanner = new AdsharesBanner()

const unit1 = new Entity('unit1');
unit1.addComponent(new Transform({
   position: new Vector3(4, 0, 8),
   scale: new Vector3(2, 2, 0.1),
}));
engine.addEntity(unit1);
adsharesBanner.spawn(
   unit1,
   {
     payout_network: 'ads',
     payout_address: '0001-000000F1-6451',
     keywords: 'decentraland,metaverse',
     zone_name: 'default',
     adserver: 'https://app.web3ads.net',
     exclude: '{"quality": ["low"], "category": ["adult"]}',
   }
)

const unit2 = new Entity('unit2');
unit2.addComponent(new Transform({
   position: new Vector3(6, 0, 6),
   scale: new Vector3(2, 2, 0.1),
}));
engine.addEntity(unit2);
adsharesBanner.spawn(
   unit2,
   {
       payout_network: 'bsc',
       payout_address: '0xcfcecfe2bd2fed07a9145222e8a7ad9cf1ccd22a', // put your metamask address here (binance chain)
       keywords: 'decentraland,metaverse',
       zone_name: 'default',
       adserver: 'https://app.web3ads.net',
       exclude: '{"quality": ["low"], "category": ["adult"]}',
   }
)
