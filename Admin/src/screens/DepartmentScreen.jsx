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
} from 'react-native';
import axios from 'axios';
import {
  Search, Plus, X, Building, Edit2, Trash2, BookOpen
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
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function DepartmentScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formHod, setFormHod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${userToken}` };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/api/departments`, { headers });
      if (res.data?.success) {
        setDepartments(res.data.data || []);
      }
    } catch (err) {
      console.log('Error fetching departments:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ─── Modal & Form Actions ────────────────────────────────────────────────────
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedDeptId(null);
    setFormName('');
    setFormCode('');
    setFormHod('');
    setModalVisible(true);
  };

  const openEditModal = (dept) => {
    setIsEditing(true);
    setSelectedDeptId(dept._id);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormHod(dept.hod?._id || ''); // Store the ID or keep empty
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formCode.trim()) {
      Alert.alert('Validation Error', 'Department Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        code: formCode,
      };
      if (formHod.trim()) {
        payload.hod = formHod;
      }

      if (isEditing) {
        await axios.put(`${BASE_URL}/api/departments/${selectedDeptId}`, payload, { headers });
        Alert.alert('Success', 'Department updated successfully.');
      } else {
        await axios.post(`${BASE_URL}/api/departments`, payload, { headers });
        Alert.alert('Success', 'Department created successfully.');
      }
      
      setModalVisible(false);
      fetchDepartments(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, name) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/departments/${id}`, { headers });
      setDepartments(prev => prev.filter(d => d._id !== id));
      Alert.alert('Deleted', 'Department has been deleted.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete department.');
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

    const hodName = item.hod?.fullName || 'Not Assigned';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.iconWrap}>
              <Building size={20} color={C.violet} />
            </View>
            <View style={styles.cardTitleInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Code: <Text style={styles.cardCode}>{item.code}</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.hodLabel}>Head of Department</Text>
          <Text style={[styles.hodName, !item.hod && { color: C.textDim, fontStyle: 'italic' }]}>
            {hodName}
          </Text>
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
          <Text style={styles.headerTitle}>Academic Structure</Text>
          <Text style={styles.headerSub}>Manage departments and courses</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Dept</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Search ─── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={C.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search departments..."
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
          data={departments}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchDepartments(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Building size={48} color={C.border} />
              <Text style={styles.emptyText}>No departments found.</Text>
            </View>
          }
        />
      )}

      {/* ─── Add/Edit Modal ─── */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Department' : 'Add Department'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department Name <Text style={{ color: C.red }}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Computer Science and Engineering"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department Code <Text style={{ color: C.red }}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. CSE"
                  value={formCode}
                  onChangeText={setFormCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HOD User ID (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste Faculty User ID here"
                  value={formHod}
                  onChangeText={setFormHod}
                />
                <Text style={styles.inputHint}>Leave blank if not assigned yet.</Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create Department'}</Text>}
              </TouchableOpacity>
            </View>
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
  hodLabel: { fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  hodName: { fontSize: 14, fontWeight: '500', color: C.text },
  
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
  modalBody: {},
  
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 8 },
  textInput: {
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: C.text,
  },
  inputHint: { fontSize: 11, color: C.textDim, marginTop: 6 },
  
  submitBtn: {
    backgroundColor: C.violet, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
