import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  X, User, Mail, Shield, CheckCircle2, AlertCircle, LogOut, Camera,
  Edit3, Lock, ChevronRight, Settings, HelpCircle, Bell, FileText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getMyProfile, updateProfile } from '../api/profile.api';

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
  red: '#EF4444',
  redDim: '#FEF2F2',
  violet: '#8B5CF6',
  violetDim: '#F5F3FF',
  green: '#10B981',
  greenDim: '#ECFDF5',
  indigo: '#6366F1',
  indigoDim: '#EEF2FF',
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
};

// ─── Animated Info Card ──────────────────────────────────────────────────────
function InfoCard({ icon: Icon, iconColor, iconBg, label, value, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.infoCard, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.infoCardAccent, { backgroundColor: iconColor }]} />
      <View style={styles.infoCardInner}>
        <View style={[styles.infoCardIcon, { backgroundColor: iconBg }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <View style={styles.infoCardText}>
          <Text style={styles.infoCardLabel}>{label}</Text>
          <Text style={styles.infoCardValue} numberOfLines={1}>{value}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Menu Row ────────────────────────────────────────────────────────────────
function MenuRow({ icon: Icon, iconColor, iconBg, title, subtitle, onPress, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <TouchableOpacity style={styles.menuRow} activeOpacity={0.65} onPress={onPress}>
        <View style={[styles.menuRowIcon, { backgroundColor: iconBg }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
        <View style={styles.menuRowText}>
          <Text style={styles.menuRowTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuRowSub}>{subtitle}</Text>}
        </View>
        <ChevronRight size={16} color={C.textDim} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userToken, signOut } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [formProfileImage, setFormProfileImage] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-30)).current;
  const avatarScale = useRef(new Animated.Value(0.5)).current;

  const headers = { Authorization: `Bearer ${userToken}` };

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getMyProfile();
      if (res.data?.success) {
        setProfile(res.data.data.user);
      }
    } catch (err) {
      console.log('Error fetching profile:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  // ─── Modal Actions ───────────────────────────────────────────────────────────
  const openEditModal = () => {
    if (profile) {
      setFormProfileImage(profile.profileImage || '');
      setFormUsername(profile.username || '');
      setFormPassword('');
      setModalVisible(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      if (formUsername.trim() !== '') formData.append('username', formUsername);
      if (formPassword.trim() !== '') formData.append('password', formPassword);
      
      if (formProfileImage && formProfileImage.startsWith('file://')) {
        const filename = formProfileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('file', {
          uri: formProfileImage,
          name: filename || 'upload.jpg',
          type
        });
      } else if (formProfileImage) {
        formData.append('profileImage', formProfileImage);
      }

      const res = await updateProfile(profile.id, formData);
      
      if (res.data?.success) {
        Alert.alert('Success', 'Profile updated successfully.');
        setProfile(prev => ({ 
            ...prev, 
            profileImage: res.data.data.user?.profileImage || formProfileImage,
            username: formUsername
        }));
        setModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.violet} />
        <Text style={styles.loaderText}>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <User size={48} color={C.border} />
        <Text style={styles.loaderText}>Could not load profile.</Text>
      </View>
    );
  }

  const firstChar = (profile.username || profile.email || 'U').charAt(0).toUpperCase();
  const displayName = profile.username || 'Admin User';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ─── Hero Section ─── */}
        <Animated.View style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
          
          {/* ─── Header Row ─── */}
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.heroEyebrow}>My Account</Text>
              <Text style={styles.heroTitle}>Profile</Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={openEditModal}>
              <Settings size={18} color={C.textMid} />
            </TouchableOpacity>
          </View>

          {/* ─── Avatar Block ─── */}
          <View style={styles.avatarBlock}>
            <Animated.View style={[styles.avatarRingOuter, { transform: [{ scale: avatarScale }] }]}>
              <View style={styles.avatarRingInner}>
                {profile.profileImage ? (
                  <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{firstChar}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage} activeOpacity={0.8}>
                <Camera size={14} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.avatarInfo}>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.emailSmall}>{profile.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <Shield size={10} color={C.violet} style={{ marginRight: 4 }} />
                  <Text style={styles.roleBadgeText}>{profile.role}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: profile.status === 'Active' ? C.greenDim : C.redDim, borderColor: (profile.status === 'Active' ? C.green : C.red) + '44' }]}>
                  <View style={[styles.statusDot, { backgroundColor: profile.status === 'Active' ? C.green : C.red }]} />
                  <Text style={[styles.statusBadgeText, { color: profile.status === 'Active' ? C.green : C.red }]}>{profile.status}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ─── Quick Info Grid ─── */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.sectionPip} />
            <Text style={styles.sectionTitle}>Account Overview</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoCard icon={Mail} iconColor={C.blue} iconBg={C.blueDim} label="Email" value={profile.email} delay={0} />
          <InfoCard icon={User} iconColor={C.violet} iconBg={C.violetDim} label="Username" value={profile.username || 'Not set'} delay={80} />
          <InfoCard icon={Shield} iconColor={C.amber} iconBg={C.amberDim} label="Role" value={profile.role} delay={160} />
          <InfoCard icon={profile.status === 'Active' ? CheckCircle2 : AlertCircle} iconColor={profile.status === 'Active' ? C.green : C.red} iconBg={profile.status === 'Active' ? C.greenDim : C.redDim} label="Status" value={profile.status} delay={240} />
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={[styles.sectionPip, { backgroundColor: C.blue }]} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          <MenuRow icon={Edit3} iconColor={C.blue} iconBg={C.blueDim} title="Edit Profile" subtitle="Update your details & avatar" onPress={openEditModal} delay={0} />
          <View style={styles.menuDivider} />
          <MenuRow icon={Lock} iconColor={C.amber} iconBg={C.amberDim} title="Change Password" subtitle="Update your security credentials" onPress={openEditModal} delay={60} />
          <View style={styles.menuDivider} />
          <MenuRow icon={Bell} iconColor={C.indigo} iconBg={C.indigoDim} title="Notifications" subtitle="Manage alert preferences" onPress={() => {}} delay={120} />
          <View style={styles.menuDivider} />
          <MenuRow icon={HelpCircle} iconColor={C.green} iconBg={C.greenDim} title="Help & Support" subtitle="FAQs and contact info" onPress={() => {}} delay={180} />
        </View>

        {/* ─── Logout Button ─── */}
        <TouchableOpacity style={styles.logoutBlock} onPress={confirmLogout} activeOpacity={0.7}>
          <View style={styles.logoutIconBox}>
            <LogOut size={18} color={C.red} />
          </View>
          <Text style={styles.logoutText}>Sign Out</Text>
          <ChevronRight size={16} color={C.red + '88'} />
        </TouchableOpacity>

        <Text style={styles.versionText}>College ERP Admin • v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Edit Modal ─── */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>

            {/* ─── Modal Handle ─── */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={C.textMid} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

              {/* ─── Modal Avatar Preview ─── */}
              <View style={styles.modalAvatarSection}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                  <View style={styles.modalAvatarRing}>
                    {formProfileImage ? (
                      <Image source={{ uri: formProfileImage }} style={styles.modalAvatarImage} />
                    ) : (
                      <View style={styles.modalAvatarPlaceholder}>
                        <User size={32} color={C.violet} />
                      </View>
                    )}
                    <View style={styles.modalCameraOverlay}>
                      <Camera size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.modalAvatarHint}>Tap to change photo</Text>
              </View>

              {/* ─── Username Field ─── */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputWrapper}>
                  <User size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="e.g. admin_john"
                    placeholderTextColor={C.textDim}
                    value={formUsername}
                    onChangeText={setFormUsername}
                  />
                </View>
              </View>

              {/* ─── Password Field ─── */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={16} color={C.textDim} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInputInner}
                    placeholder="Leave blank to keep current"
                    placeholderTextColor={C.textDim}
                    value={formPassword}
                    onChangeText={setFormPassword}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.inputHint}>Only fill this if you want to change your password.</Text>
              </View>

              {/* ─── Submit Button ─── */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProfile} disabled={isSubmitting} activeOpacity={0.85}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                )}
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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loaderText: { color: C.textDim, fontSize: 13, fontWeight: '500' },

  scrollContent: { paddingBottom: 20 },

  // ── Hero ──
  heroSection: {
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 24,
  },
  heroHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  heroEyebrow: {
    fontSize: 10, fontWeight: '700', color: C.textDim,
    textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 2,
  },
  heroTitle: {
    fontSize: 30, fontWeight: '900', color: C.text, letterSpacing: -1,
  },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Avatar Block ──
  avatarBlock: { flexDirection: 'row', alignItems: 'center' },
  avatarRingOuter: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.violet + '18',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: C.violet + '40',
    marginRight: 16, position: 'relative',
  },
  avatarRingInner: {
    width: 72, height: 72, borderRadius: 36,
    overflow: 'hidden', backgroundColor: C.violetDim,
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.violetDim, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: C.violet },
  editAvatarBtn: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: C.violet, width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: C.surface,
  },

  avatarInfo: { flex: 1 },
  displayName: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 2 },
  emailSmall: { fontSize: 13, fontWeight: '500', color: C.textDim, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.violetDim, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: C.violet + '30',
  },
  roleBadgeText: { fontSize: 10, fontWeight: '800', color: C.violet, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  // ── Section Heading ──
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14, paddingHorizontal: 20,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionPip: { width: 3, height: 16, borderRadius: 2, backgroundColor: C.amber },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: '700' },

  // ── Info Grid ──
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 28,
  },
  infoCard: {
    width: '48.5%', backgroundColor: C.surface,
    borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  infoCardAccent: { height: 2.5, width: '100%' },
  infoCardInner: { padding: 14 },
  infoCardIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  infoCardText: {},
  infoCardLabel: {
    fontSize: 10, fontWeight: '700', color: C.textDim,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  infoCardValue: { fontSize: 14, fontWeight: '700', color: C.text },

  // ── Menu Card ──
  menuCard: {
    backgroundColor: C.surface, borderRadius: 18,
    marginHorizontal: 20, marginBottom: 20,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  menuRowIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuRowText: { flex: 1 },
  menuRowTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 1 },
  menuRowSub: { fontSize: 11, fontWeight: '500', color: C.textDim },
  menuDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  // ── Logout ──
  logoutBlock: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: C.redDim, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: C.red + '25',
  },
  logoutIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.red + '15', borderWidth: 1, borderColor: C.red + '30',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  logoutText: { flex: 1, fontSize: 14, fontWeight: '700', color: C.red },

  versionText: {
    textAlign: 'center', fontSize: 11, color: C.textDim,
    fontWeight: '500', letterSpacing: 0.5, marginTop: 8,
  },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 10, maxHeight: '88%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 14,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center',
  },

  // ── Modal Avatar ──
  modalAvatarSection: { alignItems: 'center', marginBottom: 28 },
  modalAvatarRing: {
    width: 96, height: 96, borderRadius: 48,
    position: 'relative',
  },
  modalAvatarImage: { width: 96, height: 96, borderRadius: 48 },
  modalAvatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.violetDim, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.violet + '30',
  },
  modalCameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.violet, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: C.surface,
  },
  modalAvatarHint: { fontSize: 12, color: C.textDim, fontWeight: '500', marginTop: 10 },

  // ── Modal Inputs ──
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.textMid, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  textInputInner: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  inputHint: { fontSize: 11, color: C.textDim, marginTop: 6 },

  submitBtn: {
    backgroundColor: C.violet, height: 54, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
