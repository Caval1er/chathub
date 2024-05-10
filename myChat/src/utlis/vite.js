export function useEnv() {
  const { VITE_APP_API, VITE_BASE_API } = import.meta.env
  return {
    VITE_APP_API,
    VITE_BASE_API,
  }
}
