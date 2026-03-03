import { ref } from 'vue'

const isMobile = ref(
  /mobi|android|iphone|ipod|phone|tablet|ipad/i.test(navigator.userAgent)
)

export function useMobile() {
  return { isMobile }
}
