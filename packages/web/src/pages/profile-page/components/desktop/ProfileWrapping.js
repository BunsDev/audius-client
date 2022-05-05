import React, { useState, useCallback, useEffect, useRef } from 'react'

import { IconTrending } from '@audius/stems'
import cn from 'classnames'
import Linkify from 'linkifyjs/react'
import { animated, Transition } from 'react-spring/renderprops'

import { ReactComponent as BadgeArtist } from 'assets/img/badgeArtist.svg'
import { ReactComponent as IconCaretDownLine } from 'assets/img/iconCaretDownLine.svg'
import { ReactComponent as IconCaretUpLine } from 'assets/img/iconCaretUpLine.svg'
import { useSelector } from 'common/hooks/useSelector'
import { Name } from 'common/models/Analytics'
import { FeatureFlags } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import { formatCount, squashNewLines } from 'common/utils/formatUtil'
import ArtistChip from 'components/artist/ArtistChip'
import UserListModal from 'components/artist/UserListModal'
import Input from 'components/data-entry/Input'
import TextArea from 'components/data-entry/TextArea'
import More from 'components/more/More'
import ProfilePicture from 'components/profile-picture/ProfilePicture'
import { SupportingList } from 'components/tipping/support/SupportingList'
import { TopSupporters } from 'components/tipping/support/TopSupporters'
import { TipAudioButton } from 'components/tipping/tip-audio/TipAudioButton'
import Tag from 'components/track/Tag'
import UploadChip from 'components/upload/UploadChip'
import FollowsYouBadge from 'components/user-badges/FollowsYouBadge'
import ProfilePageBadge from 'components/user-badges/ProfilePageBadge'
import EditableName from 'pages/profile-page/components/EditableName'
import SocialLink, { Type } from 'pages/profile-page/components/SocialLink'
import SocialLinkInput from 'pages/profile-page/components/SocialLinkInput'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { make, useRecord } from 'store/analytics/actions'
import { profilePage, searchResultsPage, UPLOAD_PAGE } from 'utils/route'

import styles from './ProfilePage.module.css'

const { getFeatureEnabled } = remoteConfigInstance

const messages = {
  seeMore: 'See More',
  seeLess: 'See Less',
  topTags: 'Top Tags'
}

const DESCRIPTION_LINE_HEIGHT = 16
const NUM_DESCRIPTION_LINES_TRUNCATED = 4

const Tags = props => {
  const { tags, goToRoute } = props
  const record = useRecord()
  const onClickTag = useCallback(
    tag => {
      goToRoute(searchResultsPage(`#${tag}`))
      record(make(Name.TAG_CLICKING, { tag, source: 'profile page' }))
    },
    [goToRoute, record]
  )

  return tags && tags.length > 0 ? (
    <div className={styles.tags}>
      <div className={styles.tagsTitleContainer}>
        <IconTrending className={styles.topTagsIcon} />
        <span className={styles.tagsTitleText}>{messages.topTags}</span>
        <span className={styles.tagsLine} />
      </div>
      <div className={styles.tagsContent}>
        {tags.map(tag => (
          <Tag
            onClick={() => onClickTag(tag)}
            key={tag}
            className={styles.tag}
            textLabel={tag}
          />
        ))}
      </div>
    </div>
  ) : null
}

const Followers = props => {
  return (
    <div className={styles.followers}>
      <div className={styles.infoHeader}>
        {formatCount(props.followerCount)}
        {props.followerCount === 1
          ? ' FOLLOWER YOU KNOW'
          : ' FOLLOWERS YOU KNOW'}
      </div>
      <div className={styles.followersContent}>
        {props.followers
          .slice(0, Math.min(3, props.followers.length))
          .map(follower => (
            <ArtistChip
              key={follower.handle}
              userId={follower.user_id}
              profilePictureSizes={follower._profile_picture_sizes}
              handle={follower.handle}
              name={follower.name}
              followers={follower.follower_count}
              onClickArtistName={() => props.onClickArtistName(follower.handle)}
            />
          ))}
      </div>
    </div>
  )
}

