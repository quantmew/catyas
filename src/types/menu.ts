export interface MenuItem {
  id: string
  action?: string
  shortcut?: string
  disabled?: boolean
  children?: MenuItem[]
}

export interface MenuSeparator {
  type: 'separator'
}

export type MenuItemOrSeparator = MenuItem | MenuSeparator

export interface MenuGroup {
  id: string
  items: MenuItemOrSeparator[]
}

export interface MenuConfig {
  menubar: MenuGroup[]
}

export function isSeparator(item: MenuItemOrSeparator): item is MenuSeparator {
  return 'type' in item && item.type === 'separator'
}