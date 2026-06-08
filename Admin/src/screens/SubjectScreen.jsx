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
  Search, Plus, X, BookOpen, Edit2, Trash2, Tag, CheckCircle2, FlaskConical, Filter
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
export default function SubjectScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formSemester, setFormSemester] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formCredits, setFormCredits] = useState('');
  const [formType, setFormType] = useState('Theory');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${userToken}` };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchSubjects = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/api/subjects`, { headers });
      if (res.data?.success) {
        setSubjects(res.data.data || []);
      }
    } catch (err) {
      console.log('Error fetching subjects:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // ─── Modal & Form Actions ────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedSubjectId(null);
    setFormName('');
    setFormCode('');
    setFormCourse('');
    setFormSemester('');
    setFormDepartment('');
    setFormCredits('');
    setFormType('Theory');
    setModalVisible(true);
  };

  const openEditModal = (subject) => {
    setIsEditing(true);
    setSelectedSubjectId(subject._id);
    setFormName(subject.name);
    setFormCode(subject.code);
    setFormCourse(subject.course?._id || '');
    setFormSemester(subject.semester?._id || '');
    setFormDepartment(subject.department?._id || '');
    setFormCredits(subject.credits?.toString() || '');
    setFormType(subject.type || 'Theory');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formCode.trim()) {
      Alert.alert('Validation Error', 'Subject Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        code: formCode,
        type: formType,
      };
      
      if (formCourse.trim()) payload.course = formCourse;
      if (formSemester.trim()) payload.semester = formSemester;
      if (formDepartment.trim()) payload.department = formDepartment;
      if (formCredits.trim()) payload.credits = Number(formCredits);

      if (isEditing) {
        await axios.put(`${BASE_URL}/api/subjects/${selectedSubjectId}`, payload, { headers });
        Alert.alert('Success', 'Subject updated successfully.');
      } else {
        await axios.post(`${BASE_URL}/api/subjects`, payload, { headers });
        Alert.alert('Success', 'Subject created successfully.');
      }
      
      setModalVisible(false);
      fetchSubjects(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, name) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/subjects/${id}`, { headers });
      setSubjects(prev => prev.filter(s => s._id !== id));
      Alert.alert('Deleted', 'Subject has been deleted.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete subject.');
    }
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.name?.toLowerCase().includes(q) && !item.code?.toLowerCase().includes(q)) {
        return null;
      }
    }

    const isTheory = item.type !== 'Practical';
    const typeColor = isTheory ? C.blue : C.green;
    const typeBg = isTheory ? C.blueDim : C.greenDim;
    const TypeIcon = isTheory ? BookOpen : FlaskConical;

    const courseName = item.course?.name || 'No Course';
    const semName = item.semester?.name || 'No Sem';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.iconWrap}>
              <BookOpen size={20} color={C.violet} />
            </View>
            <View style={styles.cardTitleInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Code: <Text style={styles.cardCode}>{item.code}</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Course & Sem</Text>
              <Text style={styles.infoValue}>{courseName} • {semName}</Text>
            </View>
            <View style={styles.infoBlockRight}>
              <Text style={styles.infoLabel}>Credits</Text>
              <Text style={styles.infoValue}>{item.credits || '-'}</Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View style={[styles.typePill, { backgroundColor: typeBg, borderColor: typeColor + '44' }]}>
              <TypeIcon size={12} color={typeColor} style={{ marginRight: 4 }} />
              <Text style={[styles.typeText, { color: typeColor }]}>{item.type || 'Theory'}</Text>
            </View>
            {item.department?.name && (
              <View style={[styles.typePill, { backgroundColor: C.surfaceAlt, borderColor: C.border }]}>
                <Text style={[styles.typeText, { color: C.textMid }]}>{item.department.name}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Edit2 size={16} color={C.blue} />
            <Text style={[styles.actionBtnText, { color: C.blue }]}>Edit</Text>
          </TouchableOpacity>
          <View style={styles.actionDiv} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item._id, item.name)}>
            <Trash2 size={16} color={C.red} />
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
          <Text style={styles.headerTitle}>Subjects</Text>
          <Text style={styles.headerSub}>Manage subjects and syllabi</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Subject</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={C.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
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
          data={subjects}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchSubjects(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BookOpen size={48} color={C.border} />
              <Text style={styles.emptyText}>No subjects found.</Text>
            </View>
          }
        />
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20), maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Subject' : 'Add Subject'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject Name <Text style={{ color: C.red }}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Data Structures"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Code <Text style={{ color: C.red }}>*</Text></Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. CS001"
                    value={formCode}
                    onChangeText={setFormCode}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Credits</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 4"
                    value={formCredits}
                    onChangeText={setFormCredits}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Subject Type</Text>
              <View style={styles.typeSelector}>
                {['Theory', 'Practical'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, formType === type && styles.typeOptionActive]}
                    onPress={() => setFormType(type)}
                  >
                    {formType === type && <CheckCircle2 size={14} color={C.violet} style={{ marginRight: 6 }} />}
                    <Text style={[styles.typeOptionText, formType === type && styles.typeOptionTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionHint}>Mappings (Paste Object IDs below)</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Course ID here"
                  value={formCourse}
                  onChangeText={setFormCourse}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Semester ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Semester ID here"
                  value={formSemester}
                  onChangeText={setFormSemester}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Department ID here"
                  value={formDepartment}
                  onChangeText={setFormDepartment}
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Subject'}</Text>}
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
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.surfaceAlt,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.violetDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardTitleInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 2 },
  cardSubtitle: { fontSize: 13, color: C.textMid },
  cardCode: { fontWeight: '700', color: C.violet },
  
  cardBody: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  infoBlock: { flex: 1 },
  infoBlockRight: { alignItems: 'flex-end' },
  infoLabel: { fontSize: 11, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: C.text },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  typeText: { fontSize: 11, fontWeight: '700' },
  
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
  
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 8 },
  textInput: {
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: C.text,
  },
  
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeOption: {
    flex: 1, flexDirection: 'row', height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt,
    justifyContent: 'center', alignItems: 'center',
  },
  typeOptionActive: { backgroundColor: C.violetDim, borderColor: C.violet },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: C.textMid },
  typeOptionTextActive: { color: C.violet },
  
  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
  sectionHint: { fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  
  submitBtn: {
    backgroundColor: C.violet, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
