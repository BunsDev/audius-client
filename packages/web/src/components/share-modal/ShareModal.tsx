import { useCallback, useContext } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Name } from 'common/models/Analytics'
import { FeatureFlags } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import {
  shareAudioNftPlaylist,
  shareCollection
} from 'common/store/social/collections/actions'
import { shareTrack } from 'common/store/social/tracks/actions'
import { shareUser } from 'common/store/social/users/actions'
import { getShareState } from 'common/store/ui/share-modal/selectors'
import { requestOpen as requestOpenTikTokModal } from 'common/store/ui/share-sound-to-tiktok-modal/slice'
import { ToastContext } from 'components/toast/ToastContext'
import { useFlag } from 'hooks/useRemoteConfig'
import { make, useRecord } from 'store/analytics/actions'
import { isMobile } from 'utils/clientUtil'
import { SHARE_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { openTwitterLink } from 'utils/tweet'

import { ShareDialog } from './components/ShareDialog'
import { ShareDrawer } from './components/ShareDrawer'
import { messages } from './messages'
import { getTwitterShareText } from './utils'

const IS_NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

export const ShareModal = () => {
  const [isOpen, setIsOpen] = useModalState('Share')

  const { toast } = useContext(ToastContext)
  const dispatch = useDispatch()
  const record = useRecord()
  const { content, source } = useSelector(getShareState)
  const account = useSelector(getAccountUser)

  const { isEnabled: isShareSoundToTikTokEnabled } = useFlag(
    FeatureFlags.SHARE_SOUND_TO_TIKTOK
  )

  const isOwner =
    content?.type === 'track' && account?.user_id === content.artist.user_id

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleShareToTwitter = useCallback(() => {
    if (!source || !content) return
    const isPlaylistOwner =
      content.type === 'audioNftPlaylist' &&
      account?.user_id === content.user.user_id
    const { twitterText, link, analyticsEvent } = getTwitterShareText(
      content,
      isPlaylistOwner
    )
    openTwitterLink(link, twitterText)
    record(make(Name.SHARE_TO_TWITTER, { source, ...analyticsEvent }))
    handleClose()
  }, [source, content, account, record, handleClose])

  const handleShareToTikTok = useCallback(() => {
    if (content?.type === 'track') {
      dispatch(requestOpenTikTokModal({ id: content.track.track_id }))
      handleClose()
    } else {
      console.error('Tried to share sound to TikTok but track was missing')
    }
  }, [content, dispatch, handleClose])

  const handleCopyLink = useCallback(() => {
    if (!source || !content) return
    switch (content.type) {
      case 'track':
        dispatch(shareTrack(content.track.track_id, source))
        break
      case 'profile':
        dispatch(shareUser(content.profile.user_id, source))
        break
      case 'album':
        dispatch(shareCollection(content.album.playlist_id, source))
        break
      case 'playlist':
        dispatch(shareCollection(content.playlist.playlist_id, source))
        break
      case 'audioNftPlaylist':
        dispatch(shareAudioNftPlaylist(content.user.handle, source))
        break
    }
    toast(messages.toast(content.type), SHARE_TOAST_TIMEOUT_MILLIS)
    handleClose()
  }, [dispatch, toast, content, source, handleClose])

  const shareProps = {
    isOpen,
    isOwner,
    onShareToTwitter: handleShareToTwitter,
    onShareToTikTok: handleShareToTikTok,
    onCopyLink: handleCopyLink,
    onClose: handleClose,
    showTikTokShareAction: Boolean(
      content?.type === 'track' &&
        isShareSoundToTikTokEnabled &&
        isOwner &&
        !content.track.is_unlisted &&
        !content.track.is_delete
    ),
    shareType: content?.type ?? 'track'
  }

  if (IS_NATIVE_MOBILE) return null
  if (isMobile()) return <ShareDrawer {...shareProps} />
  return <ShareDialog {...shareProps} />
}
