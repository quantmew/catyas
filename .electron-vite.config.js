// Electron Vite development configuration
export default {
  main: {
    // Restart electron on main process changes
    restart: true,
  },
  preload: {
    // Reload renderer on preload changes
    reload: true,
  },
  renderer: {
    // HMR for renderer
    hmr: true,
  },
}
