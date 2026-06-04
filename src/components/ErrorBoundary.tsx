import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crashlytics = require('@react-native-firebase/crashlytics').default;
      crashlytics().recordError(error);
    } catch {
      // Crashlytics tidak tersedia (Expo Go / development)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Terjadi kesalahan</Text>
          <Text style={styles.body}>
            Aplikasi mengalami error yang tidak terduga. Silakan coba muat ulang.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  btnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
  },
});
