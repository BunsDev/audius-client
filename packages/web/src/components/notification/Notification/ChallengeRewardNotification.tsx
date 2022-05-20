import React, { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Name } from 'common/models/Analytics'
import { ChallengeReward } from 'common/store/notifications/types'
import { challengeRewardsConfig } from 'pages/audio-rewards-page/config'
import { make, useRecord } from 'store/analytics/actions'
import { AUDIO_PAGE } from 'utils/route'
import { openTwitterLink } from 'utils/tweet'

import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { TwitterShareButton } from './components/TwitterShareButton'
import { IconRewards } from './components/icons'

const messages = {
  body: (amount: number) =>
    `You've earned ${amount} $AUDIO for completing this challenge!`,
  twitterShareText:
    'I earned $AUDIO for completing challenges on @AudiusProject #AudioRewards'
}

type ChallengeRewardNotificationProps = {
  notification: ChallengeReward
}

export const ChallengeRewardNotification = (
  props: ChallengeRewardNotificationProps
) => {
  const { notification } = props
  const { challengeId, timeLabel, isViewed, type } = notification
  const dispatch = useDispatch()
  const record = useRecord()

  const { amount: rewardAmount, title, icon } = challengeRewardsConfig[
    challengeId
  ]

  const handleShare = useCallback(() => {
    openTwitterLink(null, messages.twitterShareText)
  }, [])

  const handleClick = useCallback(() => {
    dispatch(push(AUDIO_PAGE))
    record(
      make(Name.NOTIFICATIONS_CLICK_TILE, { kind: type, link_to: AUDIO_PAGE })
    )
  }, [dispatch, record, type])

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconRewards>{icon}</IconRewards>}>
        <NotificationTitle>{title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>{messages.body(rewardAmount)}</NotificationBody>
      <TwitterShareButton onClick={handleShare} />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}