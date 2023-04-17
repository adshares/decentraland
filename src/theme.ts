export const theme = new Texture('https://assets.adshares.net/metaverse/theme.png')

const themeWidth = 1024
const themeHeight = 640

declare type TSection = {
  sourceWidth: number,
  sourceHeight: number,
  sourceLeft: number,
  sourceTop: number
}

export const sections = {
  logo: {
    sourceWidth: 128,
    sourceHeight: 128,
    sourceLeft: 0,
    sourceTop: 512
  },
  closeIcon: {
    sourceWidth: 32,
    sourceHeight: 32,
    sourceLeft: 992,
    sourceTop: 512
  },
  closeIconBg: {
    sourceWidth: 32,
    sourceHeight: 32,
    sourceLeft: 960,
    sourceTop: 512
  },
  notFoundIcon: {
    sourceWidth: 512,
    sourceHeight: 512,
    sourceLeft: 0,
    sourceTop: 0
  },
  errorIcon: {
    sourceWidth: 512,
    sourceHeight: 512,
    sourceLeft: 512,
    sourceTop: 0
  }
}

export function setSourceParams (image: UIImage, section: TSection) {
  image.sourceWidth = section.sourceWidth
  image.sourceHeight = section.sourceHeight
  image.sourceLeft = section.sourceLeft ? section.sourceLeft : 0
  image.sourceTop = section.sourceTop ? section.sourceTop : 0
}

export function calculateUVParams (section: TSection) {

  const a = (section.sourceLeft + section.sourceWidth) / themeWidth
  const b = section.sourceLeft / themeWidth //b
  const c = 1 - (section.sourceTop / themeHeight) //c
  const d = 1 - ((section.sourceTop + section.sourceHeight) / themeHeight)

  return [
    b, c,
    a, c,
    a, d,
    b, d,

    b, c,
    a, c,
    a, d,
    b, d,
  ]
}
