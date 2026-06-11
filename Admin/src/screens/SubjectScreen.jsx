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
} from 'react-native';
import {
  Search, Plus, X, BookOpen, Edit2, Trash2, Tag, Layers, FlaskConical, Filter, Type
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subject.api';

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
const AnimatedSubjectCard = ({ item, index, onEdit, onDelete }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: Math.min(index * 80, 400),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 80, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPractical = item.type?.toLowerCase() === 'practical';

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.card}>
        <View style={styles.cardAccent} />
        
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatarWrap, { backgroundColor: isPractical ? C.blueDim : C.violetDim }]}>
              {isPractical ? <FlaskConical size={20} color={C.blue} /> : <BookOpen size={20} color={C.violet} />}
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardCode}>{item.code}</Text>
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

          <View style={styles.tagsContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Semester {item.semester?.name || (typeof item.semester === 'string' ? item.semester : '')}</Text>
            </View>
            <View style={[styles.tagBadge, { backgroundColor: isPractical ? C.blueDim : C.violetDim, borderColor: isPractical ? C.blue + '30' : C.violet + '30' }]}>
              <Text style={[styles.tagText, { color: isPractical ? C.blue : C.violet }]}>{item.type}</Text>
            </View>
            <View style={[styles.tagBadge, { backgroundColor: C.amberDim, borderColor: C.amber + '30' }]}>
              <Text style={[styles.tagText, { color: C.amber }]}>{item.credits} Credits</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
             <Text style={styles.footerText}>Dept: <Text style={{ fontWeight: '700', color: C.text }}>{item.department?.name || (typeof item.department === 'string' ? item.department : 'N/A')}</Text></Text>
             <Text style={styles.footerText}>Course: <Text style={{ fontWeight: '700', color: C.text }}>{item.course?.name || (typeof item.course === 'string' ? item.course : 'N/A')}</Text></Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
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
  const fetchSubjects = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getSubjects();
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
    setFormCourse(subject.course?._id || (typeof subject.course === 'string' ? subject.course : ''));
    setFormSemester(subject.semester ? subject.semester.toString() : '');
    setFormDepartment(subject.department?._id || (typeof subject.department === 'string' ? subject.department : ''));
    setFormCredits(subject.credits ? subject.credits.toString() : '');
    setFormType(subject.type || 'Theory');
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formCode.trim() || !formSemester || !formCredits) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        code: formCode.toUpperCase(),
        course: formCourse,
        semester: Number(formSemester),
        department: formDepartment,
        credits: Number(formCredits),
        type: formType,
      };

      if (isEditing) {
        await updateSubject(selectedSubjectId, payload);
        Alert.alert('Success', 'Subject updated successfully.');
      } else {
        await createSubject(payload);
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

  const handleDelete = (subject) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete ${subject.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubject(subject._id);
              Alert.alert('Success', 'Subject deleted successfully.');
              fetchSubjects(true);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete subject.');
            }
          }
        }
      ]
    );
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    if (searchQuery && !item.name?.toLowerCase().includes(searchQuery.toLowerCase()) 
        && !item.code?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    return (
      <AnimatedSubjectCard 
        item={item} 
        index={index} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ─── Hero Section ─── */}
      <Animated.View style={[styles.heroSection, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.heroEyebrow}>Academics</Text>
            <Text style={styles.heroTitle}>Subjects</Text>
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
              placeholder="Search subjects..."
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
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Subject' : 'New Subject'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject Name <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <BookOpen size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="e.g. Data Structures"
                    placeholderTextColor={C.textDim}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Code <Text style={{ color: C.red }}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Tag size={16} color={C.textDim} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.textInputInner}
                      placeholder="CS201"
                      placeholderTextColor={C.textDim}
                      autoCapitalize="characters"
                      value={formCode}
                      onChangeText={setFormCode}
                    />
                  </View>
                </View>
                
                <View style={{ width: 12 }} />

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Credits <Text style={{ color: C.red }}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Layers size={16} color={C.textDim} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.textInputInner}
                      placeholder="e.g. 4"
                      placeholderTextColor={C.textDim}
                      keyboardType="numeric"
                      value={formCredits}
                      onChangeText={setFormCredits}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Semester <Text style={{ color: C.red }}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Filter size={16} color={C.textDim} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.textInputInner}
                      placeholder="1-8"
                      placeholderTextColor={C.textDim}
                      keyboardType="numeric"
                      value={formSemester}
                      onChangeText={setFormSemester}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject Type</Text>
                <View style={styles.typeSelector}>
                  {['Theory', 'Practical'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeBtn, formType === type && styles.typeBtnActive]}
                      onPress={() => setFormType(type)}
                      activeOpacity={0.8}
                    >
                      {type === 'Theory' ? <Type size={16} color={formType === type ? C.violet : C.textMid} style={{ marginRight: 6 }}/> : <FlaskConical size={16} color={formType === type ? C.violet : C.textMid} style={{ marginRight: 6 }}/>}
                      <Text style={[styles.typeBtnText, formType === type && styles.typeBtnTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Course & Department are just ObjectIds in backend schema usually, but for a real app we'd use a picker. For now, text input to match existing logic. */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course ID</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter Course ID"
                    placeholderTextColor={C.textDim}
                    value={formCourse}
                    onChangeText={setFormCourse}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department ID</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter Department ID"
                    placeholderTextColor={C.textDim}
                    value={formDepartment}
                    onChangeText={setFormDepartment}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Update Subject' : 'Create Subject'}</Text>}
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
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', flexDirection: 'row',
  },
  cardAccent: { width: 4, backgroundColor: C.violet },
  cardInner: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12,
  },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardTitleWrap: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 4 },
  cardCode: { fontSize: 13, fontWeight: '600', color: C.textMid },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.blueDim,
    justifyContent: 'center', alignItems: 'center',
  },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tagBadge: {
    backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: C.textMid, letterSpacing: 0.3 },
  
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: C.surfaceAlt, paddingTop: 12,
  },
  footerText: { fontSize: 12, color: C.textDim, fontWeight: '500' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { marginTop: 16, color: C.textDim, fontSize: 15, fontWeight: '600' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '90%'
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
  
  inputGroup: { marginBottom: 20 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  textInputInner: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt,
  },
  typeBtnActive: { borderColor: C.violet, backgroundColor: C.violetDim },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: C.textMid },
  typeBtnTextActive: { color: C.violet },

  submitBtn: {
    backgroundColor: C.violet, height: 54, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 30,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
