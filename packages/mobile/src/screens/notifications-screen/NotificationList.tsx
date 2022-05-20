import { useCallback, useEffect, useState } from 'react'

import Status from 'audius-client/src/common/models/Status'
import {
  fetchNotifications,
  refreshNotifications
} from 'audius-client/src/common/store/notifications/actions'
import {
  getNotificationHasMore,
  getNotificationStatus,
  makeGetAllNotifications
} from 'audius-client/src/common/store/notifications/selectors'
import { Notification } from 'audius-client/src/common/store/notifications/types'
import { isEqual } from 'lodash'
import { View } from 'react-native'

import { FlatList } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { EmptyNotifications } from './EmptyNotifications'
import { NotificationBlock } from './NotificationBlock'

const NOTIFICATION_PAGE_SIZE = 10

const useStyles = makeStyles(({ spacing, palette }) => ({
  list: {
    paddingTop: spacing(1)
  },
  itemContainer: {
    marginTop: spacing(2),
    paddingHorizontal: spacing(2)
  },
  footer: {
    marginTop: spacing(5),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: spacing(12)
  },
  spinner: {
    color: palette.neutralLight4
  }
}))

const getNotifications = makeGetAllNotifications()

export const NotificationList = () => {
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const notifications = useSelectorWeb(getNotifications, isEqual)
  const status = useSelectorWeb(getNotificationStatus)
  const hasMore = useSelectorWeb(getNotificationHasMore)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    dispatchWeb(refreshNotifications())
  }, [dispatchWeb])

  useEffect(() => {
    if (status !== Status.LOADING) {
      setIsRefreshing(false)
    }
  }, [status, setIsRefreshing])

  const handleEndReached = useCallback(() => {
    if (status !== Status.LOADING && hasMore) {
      dispatchWeb(fetchNotifications(NOTIFICATION_PAGE_SIZE))
    }
  }, [status, dispatchWeb, hasMore])

  if (status === Status.SUCCESS && notifications.length === 0) {
    return <EmptyNotifications />
  }

  return (
    <FlatList
      style={styles.list}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      data={notifications}
      keyExtractor={(item: Notification) => `${item.id}`}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <NotificationBlock notification={item} />
        </View>
      )}
      ListFooterComponent={
        status === Status.LOADING && !isRefreshing ? (
          <View style={styles.footer}>
            <LoadingSpinner fill={styles.spinner.color} />
          </View>
        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.8}
      initialNumToRender={10}
    />
  )
}