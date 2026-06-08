import 'react-native-gesture-handler';
import './global.css';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screens/auth/Login';
import MainTabs from './src/layouts/MainTabs';
import Timetable from './src/screens/dashboard/Timetable';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Timetable" component={Timetable} />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
