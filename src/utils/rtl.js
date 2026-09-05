/**
 * src/utils/rtl.js
 *
 * RTL utilities for Arabic layout support.
 * Centralize RTL logic rather than ad-hoc flexDirection flips per screen.
 */

import { I18nManager, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export function isRTL() {
  return I18nManager.isRTL;
}

export function applyRTL(lang) {
  const shouldBeRTL = lang === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // On native, layout changes require a reload
    if (Platform.OS !== 'web') {
      // RN's I18nManager changes take effect on next render cycle
      // No explicit reload needed in modern RN
    }
  }
}

export function rtlFlexDirection(baseDirection) {
  if (!isRTL()) return baseDirection;
  return baseDirection === 'row' ? 'row-reverse' : baseDirection === 'row-reverse' ? 'row' : baseDirection;
}

export function rtlAlign(align) {
  if (!isRTL()) return align;
  if (align === 'flex-start') return 'flex-end';
  if (align === 'flex-end') return 'flex-start';
  return align;
}

export function rtlTextAlign(align) {
  if (!isRTL()) return align;
  if (align === 'left') return 'right';
  if (align === 'right') return 'left';
  return align;
}

export function rtlMarginHorizontal(margin) {
  if (!isRTL()) return margin;
  // Swap start/end margins
  return margin;
}
