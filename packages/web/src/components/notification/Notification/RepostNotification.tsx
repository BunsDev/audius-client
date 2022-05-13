import React, { MouseEventHandler, useCallback } from 'react'

import { useDispatch } from 'react-redux'

import { Repost } from 'common/store/notifications/types'
import {
  setUsers as setUserListUsers,
  setVisibility as openUserListModal
} from 'store/application/ui/userListModal/slice'
import { UserListType } from 'store/application/ui/userListModal/types'

import { EntityLink, useGoToEntity } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { UserNameLink } from './components/UserNameLink'
import { UserProfilePictureList } from './components/UserProfilePictureList'
import { IconRepost } from './components/icons'
import { entityToUserListEntity, formatOthersCount } from './utils'

const messages = {
  others: formatOthersCount,
  reposted: 'reposted your'
}

type RepostNotificationProps = {
  notification: Repost
}

export const RepostNotification = (props: RepostNotificationProps) => {
  const { notification } = props
  const {
    users,
    userIds,
    entity,
    entityId,
    entityType,
    timeLabel,
    isRead
  } = notification
  const [firstUser] = users
  const otherUsersCount = userIds.length - 1
  const isMultiUser = userIds.length > 1
  const dispatch = useDispatch()

  const handleGoToEntity = useGoToEntity(entity, entityType)

  const handleClick: MouseEventHandler = useCallback(
    event => {
      if (isMultiUser) {
        dispatch(
          setUserListUsers({
            userListType: UserListType.REPOST,
            entityType: entityToUserListEntity[entityType],
            id: entityId
          })
        )
        dispatch(openUserListModal(true))
      } else {
        handleGoToEntity(event)
      }
    },
    [isMultiUser, dispatch, entityType, entityId, handleGoToEntity]
  )

  return (
    <NotificationTile
      notification={notification}
      onClick={handleClick}
      disableClosePanel={otherUsersCount > 0}
    >
      <NotificationHeader icon={<IconRepost />}>
        <UserProfilePictureList users={users} totalUserCount={userIds.length} />
      </NotificationHeader>
      <NotificationBody>
        <UserNameLink user={firstUser} notification={notification} />
        {otherUsersCount > 0 ? messages.others(otherUsersCount) : null}{' '}
        {messages.reposted} {entityType.toLowerCase()}{' '}
        <EntityLink entity={entity} entityType={entityType} />
      </NotificationBody>
      <NotificationFooter timeLabel={timeLabel} isRead={isRead} />
    </NotificationTile>
  )
}