import { ChallengeRewardID } from 'audius-client/src/common/models/AudioRewards'
import { ChallengeReward } from 'audius-client/src/common/store/notifications/types'

import IconAudius from 'app/assets/images/iconAudius.svg'

import {
  NotificationTile,
  NotificationHeader,
  NotificationText,
  NotificationTitle
} from '../Notification'

const messages = {
  amountEarned: (amount: number) => `You've earned ${amount} $AUDIO`,
  referredText:
    ' for being referred! Invite your friends to join to earn more!',
  challengeCompleteText: 'for completing this challenge!'
}

const challengeInfoMap: Record<
  ChallengeRewardID,
  { title: string; amount: number }
> = {
  'profile-completion': {
    title: '✅️ Complete your Profile',
    amount: 1
  },
  'listen-streak': {
    title: '🎧 Listening Streak: 7 Days',
    amount: 1
  },
  'track-upload': {
    title: '🎶 Upload 3 Tracks',
    amount: 1
  },
  referrals: {
    title: '📨 Invite your Friends',
    amount: 1
  },
  'ref-v': {
    title: '📨 Invite your Fans',
    amount: 1
  },
  referred: {
    title: '📨 Invite your Friends',
    amount: 1
  },
  'connect-verified': {
    title: '✅️ Link Verified Accounts',
    amount: 5
  },
  'mobile-install': {
    title: '📲 Get the App',
    amount: 1
  }
}

type ChallengeRewardNotificationProps = {
  notification: ChallengeReward
}

export const ChallengeRewardNotification = (
  props: ChallengeRewardNotificationProps
) => {
  const { notification } = props
  const { challengeId } = notification
  const { title, amount } = challengeInfoMap[challengeId]
  return (
    <NotificationTile notification={notification}>
      <NotificationHeader icon={IconAudius}>
        <NotificationTitle>{title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        {messages.amountEarned(amount)}{' '}
        {challengeId === 'referred'
          ? messages.referredText
          : messages.challengeCompleteText}
      </NotificationText>
    </NotificationTile>
  )
}