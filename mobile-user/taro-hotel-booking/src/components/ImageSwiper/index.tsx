import { Swiper, SwiperItem, Image, View } from '@tarojs/components'
import './index.less'

export type ImageSwiperProps = {
  images: Array<{ id?: number; url: string }> | string[]
}

export default function ImageSwiper(props: ImageSwiperProps) {
  const urls = props.images.map((img) => (typeof img === 'string' ? img : img.url))

  if (urls.length === 0) {
    return <View className='image-swiper image-swiper--empty' />
  }

  return (
    <Swiper className='image-swiper' circular indicatorDots autoplay>
      {urls.map((url) => (
        <SwiperItem key={url}>
          <Image className='image-swiper__image' src={url} mode='aspectFill' />
        </SwiperItem>
      ))}
    </Swiper>
  )
}
