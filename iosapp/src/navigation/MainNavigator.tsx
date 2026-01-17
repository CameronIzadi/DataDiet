import React from 'react';
import { StyleSheet, Platform, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Apple, TrendingUp, FileText, History } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { DARK, LIGHT } from '../config/designSystem';

import LogMealScreen from '../screens/LogMealScreen';
import CaptureScreen from '../screens/CaptureScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ReportScreen from '../screens/ReportScreen';
import ReportHistoryScreen from '../screens/ReportHistoryScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import BloodWorkScreen from '../screens/BloodWorkScreen';
import BloodWorkManualScreen from '../screens/BloodWorkManualScreen';
import BloodWorkUploadScreen from '../screens/BloodWorkUploadScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainStackParamList = {
  MainTabs: undefined;
  Capture: undefined;
  Settings: undefined;
  ReportHistory: undefined;
  ReportDetail: { reportId: string };
  BloodWork: undefined;
  BloodWorkManual: undefined;
  BloodWorkUpload: undefined;
};

export type MainTabParamList = {
  LogMeal: undefined;
  Insights: undefined;
  Report: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityState?: { selected?: boolean };
}

function TabBarButton({ children, onPress, accessibilityState }: TabBarButtonProps) {
  const scale = useSharedValue(1);
  const isSelected = accessibilityState?.selected;

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.light();
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function MainTabs() {
  const { colors, themeProgress, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: 64 + (Platform.OS === 'ios' ? insets.bottom : 8),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
          backgroundColor: isDark ? DARK.surface : LIGHT.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark ? DARK.border : LIGHT.border,
          elevation: 0,
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      <Tab.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{
          tabBarLabel: 'Log Meal',
          tabBarIcon: ({ color }) => <Apple size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={ReportHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: isDark ? DARK.background : LIGHT.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ReportHistory" component={ReportHistoryScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <Stack.Screen name="BloodWork" component={BloodWorkScreen} />
      <Stack.Screen name="BloodWorkManual" component={BloodWorkManualScreen} />
      <Stack.Screen name="BloodWorkUpload" component={BloodWorkUploadScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
