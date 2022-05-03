import React from 'react'

import { SupportingTile } from './SupportingTile'
import { useSelector } from 'common/hooks/useSelector'
import { getSupporting } from 'common/store/tipping/selectors'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { ReactComponent as IconTokenBadgeMono } from 'assets/img/iconTokenBadgeMono.svg'
import styles from './Support.module.css'
import { IconArrow } from '@audius/stems'

const MAX_SUPPORTING_TILES = 3

const messages = {
  supporting: 'Supporting',
  seeMorePrefix: 'See ',
  seeMoreSuffix: ' More'
}

export const SupportingList = () => {
  const profile = useSelector(getProfileUser)
  const supportingMap = useSelector(getSupporting)
  const supportingList = profile
    ? supportingMap[profile.user_id] ?? []
    : []

  return supportingList.length
    ? (
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <IconTokenBadgeMono className={styles.tokenBadgeIcon} />
          <span className={styles.titleText}>{messages.supporting}</span>
          <span className={styles.line} />
        </div>
        {supportingList.slice(0, MAX_SUPPORTING_TILES).map((supporting, index) => (
          <div key={`supporting-${index}`} className={styles.tile}>
            <SupportingTile supporting={supporting} />
          </div>
        ))}
        {supportingList.length > MAX_SUPPORTING_TILES && <div className={styles.seeMore}>
          <span>
            {messages.seeMorePrefix}
            +{`${supportingList.length - MAX_SUPPORTING_TILES}`}
            {messages.seeMoreSuffix}
          </span>
          <IconArrow className={styles.arrowIcon} />
        </div>}
      </div>
    )
    : null
}
