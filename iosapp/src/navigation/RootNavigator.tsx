import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import SplashScreen from '../screens/Onboarding/SplashScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showSplash) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}>
        <Stack.Screen name="Splash">
          {(props) => (
            <SplashScreen
              {...props}
              onComplete={() => setShowSplash(false)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
