import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Search, Plus, X, Users as UsersIcon, Edit2, Trash2, Mail, Phone, BookOpen, GraduationCap, MapPin, Calendar, Fingerprint
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/student.api';
const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  amber: '#F59E0B',
  amberDim: '#FEF3C7',
  blue: '#3B82F6',
  blueDim: '#EFF6FF',
  green: '#10B981',
  greenDim: '#ECFDF5',
  red: '#EF4444',
  redDim: '#FEF2F2',
  violet: '#8B5CF6',
  violetDim: '#F5F3FF',
  indigo: '#6366F1',
  indigoDim: '#EEF2FF',
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
};

// ─── Animated List Item ──────────────────────────────────────────────────────
const AnimatedStudentCard = ({ item, index, onEdit, onDelete }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: Math.min(index * 60, 300),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 60, 300),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const firstChar = item.personalDetails?.fullName ? item.personalDetails.fullName.charAt(0).toUpperCase() : 'S';
  const name = item.personalDetails?.fullName || 'Unknown Student';
  const email = item.user?.email || 'No email linked';

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitial}>{firstChar}</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
            <Text style={styles.cardSubtitle}>{email}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
              <Edit2 size={16} color={C.blue} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.redDim }]} onPress={() => onDelete(item)}>
              <Trash2 size={16} color={C.red} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Enrollment No.</Text>
              <Text style={styles.infoValue}>{item.enrollmentNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Roll No.</Text>
              <Text style={styles.infoValue}>{item.rollNumber || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.badgeRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.department?.code || item.department?.name || (typeof item.department === 'string' ? item.department : 'Dept')}</Text>
            </View>
            <View style={[styles.tagBadge, { backgroundColor: C.indigoDim, borderColor: C.indigo + '30' }]}>
              <Text style={[styles.tagText, { color: C.indigo }]}>Sem {item.semester?.name || (typeof item.semester === 'string' ? item.semester : '-')}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
            <Phone size={14} color={C.textMid} style={{ marginRight: 6 }} />
            <Text style={styles.contactBtnText}>{item.personalDetails?.contactNumber || 'No Phone'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function StudentScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  // Form State
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formEnrollment, setFormEnrollment] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formSemester, setFormSemester] = useState('');
  const [formDivision, setFormDivision] = useState('');
  const [formBatch, setFormBatch] = useState('');
  
  const [formFullName, setFormFullName] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;

  const headers = { Authorization: `Bearer ${userToken}` };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getStudents();
      if (res.data?.success) {
        setStudents(res.data.data.students || []);
      }
    } catch (err) {
      console.log('Error fetching students:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── Modal & Form Actions ────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedStudentId(null);
    setFormEmail(''); setFormPassword('');
    setFormRollNumber(''); setFormEnrollment('');
    setFormDepartment(''); setFormCourse(''); setFormSemester(''); setFormDivision(''); setFormBatch('');
    setFormFullName(''); setFormDob(''); setFormGender('Male'); setFormPhone(''); setFormAddress('');
    setModalVisible(true);
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setSelectedStudentId(student._id);
    
    setFormEmail(student.user?.email || '');
    setFormPassword(''); // leave blank for editing unless updating
    
    setFormRollNumber(student.rollNumber || '');
    setFormEnrollment(student.enrollmentNumber || '');
    setFormDepartment(student.department?._id || (typeof student.department === 'string' ? student.department : ''));
    setFormCourse(student.course?._id || (typeof student.course === 'string' ? student.course : ''));
    setFormSemester(student.semester?._id || (typeof student.semester === 'string' ? student.semester : ''));
    setFormDivision(student.division || '');
    setFormBatch(student.batch || '');
    
    setFormFullName(student.personalDetails?.fullName || '');
    setFormDob(student.personalDetails?.dateOfBirth ? new Date(student.personalDetails.dateOfBirth).toISOString().split('T')[0] : '');
    setFormGender(student.personalDetails?.gender || 'Male');
    setFormPhone(student.personalDetails?.contactNumber || '');
    setFormAddress(student.personalDetails?.address || '');
    
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formEmail.trim() || !formFullName.trim() || !formRollNumber.trim()) {
      Alert.alert('Validation', 'Email, Full Name, and Roll Number are required.');
      return;
    }
    if (!isEditing && !formPassword.trim()) {
      Alert.alert('Validation', 'Password is required for new students.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email: formEmail,
        rollNumber: formRollNumber,
        enrollmentNumber: formEnrollment,
        department: formDepartment,
        course: formCourse,
        semester: formSemester,
        division: formDivision,
        batch: formBatch,
        personalDetails: {
          fullName: formFullName,
          dateOfBirth: formDob,
          gender: formGender,
          contactNumber: formPhone,
          address: formAddress,
        }
      };
      if (formPassword.trim()) payload.password = formPassword;

      if (isEditing) {
        await updateStudent(selectedStudentId, payload);
        Alert.alert('Success', 'Student updated successfully.');
      } else {
        await createStudent(payload);
        Alert.alert('Success', 'Student created successfully.');
      }

      setModalVisible(false);
      fetchStudents(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.personalDetails?.fullName || 'this student'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student._id);
              Alert.alert('Success', 'Student deleted successfully.');
              fetchStudents(true);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete student.');
            }
          }
        }
      ]
    );
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const sName = item.personalDetails?.fullName || '';
    const sRoll = item.rollNumber || '';
    const sEnroll = item.enrollmentNumber || '';
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!sName.toLowerCase().includes(q) && !sRoll.toLowerCase().includes(q) && !sEnroll.toLowerCase().includes(q)) {
        return null;
      }
    }

    return <AnimatedStudentCard item={item} index={index} onEdit={openEditModal} onDelete={handleDelete} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ─── Hero Section ─── */}
      <Animated.View style={[styles.heroSection, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.heroEyebrow}>Directory</Text>
            <Text style={styles.heroTitle}>Students</Text>
          </View>
          <TouchableOpacity style={styles.addBtnHeader} onPress={openAddModal} activeOpacity={0.8}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ─── Search ─── */}
        <View style={styles.toolbar}>
          <View style={styles.searchBar}>
            <Search size={18} color={C.textDim} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, roll no, enrollment..."
              placeholderTextColor={C.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </Animated.View>

      {/* ─── List ─── */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.violet} />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchStudents(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UsersIcon size={48} color={C.border} />
              <Text style={styles.emptyText}>No students found.</Text>
            </View>
          }
        />
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Student' : 'New Student'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.sectionTitle}>User Credentials</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="student@example.com"
                    placeholderTextColor={C.textDim}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={formEmail}
                    onChangeText={setFormEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password {isEditing ? '(Optional)' : <Text style={{ color: C.red }}>*</Text>}</Text>
                <View style={styles.inputWrapper}>
                  <Fingerprint size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder={isEditing ? 'Leave blank to keep current' : 'Enter a strong password'}
                    placeholderTextColor={C.textDim}
                    secureTextEntry
                    value={formPassword}
                    onChangeText={setFormPassword}
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Academic Details</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Roll Number <Text style={{ color: C.red }}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <TextInput style={styles.textInputInner} placeholder="101" placeholderTextColor={C.textDim} value={formRollNumber} onChangeText={setFormRollNumber} />
                  </View>
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Enrollment No.</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput style={styles.textInputInner} placeholder="EN2024" placeholderTextColor={C.textDim} value={formEnrollment} onChangeText={setFormEnrollment} />
                  </View>
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Semester</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput style={styles.textInputInner} placeholder="1" placeholderTextColor={C.textDim} keyboardType="numeric" value={formSemester} onChangeText={setFormSemester} />
                  </View>
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Division</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput style={styles.textInputInner} placeholder="A" placeholderTextColor={C.textDim} value={formDivision} onChangeText={setFormDivision} />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department ID</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInputInner} placeholder="Enter Dept ID" placeholderTextColor={C.textDim} value={formDepartment} onChangeText={setFormDepartment} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course ID</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInputInner} placeholder="Enter Course ID" placeholderTextColor={C.textDim} value={formCourse} onChangeText={setFormCourse} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Batch</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInputInner} placeholder="e.g. 2024-2028" placeholderTextColor={C.textDim} value={formBatch} onChangeText={setFormBatch} />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Personal Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInputInner} placeholder="Jane Doe" placeholderTextColor={C.textDim} value={formFullName} onChangeText={setFormFullName} />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Date of Birth</Text>
                  <View style={styles.inputWrapper}>
                    <Calendar size={16} color={C.textDim} style={{ marginRight: 8 }} />
                    <TextInput style={styles.textInputInner} placeholder="YYYY-MM-DD" placeholderTextColor={C.textDim} value={formDob} onChangeText={setFormDob} />
                  </View>
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput style={styles.textInputInner} placeholder="Male/Female" placeholderTextColor={C.textDim} value={formGender} onChangeText={setFormGender} />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput style={styles.textInputInner} placeholder="+1 234 567 890" placeholderTextColor={C.textDim} keyboardType="phone-pad" value={formPhone} onChangeText={setFormPhone} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <View style={[styles.inputWrapper, { height: 'auto' }]}>
                  <MapPin size={16} color={C.textDim} style={{ marginRight: 10, marginTop: 14, alignSelf: 'flex-start' }} />
                  <TextInput
                    style={[styles.textInputInner, { minHeight: 80, paddingTop: 14, paddingBottom: 14, textAlignVertical: 'top' }]}
                    placeholder="Full residential address"
                    placeholderTextColor={C.textDim}
                    multiline
                    value={formAddress}
                    onChangeText={setFormAddress}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Update Student' : 'Create Student'}</Text>}
              </TouchableOpacity>
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  
  // ── Hero Section ──
  heroSection: {
    backgroundColor: C.surface,
    paddingTop: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 10, fontWeight: '700', color: C.textDim,
    textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 2,
  },
  heroTitle: {
    fontSize: 30, fontWeight: '900', color: C.text, letterSpacing: -1,
  },
  addBtnHeader: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.violet, justifyContent: 'center', alignItems: 'center',
    shadowColor: C.violet, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  // ── Search ──
  toolbar: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderRadius: 16, paddingHorizontal: 14, height: 50,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: C.text, fontWeight: '500' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // ── Cards ──
  card: {
    backgroundColor: C.surface, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.surfaceAlt,
  },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.violet,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#fff' },
  cardTitleWrap: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, fontWeight: '500', color: C.textMid },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.blueDim,
    justifyContent: 'center', alignItems: 'center',
  },

  cardBody: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.text },
  
  badgeRow: { flexDirection: 'row', gap: 8 },
  tagBadge: {
    backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: C.textMid, letterSpacing: 0.3 },
  
  cardFooter: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surfaceAlt + '40', borderTopWidth: 1, borderTopColor: C.border,
  },
  contactBtn: { flexDirection: 'row', alignItems: 'center' },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: C.textMid },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { marginTop: 16, color: C.textDim, fontSize: 15, fontWeight: '600' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '92%'
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 14,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center',
  },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 10, marginBottom: 16 },
  
  inputGroup: { marginBottom: 16 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  textInputInner: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },

  submitBtn: {
    backgroundColor: C.violet, height: 54, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 30,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
