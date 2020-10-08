import React from 'react'
import Tooltip from 'components/tooltip/Tooltip'
import TaskCompletionList from './TaskCompletionList'

import styles from './ProfileCompletionTooltip.module.css'
import { getPercentageComplete } from './ProfileCompletionHeroCard'
import { CompletionStageArray } from './PropTypes'

const makeStrings = ({ completionPercentage }) => ({
  completionPercentage: `Profile ${completionPercentage}% Complete`
})

const TooltipContent = ({ completionStages }) => {
  const completionPercentage = getPercentageComplete(completionStages).toFixed()
  const strings = makeStrings({ completionPercentage })

  return (
    <div className={styles.content}>
      <div className={styles.header}>{strings.completionPercentage}</div>
      <TaskCompletionList
        className={styles.list}
        completionStages={completionStages}
      />
    </div>
  )
}

/**
 * ProfileCompletionTooltip is a hovering tooltip that presents the
 * percentage of profile completion and the list of completion stages.
 *
 * @param {Object} { completionStages }
 */
const ProfileCompletionTooltip = ({
  completionStages,
  children,
  isDisabled
}) => {
  return (
    <Tooltip
      shouldWrapContent={false}
      className={styles.tooltip}
      disabled={isDisabled}
      mouseEnterDelay={0.1}
      shouldDismissOnClick={false}
      text={<TooltipContent completionStages={completionStages} />}
      placement='right'
      mount={null}
    >
      {children}
    </Tooltip>
  )
}

ProfileCompletionTooltip.propTypes = {
  completionStages: CompletionStageArray.isRequired
}

export default ProfileCompletionTooltip