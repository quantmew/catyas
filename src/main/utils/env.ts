export function isDev(): boolean {
  return process.env.NODE_ENV === 'development' || !app.isPackaged
}

export function isProd(): boolean {
  return !isDev()
}

import { app } from 'electron'