const ProfileWrapping = props => {
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)
  const accountUser = useSelector(getAccountUser)
  const [showMutualConnectionsModal, setShowMutualConnectionsModal] = useState(
    false
  )
  const record = useRecord()
  const {
    handle,
    goToRoute,
    twitterHandle,
    instagramHandle,
    tikTokHandle,
    website
  } = props

  const hasSocial =
    props.twitterHandle || props.instagramHandle || props.tikTokHandle

  const bioRef = useRef(null)
  const [isCollapsible, setIsCollapsible] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (bioRef?.current) {
      const height = parseInt(
        document.defaultView
          .getComputedStyle(bioRef.current, null)
          .getPropertyValue('height')
          .slice(0, -2)
      )
      const toCollapse =
        height / DESCRIPTION_LINE_HEIGHT > NUM_DESCRIPTION_LINES_TRUNCATED
      setIsCollapsed(toCollapse)
      setIsCollapsible(toCollapse)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bioRef.current])

  const handleToggleCollapse = () => setIsCollapsed(!isCollapsed)

  const onClickTwitter = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_TWITTER, {
        handle: handle.replace('@', ''),
        twitterHandle
      })
    )
  }, [record, handle, twitterHandle])
  const onClickInstagram = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_INSTAGRAM, {
        handle: handle.replace('@', ''),
        instagramHandle
      })
    )
  }, [record, handle, instagramHandle])
  const onClickTikTok = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_TIKTOK, {
        handle: handle.replace('@', ''),
        tikTokHandle
      })
    )
  }, [record, handle, tikTokHandle])
  const onClickWebsite = useCallback(() => {
    record(
      make(Name.PROFILE_PAGE_CLICK_WEBSITE, {
        handle: handle.replace('@', ''),
        website
      })
    )
  }, [record, handle, website])
  const onClickDonation = useCallback(
    event => {
      record(
        make(Name.PROFILE_PAGE_CLICK_DONATION, {
          handle: handle.replace('@', ''),
          donation: event.target.href
        })
      )
    },
    [record, handle]
  )

  const onExternalLinkClick = useCallback(
    event => {
      record(
        make(Name.LINK_CLICKING, {
          url: event.target.href,
          source: 'profile page'
        })
      )
    },
    [record]
  )

  const onClickUploadChip = useCallback(() => {
    goToRoute(UPLOAD_PAGE)
    record(make(Name.TRACK_UPLOAD_OPEN, { source: 'profile' }))
  }, [goToRoute, record])

  const renderCollapsedContent = (_, style) =>
    hasSocial ? (
      <animated.div className={styles.socialsTruncated} style={style}>
        {props.twitterHandle && (
          <SocialLink
            type={Type.TWITTER}
            link={props.twitterHandle}
            onClick={onClickTwitter}
            iconOnly
          />
        )}
        {props.instagramHandle && (
          <SocialLink
            type={Type.INSTAGRAM}
            link={props.instagramHandle}
            onClick={onClickInstagram}
            iconOnly
          />
        )}
        {props.tikTokHandle && (
          <SocialLink
            type={Type.TIKTOK}
            link={props.tikTokHandle}
            onClick={onClickTikTok}
            iconOnly
          />
        )}
      </animated.div>
    ) : null

  const renderExpandedContent = (_, style) => (
    <animated.div className={styles.socials} style={style}>
      {props.twitterHandle && (
        <SocialLink
          type={Type.TWITTER}
          link={props.twitterHandle}
          onClick={onClickTwitter}
        />
      )}
      {props.instagramHandle && (
        <SocialLink
          type={Type.INSTAGRAM}
          link={props.instagramHandle}
          onClick={onClickInstagram}
        />
      )}
      {props.tikTokHandle && (
        <SocialLink
          type={Type.TIKTOK}
          link={props.tikTokHandle}
          onClick={onClickTikTok}
        />
      )}
      {props.website && (
        <SocialLink
          type={Type.WEBSITE}
          link={props.website}
          onClick={onClickWebsite}
        />
      )}
      {props.donation && (
        <SocialLink
          type={Type.DONATION}
          link={props.donation}
          onClick={onClickDonation}
        />
      )}
      <div className={styles.location}>{props.location}</div>
      <div className={styles.joined}>Joined {props.created}</div>
    </animated.div>
  )

  let leftNav = null
  if (props.editMode) {
    leftNav = (
      <div className={styles.edit}>
        <div className={styles.editLabel}>About You</div>
        <div className={styles.editField}>
          <TextArea
            className={styles.descriptionInput}
            size='small'
            grows
            placeholder='Description'
            defaultValue={props.bio || ''}
            onChange={props.onUpdateBio}
          />
        </div>
        <div className={styles.editField}>
          <Input
            className={styles.locationInput}
            characterLimit={30}
            size='small'
            placeholder='Location'
            defaultValue={props.location || ''}
            onChange={props.onUpdateLocation}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>
          Social Handles
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={props.twitterHandle}
            isDisabled={!!props.twitterVerified}
            className={styles.twitterInput}
            type={Type.TWITTER}
            onChange={props.onUpdateTwitterHandle}
          />
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={props.instagramHandle}
            className={styles.instagramInput}
            isDisabled={!!props.instagramVerified}
            type={Type.INSTAGRAM}
            onChange={props.onUpdateInstagramHandle}
          />
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={props.tikTokHandle}
            className={styles.tikTokInput}
            type={Type.TIKTOK}
            onChange={props.onUpdateTikTokHandle}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>Website</div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={props.website}
            className={styles.websiteInput}
            type={Type.WEBSITE}
            onChange={props.onUpdateWebsite}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>Donate</div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={props.donation}
            className={styles.donationInput}
            type={Type.DONATION}
            textLimitMinusLinks={32}
            onChange={props.onUpdateDonation}
          />
        </div>
      </div>
    )
  } else if (!props.loading && !props.isDeactivated) {
    leftNav = (
      <div className={styles.about}>
        <ProfilePageBadge userId={props.userId} className={styles.badge} />
        <Linkify options={{ attributes: { onClick: onExternalLinkClick } }}>
          <div
            className={cn(styles.description, {
              [styles.truncated]: isCollapsed
            })}
            ref={bioRef}
          >
            {squashNewLines(props.bio)}
          </div>
        </Linkify>
        {isCollapsed && (
          <div>
            <Transition
              items={null}
              from={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0 }}
              config={{ duration: 300 }}
            >
              {item => style => renderCollapsedContent(item, style)}
            </Transition>
            <div
              className={styles.truncateContainer}
              onClick={handleToggleCollapse}
            >
              <span>{messages.seeMore}</span>
              <IconCaretDownLine />
            </div>
          </div>
        )}
        {!isCollapsed && (
          <div>
            <Transition
              items={null}
              from={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0 }}
              config={{ duration: 300 }}
            >
              {item => style => renderExpandedContent(item, style)}
            </Transition>
            {isCollapsible && (
              <div
                className={styles.truncateContainer}
                onClick={handleToggleCollapse}
              >
                <span>{messages.seeLess}</span>
                <IconCaretUpLine />
              </div>
            )}
          </div>
        )}
        {isTippingEnabled &&
        accountUser &&
        accountUser.user_id !== props.userId ? (
          <div className={styles.tipAudioButton}>
            <TipAudioButton />
          </div>
        ) : null}
        <SupportingList />
        <TopSupporters />
        {props.isArtist ? (
          <Tags goToRoute={props.goToRoute} tags={props.tags} />
        ) : null}
        {props.isOwner && !props.isArtist && (
          <UploadChip type='track' variant='nav' onClick={onClickUploadChip} />
        )}
        {props.followeeFollows.length > 0 && !props.isOwner && (
          <>
            <Followers
              followers={props.followeeFollows}
              followerCount={props.followeeFollowsCount}
              onClickArtistName={handle => props.goToRoute(profilePage(handle))}
            />
            <More
              text='View All'
              onClick={() => setShowMutualConnectionsModal(true)}
            />
            <UserListModal
              title={`${formatCount(
                props.followeeFollowsCount
              )} MUTUAL CONNECTIONS`}
              visible={showMutualConnectionsModal}
              onClose={() => setShowMutualConnectionsModal(false)}
              users={props.followeeFollows}
              loading={props.followeeFollowsLoading}
              hasMore={
                props.followeeFollows.length < props.followeeFollowsCount
              }
              loadMore={props.loadMoreFolloweeFollows}
              onClickArtistName={handle => props.goToRoute(profilePage(handle))}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.profileWrapping}>
      <div className={styles.header}>
        <ProfilePicture
          userId={props.userId}
          updatedProfilePicture={
            props.updatedProfilePicture ? props.updatedProfilePicture.url : ''
          }
          error={
            props.updatedProfilePicture
              ? props.updatedProfilePicture.error
              : false
          }
          profilePictureSizes={
            props.isDeactivated ? null : props.profilePictureSizes
          }
          loading={props.loading}
          editMode={props.editMode}
          hasProfilePicture={props.hasProfilePicture}
          onDrop={props.onUpdateProfilePicture}
        />
        <div className={styles.nameWrapper}>
          <BadgeArtist
            className={cn(styles.badgeArtist, {
              [styles.hide]:
                !props.isArtist || props.loading || props.isDeactivated
            })}
          />
          {!props.isDeactivated && (
            <>
              <EditableName
                className={props.editMode ? styles.editableName : null}
                name={props.name}
                editable={props.editMode}
                verified={props.verified}
                onChange={props.onUpdateName}
                userId={props.userId}
              />
              <div className={styles.handleWrapper}>
                <h2 className={styles.handle}>{props.handle}</h2>
                {props.doesFollowCurrentUser ? <FollowsYouBadge /> : null}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.info}>{leftNav}</div>
    </div>
  )
}

export default ProfileWrapping
