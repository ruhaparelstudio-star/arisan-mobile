# Arisan Mobile — Documentation Index

Arisan is a React Native / Expo mobile app for managing rotating savings groups (_arisan_) in Indonesia. Members pool money each period; a lottery (_undian_) determines who receives the pot.

## Documents

| File | What it covers |
|------|---------------|
| [architecture.md](architecture.md) | Technology stack, folder layout, data-flow overview |
| [design-system.md](design-system.md) | Colors, typography, spacing, radius, shadow, base UI components |
| [navigation.md](navigation.md) | Route hierarchy, screen params, navigation patterns |
| [screens.md](screens.md) | Every screen: purpose, params, states, data sources |
| [api-reference.md](api-reference.md) | All API modules, types, and endpoint signatures |
| [hooks.md](hooks.md) | Custom hooks — auth, network, realtime, sound |
| [data-flow.md](data-flow.md) | Caching strategy, Supabase Realtime, offline mode |

## Quick facts

- **Platform:** Android (primary), iOS compatible  
- **Language:** TypeScript (strict)  
- **Expo SDK:** 52  
- **React Native:** 0.76.7  
- **App version:** 1.0.3 (versionCode 4)  
- **Package:** `com.ruhaparelstudio.arisan`  
- **Entry point:** `App.tsx` → `RootNavigator` → `AuthNavigator | AppNavigator`
