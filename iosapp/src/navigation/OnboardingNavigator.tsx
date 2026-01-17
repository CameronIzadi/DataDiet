import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NameScreen from '../screens/Onboarding/NameScreen';
import GoalScreen from '../screens/Onboarding/GoalScreen';
import SignalTrackingScreen from '../screens/Onboarding/SignalTrackingScreen';
import CustomSignalsScreen from '../screens/Onboarding/CustomSignalsScreen';
import PermissionsScreen from '../screens/Onboarding/PermissionsScreen';
import CreateAccountScreen from '../screens/Onboarding/CreateAccountScreen';
import ReadyScreen from '../screens/Onboarding/ReadyScreen';

export type OnboardingStackParamList = {
  Name: undefined;
  Goal: undefined;
  SignalTracking: undefined;
  CustomSignals: undefined;
  Permissions: undefined;
  CreateAccount: undefined;
  Ready: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="SignalTracking" component={SignalTrackingScreen} />
      <Stack.Screen name="CustomSignals" component={CustomSignalsScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Ready" component={ReadyScreen} />
    </Stack.Navigator>
  );
}
