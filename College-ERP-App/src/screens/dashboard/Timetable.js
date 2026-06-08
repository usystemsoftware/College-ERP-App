import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CELL_WIDTH = 140;
const CELL_HEIGHT = 100;
const TIME_COL_WIDTH = 80;

export default function Timetable() {
  const navigation = useNavigation();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

  // Map of classes. Key: 'Day-TimeIndex'
  const classesMap = {
    'Monday-0': { subject: 'Computer Networks', type: 'Lecture', room: '302', prof: 'Dr. Smith', color: 'bg-primary-500' },
    'Monday-1': { subject: 'Computer Networks', type: 'Lecture', room: '302', prof: 'Dr. Smith', color: 'bg-primary-500' },
    'Monday-2': { subject: 'Database Systems', type: 'Lab', room: 'Lab 4', prof: 'Prof. Johnson', color: 'bg-purple-500' },
    'Tuesday-0': { subject: 'Operating Systems', type: 'Lecture', room: '105', prof: 'Dr. Davis', color: 'bg-orange-500' },
    'Wednesday-3': { subject: 'Software Eng', type: 'Lecture', room: '201', prof: 'Dr. Williams', color: 'bg-pink-500' },
    'Thursday-4': { subject: 'Web Dev', type: 'Lab', room: 'Lab 2', prof: 'Dr. Miller', color: 'bg-teal-500' },
    'Friday-1': { subject: 'Machine Learning', type: 'Lecture', room: '401', prof: 'Dr. Brown', color: 'bg-red-500' },
  };

  const handleEdit = (subject) => {
    Alert.alert("Edit Class", `Editing ${subject}`);
  };

  const handleAdd = (day, time) => {
    Alert.alert("Add Class", `Adding new class on ${day} at ${time}`);
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Admin Header */}
      <View className="pt-16 pb-4 px-6 bg-primary-900 shadow-lg z-20 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-white tracking-tight">Master Timetable</Text>
            <Text className="text-xs text-primary-200 font-bold">Admin View - B.Tech CS</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white px-4 py-2 rounded-xl shadow-sm flex-row items-center gap-2">
          <Feather name="save" size={16} color="#2563eb" />
          <Text className="text-primary-600 font-bold text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Warning Banner */}
      <View className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex-row items-center gap-3 z-10">
        <Feather name="info" size={18} color="#d97706" />
        <Text className="text-amber-800 text-xs font-semibold flex-1">
          Tap a cell to add a class, or use the edit icons to modify existing ones.
        </Text>
      </View>

      {/* 2D Table Scroll Area */}
      <View className="flex-1 bg-white">
        <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={true}>
          <View>
            
            {/* Header Row (Days) */}
            <View className="flex-row border-b border-gray-200 bg-gray-50 z-10">
              {/* Top-Left Empty Corner */}
              <View 
                className="border-r border-gray-200 items-center justify-center bg-gray-100" 
                style={{ width: TIME_COL_WIDTH, height: 50 }}
              >
                <Feather name="calendar" size={18} color="#6b7280" />
              </View>
              
              {/* Day Headers */}
              {days.map((day) => (
                <View 
                  key={day} 
                  className="border-r border-gray-200 items-center justify-center bg-gray-50" 
                  style={{ width: CELL_WIDTH, height: 50 }}
                >
                  <Text className="font-bold text-gray-800 text-sm tracking-wide">{day}</Text>
                </View>
              ))}
            </View>

            {/* Table Body (Vertical Scroll) */}
            <ScrollView bounces={false} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 100 }}>
              {times.map((time, timeIndex) => (
                <View key={time} className="flex-row border-b border-gray-100">
                  
                  {/* Sticky Time Column */}
                  <View 
                    className="border-r border-gray-200 bg-gray-50 items-center justify-center" 
                    style={{ width: TIME_COL_WIDTH, height: CELL_HEIGHT }}
                  >
                    <Text className="text-xs font-bold text-gray-600 text-center px-1">{time}</Text>
                  </View>

                  {/* Data Cells */}
                  {days.map((day) => {
                    const cellKey = `${day}-${timeIndex}`;
                    const cls = classesMap[cellKey];

                    return (
                      <TouchableOpacity 
                        key={cellKey}
                        activeOpacity={0.7}
                        onPress={() => cls ? null : handleAdd(day, time)}
                        className="border-r border-gray-100 p-1 bg-white"
                        style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
                      >
                        {cls ? (
                          /* Class Block */
                          <TouchableOpacity 
                            onPress={() => handleEdit(cls.subject)}
                            className={`flex-1 rounded-xl p-2 shadow-sm ${cls.color} justify-between`}
                          >
                            <View className="flex-row justify-between items-start">
                              <Text className="text-[9px] font-bold text-white/80 uppercase bg-black/10 px-1.5 py-0.5 rounded">{cls.type}</Text>
                              <Feather name="edit-2" size={12} color="white" className="opacity-80" />
                            </View>
                            
                            <View>
                              <Text className="text-white font-extrabold text-xs leading-tight mb-0.5" numberOfLines={2}>
                                {cls.subject}
                              </Text>
                              <View className="flex-row items-center gap-1">
                                <Feather name="map-pin" size={8} color="white" className="opacity-80" />
                                <Text className="text-white/90 text-[10px] font-bold">{cls.room}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ) : (
                          /* Empty Slot */
                          <View className="flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 group">
                            <Feather name="plus" size={16} color="#d1d5db" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                </View>
              ))}
            </ScrollView>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}
