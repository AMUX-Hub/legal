/* global URL, window */
// Landing logic for the email links (docs/EMAIL_TEMPLATES.md). The email links to
//   https://amux-pulse.com/auth/open#u=<the Supabase verify address>
// so the link in the email sits on our own domain. The page checks that the address really is our
// Supabase verify endpoint and shows one button; the button goes there, and Supabase hands over to the app
// (fitnessappearlymvp://auth/callback). Nothing is sent to our server (the fragment stays in the browser),
// and nothing happens before a tap, so a mail scanner that loads the page cannot use up the link.
;(function (root) {
  var ALLOWED_HOSTS = ['kfbvsiyhkzqlnwazwqrb.supabase.co']
  var ALLOWED_PATH = '/auth/v1/verify'
  var ALLOWED_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change']
  var APP_CALLBACK = 'fitnessappearlymvp://auth/callback'

  /** The address to open, or null when the link is not one of ours. */
  function targetFromHash(hash) {
    if (typeof hash !== 'string' || hash.indexOf('#u=') !== 0) return null
    var raw = hash.slice(3)
    // A template engine may percent-encode the address once; accept both forms.
    if (/^https%3a/i.test(raw)) {
      try {
        raw = decodeURIComponent(raw)
      } catch {
        return null
      }
    }
    var url
    try {
      url = new URL(raw)
    } catch {
      return null
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    if (ALLOWED_HOSTS.indexOf(url.hostname) === -1) return null
    if (url.pathname !== ALLOWED_PATH) return null
    if (ALLOWED_TYPES.indexOf(url.searchParams.get('type') || '') === -1) return null
    if (!url.searchParams.get('token')) return null
    var redirect = url.searchParams.get('redirect_to')
    if (redirect !== null && redirect !== APP_CALLBACK) return null
    return url.toString()
  }

  var api = { targetFromHash: targetFromHash, ALLOWED_HOSTS: ALLOWED_HOSTS }
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.AmuxAuthOpen = api
})(typeof window !== 'undefined' ? window : globalThis)
