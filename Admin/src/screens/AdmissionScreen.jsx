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
  Animated,
  ScrollView
} from 'react-native';
import {
  Search, Filter, ChevronRight, X, User as UserIcon, FileText, CheckCircle, Clock, XCircle, AlertCircle, Plus, Mail, Phone, BookOpen, Hash
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getAdmissions, reviewAdmission, applyAdmission } from '../api/admission.api';

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
    default: return { color: C.amber, bg: C.amberDim, icon: Clock }; // Pending
  }
}

// ─── Animated List Item ──────────────────────────────────────────────────────
const AnimatedApplicationCard = ({ item, index, onPress }) => {
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

  const sConf = getStatusConfig(item.status);
  const StatusIcon = sConf.icon;
  const applicantName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown Applicant';
  const appDate = new Date(item.createdAt).toLocaleDateString();
  const firstChar = applicantName.charAt(0).toUpperCase();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardAppId}>{item.applicationId || item._id?.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.cardDate}>{appDate}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={[styles.avatarWrap, { backgroundColor: C.violetDim }]}>
            <Text style={styles.avatarInitial}>{firstChar}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.applicantName}>{applicantName}</Text>
            <Text style={styles.courseName}>{item.courseId?.name || (typeof item.courseId === 'string' ? item.courseId : 'MCA')}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: sConf.bg, borderColor: sConf.color + '44' }]}>
            <StatusIcon size={12} color={sConf.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: sConf.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.reviewBtn} onPress={() => onPress(item)} activeOpacity={0.7}>
            <Text style={styles.reviewBtnText}>Review Application</Text>
            <ChevronRight size={16} color={C.violet} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdmissionScreen() {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [allottedBatchId, setAllottedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Admission Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCourseId, setFormCourseId] = useState('');

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

      const res = await getAdmissions(params);
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

      const res = await reviewAdmission(selectedApp._id, payload);
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

  // ─── Add Admission Action ────────────────────────────────────────────────────
  const openAddModal = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormCourseId('');
    setIsAddModalVisible(true);
  };

  const submitNewAdmission = async () => {
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || !formCourseId.trim()) {
      Alert.alert('Validation', 'Please fill all required fields (Name, Email, Course ID).');
      return;
    }

    setIsAdding(true);
    try {
      const payload = {
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        courseId: formCourseId,
        dateOfBirth: "2000-01-01", // Default placeholder for now
        gender: "Other", // Default placeholder
        address: "Pending Address",
        previousQualification: "High School"
      };

      const res = await applyAdmission(payload);
      if (res.data?.success) {
        Alert.alert('Success', 'Application created successfully.');
        setIsAddModalVisible(false);
        fetchApplications(true);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsAdding(false);
    }
  };

  // ─── Render List Item ────────────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    if (searchQuery && !item.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
      && !item.applicationId?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null;
    }

    return <AnimatedApplicationCard item={item} index={index} onPress={openReviewModal} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ─── Hero Section ─── */}
      <View style={[styles.heroSection, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroHeaderRow}>
          <View>
            <Text style={styles.heroEyebrow}>Enrollment</Text>
            <Text style={styles.heroTitle}>Admissions</Text>
          </View>
          <TouchableOpacity style={styles.addBtnHeader} onPress={openAddModal} activeOpacity={0.8}>
            <Plus size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ─── Search & Filters ─── */}
        <View style={styles.toolbar}>
          <View style={styles.searchBar}>
            <Search size={18} color={C.textDim} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Applicants..."
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
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Application</Text>
              <TouchableOpacity onPress={() => setSelectedApp(null)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            {selectedApp && (
              <View style={styles.modalBody}>
                <View style={styles.applicantInfoBlock}>
                  <Text style={styles.modalApplicantName}>
                    {selectedApp.firstName} {selectedApp.lastName}
                  </Text>
                  <Text style={styles.modalDetailText}>App ID: {selectedApp.applicationId || selectedApp._id?.substring(0, 8).toUpperCase()}</Text>
                </View>

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
                    <View style={styles.inputWrapper}>
                      <Hash size={16} color={C.textDim} style={{ marginRight: 10 }} />
                      <TextInput
                        style={styles.textInputInner}
                        placeholder="e.g. BATCH-2026-MCA"
                        placeholderTextColor={C.textDim}
                        value={allottedBatchId}
                        onChangeText={setAllottedBatchId}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Review Notes</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.textInputInner, styles.textArea]}
                      placeholder="Enter internal review notes..."
                      placeholderTextColor={C.textDim}
                      multiline
                      numberOfLines={3}
                      value={reviewNotes}
                      onChangeText={setReviewNotes}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Decision</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Add Admission Modal ─── */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20), maxHeight: '90%' }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Application</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter first name"
                    placeholderTextColor={C.textDim}
                    value={formFirstName}
                    onChangeText={setFormFirstName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter last name"
                    placeholderTextColor={C.textDim}
                    value={formLastName}
                    onChangeText={setFormLastName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <Mail size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="student@example.com"
                    placeholderTextColor={C.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formEmail}
                    onChangeText={setFormEmail}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter phone number"
                    placeholderTextColor={C.textDim}
                    keyboardType="phone-pad"
                    value={formPhone}
                    onChangeText={setFormPhone}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course ID <Text style={{ color: C.red }}>*</Text></Text>
                <View style={styles.inputWrapper}>
                  <BookOpen size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Enter associated Course ID"
                    placeholderTextColor={C.textDim}
                    value={formCourseId}
                    onChangeText={setFormCourseId}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={submitNewAdmission} disabled={isAdding}>
                {isAdding ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 16,
    shadowColor: C.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 24,
  },
  addBtnHeader: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: C.violet, justifyContent: 'center', alignItems: 'center',
    shadowColor: C.violet, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  heroEyebrow: {
    fontSize: 11, fontWeight: '700', color: C.textDim,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32, fontWeight: '900', color: C.text, letterSpacing: -1,
  },

  // ── Search & Filters ──
  toolbar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderRadius: 16, paddingHorizontal: 14, height: 50,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: C.text, fontWeight: '500' },
  filterWrap: {
    width: 50, height: 50, backgroundColor: C.surface, borderRadius: 16, marginLeft: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },

  tabsWrapper: { marginBottom: 4 },
  tabChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
  },
  tabChipActive: { backgroundColor: C.violet, borderColor: C.violet },
  tabChipText: { fontSize: 13, fontWeight: '700', color: C.textMid },
  tabChipTextActive: { color: '#fff' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // ── Cards ──
  card: {
    backgroundColor: C.surface, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: C.surfaceAlt,
  },
  cardAppId: { fontSize: 12, fontWeight: '800', color: C.textMid, letterSpacing: 0.5 },
  cardDate: { fontSize: 12, color: C.textDim, fontWeight: '600' },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarWrap: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: C.violetDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarInitial: { fontSize: 18, fontWeight: '800', color: C.violet },
  cardInfo: { flex: 1 },
  applicantName: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 3 },
  courseName: { fontSize: 13, color: C.textMid, fontWeight: '600' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  cardFooter: {
    borderTopWidth: 1, borderTopColor: C.surfaceAlt,
  },
  reviewBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14, backgroundColor: C.surfaceAlt + '40',
  },
  reviewBtnText: { fontSize: 13, fontWeight: '700', color: C.violet },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { marginTop: 16, color: C.textDim, fontSize: 15, fontWeight: '600' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 12,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center',
  },
  modalBody: {},
  applicantInfoBlock: {
    backgroundColor: C.surfaceAlt,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalApplicantName: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 4 },
  modalDetailText: { fontSize: 13, color: C.textMid, fontWeight: '500' },

  inputLabel: { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 10 },
  statusSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statusOpt: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.surfaceAlt,
  },
  statusOptText: { fontSize: 13, fontWeight: '600', color: C.textMid },

  inputGroup: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, minHeight: 52,
  },
  textInputInner: { flex: 1, fontSize: 15, color: C.text, fontWeight: '500' },
  textArea: { minHeight: 80, paddingTop: 14, paddingBottom: 14, textAlignVertical: 'top' },

  submitBtn: {
    backgroundColor: C.violet, height: 54, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 12,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
