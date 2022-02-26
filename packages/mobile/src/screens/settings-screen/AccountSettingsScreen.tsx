import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import { ScrollView, Text, View } from 'react-native'

import Key from 'app/assets/images/emojis/key.png'
import Lock from 'app/assets/images/emojis/lock.png'
import StopSign from 'app/assets/images/emojis/octagonal-sign.png'
import Checkmark from 'app/assets/images/emojis/white-heavy-check-mark.png'
import IconMail from 'app/assets/images/iconMail.svg'
import IconSignOut from 'app/assets/images/iconSignOut.svg'
import IconVerified from 'app/assets/images/iconVerified.svg'
import { Screen } from 'app/components/core'
import { ProfilePhoto } from 'app/components/user'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { AccountSettingsItem } from './AccountSettingsItem'

const messages = {
  title: 'Account',
  recoveryTitle: 'Recovery Email',
  recoveryDescription:
    'Store your recovery email safely. This email is the only way to recover your account if you forget your password.',
  recoveryButtonTitle: 'Resend',
  verifyTitle: 'Get Verified',
  verifyDescription:
    'Get verified by linking a verified social account to Audius',
  verifyButtonTitle: 'Verification',
  passwordTitle: 'Change Password',
  passwordDescription: 'Change your password',
  passwordButtonTitle: 'Change',
  signOutTitle: 'Sign Out',
  signOutDescription:
    'Make sure you have your account recovery email stored somewhere safe before signing out!',
  signOutButtonTitle: 'Sign Out'
}

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  header: {
    alignItems: 'center',
    paddingTop: spacing(12),
    paddingBottom: spacing(6)
  },
  profilePhoto: {
    height: 128,
    width: 128
  },
  name: { ...typography.h2, color: palette.neutral, marginTop: spacing(1) },
  handle: {
    ...typography.h2,
    color: palette.neutral,
    fontFamily: typography.fontByWeight.medium
  }
}))

export const AccountSettingsScreen = () => {
  const styles = useStyles()
  const accountUser = useSelectorWeb(getAccountUser)

  if (!accountUser) return null

  const { name, handle } = accountUser

  return (
    <Screen title={messages.title} topbarRight={null} variant='secondary'>
      <ScrollView>
        <View style={styles.header}>
          <ProfilePhoto profile={accountUser} style={styles.profilePhoto} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{handle}</Text>
        </View>
        <AccountSettingsItem
          title={messages.recoveryTitle}
          titleIconSource={Key}
          description={messages.recoveryDescription}
          buttonTitle={messages.recoveryButtonTitle}
          buttonIcon={IconMail}
        />
        <AccountSettingsItem
          title={messages.verifyTitle}
          titleIconSource={Checkmark}
          description={messages.verifyDescription}
          buttonTitle={messages.verifyButtonTitle}
          buttonIcon={IconVerified}
        />
        <AccountSettingsItem
          title={messages.passwordTitle}
          titleIconSource={Lock}
          description={messages.passwordDescription}
          buttonTitle={messages.passwordButtonTitle}
          buttonIcon={IconMail}
        />
        <AccountSettingsItem
          title={messages.signOutTitle}
          titleIconSource={StopSign}
          description={messages.signOutDescription}
          buttonTitle={messages.signOutButtonTitle}
          buttonIcon={IconSignOut}
        />
      </ScrollView>
    </Screen>
  )
}