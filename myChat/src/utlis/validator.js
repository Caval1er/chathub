export function isValidEmail(email) {
  // 正则表达式来自于 https://emailregex.com/
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return emailRegex.test(email)
}

export function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,16}$/
  return passwordRegex.test(password)
}

export function isRequired(field) {
  return !!field || '此项为必填项'
}

export function validateAvatar(val) {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // 协议
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // 域名
      '((\\d{1,3}\\.){3}\\d{1,3})|localhost)' + // 或 IP (v4) 地址
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // 端口和路径
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // 查询字符串
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  if (urlPattern.test(val)) {
    return 'URL'
  } else {
    return '普通文本'
  }
}
