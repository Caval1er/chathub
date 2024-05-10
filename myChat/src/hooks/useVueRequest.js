import { useRequest } from 'vue-request'

//防抖
export function useDebounce(service, debouceInterval, option) {
  return useRequest(service, {
    debounceInterval: debouceInterval,
    ...option,
  })
}
