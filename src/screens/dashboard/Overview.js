import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Overview() {
  const navigation = useNavigation();

  const quickActions = [
    { id: 1, name: 'Attendance', icon: 'check-circle', color: 'bg-[#10b981]' },
    { id: 2, name: 'Timetable', icon: 'calendar', color: 'bg-[#8b5cf6]' },
    { id: 3, name: 'Results', icon: 'award', color: 'bg-[#ec4899]' },
    { id: 4, name: 'Fees', icon: 'credit-card', color: 'bg-[#f97316]' },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-surface flex-1" showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View className="pt-20 px-6 pb-20 bg-primary-900 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        {/* Decorative background circle */}
        <View className="absolute -top-10 -right-10 w-64 h-64 bg-primary-600 rounded-full opacity-30" />
        <View className="absolute bottom-[-50px] -left-10 w-48 h-48 bg-primary-400 rounded-full opacity-20" />
        
        <View className="flex-row justify-between items-start mb-6 z-10">
          <View>
            <Text className="text-primary-100 text-sm font-bold tracking-wider uppercase mb-1">Welcome back</Text>
            <Text className="text-white text-3xl font-extrabold tracking-tight">Admin User</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-full items-center justify-center backdrop-blur-md border border-white/20">
            <Feather name="bell" size={22} color="white" />
            <View className="absolute top-2 right-2 w-3 h-3 bg-accent-pink rounded-full border-2 border-primary-900" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area - Overlapping */}
      <View className="px-6 space-y-8 mt-[-60px] pb-32 z-20">
        
        {/* Glassmorphic Stats Row */}
        <View className="flex-row justify-between">
          <View className="w-[48%] bg-white p-5 rounded-[2rem] shadow-lg shadow-gray-200/50 items-start">
            <View className="w-14 h-14 bg-primary-50 rounded-2xl items-center justify-center mb-4">
              <Feather name="users" size={28} color="#2563eb" />
            </View>
            <Text className="text-3xl font-black text-gray-900 tracking-tight">1,240</Text>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Total Students</Text>
          </View>
          
          <View className="w-[48%] bg-white p-5 rounded-[2rem] shadow-lg shadow-gray-200/50 items-start">
            <View className="w-14 h-14 bg-accent-orange/10 rounded-2xl items-center justify-center mb-4">
              <Feather name="check-square" size={28} color="#fb923c" />
            </View>
            <Text className="text-3xl font-black text-gray-900 tracking-tight">45</Text>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Approvals</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View>
          <Text className="text-xl font-extrabold text-gray-900 mb-5 tracking-tight">Quick Actions</Text>
          <View className="flex-row justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                className="items-center group"
                onPress={() => {
                  if (action.name === 'Timetable') {
                    navigation.navigate('Timetable');
                  }
                }}
              >
                <View className={`w-16 h-16 ${action.color} rounded-[1.5rem] items-center justify-center mb-3 shadow-lg shadow-gray-300/50`}>
                  <Feather name={action.icon} size={26} color="white" />
                </View>
                <Text className="text-xs font-bold text-gray-600">{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Classes / Schedule */}
        <View>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-extrabold text-gray-900 tracking-tight">Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')} className="bg-primary-50 px-4 py-2 rounded-full">
              <Text className="text-sm font-bold text-primary-600">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-200/50">
            <View className="flex-row items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-accent-purple/10 rounded-2xl items-center justify-center">
                  <Feather name="book-open" size={24} color="#8b5cf6" />
                </View>
                <View>
                  <Text className="text-lg font-extrabold text-gray-900 mb-0.5">Computer Networks</Text>
                  <Text className="text-sm text-gray-500 font-semibold">Prof. Smith</Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                <Feather name="clock" size={16} color="#4b5563" />
                <Text className="text-sm font-bold text-gray-700">10:30 AM (1.5h)</Text>
              </View>
              <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                <Feather name="map-pin" size={16} color="#4b5563" />
                <Text className="text-sm font-bold text-gray-700">Room 302</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Approvals Link */}
        <TouchableOpacity 
          className="w-full bg-primary-900 py-5 rounded-[2rem] shadow-lg shadow-primary-900/30 flex-row items-center justify-center gap-3"
          onPress={() => navigation.navigate('Approvals')}
        >
          <Feather name="file-text" size={20} color="white" />
          <Text className="text-white font-bold text-lg">Review All Approvals</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
