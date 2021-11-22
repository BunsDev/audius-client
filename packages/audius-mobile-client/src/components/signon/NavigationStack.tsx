import React, { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { remindUserToTurnOnNotifications } from 'app/components/notification-reminder/NotificationReminder'
import {
  getDappLoaded,
  getIsSignedIn,
  getOnSignUp
} from 'app/store/lifecycle/selectors'
import {
  getAccountAvailable,
  getFinalEmail,
  getFinalHandle
} from 'app/store/signon/selectors'
import { EventNames } from 'app/types/analytics'
import { track, make } from 'app/utils/analytics'

import CreatePassword from './CreatePassword'
import FirstFollows from './FirstFollows'
import ProfileAuto from './ProfileAuto'
import ProfileManual from './ProfileManual'
import SignOn from './SignOn'
import SignupLoadingPage from './SignupLoadingPage'

export type RootStackParamList = {
  SignOn: undefined
  CreatePassword: { email: string }
  ProfileAuto: { email: string; password: string }
  ProfileManual: {
    email: string
    password: string
    name?: string
    handle?: string
    twitterId?: string
    twitterScreenName?: string
    instagramId?: string
    instagramScreenName?: string
    verified?: boolean
    profilePictureUrl?: string
    coverPhotoUrl?: string
  }
  FirstFollows: { email: string; handle: string }
  SignupLoadingPage: undefined
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    elevation: 1,
    zIndex: 2,
    backgroundColor: 'white'
  }
})

const Stack = createNativeStackNavigator()

const SignOnNav = () => {
  const dispatch = useDispatch()

  const dappLoaded = useSelector(getDappLoaded)
  const signedIn = useSelector(getIsSignedIn)
  const onSignUp = useSelector(getOnSignUp)
  const isAccountAvailable = useSelector(getAccountAvailable)
  const finalEmail = useSelector(getFinalEmail)
  const finalHandle = useSelector(getFinalHandle)
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    setIsHidden(
      !dappLoaded ||
        signedIn === null ||
        (signedIn && !onSignUp) ||
        isAccountAvailable
    )
  }, [dappLoaded, isAccountAvailable, signedIn, onSignUp])

  useEffect(() => {
    if (onSignUp && isAccountAvailable) {
      track(
        make({
          eventName: EventNames.CREATE_ACCOUNT_FINISH,
          emailAddress: finalEmail,
          handle: finalHandle
        })
      )
      remindUserToTurnOnNotifications(dispatch)
    }
  }, [onSignUp, isAccountAvailable, finalEmail, finalHandle, dispatch])

  const screenProps = [
    {
      name: 'SignOn',
      component: SignOn
    },
    {
      name: 'CreatePassword',
      component: CreatePassword
    },
    {
      name: 'ProfileAuto',
      component: ProfileAuto
    },
    {
      name: 'ProfileManual',
      component: ProfileManual
    },
    {
      name: 'FirstFollows',
      component: FirstFollows
    },
    {
      name: 'SignupLoadingPage',
      component: SignupLoadingPage
    }
  ]

  return isHidden ? null : (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName='SignOn'
          screenOptions={{
            animationTypeForReplace: 'push'
          }}
        >
          {screenProps.map(props => (
            <Stack.Screen
              key={props.name}
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'slide_from_right'
              }}
              {...props}
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}

export default SignOnNav