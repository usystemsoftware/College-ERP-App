import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useRef, useState } from 'react';

export default function OtpVerification() {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50 flex-1">
      <View className="flex-1 justify-center px-6 py-12 lg:px-8 max-w-md w-full mx-auto">
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Feather name="key" size={28} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Enter Security Code</Text>
          <Text className="mt-2 text-sm text-gray-500 text-center">
            We've sent a 6-digit code to your registered device. Enter it below to verify your identity.
          </Text>
        </View>

        <View className="bg-white px-8 py-10 shadow rounded-3xl items-center">
          <View className="flex-row justify-between w-full mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => inputs.current[index] = ref}
                className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-900 focus:border-primary-500"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
              />
            ))}
          </View>

          <TouchableOpacity 
            className="w-full bg-primary-600 py-4 rounded-xl shadow-md items-center justify-center"
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text className="text-white font-bold text-base">Verify Identity</Text>
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-gray-500">Didn't receive the code? </Text>
            <TouchableOpacity>
              <Text className="text-sm font-semibold text-primary-600">Resend Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
