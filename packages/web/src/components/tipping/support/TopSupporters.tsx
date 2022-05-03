import { IconTrophy } from '@audius/stems'
import { useSelector } from 'common/hooks/useSelector'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporters } from 'common/store/tipping/selectors'
import styles from './Support.module.css'
import React from 'react'
import cn from 'classnames'

const messages = {
  topSupporters: 'Top Supporters',
  viewAll: 'View All'
}

export const TopSupporters = () => {
  const profile = useSelector(getProfileUser)
  const supportersMap = useSelector(getSupporters)
  const supportersList = profile
    ? supportersMap[profile.user_id] ?? []
    : []

  return supportersList.length
  ? (
    <div className={styles.container}>
        <div className={styles.titleContainer}>
        <IconTrophy className={styles.trophyIcon} />
        <span className={styles.titleText}>{messages.topSupporters}</span>
        <span className={cn(styles.line, styles.topSupportersLine)} />
      </div>
      
    </div>
  )
  : null
}
