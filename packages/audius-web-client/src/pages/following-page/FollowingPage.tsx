import React, { useContext, useEffect } from 'react'

import { getUserList } from 'common/store/user-list/following/selectors'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import NavContext, { LeftPreset } from 'components/nav/store/context'
import UserList from 'components/user-list/UserList'
import { USER_LIST_TAG } from 'pages/following-page/sagas'

const messages = {
  title: 'Following'
}

// Eventually calculate a custom page size
export const PAGE_SIZE = 15

const FollowingPage = () => {
  const { setLeft, setCenter, setRight } = useContext(NavContext)!

  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(messages.title)
    setRight(null)
  }, [setLeft, setCenter, setRight])

  return (
    <MobilePageContainer fullHeight>
      <UserList
        stateSelector={getUserList}
        tag={USER_LIST_TAG}
        pageSize={PAGE_SIZE}
      />
    </MobilePageContainer>
  )
}

export default FollowingPage