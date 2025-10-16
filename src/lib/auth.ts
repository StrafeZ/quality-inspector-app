import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Gets the current authenticated user
 * @returns User object or null if not authenticated
 * Handles errors gracefully without throwing
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error.message)
      return null
    }

    return data.user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

/**
 * Ensures user is authenticated, throws error if not
 * @returns User object
 * @throws Error if not authenticated
 * Use in API services that require authentication
 */
export async function requireAuth(): Promise<User> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`Authentication error: ${error.message}`)
  }

  if (!data.user) {
    throw new Error('Authentication required. Please sign in to continue.')
  }

  return data.user
}

/**
 * Gets authorization headers for API calls
 * @returns Object with Authorization header or empty object
 * Use for authenticated external API requests
 */
export async function getAuthHeaders(): Promise<{ Authorization: string } | {}> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session?.access_token) {
      return {}
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`
    }
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return {}
  }
}

/**
 * Quick check if user is currently authenticated
 * @returns Boolean indicating authentication status
 * Doesn't throw errors - safe for conditional rendering
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      return false
    }

    return !!data.user
  } catch (error) {
    return false
  }
}
