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
import * as Ads from '../node_modules/@adshares/decentraland/src/index'
```

### 2. Create supply agent

```js
const agent = new Ads.SupplyAgent(adserver: string, publisherId: string)
```

or

```js
const agent = Ads.SupplyAgent.fromWallet(adserver: string, chain: string, wallet: string)
```

In function **fromWallet()** first argument is adserver network, second argument is payout network (ads, bsc), and third argument is wallet address in this payout network.

### 3. Create Placement or Stand

#### Placements

Placements are the basic objects for displaying creatives.
Every placement implements IEntity and has access to IEntity methods.

Usage:

```js
const placement = new Ads.PlainPlacement(name: string, options?: {})
```

Available options:

```js
{
  position?: Vector3, // @decentraland-ecs
  rotation?: Quaternion, // @decentraland-ecs
  width?: number,
  ratio?: '9:16' | '3:4' | '1:1' | '4:3' | '16:9',
  no?: number | null,
  types?: string[] | null,
  mimes?: string[] | null,
  background?: Material | null,
}
```

#### Stands

Stands combine several placements into one object.
Every stand implements IEntity and has access to IEntity methods.

Available stands:

| Class | Description                | Ratios | Models             |
|-------|----------------------------|--------|--------------------|
| Totem | A simple advertising totem | 9:16   | ads_totem_9_16.glb |

You must copy the models to the root scene folder before using the stands. It's a good practice to copy only the models you use.

```bash
cp -r node_modules/@adshares/decentraland/models/ads_totem_9_16.glb models/
```

Usage:

```js
const totem = new Ads.Totem(name: string, options?: {})
```

Available options:

```js
{
  types?: string[] | null,
  mimes?: string[] | null,
}
```


### 4. Add placements into Decentraland engine

```js
engine.addEntity(placement)
// or
engine.addEntity(totem)
```
or 

```js
placement.setParent(myEntity)
// or
totem.setParent(myEntity)
```

### 5. Add placement into agent and spawn banner

```js
agent.addPlacement(placement: IPlacement | IStand).spawn()
```

### Example

```js
import * as Ads from '../node_modules/@adshares/decentraland/src/index'

const agent = Ads.SupplyAgent.fromWallet('https://app.web3ads.net', 'ads', '0001-00000000-9B6F')

const placement1 = new Ads.PlainPlacement('unit1', {
  position: new Vector3(8,2, 8),
  rotation: new Quaternion(0, 0, 0, 1),
  width: 5,
  ratio: '16:9',
})
engine.addEntity(placement1)

const placement2 = new Ads.PlainPlacement('unit2', {
  position: new Vector3(11, 2, 6),
  rotation: new Quaternion(0, 1, 0, 1),
  width: 3,
  ratio: '3:4',
})
engine.addEntity(placement2)

const totem = new Ads.Totem('unit3', {
  position: new Vector3(2, 0, 2),
})
engine.addEntity(totem)

agent.addPlacement(placement1, placement2, totem).spawn()
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
