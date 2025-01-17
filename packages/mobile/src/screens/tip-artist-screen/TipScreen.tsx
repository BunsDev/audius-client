import { Screen, ScreenProps } from 'app/components/core'

type TipScreenProps = ScreenProps

export const TipScreen = (props: TipScreenProps) => {
  return (
    <Screen
      variant='white'
      style={{ paddingVertical: 60, paddingHorizontal: 16 }}
      {...props}
    />
  )
}
