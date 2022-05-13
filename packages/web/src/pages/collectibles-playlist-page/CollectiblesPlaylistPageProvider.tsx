import React, { useCallback, useMemo } from 'react'

import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { Chain } from 'common/models/Chain'
import { Collectible } from 'common/models/Collectible'
import Status from 'common/models/Status'
import {
  getAccountCollectibles,
  getAccountUser
} from 'common/store/account/selectors'
import {
  CollectionTrack,
  TrackRecord
} from 'common/store/pages/collection/types'
import { add, clear, pause, play } from 'common/store/queue/slice'
import { Source } from 'common/store/queue/types'
import { getHash } from 'components/collectibles/helpers'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { COLLECTIBLES_PLAYLIST } from 'pages/smart-collection/smartCollections'
import { getPlaying, makeGetCurrent } from 'store/player/selectors'

import { CollectionPageProps as DesktopCollectionPageProps } from '../collection-page/components/desktop/CollectionPage'
import { CollectionPageProps as MobileCollectionPageProps } from '../collection-page/components/mobile/CollectionPage'

import styles from './CollectiblesPlaylistPage.module.css'

type CollectiblesPlaylistPageProviderProps = {
  children:
    | React.ComponentType<MobileCollectionPageProps>
    | React.ComponentType<DesktopCollectionPageProps>
}

const chainLabelMap: Record<Chain, string> = {
  [Chain.Eth]: 'Ethereum',
  [Chain.Sol]: 'Solana'
}

const getCurrent = makeGetCurrent()

export const CollectiblesPlaylistPageProvider = ({
  children: Children
}: CollectiblesPlaylistPageProviderProps) => {
  const dispatch = useDispatch()
  const accountUser = useSelector(getAccountUser)
  const accountCollectibles = useSelector(getAccountCollectibles)
  const currentPlayerItem = useSelector(getCurrent)
  const playing = useSelector(getPlaying)
  const title = 'Collectibles Playlist'

  const audioCollectibles = useMemo(
    () =>
      accountCollectibles?.filter(c =>
        ['mp3', 'wav', 'oga'].some(ext => c.animationUrl?.endsWith(ext))
      ),
    [accountCollectibles]
  )
  const tracksLoading = !audioCollectibles.length

  const isPlayingACollectible = useMemo(
    () =>
      audioCollectibles.some(
        collectible => collectible.id === currentPlayerItem?.collectible?.id
      ),
    [audioCollectibles, currentPlayerItem]
  )

  const entries = audioCollectibles.map(collectible => ({
    id: collectible.id,
    uid: collectible.id,
    collectible,
    source: Source.COLLECTIBLE_PLAYLIST_TRACKS
  }))

  const onClickRow = (collectible: Collectible, index: number) => {
    if (playing && collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(pause({}))
    } else if (collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(play({}))
    } else {
      if (!isPlayingACollectible) {
        dispatch(clear({}))
        dispatch(add({ entries }))
      }
      dispatch(play({ collectible }))
    }
  }

  const onClickTrackName = (collectible: Collectible) => {
    const url = `/${accountUser?.handle}/collectibles/${getHash(
      collectible.id
    )}`
    dispatch(push(url))
  }

  const handlePlayAllClick = () => {
    if (playing && isPlayingACollectible) {
      dispatch(pause({}))
    } else if (isPlayingACollectible) {
      dispatch(play({}))
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries,
          index: 0
        })
      )
      dispatch(play({ collectible: audioCollectibles[0] }))
    }
  }

  const getPlayingUid = useCallback(() => {
    return currentPlayerItem.uid
  }, [currentPlayerItem])

  const formatMetadata = useCallback(
    (trackMetadatas: CollectionTrack[]): TrackRecord[] => {
      return trackMetadatas.map((metadata, i) => ({
        ...metadata,
        ...metadata.collectible,
        key: `${metadata.collectible.name}_${metadata.uid}_${i}`,
        name: metadata.collectible.name,
        artist: '',
        handle: '',
        date: metadata.dateAdded || metadata.created_at,
        time: 0,
        plays: 0
      }))
    },
    []
  )

  const getFilteredData = useCallback(
    (trackMetadatas: CollectionTrack[]) => {
      const playingUid = getPlayingUid()
      const playingIndex = entries.findIndex(({ uid }) => uid === playingUid)
      const formattedMetadata = formatMetadata(trackMetadatas)
      const filteredIndex =
        playingIndex > -1
          ? formattedMetadata.findIndex(metadata => metadata.uid === playingUid)
          : playingIndex
      return [formattedMetadata, filteredIndex] as [
        typeof formattedMetadata,
        number
      ]
    },
    [getPlayingUid, formatMetadata, entries]
  )

  const isQueued = useCallback(() => {
    return entries.some(entry => currentPlayerItem.collectible.id === entry.id)
  }, [entries, currentPlayerItem])

  const columns = [
    {
      title: '',
      key: 'playButton',
      className: 'colPlayButton',
      render: (val: string, record: Collectible, index: number) => (
        <TablePlayButton
          paused={!playing}
          playing={record.id === currentPlayerItem?.collectible?.id}
          className={styles.playButtonFormatting}
        />
      )
    },
    {
      title: 'Track Name',
      dataIndex: 'name',
      key: 'name',
      className: 'colTrackName',
      render: (val: string, record: Collectible) => (
        <div
          className={cn(styles.collectibleName, {
            [styles.active]: record.id === currentPlayerItem?.collectible?.id
          })}
          onClick={e => {
            e.stopPropagation()
            onClickTrackName(record)
          }}
        >
          {val}
        </div>
      )
    },
    {
      title: 'Chain',
      dataIndex: 'chain',
      key: 'chain',
      className: 'colTestColumn',
      render: (val: string, record: Collectible) => (
        <div>{chainLabelMap[record.collectible.chain]}</div>
      )
    }
  ]

  const onShare = () => {}

  const metadata = {
    ...COLLECTIBLES_PLAYLIST,
    playlist_contents: {
      track_ids: entries.map(entry => ({ track: entry.id }))
    },
    imageOverride: audioCollectibles?.[0]?.imageUrl
  }
  const childProps = {
    title,
    description: '',
    canonicalUrl: '',
    playlistId: title,
    playing,
    type: 'playlist',
    collection: {
      status: tracksLoading ? Status.LOADING : Status.SUCCESS,
      metadata,
      user: null
    },
    tracks: {
      status: tracksLoading ? Status.LOADING : Status.SUCCESS,
      entries
    },
    columns,
    getPlayingUid: getPlayingUid,
    getFilteredData: getFilteredData,
    isQueued: isQueued,

    onPlay: handlePlayAllClick,
    onHeroTrackShare: onShare,
    onClickRow: onClickRow,
    onClickTrackName: onClickTrackName
  }

  return <Children {...childProps} />
}
