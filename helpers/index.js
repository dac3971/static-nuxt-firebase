import jwtDecode from 'jwt-decode'
var cookieparser = require('cookieparser')
import Cookie from 'js-cookie'

export function getUserFromCookie (req) {
  if (req && req.headers){
    if (!req.headers.cookie) return

    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      const accessTokenCookie = parsed.__session
      if (!accessTokenCookie) return
      const decodedToken = jwtDecode(accessTokenCookie)
      if (!decodedToken) return

      return decodedToken
    }
  }
  return
}

export const getUserFromLocalStorage = () => {
  if(window){
    const json = window.localStorage.user
    return json ? JSON.parse(json) : undefined
  }
}

export const setToken = (token) => {
  if (process.SERVER_BUILD) return
  if(window){
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('user', JSON.stringify(jwtDecode(token)))
  }
  Cookie.set('__session', token)
}

export const unsetToken = () => {
  if (process.SERVER_BUILD) return
  if(window){
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('secret')
    window.localStorage.setItem('logout', Date.now())
  }
  Cookie.remove('__session')
}
