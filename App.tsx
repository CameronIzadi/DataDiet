import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ReportScreen from './src/screens/ReportScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0D1117' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Insights" component={InsightsScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
