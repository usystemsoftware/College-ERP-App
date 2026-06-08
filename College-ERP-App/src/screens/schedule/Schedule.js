import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState('Mon');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock schedule data
  const scheduleData = {
    Mon: [
      { id: 1, subject: 'Computer Networks', time: '09:00 AM - 10:30 AM', room: 'Room 302', professor: 'Dr. Smith', type: 'Lecture', color: 'bg-blue-50', iconColor: '#3b82f6' },
      { id: 2, subject: 'Database Systems', time: '10:45 AM - 12:15 PM', room: 'Lab 4', professor: 'Prof. Johnson', type: 'Lab', color: 'bg-green-50', iconColor: '#10b981' },
      { id: 3, subject: 'Software Engineering', time: '01:00 PM - 02:30 PM', room: 'Room 201', professor: 'Dr. Williams', type: 'Lecture', color: 'bg-purple-50', iconColor: '#8b5cf6' },
    ],
    Tue: [
      { id: 4, subject: 'Operating Systems', time: '09:30 AM - 11:00 AM', room: 'Room 105', professor: 'Prof. Davis', type: 'Lecture', color: 'bg-orange-50', iconColor: '#f97316' },
      { id: 5, subject: 'Web Development', time: '11:15 AM - 01:15 PM', room: 'Lab 2', professor: 'Dr. Miller', type: 'Lab', color: 'bg-pink-50', iconColor: '#ec4899' },
    ],
    Wed: [
      { id: 6, subject: 'Computer Networks', time: '09:00 AM - 10:30 AM', room: 'Room 302', professor: 'Dr. Smith', type: 'Lecture', color: 'bg-blue-50', iconColor: '#3b82f6' },
      { id: 7, subject: 'Database Systems', time: '11:00 AM - 12:30 PM', room: 'Room 305', professor: 'Prof. Johnson', type: 'Lecture', color: 'bg-green-50', iconColor: '#10b981' },
      { id: 8, subject: 'Machine Learning', time: '01:30 PM - 03:00 PM', room: 'Room 401', professor: 'Dr. Brown', type: 'Lecture', color: 'bg-red-50', iconColor: '#ef4444' },
    ],
    Thu: [
      { id: 9, subject: 'Software Engineering', time: '10:00 AM - 11:30 AM', room: 'Room 201', professor: 'Dr. Williams', type: 'Lecture', color: 'bg-purple-50', iconColor: '#8b5cf6' },
      { id: 10, subject: 'Operating Systems', time: '12:00 PM - 01:30 PM', room: 'Lab 1', professor: 'Prof. Davis', type: 'Lab', color: 'bg-orange-50', iconColor: '#f97316' },
    ],
    Fri: [
      { id: 11, subject: 'Web Development', time: '09:00 AM - 10:30 AM', room: 'Room 204', professor: 'Dr. Miller', type: 'Lecture', color: 'bg-pink-50', iconColor: '#ec4899' },
      { id: 12, subject: 'Machine Learning', time: '10:45 AM - 12:45 PM', room: 'Lab 3', professor: 'Dr. Brown', type: 'Lab', color: 'bg-red-50', iconColor: '#ef4444' },
    ],
    Sat: [
      { id: 13, subject: 'Project Mentoring', time: '10:00 AM - 01:00 PM', room: 'Innovation Hub', professor: 'All Faculty', type: 'Mentorship', color: 'bg-teal-50', iconColor: '#14b8a6' },
    ]
  };

  const currentClasses = scheduleData[selectedDay] || [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 pb-4 px-6 bg-white shadow-sm z-10">
        <Text className="text-2xl font-bold text-gray-900">Class Schedule</Text>
        <Text className="text-sm text-gray-500 mt-1">Manage your classes and timings</Text>
      </View>

      {/* Day Selector */}
      <View className="bg-white px-2 py-3 border-t border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`w-16 h-16 items-center justify-center rounded-2xl mr-3 ${
                  isSelected ? 'bg-primary-600 shadow-md' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {day}
                </Text>
                {isSelected && (
                  <View className="w-1.5 h-1.5 bg-white rounded-full mt-1" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Schedule List */}
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {currentClasses.length > 0 ? (
          currentClasses.map((item) => (
            <View key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="px-2 py-1 bg-gray-100 rounded-md">
                      <Text className="text-[10px] font-bold text-gray-600 uppercase">{item.type}</Text>
                    </View>
                  </View>
                  <Text className="text-lg font-bold text-gray-900 leading-tight">{item.subject}</Text>
                  <Text className="text-sm font-medium text-gray-500 mt-1">{item.professor}</Text>
                </View>
                <View className={`w-12 h-12 ${item.color} rounded-2xl items-center justify-center`}>
                  <Feather name={item.type === 'Lab' ? 'monitor' : 'book-open'} size={20} color={item.iconColor} />
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                <View className="flex-row items-center gap-2">
                  <Feather name="clock" size={16} color="#6b7280" />
                  <Text className="text-sm font-bold text-gray-700">{item.time}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather name="map-pin" size={16} color="#6b7280" />
                  <Text className="text-sm font-bold text-gray-700">{item.room}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Feather name="coffee" size={32} color="#9ca3af" />
            </View>
            <Text className="text-lg font-bold text-gray-900">No classes today!</Text>
            <Text className="text-sm text-gray-500 mt-1">Enjoy your free time.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
