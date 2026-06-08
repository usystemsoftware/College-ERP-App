import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

export default function ApprovalDashboard() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Pending');

  const tabs = ['Pending', 'Approved', 'Rejected'];

  const requests = [
    {
      id: 1,
      type: 'Student Leave',
      applicant: 'John Doe',
      department: 'B.Tech CS - 3rd Yr',
      date: 'Oct 24, 2026',
      description: 'Medical leave for 3 days due to viral fever. Medical certificate attached.',
      status: 'Pending',
      icon: 'thermometer',
      color: 'bg-orange-50',
      iconColor: '#f97316'
    },
    {
      id: 2,
      type: 'Event Proposal',
      applicant: 'Tech Club',
      department: 'Student Council',
      date: 'Oct 23, 2026',
      description: 'Requesting permission to use the main auditorium for the annual Hackathon.',
      status: 'Pending',
      icon: 'mic',
      color: 'bg-purple-50',
      iconColor: '#a855f7'
    },
    {
      id: 3,
      type: 'Budget Approval',
      applicant: 'Prof. Davis',
      department: 'Computer Science',
      date: 'Oct 22, 2026',
      description: 'New lab equipment procurement (5 servers).',
      status: 'Pending',
      icon: 'dollar-sign',
      color: 'bg-blue-50',
      iconColor: '#3b82f6'
    },
    {
      id: 4,
      type: 'Equipment Request',
      applicant: 'Jane Smith',
      department: 'Mechanical Dept',
      date: 'Oct 20, 2026',
      description: 'Requesting 3D Printer filament restock.',
      status: 'Approved',
      icon: 'box',
      color: 'bg-green-50',
      iconColor: '#10b981'
    }
  ];

  const filteredRequests = requests.filter(req => req.status === activeTab);

  return (
    <View className="bg-gray-50 flex-1">
      {/* Header */}
      <View className="pt-16 px-6 pb-4 bg-white shadow-sm z-10 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <Feather name="arrow-left" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-gray-900">Approvals</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
            <Feather name="filter" size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Custom Segmented Control */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl mt-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 items-center rounded-lg ${
                  isActive ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <View key={req.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row gap-3 flex-1">
                  <View className={`w-12 h-12 ${req.color} rounded-2xl items-center justify-center`}>
                    <Feather name={req.icon} size={22} color={req.iconColor} />
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold text-gray-900">{req.type}</Text>
                    <Text className="text-xs font-semibold text-gray-500 mt-0.5">{req.date}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                <View className="flex-row items-center gap-2 mb-1">
                  <Feather name="user" size={14} color="#6b7280" />
                  <Text className="text-sm font-bold text-gray-700">{req.applicant}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="briefcase" size={14} color="#6b7280" />
                  <Text className="text-xs font-medium text-gray-500">{req.department}</Text>
                </View>
              </View>

              <Text className="text-sm text-gray-600 leading-snug mb-5">{req.description}</Text>

              {activeTab === 'Pending' && (
                <View className="flex-row gap-3 border-t border-gray-100 pt-4">
                  <TouchableOpacity className="flex-1 bg-white py-3 rounded-xl items-center border border-gray-200 shadow-sm">
                    <Text className="text-gray-700 font-bold text-sm">Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-primary-600 py-3 rounded-xl items-center shadow-sm">
                    <Text className="text-white font-bold text-sm">Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Feather name="check-circle" size={32} color="#9ca3af" />
            </View>
            <Text className="text-lg font-bold text-gray-900">All caught up!</Text>
            <Text className="text-sm text-gray-500 mt-1">No {activeTab.toLowerCase()} requests right now.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
