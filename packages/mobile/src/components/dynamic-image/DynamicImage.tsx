import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

import transparentPlaceholderImg from 'audius-client/src/common/assets/image/1x1-transparent.png'
import useInstanceVar from 'audius-client/src/common/hooks/useInstanceVar'
import { Maybe } from 'audius-client/src/common/utils/typeUtils'
import { isArray, isObject } from 'lodash'
import {
  Animated,
  Image,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet,
  View
} from 'react-native'

import { ImageSkeleton } from 'app/components/image-skeleton'

export type DynamicImageProps = {
  // Image source
  image?: ImageSourcePropType
  // Style to apply to the image itself
  style?: StyleProp<ImageStyle>
  // Whether or not to immediately animate
  immediate?: boolean
  // Whether or not to use the default placeholder
  usePlaceholder?: boolean
}

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
})

const isImageEqual = (
  imageA: Maybe<ImageSourcePropType>,
  imageB: Maybe<ImageSourcePropType>
) => {
  if (imageA === imageB) {
    return true
  }

  if (
    isArray(imageA) &&
    isArray(imageB) &&
    !imageA.some((v, i) => v.uri !== imageB[i].uri)
  ) {
    return true
  }

  if (
    isObject(imageA) &&
    isObject(imageB) &&
    (imageA as ImageURISource).uri === (imageB as ImageURISource).uri
  ) {
    return true
  }

  return false
}

const ImageWithPlaceholder = ({ usePlaceholder, image, style }) => {
  if (image) {
    return <Image source={image} style={style} />
  }

  if (usePlaceholder) {
    return <ImageSkeleton styles={{ root: style }} />
  }

  return <Image source={transparentPlaceholderImg} />
}

/**
 * A dynamic image that transitions between changes to the `image` prop.
 */
const DynamicImage = ({
  image,
  style,
  immediate,
  usePlaceholder = true
}: DynamicImageProps) => {
  const [firstSize, setFirstSize] = useState(0)
  const [secondSize, setSecondSize] = useState(0)
  const [firstImage, setFirstImage] = useState<ImageSourcePropType>()
  const [secondImage, setSecondImage] = useState<ImageSourcePropType>()

  const firstOpacity = useRef(new Animated.Value(0)).current
  const secondOpacity = useRef(new Animated.Value(0)).current

  const [isFirstImageActive, setIsFirstImageActive] = useState(true)

  const [
    getPrevImage,
    setPrevImage
  ] = useInstanceVar<ImageSourcePropType | null>(null) // no previous image

  const animateTo = useCallback(
    (anim: Animated.Value, toValue: number) =>
      Animated.timing(anim, {
        toValue,
        duration: immediate ? 100 : 500,
        useNativeDriver: true
      }).start(),
    [immediate]
  )

  useEffect(() => {
    // Skip animation for subsequent loads where the image hasn't changed
    const previousImage = getPrevImage()
    if (previousImage !== null && isImageEqual(previousImage, image)) {
      return
    }

    setPrevImage(image ?? null)

    if (isFirstImageActive) {
      setIsFirstImageActive(false)
      setFirstImage(image)
      animateTo(firstOpacity, 1)
      animateTo(secondOpacity, 0)
    } else {
      setIsFirstImageActive(true)
      setSecondImage(image)
      animateTo(firstOpacity, 0)
      animateTo(secondOpacity, 1)
    }
  }, [
    animateTo,
    firstOpacity,
    getPrevImage,
    image,
    isFirstImageActive,
    secondOpacity,
    setIsFirstImageActive,
    setPrevImage
  ])

  return (
    <View>
      <Animated.View
        style={[styles.image, { opacity: firstOpacity }]}
        onLayout={e => setFirstSize(e.nativeEvent.layout.width)}
      >
        <ImageWithPlaceholder
          image={firstImage}
          style={[{ width: firstSize, height: firstSize }, style]}
          usePlaceholder={usePlaceholder}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.image,
          { opacity: secondOpacity, zIndex: isFirstImageActive ? -1 : 0 }
        ]}
        onLayout={e => setSecondSize(e.nativeEvent.layout.width)}
      >
        <ImageWithPlaceholder
          image={secondImage}
          style={[{ width: secondSize, height: secondSize }, style]}
          usePlaceholder={usePlaceholder}
        />
      </Animated.View>
    </View>
  )
}

export default memo(DynamicImage)