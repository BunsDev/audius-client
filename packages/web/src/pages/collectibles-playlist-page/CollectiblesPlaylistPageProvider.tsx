import React, { useCallback, useEffect, useMemo } from 'react'

import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'
import { matchPath } from 'react-router-dom'

import { ShareSource } from 'common/models/Analytics'
import { Chain } from 'common/models/Chain'
import { Collectible } from 'common/models/Collectible'
import { SmartCollectionVariant } from 'common/models/SmartCollectionVariant'
import Status from 'common/models/Status'
import { User } from 'common/models/User'
import { getUser } from 'common/store/cache/users/selectors'
import {
  CollectionTrack,
  TrackRecord
} from 'common/store/pages/collection/types'
import { fetchProfile } from 'common/store/pages/profile/actions'
import { add, clear, pause, play } from 'common/store/queue/slice'
import { Source } from 'common/store/queue/types'
import { requestOpen as requestOpenShareModal } from 'common/store/ui/share-modal/slice'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { COLLECTIBLES_PLAYLIST } from 'pages/smart-collection/smartCollections'
import { getPlaying, makeGetCurrent } from 'store/player/selectors'
import { getLocationPathname } from 'store/routing/selectors'
import { AppState } from 'store/types'
import { collectibleDetailsPage, COLLECTIBLES_PLAYLIST_PAGE } from 'utils/route'

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
  const currentPlayerItem = useSelector(getCurrent)
  const playing = useSelector(getPlaying)
  const title = SmartCollectionVariant.COLLECTIBLES_PLAYLIST

  // Getting user data
  const pathname = useSelector(getLocationPathname)
  const routeMatch = useMemo(
    () =>
      matchPath<{ handle: string }>(pathname, {
        path: COLLECTIBLES_PLAYLIST_PAGE,
        exact: true
      }),
    [pathname]
  )

  const user = useSelector<AppState, User | null>(state =>
    getUser(state, { handle: routeMatch?.params.handle ?? null })
  )
  const audioCollectibles = useMemo(
    () =>
      [
        ...(user?.collectibleList ?? []),
        ...(user?.solanaCollectibleList ?? [])
      ]?.filter(c =>
        ['mp3', 'wav', 'oga'].some(ext => c.animationUrl?.endsWith(ext))
      ),
    [user]
  )

  useEffect(() => {
    dispatch(
      fetchProfile(
        routeMatch?.params.handle ?? null,
        null,
        false,
        false,
        false,
        true
      )
    )
  }, [dispatch, routeMatch])

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
    artistId: user?.user_id,
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
    const url = collectibleDetailsPage(user?.handle ?? '', collectible.id)
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
    return entries.some(
      entry => currentPlayerItem?.collectible?.id === entry.id
    )
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
        <div>{chainLabelMap[record.chain]}</div>
      )
    }
  ]

  const onShare = () => {
    if (user) {
      dispatch(
        requestOpenShareModal({
          type: 'collectiblesPlaylist',
          userId: user?.user_id,
          source: ShareSource.TILE
        })
      )
    }
  }

  const metadata = {
    ...COLLECTIBLES_PLAYLIST,
    playlist_contents: {
      track_ids: entries.map(entry => ({ track: entry.id }))
    },
    imageOverride: audioCollectibles?.[0]?.imageUrl,
    typeTitle: 'NFT Playlist'
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
