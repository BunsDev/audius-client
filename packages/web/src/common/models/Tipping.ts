import { Nullable } from 'common/utils/typeUtils'

import { ID } from './Identifiers'
import { StringWei } from './Wallet'

export type Supporter = {
  sender_id: ID
  amount: StringWei
  rank: number
}

export type Supporting = {
  receiver_id: ID
  amount: StringWei
  rank: number
}

export type UserTip = {
  amount: StringWei
  sender_id: ID
  receiver_id: ID
  followee_supporter_ids: ID[]
  slot: number
  created_at: string
  tx_signature: string
}

export type RecentTipsStorage = {
  dismissed: boolean
  minSlot: number
  lastDismissalTimestamp: Nullable<number>
}
