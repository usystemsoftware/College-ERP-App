import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import Overview from '../screens/dashboard/Overview';
import ApprovalDashboard from '../screens/approvals/ApprovalDashboard';
import Schedule from '../screens/schedule/Schedule';
import Messages from '../screens/messages/Messages';
import Profile from '../screens/profile/Profile';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'grid';
          else if (route.name === 'Schedule') iconName = 'calendar';
          else if (route.name === 'Approvals') iconName = 'check-square';
          else if (route.name === 'Notices') iconName = 'message-circle';
          else if (route.name === 'Profile') iconName = 'user';

          return (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? 'bg-primary-500 shadow-md shadow-primary-500/30' : 'bg-transparent'}`}>
              <Feather name={iconName} size={22} color={focused ? '#ffffff' : '#9ca3af'} />
            </View>
          );
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          backgroundColor: '#ffffff',
          borderRadius: 40,
          height: 70,
          borderTopWidth: 0,
          paddingHorizontal: 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={Overview} />
      <Tab.Screen name="Schedule" component={Schedule} />
      <Tab.Screen name="Approvals" component={ApprovalDashboard} />
      <Tab.Screen name="Notices" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
