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
// import { add } from 'common/store/queue/slice'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { getPlaying, makeGetCurrent } from 'store/player/selectors'
import { playCollectible } from 'store/player/slice'

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

  const audioCollectibles = useMemo(
    () =>
      accountCollectibles?.filter(c =>
        ['mp3', 'wav', 'oga'].some(ext => c.animationUrl?.endsWith(ext))
      ),
    [accountCollectibles]
  )

  const isPlayingCollectible = useMemo(() => {
    return (
      playing &&
      audioCollectibles.some(
        collectible => collectible.id === currentPlayerItem?.collectible?.id
      )
    )
  }, [playing, audioCollectibles, currentPlayerItem])

  const playlistName = 'Collectibles Playlist'
  const tracksLoading = false
  const trackCount = accountCollectibles.length

  const onClickRow = (collectible: Collectible, index: number) => {
    console.log({ collectible, index })
    // TODO: Need to add the collectibles to the queue here and set the proper index so that next and prev will work
    // dispatch(add({ entries: audioCollectibles, index }))
    dispatch(
      playCollectible({
        collectible,
        onEnd: () => {}
      })
    )
  }

  const onClickTrackName = (collectible: Collectible) => {
    // Should go to the NFT page
    console.log({ collectible })
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
      text={isPlayingCollectible ? 'PAUSE' : 'PLAY'}
      leftIcon={isPlayingCollectible ? <IconPause /> : <IconPlay />}
      // TODO: Add function to handle play/pause of all collectibles
      // Need to add them to the queue and update the queue to be able to handle collectibles
      // onClick={onPlay}
    />
  )

  const header = (
    <Header
      primary={`${accountUser?.name}${accountUser ? "'s " : ''}${
        messages.headerTitle
      }`}
      secondary={trackCount ? playAllButton : null}
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
