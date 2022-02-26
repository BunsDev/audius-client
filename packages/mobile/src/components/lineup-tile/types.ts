import { ReactNode } from 'react'

import { PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { Collection } from 'audius-client/src/common/models/Collection'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'

import { GestureResponderHandler } from 'app/types/gesture'

export type LineupItemProps = {
  /** Index of tile in lineup */
  index: number

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Is this item unlisted (hidden)? */
  isUnlisted?: boolean

  /** Function to call when item & art has loaded */
  onLoad?: (index: number) => void

  /** Whether or not to show the artist pick indicators */
  showArtistPick?: boolean

  /** Whether to show an icon indicating rank in lineup */
  showRankIcon?: boolean

  /** Function that will toggle play of a track */
  togglePlay: (uid: UID, id: ID, source: PlaybackSource) => void

  /** Uid of the item */
  uid: UID
}

export type LineupTileProps = Omit<LineupItemProps, 'togglePlay'> & {
  children?: ReactNode

  /** Cosign information */
  coSign?: Track['_co_sign']

  /** Duration of the tile's tracks */
  duration?: number

  /** Hide the play count */
  hidePlays?: boolean

  /** Hide the share button */
  hideShare?: boolean

  /** ID of the item */
  id: ID

  /** The item (track or collection) */
  item: Track | Collection

  /** Function to call when tile is pressed */
  onPress?: GestureResponderHandler

  /** Function to call when the overflow menu button is pressed */
  onPressOverflow?: GestureResponderHandler

  /** Function to call when repost is pressed */
  onPressRepost?: GestureResponderHandler

  /** Function to call when save is pressed */
  onPressSave?: GestureResponderHandler

  /** Function to call when share is pressed */
  onPressShare?: GestureResponderHandler

  /** Function to call when the title is pressed */
  onPressTitle?: GestureResponderHandler

  /** Amount of plays on this item */
  playCount?: number

  /** Title of the item */
  title: string

  /** User associated with the item */
  user: User
}