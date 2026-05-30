export const Spacing = {
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 16,
  sp5: 22,
  sp6: 28,
  sp7: 40,
  screenPad: 22,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  input: 14,
  btn: 15,
  card: 20,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  primary: {
    shadowColor: 'rgba(0,168,126,0.55)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },
  pop: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
