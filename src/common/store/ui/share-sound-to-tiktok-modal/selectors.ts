import { createSelector } from '@reduxjs/toolkit'

import { CommonState } from 'common/store'

const shareSoundToTikTokModalState = (state: CommonState) =>
  state.ui.shareSoundToTikTokModal

export const getTrack = createSelector(
  shareSoundToTikTokModalState,
  (state) => state.track
)
export const getIsAuthenticated = createSelector(
  shareSoundToTikTokModalState,
  (state) => state.isAuthenticated
)
export const getStatus = createSelector(
  shareSoundToTikTokModalState,
  (state) => state.status
)
