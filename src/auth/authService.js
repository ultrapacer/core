import auth0 from 'auth0-js'
import { EventEmitter } from 'events'

// eslint-disable-next-line no-undef
const secrets = SECRETS // from webpack config

// if environment parameters undefined, no auth
const enableAuth = Boolean(secrets.AUTH0_DOMAIN)

let webAuth
if (enableAuth) {
  webAuth = new auth0.WebAuth({
    domain: secrets.AUTH0_DOMAIN,
    redirectUri: `${window.location.origin}/callback`,
    clientID: secrets.AUTH0_CLIENT_ID,
    responseType: 'token id_token',
    scope: 'openid profile email',
    audience: secrets.AUTH0_AUDIENCE
  })
}

const localStorageKey = 'loggedIn'
const loginEvent = 'loginEvent'

class AuthService extends EventEmitter {
  idToken = null;
  accessToken = null;
  profile = null;
  tokenExpiry = null;
  accessTokenExpiry = null;

  login (customState) {
    webAuth.authorize({
      appState: customState
    })
  }

  logOut () {
    localStorage.removeItem(localStorageKey)

    this.idToken = null
    this.accessToken = null
    this.tokenExpiry = null
    this.profile = null
    this.accessTokenExpiry = null

    webAuth.logout({
      returnTo: `${window.location.origin}`
    })

    this.emit(loginEvent, { loggedIn: false })
  }

  handleAuthentication () {
    return new Promise((resolve, reject) => {
      webAuth.parseHash((err, authResult) => {
        if (err) {
          reject(err)
        } else {
          this.localLogin(authResult)
          resolve(authResult.idToken)
        }
      })
    })
  }

  isAuthenticated () {
    return (
      Date.now() < this.tokenExpiry &&
      localStorage.getItem(localStorageKey) === 'true'
    )
  }

  isIdTokenValid () {
    return (
      this.idToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    )
  }

  isAccessTokenValid () {
    return (
      this.accessToken &&
      this.accessTokenExpiry &&
      Date.now() < this.accessTokenExpiry
    )
  }

  getIdToken () {
    return new Promise((resolve, reject) => {
      if (this.isIdTokenValid()) {
        resolve(this.idToken)
      } else if (this.isAuthenticated()) {
        this.renewTokens().then(authResult => {
          resolve(authResult.idToken)
        // eslint-disable-next-line prefer-promise-reject-errors
        }, reject('Unable to renew authentication'))
      } else {
        resolve()
      }
    })
  }

  getAccessToken () {
    return new Promise((resolve, reject) => {
      if (this.isAccessTokenValid()) {
        resolve(this.accessToken)
      } else {
        this.renewTokens().then(authResult => {
          resolve(authResult.accessToken)
        }, reject)
      }
    })
  }

  localLogin (authResult) {
    this.idToken = authResult.idToken
    this.profile = authResult.idTokenPayload

    this.accessToken = authResult.accessToken

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    this.tokenExpiry = new Date(this.profile.exp * 1000)

    // Convert expiresIn to milliseconds and add the current time
    // (expiresIn is a relative timestamp, we want an absolute time)
    this.accessTokenExpiry = new Date(Date.now() + authResult.expiresIn * 1000)

    localStorage.setItem(localStorageKey, 'true')

    this.emit(loginEvent, {
      loggedIn: true,
      profile: authResult.idTokenPayload,
      state: authResult.appState || {}
    })
  }

  renewTokens () {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(localStorageKey) !== 'true') {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject('Not logged in')
      }

      webAuth.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err)
        } else {
          this.localLogin(authResult)
          resolve(authResult)
        }
      })
    })
  }
}

// create a dummy auth service proxy that just returns false to everything
const DummyAuthService = new Proxy({}, {
  get: function () { return () => { return false } }
})

const service = enableAuth ? new AuthService() : DummyAuthService
service.setMaxListeners(5)

export default service
