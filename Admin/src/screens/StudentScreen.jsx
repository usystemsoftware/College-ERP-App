import React, { useState, useEffect, useContext, useCallback } from 'react';
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
} from 'react-native';
import axios from 'axios';
import {
  Search, Plus, X, Users as UsersIcon, Edit2, Trash2, Mail, Phone, BookOpen
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'http://192.168.1.21:5050';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  amber: '#F59E0B',
  blue: '#3B82F6',
  blueDim: '#EFF6FF',
  red: '#EF4444',
  redDim: '#FEF2F2',
  violet: '#8B5CF6',
  violetDim: '#F5F3FF',
  green: '#10B981',
  greenDim: '#ECFDF5',
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
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

  const headers = { Authorization: `Bearer ${userToken}` };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/api/students`, { headers });
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
    
    // Reset fields
    setFormEmail(''); setFormPassword('');
    setFormRollNumber(''); setFormEnrollment('');
    setFormDepartment(''); setFormCourse(''); setFormSemester('');
    setFormDivision('A'); setFormBatch('2024-2028');
    setFormFullName(''); setFormDob(''); setFormGender('Male');
    setFormPhone(''); setFormAddress('');
    
    setModalVisible(true);
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setSelectedStudentId(student._id);
    
    setFormEmail(student.user?.email || '');
    setFormPassword(''); // Don't prefill password
    setFormRollNumber(student.rollNumber || '');
    setFormEnrollment(student.enrollmentNumber || '');
    setFormDepartment(student.department?._id || '');
    setFormCourse(student.course?._id || '');
    setFormSemester(student.semester?._id || '');
    setFormDivision(student.division || 'A');
    setFormBatch(student.batch || '');
    
    setFormFullName(student.personalDetails?.fullName || '');
    setFormDob(student.personalDetails?.dob ? new Date(student.personalDetails.dob).toISOString().split('T')[0] : '');
    setFormGender(student.personalDetails?.gender || 'Male');
    setFormPhone(student.personalDetails?.phone || '');
    setFormAddress(student.personalDetails?.address || '');

    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formEmail.trim() || !formFullName.trim() || !formEnrollment.trim()) {
      Alert.alert('Validation Error', 'Email, Full Name, and Enrollment are required.');
      return;
    }
    if (!isEditing && !formPassword.trim()) {
      Alert.alert('Validation Error', 'Password is required for new students.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        rollNumber: formRollNumber,
        enrollmentNumber: formEnrollment,
        department: formDepartment,
        course: formCourse,
        semester: formSemester,
        division: formDivision,
        batch: formBatch,
        personalDetails: {
          fullName: formFullName,
          dob: formDob,
          gender: formGender,
          phone: formPhone,
          address: formAddress
        }
      };
      
      if (!isEditing) {
        payload.email = formEmail;
        payload.password = formPassword;
      } else if (formPassword.trim()) {
        payload.password = formPassword; // If password changed
      }

      if (isEditing) {
        await axios.put(`${BASE_URL}/api/students/${selectedStudentId}`, payload, { headers });
        Alert.alert('Success', 'Student updated successfully.');
      } else {
        await axios.post(`${BASE_URL}/api/students`, payload, { headers });
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

  const confirmDelete = (id, name) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${name}? This will remove their login access as well.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/students/${id}`, { headers });
      setStudents(prev => prev.filter(s => s._id !== id));
      Alert.alert('Deleted', 'Student has been deleted.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete student.');
    }
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const fullName = item.personalDetails?.fullName || 'Unknown Student';
    const email = item.user?.email || 'No email';
    const courseName = item.course?.name || 'No Course';
    const semName = item.semester?.name || 'No Sem';
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!fullName.toLowerCase().includes(q) && !(item.enrollmentNumber || '').toLowerCase().includes(q)) {
        return null;
      }
    }

    const firstChar = fullName.charAt(0).toUpperCase();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstChar}</Text>
          </View>
          <View style={styles.cardTitleInfo}>
            <Text style={styles.cardTitle}>{fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Mail size={12} color={C.textDim} style={{ marginRight: 4 }} />
              <Text style={styles.cardSubtitle}>{email}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Enrollment ID</Text>
              <Text style={styles.infoValue}>{item.enrollmentNumber || '-'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Course & Sem</Text>
              <Text style={styles.infoValue}>{courseName}</Text>
              <Text style={[styles.infoValue, { fontSize: 11, color: C.textMid, fontWeight: '400' }]}>{semName}</Text>
            </View>
            <View style={styles.infoBlockRight}>
              <Text style={styles.infoLabel}>Contact</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Phone size={11} color={C.textMid} style={{ marginRight: 4 }} />
                <Text style={styles.infoValue}>{item.personalDetails?.phone || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Edit2 size={15} color={C.blue} />
            <Text style={[styles.actionBtnText, { color: C.blue }]}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.actionDiv} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item._id, fullName)}>
            <Trash2 size={15} color={C.red} />
            <Text style={[styles.actionBtnText, { color: C.red }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Student Directory</Text>
          <Text style={styles.headerSub}>Manage all enrolled students</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Student</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={C.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor={C.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

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
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20), maxHeight: '92%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Student' : 'Add New Student'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              <Text style={styles.sectionHeader}>Account Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email <Text style={{ color: C.red }}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, isEditing && { backgroundColor: C.border }]}
                  placeholder="student@example.com"
                  value={formEmail}
                  onChangeText={setFormEmail}
                  editable={!isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password {isEditing ? '(Leave blank to keep)' : <Text style={{ color: C.red }}>*</Text>}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password123"
                  value={formPassword}
                  onChangeText={setFormPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Personal Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name <Text style={{ color: C.red }}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. John Doe"
                  value={formFullName}
                  onChangeText={setFormFullName}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                    {['Male', 'Female'].map(g => (
                      <TouchableOpacity 
                        key={g} 
                        style={[styles.genderBtn, formGender === g && styles.genderBtnActive]}
                        onPress={() => setFormGender(g)}
                      >
                        <Text style={[styles.genderBtnText, formGender === g && styles.genderBtnTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>DOB</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={formDob}
                    onChangeText={setFormDob}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9876543210"
                  value={formPhone}
                  onChangeText={setFormPhone}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Full address"
                  multiline
                  numberOfLines={2}
                  value={formAddress}
                  onChangeText={setFormAddress}
                />
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Academic Details</Text>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Enrollment No <Text style={{ color: C.red }}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="COL-2026-..."
                    value={formEnrollment}
                    onChangeText={setFormEnrollment}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Roll Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="R-102"
                    value={formRollNumber}
                    onChangeText={setFormRollNumber}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Department ID"
                  value={formDepartment}
                  onChangeText={setFormDepartment}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Course ID"
                  value={formCourse}
                  onChangeText={setFormCourse}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Semester ID</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Sem ID"
                    value={formSemester}
                    onChangeText={setFormSemester}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Batch</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 2024-2028"
                    value={formBatch}
                    onChangeText={setFormBatch}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Student'}</Text>}
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
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.textMid, marginTop: 4 },
  
  addBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.violet,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, 
    borderRadius: 12, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: C.text },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  
  card: {
    backgroundColor: C.surface, borderRadius: 16, marginBottom: 16,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.surfaceAlt,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E7FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  cardTitleInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  cardSubtitle: { fontSize: 12, color: C.textMid },
  statusBadge: {
    backgroundColor: C.greenDim, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    borderWidth: 1, borderColor: C.green + '44',
  },
  statusBadgeText: { color: C.green, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  cardBody: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBlock: { flex: 1 },
  infoBlockRight: { flex: 1, alignItems: 'flex-end' },
  infoLabel: { fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: C.text },
  
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, gap: 6, backgroundColor: C.surfaceAlt + '44',
  },
  actionDiv: { width: 1, backgroundColor: C.border },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: C.textDim, fontSize: 14, fontWeight: '500' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  closeBtn: { padding: 4 },
  
  sectionHeader: { fontSize: 14, fontWeight: '700', color: C.violet, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },

  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 8 },
  textInput: {
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: C.text,
  },
  textArea: { height: 60, paddingTop: 14, textAlignVertical: 'top' },
  
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  genderBtnActive: { backgroundColor: C.violetDim, borderColor: C.violet },
  genderBtnText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  genderBtnTextActive: { color: C.violet },
  
  submitBtn: {
    backgroundColor: C.violet, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
