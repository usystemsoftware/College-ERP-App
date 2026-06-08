import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

const { height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const [role, setRole] = useState('Student');
  
  const roles = ['Student', 'Staff', 'Management'];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-surface flex-1" showsVerticalScrollIndicator={false}>
      
      {/* Dynamic Background Header */}
      <View className="absolute top-0 w-full h-[45%] bg-primary-900 rounded-b-[4rem] overflow-hidden">
        <View className="absolute -top-20 -left-20 w-80 h-80 bg-primary-600 rounded-full opacity-40 blur-3xl" />
        <View className="absolute bottom-10 -right-20 w-64 h-64 bg-accent-purple rounded-full opacity-20 blur-2xl" />
      </View>

      <View className="flex-1 justify-center px-6 py-12 lg:px-8 max-w-md w-full mx-auto z-10" style={{ marginTop: height * 0.05 }}>
        
        {/* Logo and Welcome Text */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-white/10 rounded-[2rem] items-center justify-center shadow-lg backdrop-blur-md border border-white/20 mb-6">
            <Feather name="layers" size={40} color="white" />
          </View>
          <Text className="text-4xl font-black text-white tracking-tight text-center">College ERP</Text>
          <Text className="mt-2 text-base font-medium text-primary-100 text-center">The Next-Gen Campus Platform</Text>
        </View>

        {/* Login Card */}
        <View className="bg-white px-8 py-10 shadow-2xl shadow-gray-300/60 rounded-[2.5rem] border border-gray-100">
          <View className="space-y-6">
            
            {/* Role Selector */}
            <View className="flex-row bg-surface p-1.5 rounded-[1.2rem] mb-4 border border-gray-100">
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-3 items-center rounded-xl ${
                    role === r ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-sm font-extrabold tracking-wide ${
                      role === r ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View>
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</Text>
              <View className="relative flex-row items-center">
                <View className="absolute left-5 z-10">
                  <Feather name="mail" size={20} color="#9ca3af" />
                </View>
                <TextInput 
                  className="w-full pl-14 pr-5 py-4 bg-surface border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-primary-50 text-gray-900 font-semibold"
                  placeholder="name@college.edu"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
                />
              </View>
            </View>

            <View className="mt-2">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</Text>
              <View className="relative flex-row items-center">
                <View className="absolute left-5 z-10">
                  <Feather name="lock" size={20} color="#9ca3af" />
                </View>
                <TextInput 
                  className="w-full pl-14 pr-5 py-4 bg-surface border-2 border-gray-100 rounded-2xl focus:border-primary-500 focus:bg-primary-50 text-gray-900 font-semibold"
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-end mt-2">
              <TouchableOpacity>
                <Text className="text-sm font-bold text-primary-600 tracking-wide">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="w-full mt-4 bg-primary-600 py-5 rounded-2xl shadow-lg shadow-primary-600/40 items-center justify-center flex-row gap-2"
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text className="text-white font-extrabold text-lg tracking-wide">Sign In</Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
