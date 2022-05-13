import React, { useCallback } from 'react'

import { IconArrow } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { useSelector } from 'common/hooks/useSelector'
import { ID } from 'common/models/Identifiers'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporting } from 'common/store/tipping/selectors'
import { stringWeiToBN } from 'common/utils/wallet'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import styles from './Support.module.css'
import { SupportingTile } from './SupportingTile'

const MAX_SUPPORTING_TILES = 3

const messages = {
  supporting: 'Supporting',
  seeMorePrefix: 'See ',
  seeMoreSuffix: ' More'
}

export const SupportingList = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)
  const supportingMap = useSelector(getSupporting)
  const supportingForProfile = profile?.user_id
    ? supportingMap[profile.user_id] ?? {}
    : {}
  const rankedSupportingList = Object.keys(supportingForProfile)
    .sort((k1, k2) => {
      const amount1BN = stringWeiToBN(
        supportingForProfile[(k1 as unknown) as ID].amount
      )
      const amount2BN = stringWeiToBN(
        supportingForProfile[(k2 as unknown) as ID].amount
      )
      return amount1BN.gte(amount2BN) ? -1 : 1
    })
    .map(k => supportingForProfile[(k as unknown) as ID])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.SUPPORTING,
          entityType: UserListEntityType.USER,
          id: profile.user_id
        })
      )
      dispatch(setVisibility(true))
    }
  }, [profile, dispatch])

  return profile && rankedSupportingList.length > 0 ? (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <IconTip className={styles.tipIcon} />
        <span className={styles.titleText}>{messages.supporting}</span>
        <span className={styles.line} />
      </div>
      {rankedSupportingList
        .slice(0, MAX_SUPPORTING_TILES)
        .map((supporting, index) => (
          <div key={`supporting-${index}`} className={styles.tile}>
            <SupportingTile supporting={supporting} />
          </div>
        ))}
      {profile.supporting_count > MAX_SUPPORTING_TILES && (
        <div className={styles.seeMore} onClick={handleClick}>
          <span>
            {messages.seeMorePrefix}+
            {`${profile.supporting_count - MAX_SUPPORTING_TILES}`}
            {messages.seeMoreSuffix}
          </span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      )}
    </div>
  ) : null
}