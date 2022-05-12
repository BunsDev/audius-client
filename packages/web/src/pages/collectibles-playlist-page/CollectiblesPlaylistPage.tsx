import React, { useMemo } from 'react'

import {
  Button,
  ButtonSize,
  ButtonType,
  IconPause,
  IconPlay
} from '@audius/stems'
import { Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { Collectible } from 'common/models/Collectible'
import {
  getAccountCollectibles,
  getAccountUser
} from 'common/store/account/selectors'
import { add, clear, pause, play } from 'common/store/queue/slice'
import { Source } from 'common/store/queue/types'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { getPlaying, makeGetCurrent } from 'store/player/selectors'

import styles from './CollectiblesPlaylistPage.module.css'

const messages = {
  headerTitle: 'Collectibles Playlist',
  pageTitle: 'Collectibles Playlist',
  pageDescription: 'A playlist of your collectibles'
}

const getCurrent = makeGetCurrent()

export const CollectiblesPlaylistPage = () => {
  const dispatch = useDispatch()
  const accountUser = useSelector(getAccountUser)
  const accountCollectibles = useSelector(getAccountCollectibles)
  const currentPlayerItem = useSelector(getCurrent)
  const playing = useSelector(getPlaying)
  const playlistName = 'Collectibles Playlist'
  const tracksLoading = false

  const audioCollectibles = useMemo(
    () =>
      accountCollectibles?.filter(c =>
        ['mp3', 'wav', 'oga'].some(ext => c.animationUrl?.endsWith(ext))
      ),
    [accountCollectibles]
  )

  const isPlayingACollectible = useMemo(
    () =>
      audioCollectibles.some(
        collectible => collectible.id === currentPlayerItem?.collectible?.id
      ),
    [audioCollectibles, currentPlayerItem]
  )

  const onClickRow = (collectible: Collectible, index: number) => {
    // TODO: Add whatever the intended behavior is for clicking the row
    console.log('Clicked on the collectible row')
    console.log({ collectible, index })
  }

  const onClickTrackName = (collectible: Collectible) => {
    // TODO: Should go to the NFT page
    console.log('Clicked on the collectible name')
    console.log({ collectible })
  }

  const handlePlayButtonClick = (
    e: React.MouseEvent<MouseEvent>,
    collectible: Collectible
  ) => {
    e.stopPropagation()
    if (playing && collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(pause({}))
    } else if (collectible.id === currentPlayerItem?.collectible?.id) {
      dispatch(play({}))
    } else {
      if (!isPlayingACollectible) {
        dispatch(clear({}))
        dispatch(
          add({
            entries: audioCollectibles.map(collectible => ({
              id: 0,
              uid: collectible.id,
              collectible,
              source: Source.COLLECTIBLE_PLAYLIST_TRACKS
            }))
          })
        )
      }
      dispatch(play({ collectible }))
    }
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
          entries: audioCollectibles.map(collectible => ({
            id: 0,
            uid: collectible.id,
            collectible,
            source: Source.COLLECTIBLE_PLAYLIST_TRACKS
          })),
          index: 0
        })
      )
      dispatch(play({ collectible: audioCollectibles[0] }))
    }
  }

  const trackNameCell = (val: string, record: Collectible) => {
    return (
      <div
        // className={styles.textContainer}
        onClick={e => {
          e.stopPropagation()
          onClickTrackName(record)
        }}
      >
        {/* <div className={cn(styles.textCell, { [styles.trackName]: !deleted })}> */}
        <div>{val}</div>
      </div>
    )
  }

  const columns = [
    {
      title: '',
      key: 'playButton',
      className: 'colPlayButton',
      render: (val: string, record: Collectible, index: number) => (
        <TablePlayButton
          paused={!playing}
          playing={record.id === currentPlayerItem?.collectible?.id}
          onClick={e => handlePlayButtonClick(e, record)}
          // className={styles.playButton}
        />
      )
    },
    {
      title: 'Track Name',
      dataIndex: 'name',
      key: 'name',
      className: 'colTrackName',
      // sorter: (a, b) => alphaSortFn(a.name, b.name, a.key, b.key),
      render: (val: string, record: Collectible) => trackNameCell(val, record)
    }
  ]

  const playAllButton = (
    <Button
      className={styles.playAllButton}
      textClassName={styles.playAllButtonText}
      iconClassName={styles.playAllButtonIcon}
      type={ButtonType.PRIMARY_ALT}
      size={ButtonSize.SMALL}
      text={isPlayingACollectible && playing ? 'PAUSE' : 'PLAY'}
      leftIcon={isPlayingACollectible && playing ? <IconPause /> : <IconPlay />}
      // TODO: Add function to handle play/pause of all collectibles
      // Need to add them to the queue and update the queue to be able to handle collectibles
      onClick={handlePlayAllClick}
    />
  )

  const header = (
    <Header
      primary={`${accountUser?.name}${accountUser ? "'s " : ''}${
        messages.headerTitle
      }`}
      secondary={audioCollectibles.length ? playAllButton : null}
      variant={'main'}
    />
  )

  return (
    <Page
      title={messages.pageTitle}
      description={messages.pageDescription}
      size='large'
      header={header}
    >
      <Table
        key={playlistName}
        loading={tracksLoading}
        dataSource={audioCollectibles}
        columns={columns}
        pagination={false}
        onRow={(record, rowIndex) => ({
          index: rowIndex,
          onClick: () => onClickRow(record, rowIndex)
        })}
      />
    </Page>
  )
}
