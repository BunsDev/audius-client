import React, { useCallback, useState } from 'react'

import { getUserHandle } from 'audius-client/src/common/store/account/selectors'
import { getIsOpen as getIsMobileOverflowModalOpen } from 'audius-client/src/common/store/ui/mobile-overflow-menu/selectors'
import { getModalIsOpen } from 'audius-client/src/common/store/ui/modals/slice'
import { getIsOpen as getIsNowPlayingOpen } from 'audius-client/src/common/store/ui/now-playing/selectors'
// TODO: move these into /common
import { setTab } from 'audius-client/src/containers/explore-page/store/actions'
import { Tabs } from 'audius-client/src/containers/explore-page/store/types'
import {
  openSignOn as _openSignOn,
  showRequiresAccountModal
} from 'audius-client/src/containers/sign-on/store/actions'
import {
  FEED_PAGE,
  TRENDING_PAGE,
  EXPLORE_PAGE,
  FAVORITES_PAGE,
  getPathname,
  profilePage
} from 'audius-client/src/utils/route'
import { push } from 'connected-react-router'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { MessageType } from 'app/message/types'
import { getLocation } from 'app/store/lifecycle/selectors'
import { Theme, useTheme, useThemeVariant } from 'app/utils/theme'

import ExploreButton from './buttons/ExploreButton'
import FavoritesButton from './buttons/FavoritesButton'
import FeedButton from './buttons/FeedButton'
import ProfileButton from './buttons/ProfileButton'
import TrendingButton from './buttons/TrendingButton'

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',

    borderTopWidth: 1,

    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  }
})

const BottomBar = () => {
  const bottomBarStyle = useTheme(styles.bottomBar, {
    borderTopColor: 'neutralLight8',
    backgroundColor: 'neutralLight10'
  })

  const themeVariant = useThemeVariant()
  const isDarkMode = themeVariant === Theme.DARK

  // Selectors
  const handle = useSelectorWeb(getUserHandle)
  const location = useSelector(getLocation)
  const isOverflowModalOpen = useSelectorWeb(getIsMobileOverflowModalOpen)
  const isModalOpen = useSelectorWeb(getModalIsOpen)
  const isNowPlayingOpen = useSelectorWeb(getIsNowPlayingOpen)

  // Actions
  const dispatchWeb = useDispatchWeb()
  const openSignOn = useCallback(() => {
    dispatchWeb(_openSignOn(false))
    dispatchWeb(showRequiresAccountModal())
  }, [dispatchWeb])
  const goToRoute = useCallback((route: string) => dispatchWeb(push(route)), [
    dispatchWeb
  ])
  const resetExploreTab = useCallback(() => dispatchWeb(setTab(Tabs.FOR_YOU)), [
    dispatchWeb
  ])
  const scrollToTop = useCallback(
    () =>
      dispatchWeb({
        type: MessageType.SCROLL_TO_TOP
      }),
    [dispatchWeb]
  )

  const userProfilePage = handle ? profilePage(handle) : null
  const navRoutes = new Set([
    FEED_PAGE,
    TRENDING_PAGE,
    EXPLORE_PAGE,
    FAVORITES_PAGE,
    userProfilePage
  ])

  const [lastNavRoute, setNavRoute] = useState(FEED_PAGE)
  const currentRoute = location && getPathname(location)

  // TODO: this will have to change with the RN SignOn changes
  const onSignOn = currentRoute === '/signup' || currentRoute === '/signin'
  const onErrorPage = currentRoute === '/error'

  if (lastNavRoute !== currentRoute) {
    // If the current route isn't what we memoized, check if it's a nav route
    // and update the current route if so
    if (navRoutes.has(currentRoute)) {
      setNavRoute(currentRoute)
    }
  }

  // Hide the BottomBar when an overlay is open
  // NOTE: This can be removed when the overlays (overflow modal, drawer)
  // are migrated to RN
  const hideBottomBar = React.useMemo(() => {
    return (
      onSignOn ||
      onErrorPage ||
      isOverflowModalOpen ||
      isModalOpen ||
      isNowPlayingOpen
    )
  }, [
    onSignOn,
    onErrorPage,
    isOverflowModalOpen,
    isModalOpen,
    isNowPlayingOpen
  ])

  const goToFeed = useCallback(() => {
    if (!handle) {
      openSignOn()
    } else {
      goToRoute(FEED_PAGE)
    }
  }, [goToRoute, handle, openSignOn])

  const goToTrending = useCallback(() => {
    goToRoute(TRENDING_PAGE)
  }, [goToRoute])

  const goToExplore = useCallback(() => {
    goToRoute(EXPLORE_PAGE)
  }, [goToRoute])

  const goToFavorites = useCallback(() => {
    if (!handle) {
      openSignOn()
    } else {
      goToRoute(FAVORITES_PAGE)
    }
  }, [goToRoute, handle, openSignOn])

  const goToProfile = useCallback(() => {
    if (!handle) {
      openSignOn()
    } else {
      goToRoute(profilePage(handle))
    }
  }, [goToRoute, handle, openSignOn])

  const onClick = useCallback(
    (callback: () => void, page: string | null) => () => {
      resetExploreTab()
      if (page === currentRoute) {
        scrollToTop()
      } else {
        callback()
      }
    },
    [currentRoute, resetExploreTab, scrollToTop]
  )

  return !hideBottomBar ? (
    <SafeAreaView style={bottomBarStyle} edges={['bottom']}>
      <FeedButton
        isActive={currentRoute === FEED_PAGE}
        isDarkMode={isDarkMode}
        onClick={onClick(goToFeed, FEED_PAGE)}
      />
      <TrendingButton
        isActive={currentRoute === TRENDING_PAGE}
        isDarkMode={isDarkMode}
        onClick={onClick(goToTrending, TRENDING_PAGE)}
      />
      <ExploreButton
        isActive={currentRoute === EXPLORE_PAGE}
        isDarkMode={isDarkMode}
        onClick={onClick(goToExplore, EXPLORE_PAGE)}
      />
      <FavoritesButton
        isActive={currentRoute === FAVORITES_PAGE}
        isDarkMode={isDarkMode}
        onClick={onClick(goToFavorites, FAVORITES_PAGE)}
      />
      <ProfileButton
        isActive={currentRoute === userProfilePage}
        isDarkMode={isDarkMode}
        onClick={onClick(goToProfile, userProfilePage)}
      />
    </SafeAreaView>
  ) : null
}

export default BottomBar