export const FRAME_MAX_SIZE = {
  maxWidth: 1920,
  maxHeight: 1080,
};

export const FRAME_DEFAULT_SIZE = {
  width: 1440,
  height: 900,
};

export const FRAME_MIN_SIZE = {
  minWidth: 1280,
  minHeight: 768,
};

const TABS_LINE_HEIGHT_MACOS = 44;
const TABS_LINE_HEIGHT_WIN32 = 52;

const TABS_LINE_HEIGHT = TABS_LINE_HEIGHT_MACOS;
const NAVIGATION_HEIGHT = 44;
export const NATIVE_HEADER_H = TABS_LINE_HEIGHT;
export const NATIVE_HEADER_WITH_NAV_H = TABS_LINE_HEIGHT + NAVIGATION_HEIGHT;
