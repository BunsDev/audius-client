import { Text, TextProps } from 'app/components/core'

type ErrorTextProps = TextProps

export const ErrorText = (props: ErrorTextProps) => {
  return (
    <Text
      fontSize='medium'
      weight='demiBold'
      color='error'
      style={{ textAlign: 'center' }}
      {...props}
    />
  )
}
