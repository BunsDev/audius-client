import React from 'react'

import { ReactComponent as IconTrending } from 'assets/img/iconTrending.svg'
import { TopSupporter } from 'common/store/notifications/types'

import { NotificationBody } from './NotificationBody'
import { NotificationFooter } from './NotificationFooter'
import { NotificationHeader } from './NotificationHeader'
import { NotificationTile } from './NotificationTile'
import { NotificationTitle } from './NotificationTitle'
import { ProfilePicture } from './ProfilePicture'
import styles from './TopSupporterNotification.module.css'
import { TwitterShareButton } from './TwitterShareButton'
import { UserNameLink } from './UserNameLink'
import { IconTip } from './icons'

const messages = {
  title: 'Top Supporter',
  supporterChange: "You're now their",
  supporter: 'Top Supporter'
}

type TopSupporterNotificationProps = {
  notification: TopSupporter
}

export const TopSupporterNotification = (
  props: TopSupporterNotificationProps
) => {
  const { notification } = props
  const { user, rank, timeLabel, isRead } = notification

  return (
    <NotificationTile notification={notification}>
      <NotificationHeader icon={<IconTip />}>
        <NotificationTitle>
          #{rank} {messages.title}
        </NotificationTitle>
      </NotificationHeader>
      <NotificationBody className={styles.body}>
        <div className={styles.bodyUser}>
          <ProfilePicture className={styles.profilePicture} user={user} />
          <UserNameLink
            className={styles.userNameLink}
            user={user}
            notification={notification}
          />
        </div>
        <span className={styles.trending}>
          <IconTrending className={styles.trendingIcon} />
          {messages.supporterChange} #{rank} {messages.supporter}
        </span>
      </NotificationBody>
      <TwitterShareButton />
      <NotificationFooter timeLabel={timeLabel} isRead={isRead} />
    </NotificationTile>
  )
}