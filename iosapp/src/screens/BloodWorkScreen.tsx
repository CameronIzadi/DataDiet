import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { Card, Text as ThemedText } from '../components';
import { SPACING } from '../config/designSystem';

interface Props {
  navigation: any;
}

export default function BloodWorkScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();

  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(12);
  const cardOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(16);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    headerTranslate.value = withDelay(100, withTiming(0, { duration: 500 }));
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    cardTranslate.value = withDelay(200, withTiming(0, { duration: 500 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslate.value }],
  }));

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <Animated.View style={[styles.header, headerStyle]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: `${colors.primary}15` }]}
          >
            <Icon name="arrow-left" size={20} color={colors.primary} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText variant="headlineSmall" color="primary">
              Blood Work
            </ThemedText>
            <ThemedText variant="bodySmall" color="muted" style={styles.subtitle}>
              Add results so we can correlate with diet patterns.
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View style={[styles.content, cardStyle]}>
          <Pressable
            onPress={() => {
              haptics.light();
              navigation.navigate('BloodWorkUpload');
            }}
          >
            <Card variant="primary" style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Icon name="file-upload-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionText}>
                <ThemedText variant="bodyLarge" color="primary">Upload a file</ThemedText>
                <ThemedText variant="bodySmall" color="muted">
                  PDF or image of lab results
                </ThemedText>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </Card>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              navigation.navigate('BloodWorkManual');
            }}
          >
            <Card variant="secondary" style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Icon name="pencil-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionText}>
                <ThemedText variant="bodyLarge" color="primary">Enter manually</ThemedText>
                <ThemedText variant="bodySmall" color="muted">
                  Type key lab values
                </ThemedText>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textMuted} />
            </Card>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
});
