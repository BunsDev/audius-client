import { AccountInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { Name } from 'common/models/Analytics'
import { FeatureFlags } from 'common/services/remote-config'
import { Nullable } from 'common/utils/typeUtils'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { track } from 'store/analytics/providers'

// @ts-ignore
const libs = () => window.audiusLibs

export const doesUserBankExist = async () => {
  await waitForLibsInit()
  const userBank: PublicKey = await libs().solanaWeb3Manager.getUserBank()
  const tokenAccount: Nullable<AccountInfo> = await libs().solanaWeb3Manager.getAssociatedTokenAccountInfo(
    userBank.toString()
  )
  return tokenAccount != null
}

export const createUserBank = async () => {
  await waitForLibsInit()
  return libs().solanaWeb3Manager.createUserBank()
}

export const createUserBankIfNeeded = async () => {
  await waitForLibsInit()
  const userbankEnabled = remoteConfigInstance.getFeatureEnabled(
    FeatureFlags.CREATE_WAUDIO_USER_BANK_ON_SIGN_UP
  )
  if (!userbankEnabled) return
  const userId = libs().Account.getCurrentUser().user_id
  try {
    const userbankExists = await doesUserBankExist()
    if (userbankExists) return
    console.warn(`Userbank doesn't exist, attempting to create...`)
    await track(Name.CREATE_USER_BANK_REQUEST, { userId })
    const { error, errorCode } = await createUserBank()
    if (error || errorCode) {
      console.error(
        `Failed to create userbank, with err: ${error}, ${errorCode}`
      )
      await track(Name.CREATE_USER_BANK_FAILURE, {
        userId,
        errorCode,
        error: (error as any).toString()
      })
    } else {
      console.log(`Successfully created userbank!`)
    }
    await track(Name.CREATE_USER_BANK_SUCCESS, { userId })
  } catch (err) {
    await track(Name.CREATE_USER_BANK_FAILURE, {
      userId,
      errorMessage: (err as any).toString()
    })
    console.error(`Failed to create userbank, with err: ${err}`)
  }
}