import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, UserPlus, Building, Users, DollarSign, User, BookOpen } from 'lucide-react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdmissionScreen from '../screens/AdmissionScreen';
import DepartmentScreen from '../screens/DepartmentScreen';
import SubjectScreen from '../screens/SubjectScreen';
import StudentScreen from '../screens/StudentScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthProvider, AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder Screen component for unfinished tabs
const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{route.name} Module</Text>
    <Text style={styles.placeholderSubtext}>Coming soon...</Text>
  </View>
);

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Dashboard') IconComponent = Home;
          else if (route.name === 'Admission') IconComponent = UserPlus;
          else if (route.name === 'Department') IconComponent = Building;
          else if (route.name === 'Subjects') IconComponent = BookOpen;
          else if (route.name === 'Students') IconComponent = Users;
          else if (route.name === 'Profile') IconComponent = User;

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent 
                size={22} 
                color={focused ? '#F59E0B' : '#94a3b8'} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          paddingBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60 + Math.max(insets.bottom, 0),
          paddingBottom: Math.max(insets.bottom, 4),
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#0f172a',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Admission" component={AdmissionScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Department" component={DepartmentScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Subjects" component={SubjectScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Students" component={StudentScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// Wrapper to consume context and conditionally show stacks
function RootNavigator() {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  }
});
