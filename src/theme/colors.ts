export const Colors = {
  primary: '#00C897',
  primaryDeep: '#00A87E',
  primaryInk: '#047857',
  primaryTint: '#E6FAF4',
  primaryRing: 'rgba(0,200,151,0.18)',
  primaryShadow: 'rgba(0,168,126,0.55)',

  bg: '#FFFFFF',
  card: '#FFFFFF',
  surface: '#F4F6F5',
  border: '#ECEFEE',
  borderStrong: '#DDE3E1',
  ink: '#0E1B16',
  muted: '#7A8B84',
  mutedStrong: '#566159',

  amber: '#F5A524',
  amberTint: '#FFF4E0',
  amberInk: '#B57400',
  danger: '#EF5B52',
  dangerTint: '#FEECEB',
  success: '#00C897',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const AvatarColors: [string, string][] = [
  ['#E8FAF4', '#00A87E'],
  ['#FFF1E6', '#E07B39'],
  ['#EEF2FF', '#5B6CF0'],
  ['#FDECF2', '#D6447E'],
  ['#ECFCF6', '#0F9B76'],
  ['#FFF6E0', '#C99400'],
  ['#EAF4FF', '#2D7FD6'],
  ['#F2EEFC', '#7B5AD6'],
];

export function getAvatarColor(name: string): [string, string] {
  const idx = (name.charCodeAt(0) || 0) % AvatarColors.length;
  return AvatarColors[idx];
}
