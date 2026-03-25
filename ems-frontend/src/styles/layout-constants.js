// Layout Constants for EMS Application
export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTHS: {
    ADMIN: 240,
    MANAGER: 280
  },
  BREAKPOINTS: {
    MOBILE: 'md',
    TABLET: 'lg',
    DESKTOP: 'xl'
  },
  TRANSITIONS: {
    FAST: '0.2s ease',
    NORMAL: '0.3s ease',
    SLOW: '0.4s ease'
  }
};

// CSS Custom Properties (can be injected globally)
export const CSS_VARIABLES = {
  '--admin-sidebar-width': '240px',
  '--manager-sidebar-width': '280px',
  '--layout-transition': 'margin 0.3s ease'
};
