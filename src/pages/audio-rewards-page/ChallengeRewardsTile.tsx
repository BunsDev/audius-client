import React, { ReactNode, useContext, useEffect, useState } from 'react'

import { ProgressBar } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { useSetVisibility } from 'common/hooks/useModalState'
import { ChallengeRewardID } from 'common/models/AudioRewards'
import { StringKeys } from 'common/services/remote-config'
import {
  getUserChallenges,
  getUserChallengesLoading
} from 'common/store/pages/audio-rewards/selectors'
import {
  ChallengeRewardsModalType,
  setChallengeRewardsModalType,
  reset,
  refreshUserBalance,
  refreshUserChallenges
} from 'common/store/pages/audio-rewards/slice'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'
import { useRemoteVar } from 'hooks/useRemoteConfig'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { CLAIM_REWARD_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import fillString from 'utils/fillString'
import { AUDIO_PAGE } from 'utils/route'

import styles from './RewardsTile.module.css'
import ButtonWithArrow from './components/ButtonWithArrow'
import { Tile } from './components/ExplainerTile'
import { challengeRewardsConfig } from './config'
import { useOptimisticChallengeCompletionStepCounts } from './hooks'

const messages = {
  title: '$AUDIO REWARDS',
  description1: 'Complete tasks to earn $AUDIO tokens!',
  description2:
    'Opportunities to earn $AUDIO will change, so check back often for more chances to earn!',
  completeLabel: 'COMPLETE',
  claimReward: 'Claim Your Reward',
  challengeCompleted: 'You’ve Completed an $AUDIO Rewards Challenge!',
  seeMore: 'See more'
}

type RewardPanelProps = {
  title: string
  icon: ReactNode
  description: (amount: string | undefined) => string
  panelButtonText: string
  progressLabel: string
  stepCount: number
  openModal: (modalType: ChallengeRewardsModalType) => void
  id: ChallengeRewardID
  currentStepCountOverride?: number
}

const RewardPanel = ({
  id,
  title,
  description,
  panelButtonText,
  openModal,
  progressLabel,
  icon,
  stepCount,
  currentStepCountOverride
}: RewardPanelProps) => {
  const { toast } = useContext(ToastContext)

  const wm = useWithMobileStyle(styles.mobile)
  const userChallenges = useSelector(getUserChallenges)

  const openRewardModal = () => openModal(id)

  const challenge = userChallenges[id]
  const shouldOverrideCurrentStepCount =
    !challenge?.is_complete && currentStepCountOverride !== undefined
  const currentStepCount = shouldOverrideCurrentStepCount
    ? currentStepCountOverride!
    : challenge?.current_step_count || 0
  const isComplete = shouldOverrideCurrentStepCount
    ? currentStepCountOverride! >= stepCount
    : !!challenge?.is_complete
  const [wasChallengeComplete, setWasChallengeComplete] = useState(
    !!challenge?.is_complete
  )

  useEffect(() => {
    if (!wasChallengeComplete && !!challenge?.is_complete) {
      toast(
        <ToastLinkContent
          text={messages.challengeCompleted}
          linkText={messages.seeMore}
          link={AUDIO_PAGE}
        />,
        CLAIM_REWARD_TOAST_TIMEOUT_MILLIS
      )
      setWasChallengeComplete(true)
    }
  }, [wasChallengeComplete, challenge, toast])

  return (
    <div className={wm(styles.rewardPanelContainer)} onClick={openRewardModal}>
      <span className={wm(styles.rewardTitle)}>
        {icon}
        {title}
      </span>
      <span className={wm(styles.rewardDescription)}>
        {description(challenge?.amount)}
      </span>
      <div className={wm(styles.rewardProgress)}>
        <p
          className={cn(styles.rewardProgressLabel, {
            [styles.complete]: isComplete
          })}
        >
          {isComplete
            ? messages.completeLabel
            : fillString(
                progressLabel,
                currentStepCount.toString(),
                stepCount.toString()
              )}
        </p>
        {stepCount > 1 && (
          <ProgressBar
            className={styles.rewardProgressBar}
            value={currentStepCount}
            max={stepCount}
          />
        )}
      </div>
      <ButtonWithArrow
        className={wm(styles.panelButton)}
        text={
          challenge?.is_complete && !challenge?.is_disbursed
            ? messages.claimReward
            : panelButtonText
        }
        onClick={openRewardModal}
        textClassName={styles.panelButtonText}
      />
    </div>
  )
}

type RewardsTileProps = {
  className?: string
}

const validRewardIds: Set<ChallengeRewardID> = new Set([
  'track-upload',
  'referrals',
  'mobile-install',
  'connect-verified',
  'listen-streak',
  'profile-completion'
])

/** Pulls rewards from remoteconfig */
const useRewardIds = () => {
  const rewardsString = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  if (rewardsString === null) return []
  const rewards = rewardsString.split(',') as ChallengeRewardID[]
  const filteredRewards: ChallengeRewardID[] = rewards.filter(reward =>
    validRewardIds.has(reward)
  )
  return filteredRewards
}

const RewardsTile = ({ className }: RewardsTileProps) => {
  const setVisibility = useSetVisibility()
  const dispatch = useDispatch()
  const rewardIds = useRewardIds()
  const userChallengesLoading = useSelector(getUserChallengesLoading)
  const currentStepCountOverrides = useOptimisticChallengeCompletionStepCounts()
  const [haveChallengesLoaded, setHaveChallengesLoaded] = useState(false)

  useEffect(() => {
    if (!userChallengesLoading && !haveChallengesLoaded) {
      setHaveChallengesLoaded(true)
    }
  }, [userChallengesLoading, haveChallengesLoaded])

  // poll for user challenges and user balance to refresh
  useEffect(() => {
    dispatch(refreshUserChallenges())
    dispatch(refreshUserBalance())
    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  const openModal = (modalType: ChallengeRewardsModalType) => {
    dispatch(setChallengeRewardsModalType({ modalType }))
    setVisibility('ChallengeRewardsExplainer')(true)
  }

  const rewardsTiles = rewardIds
    .map(id => challengeRewardsConfig[id])
    .map(props => (
      <RewardPanel
        {...props}
        currentStepCountOverride={currentStepCountOverrides[props.id]}
        openModal={openModal}
        key={props.id}
      />
    ))

  const wm = useWithMobileStyle(styles.mobile)

  return (
    <Tile className={wm(styles.rewardsTile, className)}>
      <span className={wm(styles.title)}>{messages.title}</span>
      <div className={wm(styles.subtitle)}>
        <span>{messages.description1}</span>
        <span>{messages.description2}</span>
      </div>
      <div className={styles.rewardsContainer}>
        {userChallengesLoading && !haveChallengesLoaded ? (
          <LoadingSpinner />
        ) : (
          rewardsTiles
        )}
      </div>
    </Tile>
  )
}

export default RewardsTile
