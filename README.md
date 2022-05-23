<p align="center">
  <a href="https://adshares.net/">
    <img src="https://adshares.net/logos/ads.svg" alt="Adshares" width=72 height=72>
  </a>
  <h3 align="center"><small>ADS JS Library</small></h3>
  <p align="center">
    <a href="https://github.com/adshares/decentraland/issues/new?template=bug_report.md&labels=Bug">Report bug</a>
    ·
    <a href="https://github.com/adshares/decentraland/issues/new?template=feature_request.md&labels=New%20Feature">Request feature</a>
    ·
    <a href="https://github.com/adshares/ads/wiki">Wiki</a>
  </p>
</p>

<br>

Adshares smart items for **Decentraland** scenes. You can use it in your scenes for addition hassle-free earnings.

Easy configuration. Just fill out your payout address (Adshares blockchain or as BEP20 token) and get paid in $ADS for every visitor on your scene.


## Install

```bash
npm install @adshares/decentraland

yarn add @adshares/decentraland
```

## Usage

```js
import AdsharesBanner from '../node_modules/@adshares/decentraland/src/item'

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
```

### Contributing

Please follow our [Contributing Guidelines](docs/CONTRIBUTING.md)

### Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/adshares/decentraland/tags).

## Authors

- **[Contributor](https://github.com/smartsir796)** - _programmer_

See also the list of [contributors](https://github.com/adshares/decentraland/contributors) who participated in this project.

### License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## More info

- [Adshares](https://adshares.net)
- [Usage instructions](https://adshar.es/decentraland)
- [DCL smart items](https://docs.decentraland.org/development-guide/smart-items/)
