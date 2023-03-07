<p align="center">
  <a href="https://adshares.net/">
    <img src="https://adshares.net/logos/ads.svg" alt="Adshares" width=72 height=72>
  </a>
  <h3 align="center"><small>Adshares DCL plugin</small></h3>
  <p align="center">
    <a href="https://github.com/adshares/decentraland/issues/new?template=bug_report.md&labels=Bug">Report bug</a>
    ·
    <a href="https://github.com/adshares/decentraland/issues/new?template=feature_request.md&labels=New%20Feature">Request feature</a>
    ·
    <a href="https://docs.adshares.net/adserver/">Docs</a>
  </p>
</p>

<br>

Adshares plugin for **Decentraland** SDK. You can use it in your scenes for addition hassle-free earnings.

Easy configuration. Just fill out your payout address (Adshares blockchain or as BEP20 token) and get paid in $ADS for every visitor on your scene. See [DCL Example Scene](https://github.com/adshares/dcl-scene).

## Install

```bash
npm install @adshares/decentraland
```

### Update

```bash
npm update @adshares/decentraland
```

## Usage

### 1. Import dependencies

```js
import {PlainPlacement, SupplyAgent} from '../node_modules/@adshares/decentraland/src/index'
```

### 2. Create supply agent

```js
const agent = new SupplyAgent(adserver: string, publisherId: string)
```

or

```js
const agent = SupplyAgent.fromWallet(adserver: string, chain: string, wallet: string)
```

In function **fromWallet()** first argument is adserver network, second argument is payout network (ads, bsc), and third argument is wallet address in this payout network.

### 3. Create Placement

```js
const placement = new PlainPlacement(name: string, options?: {})
```

PlainPlacement extends Entity and has access to Entity methods except *Entity.addComponent()*

#### Available options:

```js
{
  position?: Vector3, // @decentraland-ecs
  rotation?: Quaternion, // @decentraland-ecs
  width?: number,
  ratio?: '9:16' | '3:4' | '1:1' | '4:3' | '16:9',
  types?: string[] | null,
  mimes?: string[] | null,
  background?: Material | null,
}
```

### 4. Add placement into Decentraland engine

```js
engine.addEntity(placement)
```
or 

```js
placement.setParent(myEntity)
```

### 5. Add placement into agent and spawn banner

```js
agent.addPlacement(placement: Entity).spawn()
```

### Example

```js
import {PlainPlacement, SupplyAgent} from '../node_modules/@adshares/decentraland/src/index'

const agent = new SupplyAgent('https://app.web3ads.net', 'e39f6593-578e-41f0-8d06-88aff41c6a19')

const placement1 = new PlainPlacement('unit1', {
  position: new Vector3(8,2, 8),
  rotation: new Quaternion(0,0,0,1),
  width: 5,
  ratio: '16:9',
})
engine.addEntity(placement1)

const placement2 = new PlainPlacement('unit2', {
  position: new Vector3(11,2, 6),
  rotation: new Quaternion(0,1,0,1),
  width: 3,
  ratio: '3:4',
})
engine.addEntity(placement2)

agent.addPlacement(placement1, placement2).spawn()
```

![Placement example](/assets/placement_example.png "Decentraland scene")

### Contributing

Please follow our [Contributing Guidelines](docs/CONTRIBUTING.md)

### Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/adshares/decentraland/tags).

## Authors

- **[Mykola Zhura](https://github.com/Niko-Yea)** - _programmer_
- **[Maciej Pilarczyk](https://github.com/m-pilarczyk)** - _programmer_
- **[Contributor](https://github.com/smartsir796)** - _programmer_

See also the list of [contributors](https://github.com/adshares/decentraland/contributors) who participated in this project.

### License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## More info

- [DCL Example Scene](https://github.com/adshares/dcl-scene)
- [DCL Smart Banner](https://github.com/adshares/dcl-smart-banner)
- [Adshares](https://adshares.net)
- [Adshares Docs](https://docs.adshares.net)
