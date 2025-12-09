<template>
  <component :is="iconComponent" v-if="iconComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Import all your icons here in one place
import CameraIcon from '@iconify-vue/mdi/camera'
import ArrowRightIcon from '@iconify-vue/mdi/arrow-right'
import MessageTextIcon from '@iconify-vue/mdi/message-text'
import AlertCircleIcon from '@iconify-vue/mdi/alert-circle'
import CloseIcon from '@iconify-vue/mdi/close'
import ImageSearchIcon from '@iconify-vue/mdi/image-search'
import FilterIcon from '@iconify-vue/mdi/filter'
import AccountIcon from '@iconify-vue/mdi/account'
import CreativeCommonsIcon from '@iconify-vue/mdi/creative-commons'
import ClockIcon from '@iconify-vue/mdi/clock-outline'
import DownloadIcon from '@iconify-vue/mdi/download'
import InboxIcon from '@iconify-vue/mdi/inbox-outline'
import UploadIcon from '@iconify-vue/mdi/upload'
import PostIcon from '@iconify-vue/mdi/post'
import BookIcon from '@iconify-vue/mdi/book-open-page-variant'
import SignIcon from '@iconify-vue/mdi/sign-real-estate'
import StickerIcon from '@iconify-vue/mdi/sticker-circle-outline'
import RectangleIcon from '@iconify-vue/mdi/rectangle-outline'
import FileIcon from '@iconify-vue/mdi/file'
import HomeIcon from '@iconify-vue/mdi/home'
import MapIcon from '@iconify-vue/mdi/map'
import SchoolIcon from '@iconify-vue/mdi/school'
import ShoppingIcon from '@iconify-vue/mdi/shopping-cart'
import MapMarkerPlusIcon from '@iconify-vue/mdi/map-marker-plus'
import FileDocumentIcon from '@iconify-vue/mdi/file-document'
import AccountVoiceIcon from '@iconify-vue/mdi/account-voice'
import EmailOutlineIcon from '@iconify-vue/mdi/email-outline'
import GithubIcon from '@iconify-vue/mdi/github'
import HeartIcon from '@iconify-vue/mdi/heart'
import ChevronDownIcon from '@iconify-vue/mdi/chevron-down'
import ThemeIcon from '@iconify-vue/mdi/theme-light-dark'
import HamburgerIcon from '@iconify-vue/mdi/menu'
// Add more as needed...

// Import from IC set
import GroupingIcon from '@iconify-vue/ic/baseline-bubble-chart'
import DiscordIcon from '@iconify-vue/ic/baseline-discord'

const props = defineProps<{
  name: string
}>()

// Icon registry mapping
const iconRegistry = {
  // MDI Icons
  'camera': CameraIcon,
  'arrow-right': ArrowRightIcon,
  'message-text': MessageTextIcon,
  'alert-circle': AlertCircleIcon,
  'close': CloseIcon,
  'image-search': ImageSearchIcon,
  'filter': FilterIcon,
  'account': AccountIcon,
  'creative-commons': CreativeCommonsIcon,
  'clock': ClockIcon,
  'download': DownloadIcon,
  'inbox': InboxIcon,
  'upload': UploadIcon,
  'post': PostIcon,
  'book': BookIcon,
  'sign': SignIcon,
  'sticker': StickerIcon,
  'rectangle': RectangleIcon,
  'file': FileIcon,
  'home': HomeIcon,
  'map': MapIcon,
  'school': SchoolIcon,
  'shopping': ShoppingIcon,
  'map-marker-plus': MapMarkerPlusIcon,
  'file-document': FileDocumentIcon,
  'account-voice': AccountVoiceIcon,
  'email-outline': EmailOutlineIcon,
  'github': GithubIcon,
  'heart': HeartIcon,
  'chevron-down': ChevronDownIcon,
  'theme': ThemeIcon,
  'hamburger': HamburgerIcon,
  
  // IC Icons
  'grouping': GroupingIcon,
  'discord': DiscordIcon,
  
  // Add more mappings as needed...
}

const iconComponent = computed(() => {
  return iconRegistry[props.name as keyof typeof iconRegistry]
})
</script>