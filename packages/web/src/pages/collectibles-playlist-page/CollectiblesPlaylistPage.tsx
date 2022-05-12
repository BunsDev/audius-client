import React, { useMemo } from 'react'

import {
  Button,
  ButtonSize,
  ButtonType,
  IconPause,
  IconPlay
} from '@audius/stems'
import { Table } from 'antd'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { Chain } from 'common/models/Chain'
import { Collectible } from 'common/models/Collectible'
import {
  getAccountCollectibles,
  getAccountUser
} from 'common/store/account/selectors'
import { add, clear, pause, play } from 'common/store/queue/slice'
import { Source } from 'common/store/queue/types'
import { getHash } from 'components/collectibles/helpers'
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

const chainLabelMap: Record<Chain, string> = {
  [Chain.Eth]: 'Ethereum',
  [Chain.Sol]: 'Solana'
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

  const columns = [
    {
      title: '',
      key: 'playButton',
      className: 'colPlayButton',
      render: (val: string, record: Collectible, index: number) => (
        <TablePlayButton
          paused={!playing}
          playing={record.id === currentPlayerItem?.collectible?.id}
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

  const playAllButton = (
    <Button
      className={styles.playAllButton}
      textClassName={styles.playAllButtonText}
      iconClassName={styles.playAllButtonIcon}
      type={ButtonType.PRIMARY_ALT}
      size={ButtonSize.SMALL}
      text={isPlayingACollectible && playing ? 'PAUSE' : 'PLAY'}
      leftIcon={isPlayingACollectible && playing ? <IconPause /> : <IconPlay />}
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
        className={styles.collectiblesTable}
        rowClassName={(record: Collectible, index: number) =>
          record.id === currentPlayerItem?.collectible?.id
            ? styles.activeRow
            : ''
        }
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
