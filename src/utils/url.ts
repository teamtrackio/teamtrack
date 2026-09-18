// window.location.origin alone (e.g. "https://username.github.io") drops the
// GitHub Pages project subpath (e.g. "/teamtrack/"), which produced broken
// 404 invite links. import.meta.env.BASE_URL is set at build time from
// VITE_BASE_PATH (see vite.config.ts) and already ends with a trailing
// slash, so joining it here reproduces the exact path the app is served
// from, whatever that is.
export function getAppOrigin(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}

export function getInviteLink(token: string): string {
  return `${getAppOrigin()}join/${token}`
}
