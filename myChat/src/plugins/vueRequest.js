import { setGlobalOptions } from 'vue-request'

export function setVueRequstGlobal(option = {}) {
  setGlobalOptions({
    manual: true,
    ...option,
  })
}
