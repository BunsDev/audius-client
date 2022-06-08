import { ID } from 'common/models/Identifiers'
import { UserListStoreState } from 'common/store/user-list/types'

export type MutualsOwnState = {
  id: ID | null
}

export type MutualsPageState = {
  followingPage: MutualsOwnState
  userList: UserListStoreState
}

export const USER_LIST_TAG = 'MUTUALS'