export const uuidv4 = (): string => {
  var d = new Date().getTime() //Timestamp
  var d2 = 0 //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) { //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else { //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export const addUrlParam = (url: string, names: any, value: any = null) => {
  if (typeof names != 'object') {
    const tmp = names
    names = {}
    names[tmp] = value
  }
  for (let name in names) {
    value = names[name]
    if (value === null || value === undefined) {
      continue
    }
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