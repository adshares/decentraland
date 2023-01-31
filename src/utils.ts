const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_='
const b64chs = Array.prototype.slice.call(b64ch)

export const urlSafeBase64Encode = (bin: string): string => {
  bin = unescape(encodeURIComponent(bin))
  let u32, c0, c1, c2, asc = ''
  const pad = bin.length % 3
  for (let i = 0; i < bin.length;) {
    if ((c0 = bin.charCodeAt(i++)) > 255 ||
      (c1 = bin.charCodeAt(i++)) > 255 ||
      (c2 = bin.charCodeAt(i++)) > 255) {
      throw new TypeError('invalid character found')
    }
    u32 = (c0 << 16) | (c1 << 8) | c2
    asc += b64chs[u32 >> 18 & 63]
      + b64chs[u32 >> 12 & 63]
      + b64chs[u32 >> 6 & 63]
      + b64chs[u32 & 63]
  }
  return pad ? asc.slice(0, pad - 3) : asc
}

export const getRandId = (bytes: Number): string => {
  let d = new Date().getTime()

  let chars = []
  for (let i = 0; i < bytes; i++) {
    const r = (d + Math.random() * 256) % 256 | 0
    d = Math.floor(d / 256)
    chars.push(String.fromCharCode(r))
  }

  return chars.join('')
}

export const addUrlParam = (url: string, names: any, value: any = null) => {
  if (typeof names != 'object') {
    const tmp = names
    names = {}
    names[tmp] = value
  }
  for (let name in names) {
    value = names[name]
    let param = name + '=' + encodeURIComponent(value)
    const qPos = url.indexOf('?')
    if (qPos > -1) {
      url += (qPos < url.length ? '&' : '') + param
    } else {
      url += '?' + param
    }
  }
  return url
}

export const parseErrors = (response: any): string[] => {
  let errors: string[] = []
  if (response.errors) {
    let k: any
    let v: any
    for (k in response.errors) {
      v = response.errors[k]
      if (typeof v !== 'object') {
        v = Array(v)
      }
      v.forEach((text: string) => {
        errors.push(text)
      })
      errors.push('')
    }
  } else if (response.message) {
    errors.push(`Error ${response.code} ${response.message}`)
  } else {
    errors.push('Unknown error')
  }
  return errors
}