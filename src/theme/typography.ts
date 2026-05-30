export const Fonts = {
  displayBold: 'SpaceGrotesk_700Bold',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayMedium: 'SpaceGrotesk_500Medium',
  displayRegular: 'SpaceGrotesk_400Regular',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

export const Typography = {
  displayXL: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  displayLG: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  caption: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  overline: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.6,
  },
  num: {
    fontFamily: Fonts.displaySemiBold,
  },
} as const;
