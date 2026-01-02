/**
 * Authentication utilities for client-side auth management
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const auth = {
  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Store the authentication token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * Remove the authentication token
   */
  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },

  /**
   * Get the stored user data
   */
  getUser(): any | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(USER_KEY)
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  },

  /**
   * Store user data
   */
  setUser(user: any): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * Remove user data
   */
  removeUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  /**
   * Clear all authentication data (logout)
   */
  logout(): void {
    this.removeToken()
    this.removeUser()
  }
}
