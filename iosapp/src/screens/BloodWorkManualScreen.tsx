import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { Button } from '../components/Button';
import { Card, Text as ThemedText } from '../components';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT, GRADIENTS } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BloodWorkData {
  id: string;
  date: string;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  fastingGlucose?: number;
  hba1c?: number;
  notes?: string;
  createdAt: string;
}

interface Props {
  navigation: any;
}

const BLOOD_WORK_FIELDS = [
  { key: 'totalCholesterol', label: 'Total Cholesterol', unit: 'mg/dL', icon: 'heart-pulse', normalRange: '< 200' },
  { key: 'ldl', label: 'LDL (Bad)', unit: 'mg/dL', icon: 'arrow-down-bold', normalRange: '< 100' },
  { key: 'hdl', label: 'HDL (Good)', unit: 'mg/dL', icon: 'arrow-up-bold', normalRange: '> 40' },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', icon: 'water', normalRange: '< 150' },
  { key: 'fastingGlucose', label: 'Fasting Glucose', unit: 'mg/dL', icon: 'glucose', normalRange: '< 100' },
  { key: 'hba1c', label: 'HbA1c', unit: '%', icon: 'percent', normalRange: '< 5.7' },
];

export default function BloodWorkManualScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const animatedBackground = useAnimatedBackground();
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleValueChange = (key: string, value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setValues(prev => ({ ...prev, [key]: cleaned }));
  };

  const handleSave = async () => {
    // Check if at least one value is entered
    const hasValues = Object.values(values).some(v => v && v.trim() !== '');
    if (!hasValues) {
      Alert.alert('No Data', 'Please enter at least one blood work value.');
      return;
    }

    setSaving(true);
    haptics.light();

    try {
      const bloodWorkData: BloodWorkData = {
        id: Date.now().toString(),
        date,
        totalCholesterol: values.totalCholesterol ? parseFloat(values.totalCholesterol) : undefined,
        ldl: values.ldl ? parseFloat(values.ldl) : undefined,
        hdl: values.hdl ? parseFloat(values.hdl) : undefined,
        triglycerides: values.triglycerides ? parseFloat(values.triglycerides) : undefined,
        fastingGlucose: values.fastingGlucose ? parseFloat(values.fastingGlucose) : undefined,
        hba1c: values.hba1c ? parseFloat(values.hba1c) : undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // Get existing blood work data
      const existingData = await AsyncStorage.getItem('bloodwork_data');
      const allData: BloodWorkData[] = existingData ? JSON.parse(existingData) : [];

      // Add new data
      allData.unshift(bloodWorkData);

      // Save back
      await AsyncStorage.setItem('bloodwork_data', JSON.stringify(allData));

      haptics.success();
      Alert.alert(
        'Saved',
        'Blood work results have been saved. They will be used to correlate with your dietary patterns.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving blood work:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to save blood work data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} isDark={isDark} colors={colors} />
            <View style={styles.headerTitle}>
              <ThemedText variant="headlineSmall" color="primary">Add Blood Work</ThemedText>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Info Card */}
            <Card variant="utility" style={styles.infoCard}>
              <Icon name="information-outline" size={20} color={colors.primary} />
              <ThemedText variant="bodySmall" color="muted" style={styles.infoText}>
                Enter your blood test results. These will help correlate dietary patterns with your health markers.
              </ThemedText>
            </Card>

            {/* Date Input */}
            <Card variant="secondary" style={styles.dateCard}>
              <View style={styles.dateHeader}>
                <Icon name="calendar" size={20} color={colors.primary} />
                <ThemedText variant="bodyLarge" color="primary" style={styles.dateLabel}>
                  Test Date
                </ThemedText>
              </View>
              <TextInput
                style={[
                  styles.dateInput,
                  {
                    color: isDark ? DARK.text : LIGHT.text,
                    backgroundColor: isDark ? DARK.background : LIGHT.background,
                    borderColor: isDark ? DARK.border : LIGHT.border,
                  }
                ]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDark ? DARK.textMuted : LIGHT.textMuted}
              />
            </Card>

            {/* Blood Work Fields */}
            <ThemedText variant="headlineSmall" color="primary" style={styles.sectionTitle}>
              Lab Results
            </ThemedText>

            {BLOOD_WORK_FIELDS.map((field, index) => (
              <Animated.View
                key={field.key}
                entering={FadeIn.delay(index * 50).duration(300)}
              >
                <BloodWorkInput
                  field={field}
                  value={values[field.key] || ''}
                  onChange={(value) => handleValueChange(field.key, value)}
                  isDark={isDark}
                  colors={colors}
                />
              </Animated.View>
            ))}

            {/* Notes */}
            <ThemedText variant="headlineSmall" color="primary" style={styles.sectionTitle}>
              Notes (Optional)
            </ThemedText>

            <Card variant="utility" style={styles.notesCard}>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: isDark ? DARK.text : LIGHT.text,
                  }
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes about this test..."
                placeholderTextColor={isDark ? DARK.textMuted : LIGHT.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Card>

            <View style={styles.spacer} />
          </ScrollView>

          {/* Save Button */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: isDark ? DARK.surface : LIGHT.surface,
                borderTopColor: isDark ? DARK.border : LIGHT.border,
                paddingBottom: SPACING.lg + insets.bottom,
              },
            ]}
          >
            <Button
              title="Save Blood Work"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

interface BackButtonProps {
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function BackButton({ onPress, isDark, colors }: BackButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.backButton,
        animatedStyle,
        { backgroundColor: isDark ? DARK.surface : LIGHT.surface }
      ]}
    >
      <Icon name="arrow-left" size={22} color={colors.text} />
    </AnimatedPressable>
  );
}

interface BloodWorkInputProps {
  field: typeof BLOOD_WORK_FIELDS[0];
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  colors: any;
}

function BloodWorkInput({ field, value, onChange, isDark, colors }: BloodWorkInputProps) {
  return (
    <Card variant="utility" style={styles.inputCard}>
      <View style={styles.inputHeader}>
        <View style={[styles.inputIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Icon name={field.icon as any} size={18} color={colors.primary} />
        </View>
        <View style={styles.inputLabelContainer}>
          <ThemedText variant="bodyMedium" color="primary">{field.label}</ThemedText>
          <ThemedText variant="labelSmall" color="soft">Normal: {field.normalRange}</ThemedText>
        </View>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.valueInput,
            {
              color: isDark ? DARK.text : LIGHT.text,
              backgroundColor: isDark ? DARK.background : LIGHT.background,
              borderColor: isDark ? DARK.border : LIGHT.border,
            }
          ]}
          value={value}
          onChangeText={onChange}
          placeholder="--"
          placeholderTextColor={isDark ? DARK.textMuted : LIGHT.textMuted}
          keyboardType="decimal-pad"
        />
        <ThemedText variant="bodySmall" color="soft" style={styles.unitLabel}>
          {field.unit}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  dateCard: {
    marginBottom: SPACING.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  dateInput: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  inputCard: {
    marginBottom: SPACING.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabelContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  valueInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineSmall,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    textAlign: 'center',
  },
  unitLabel: {
    width: 50,
  },
  notesCard: {
    marginBottom: SPACING.lg,
  },
  notesInput: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  spacer: {
    height: SPACING.xl,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
