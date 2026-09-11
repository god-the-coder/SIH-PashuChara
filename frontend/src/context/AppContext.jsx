import { AppContext, initialAppContext } from './appContext'

/**
 * Root provider for genuinely application-wide state.
 *
 * The context is intentionally state-free until a shared concern, such as an
 * authenticated session, is introduced in a later phase.
 */
export function AppProvider({ children }) {
  return <AppContext.Provider value={initialAppContext}>{children}</AppContext.Provider>
}
