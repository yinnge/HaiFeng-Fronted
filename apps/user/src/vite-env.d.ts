/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    layout?: 'default' | 'blank'
  }
}
