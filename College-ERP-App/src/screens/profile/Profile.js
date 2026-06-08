import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const navigation = useNavigation();

  const menuItems = [
    { id: 1, title: 'Personal Information', icon: 'user', color: '#3b82f6', bgColor: 'bg-blue-50' },
    { id: 2, title: 'Academic Records', icon: 'book', color: '#8b5cf6', bgColor: 'bg-purple-50' },
    { id: 3, title: 'Fee Details', icon: 'credit-card', color: '#10b981', bgColor: 'bg-green-50' },
    { id: 4, title: 'Settings', icon: 'settings', color: '#64748b', bgColor: 'bg-slate-100' },
    { id: 5, title: 'Help & Support', icon: 'help-circle', color: '#f59e0b', bgColor: 'bg-amber-50' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header Profile Info */}
      <View className="bg-primary-600 pt-20 pb-8 px-6 rounded-b-[40px] shadow-sm items-center relative">
        <View className="absolute top-16 right-6">
          <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Feather name="edit-3" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="w-24 h-24 bg-white rounded-full p-1 mb-4 shadow-md">
          <View className="flex-1 bg-primary-100 rounded-full items-center justify-center">
            <Text className="text-3xl font-extrabold text-primary-600">AD</Text>
          </View>
        </View>

        <Text className="text-2xl font-extrabold text-white">Admin User</Text>
        <Text className="text-primary-100 font-medium mt-1">Staff ID: EMP-2048</Text>
        
        <View className="flex-row items-center mt-3 bg-white/20 px-4 py-1.5 rounded-full">
          <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
          <Text className="text-white text-xs font-bold">Active</Text>
        </View>
      </View>

      <View className="px-6 pt-6 -mt-10">
        {/* Key Information Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[48%] bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center">
            <Feather name="mail" size={20} color="#6b7280" className="mb-2" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">Email</Text>
            <Text className="text-sm font-semibold text-gray-900 mt-1">admin@college.edu</Text>
          </View>
          
          <View className="w-[48%] bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center">
            <Feather name="phone" size={20} color="#6b7280" className="mb-2" />
            <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">Phone</Text>
            <Text className="text-sm font-semibold text-gray-900 mt-1">+1 234 567 890</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <View className="flex-row items-center gap-4">
                <View className={`w-10 h-10 ${item.bgColor} rounded-xl items-center justify-center`}>
                  <Feather name={item.icon} size={18} color={item.color} />
                </View>
                <Text className="text-base font-bold text-gray-800">{item.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          className="w-full bg-red-50 border border-red-100 py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-6"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text className="text-red-600 font-bold text-base">Log Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-xs font-semibold text-gray-400 mb-6">App Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}
