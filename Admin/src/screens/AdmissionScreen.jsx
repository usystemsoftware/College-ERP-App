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
  Search, Filter, ChevronRight, X, User as UserIcon, FileText, CheckCircle, Clock, XCircle, AlertCircle
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
  amberDim: '#FEF3C7',
  blue: '#3B82F6',
  blueDim: '#EFF6FF',
  green: '#10B981',
  greenDim: '#ECFDF5',
  red: '#EF4444',
  redDim: '#FEF2F2',
  violet: '#8B5CF6',
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
};

const STATUS_FILTERS = ['All Statuses', 'Pending', 'Reviewed', 'Approved', 'Rejected'];

// ─── Status Helper ───────────────────────────────────────────────────────────
function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case 'approved': return { color: C.green, bg: C.greenDim, icon: CheckCircle };
    case 'rejected': return { color: C.red, bg: C.redDim, icon: XCircle };
    case 'reviewed': return { color: C.blue, bg: C.blueDim, icon: AlertCircle };
    default:         return { color: C.amber, bg: C.amberDim, icon: Clock }; // Pending
  }
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdmissionScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [allottedBatchId, setAllottedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${userToken}` };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const params = {};
      if (activeFilter !== 'All Statuses') {
        params.status = activeFilter;
      }

      const res = await axios.get(`${BASE_URL}/api/admission/applications`, { headers, params });
      if (res.data?.success) {
        setApplications(res.data.data.applications || []);
      }
    } catch (err) {
      console.log('Error fetching applications:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken, activeFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ─── Review Action ───────────────────────────────────────────────────────────
  const openReviewModal = (app) => {
    setSelectedApp(app);
    setReviewStatus(app.status || 'Pending');
    setReviewNotes('');
    setAllottedBatchId('');
  };

  const submitReview = async () => {
    if (reviewStatus === 'Approved' && !allottedBatchId.trim()) {
      Alert.alert('Validation Error', 'Allotted Batch ID is required when approving an application.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: reviewStatus,
        reviewNotes,
      };
      if (reviewStatus === 'Approved') {
        payload.allottedBatchId = allottedBatchId;
      }

      const res = await axios.put(`${BASE_URL}/api/admission/applications/${selectedApp._id}/review`, payload, { headers });
      if (res.data?.success) {
        Alert.alert('Success', 'Application reviewed successfully.');
        setSelectedApp(null);
        fetchApplications(true); // refresh list
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const sConf = getStatusConfig(item.status);
    const StatusIcon = sConf.icon;

    // Search filter logic applied on frontend for quick searching
    if (searchQuery && !item.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) 
        && !item.applicationId?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    const applicantName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown Applicant';
    const appDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardAppId}>{item.applicationId || item._id?.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.cardDate}>{appDate}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.avatarWrap}>
            <UserIcon size={20} color={C.blue} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.applicantName}>{applicantName}</Text>
            <Text style={styles.courseName}>{item.courseId?.name || 'MCA'}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: sConf.bg, borderColor: sConf.color + '44' }]}>
            <StatusIcon size={12} color={sConf.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: sConf.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.reviewBtn} onPress={() => openReviewModal(item)}>
            <Text style={styles.reviewBtnText}>Review Application</Text>
            <ChevronRight size={16} color={C.violet} />
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
        <Text style={styles.headerTitle}>Admission Review</Text>
        <Text style={styles.headerSub}>Verify applications and allot seats</Text>
      </View>

      {/* ─── Search & Filters ─── */}
      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <Search size={18} color={C.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Applicant..."
            placeholderTextColor={C.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterWrap}>
          <Filter size={18} color={C.textDim} />
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={item => item}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabChip, activeFilter === item && styles.tabChipActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.tabChipText, activeFilter === item && styles.tabChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ─── List ─── */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.violet} />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchApplications(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={48} color={C.border} />
              <Text style={styles.emptyText}>No applications found.</Text>
            </View>
          }
        />
      )}

      {/* ─── Review Modal ─── */}
      <Modal visible={!!selectedApp} animationType="slide" transparent={true} onRequestClose={() => setSelectedApp(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Application</Text>
              <TouchableOpacity onPress={() => setSelectedApp(null)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            {selectedApp && (
              <View style={styles.modalBody}>
                <Text style={styles.modalApplicantName}>
                  {selectedApp.firstName} {selectedApp.lastName}
                </Text>
                <Text style={styles.modalDetailText}>App ID: {selectedApp.applicationId || selectedApp._id?.substring(0, 8).toUpperCase()}</Text>
                
                <Text style={styles.inputLabel}>Update Status</Text>
                <View style={styles.statusSelectRow}>
                  {['Pending', 'Reviewed', 'Approved', 'Rejected'].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusOpt, reviewStatus === s && { borderColor: getStatusConfig(s).color, backgroundColor: getStatusConfig(s).bg }]}
                      onPress={() => setReviewStatus(s)}
                    >
                      <Text style={[styles.statusOptText, reviewStatus === s && { color: getStatusConfig(s).color, fontWeight: '700' }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {reviewStatus === 'Approved' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Allotted Batch ID <Text style={{ color: C.red }}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. BATCH-2026-MCA"
                      value={allottedBatchId}
                      onChangeText={setAllottedBatchId}
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Review Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Enter notes (optional)"
                    multiline
                    numberOfLines={3}
                    value={reviewNotes}
                    onChangeText={setReviewNotes}
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Decision</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.textMid, marginTop: 4 },
  
  toolbar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 10 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: C.text },
  filterWrap: {
    width: 44, height: 44, backgroundColor: C.surface, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },

  tabChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  tabChipActive: { backgroundColor: C.violet, borderColor: C.violet },
  tabChipText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  tabChipTextActive: { color: '#fff' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  
  card: {
    backgroundColor: C.surface, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: C.surfaceAlt,
  },
  cardAppId: { fontSize: 12, fontWeight: '700', color: C.violet, letterSpacing: 1 },
  cardDate: { fontSize: 12, color: C.textDim, fontWeight: '500' },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.blueDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  applicantName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  courseName: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  cardFooter: {
    borderTopWidth: 1, borderTopColor: C.border,
  },
  reviewBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surfaceAlt + '55',
  },
  reviewBtnText: { fontSize: 13, fontWeight: '600', color: C.violet },

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
  modalApplicantName: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 4 },
  modalDetailText: { fontSize: 14, color: C.textMid, marginBottom: 24 },
  
  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textMid, marginBottom: 8 },
  statusSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statusOpt: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt,
  },
  statusOptText: { fontSize: 13, fontWeight: '600', color: C.textMid },
  
  inputGroup: { marginBottom: 20 },
  textInput: {
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: C.text,
  },
  textArea: { height: 80, paddingTop: 14, textAlignVertical: 'top' },
  
  submitBtn: {
    backgroundColor: C.violet, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
