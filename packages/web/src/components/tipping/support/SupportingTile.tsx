import React from 'react'

import { Supporting } from 'common/models/Tipping'
import styles from './Support.module.css'
import { ReactComponent as IconTokenBadgeMono } from 'assets/img/iconTokenBadgeMono.svg'
import { IconTrophy } from '@audius/stems'
import cn from 'classnames'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { SquareSizes, WidthSizes } from 'common/models/ImageSizes'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'

const messages = {
  supporter: 'SUPPORTER'
}

const TOP_RANK_THRESHOLD = 5

type SupportingCardProps = {
  supporting: Supporting
}
export const SupportingTile = ({ supporting }: SupportingCardProps) => {
  const { supporting: user, rank } = supporting
  const isTopFive = rank >= 1 && rank <= TOP_RANK_THRESHOLD
  const profileImage = useUserProfilePicture(
    user.user_id,
    user._profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150
  )
  const coverPhoto = useUserCoverPhoto(
    user.user_id,
    user._cover_photo_sizes,
    WidthSizes.SIZE_640
  )

  return (
    <div className={styles.tileContainer}>
      <div className={styles.tileBackground}>
        <img className={styles.coverPhoto} src={coverPhoto} />
        <div className={styles.profilePictureContainer}>
          <img className={styles.profilePicture} src={profileImage} />
          <div className={styles.name}>
            {user.name}
            <UserBadges
              className={styles.badge}
              userId={user.user_id}
              badgeSize={12}
            />
          </div>
        </div>
      </div>
      {isTopFive
        ? (
          <div className={cn(styles.tileHeader, styles.topFive)}>
            <IconTrophy className={styles.trophyIcon} />
            <span>#{rank} {messages.supporter}</span>
          </div>
        )
        : (
          <div className={styles.tileHeader}>
            <IconTokenBadgeMono className={styles.tokenBadgeIcon} />
            <span>{messages.supporter}</span>
          </div>
        )}
    </div>
  )
}
