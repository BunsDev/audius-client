import { tracksActions } from 'common/store/pages/history-page/lineups/tracks/actions'
import { LineupSagas } from 'store/lineup/sagas'

const PREFIX = 'COLLECTIBLES_PLAYLIST_TRACKS'

function* getCollectiblesPlaylistTracks() {
  try {
    // Get are return the audio collectibles for the user
  } catch (e) {
    console.error(e)
    return []
  }
}

const getCollectiblesPlaylistTracksFromStore = store => {
  // get from the store
  // Get account user
  // Get account user collectibles
  // Filter on animationUrl extension ending with mp3, wav, or oga
  // Return
}

const retainSelector = () => {}

const sourceSelector = () => PREFIX

class TracksSagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      tracksActions,
      getCollectiblesPlaylistTracksFromStore,
      getCollectiblesPlaylistTracks,
      retainSelector,
      /* removeDeleted */ false,
      sourceSelector
    )
  }
}

export default function sagas() {
  return new TracksSagas().getSagas()
}
