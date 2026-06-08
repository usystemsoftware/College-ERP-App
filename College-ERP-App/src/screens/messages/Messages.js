import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

export default function Messages() {
  const [activeTab, setActiveTab] = useState('Notices');

  const notices = [
    {
      id: 1,
      title: 'End Semester Examination Schedule',
      sender: 'Examination Department',
      date: 'Today, 09:30 AM',
      description: 'The final timetable for the upcoming Fall Semester examinations is now available. Please check the attached document.',
      isImportant: true,
      hasAttachment: true,
    },
    {
      id: 2,
      title: 'Campus Placement Drive: Google',
      sender: 'Placement Cell',
      date: 'Yesterday',
      description: 'Google is visiting our campus next week. All final year CS/IT students must register before Friday.',
      isImportant: true,
      hasAttachment: false,
    },
    {
      id: 3,
      title: 'Library Maintenance Notice',
      sender: 'Central Library',
      date: 'Oct 20, 2026',
      description: 'The central library will remain closed this Saturday for pest control and general maintenance.',
      isImportant: false,
      hasAttachment: false,
    }
  ];

  const messages = [
    {
      id: 1,
      name: 'Prof. Sarah Davis',
      role: 'HOD Computer Science',
      lastMessage: 'Have you completed the assignment I gave yesterday?',
      time: '10:45 AM',
      unread: 2,
      color: 'bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Class Representative',
      lastMessage: 'Sure, I will share the notes with everyone in the group.',
      time: 'Yesterday',
      unread: 0,
      color: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      id: 3,
      name: 'Admin Office',
      role: 'Fee Collection',
      lastMessage: 'Your semester fee receipt has been generated successfully.',
      time: 'Oct 21',
      unread: 0,
      color: 'bg-green-100',
      textColor: 'text-green-700'
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white shadow-sm z-10 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-extrabold text-gray-900">Updates</Text>
          <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
            <Feather name="search" size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Custom Segmented Control */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl">
          <TouchableOpacity
            onPress={() => setActiveTab('Notices')}
            className={`flex-1 py-2.5 items-center rounded-lg ${
              activeTab === 'Notices' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`text-sm font-bold ${activeTab === 'Notices' ? 'text-primary-600' : 'text-gray-500'}`}>
              Notices
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Messages')}
            className={`flex-1 py-2.5 items-center rounded-lg ${
              activeTab === 'Messages' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Text className={`text-sm font-bold ${activeTab === 'Messages' ? 'text-primary-600' : 'text-gray-500'}`}>
                Messages
              </Text>
              <View className="w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[10px] text-white font-bold">2</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {activeTab === 'Notices' && notices.map((notice) => (
          <View key={notice.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-row items-center gap-2 flex-1 pr-4">
                {notice.isImportant && (
                  <View className="px-2 py-1 bg-red-50 rounded-md">
                    <Text className="text-[10px] font-bold text-red-600 uppercase">Important</Text>
                  </View>
                )}
                <Text className="text-xs font-semibold text-gray-500">{notice.sender}</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-400">{notice.date}</Text>
            </View>
            
            <Text className="text-lg font-bold text-gray-900 mb-2 leading-snug">{notice.title}</Text>
            <Text className="text-sm text-gray-600 mb-4 leading-relaxed">{notice.description}</Text>
            
            {notice.hasAttachment && (
              <TouchableOpacity className="flex-row items-center gap-2 bg-gray-50 py-3 px-4 rounded-xl border border-gray-200 self-start">
                <Feather name="paperclip" size={16} color="#4b5563" />
                <Text className="text-sm font-semibold text-gray-700">View Attachment</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {activeTab === 'Messages' && messages.map((msg) => (
          <TouchableOpacity key={msg.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-3 flex-row items-center gap-4">
            {/* Avatar Placeholder */}
            <View className={`w-14 h-14 ${msg.color} rounded-2xl items-center justify-center`}>
              <Text className={`text-xl font-bold ${msg.textColor}`}>{msg.name.charAt(0)}</Text>
            </View>
            
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-bold text-gray-900">{msg.name}</Text>
                <Text className={`text-xs font-semibold ${msg.unread > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                  {msg.time}
                </Text>
              </View>
              <Text className="text-xs font-medium text-gray-500 mb-1">{msg.role}</Text>
              <Text 
                className={`text-sm ${msg.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'} line-clamp-1`}
                numberOfLines={1}
              >
                {msg.lastMessage}
              </Text>
            </View>

            {msg.unread > 0 && (
              <View className="w-6 h-6 bg-primary-600 rounded-full items-center justify-center">
                <Text className="text-xs text-white font-bold">{msg.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Floating Action Button for Messages */}
      {activeTab === 'Messages' && (
        <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg shadow-primary-600/30">
          <Feather name="edit-2" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
