import { 
  useState, 
  useEffect, 
  useCallback
} from 'react'
import { AppState, AppStateStatus } from 'react-native'

/**
 * `active` - The app is running in the foreground
 * `background` - The app is running in the background. The user is either:
 *   - in another app
 *   - on the home screen
 *   - [Android] on another Activity (even if it was launched by your app)
 * [iOS] `inactive` - This is a state that occurs when transitioning between foreground & background, 
 * and during periods of inactivity such as entering the Multitasking view or in the event of an incoming call
 */

type OnEnterForeground = () => void

const NotActive = new RegExp(`inactive|background`, 'g' )

export const useAppState = (onEnterForeground: OnEnterForeground) => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)
  const handleAppStateChange = useCallback((nextAppState) => {
    if (
      appState.match(NotActive) &&
      nextAppState === 'active'
    ) {
      console.info('Enter foreground')
      onEnterForeground()
    }
    setAppState(nextAppState)
  }, [appState, onEnterForeground])

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
    return () =>
      AppState.removeEventListener('change', handleAppStateChange)
  }, [handleAppStateChange])

  return appState
}

export default useAppState