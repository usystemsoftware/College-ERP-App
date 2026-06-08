import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import {
  Users, BookOpen, DollarSign, Clock, Bell, LogOut,
  GraduationCap, Calendar, ClipboardCheck, Archive,
  Book, Shield, TrendingUp, ChevronRight, ArrowUpRight,
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const { width: SW } = Dimensions.get('window');

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  bgDeep: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceUp: '#F1F5F9',
  border: '#E2E8F0',
  cream: '#0F172A',      // primary text (dark on light)
  amber: '#F59E0B',
  amberDim: '#FEF3C7',
  amberGlow: '#FDE68A',
  green: '#10B981',
  greenDim: '#ECFDF5',
  blue: '#3B82F6',
  blueDim: '#EFF6FF',
  violet: '#8B5CF6',
  violetDim: '#F5F3FF',
  red: '#EF4444',
  redDim: '#FEF2F2',
  text: '#0F172A',
  textMid: '#475569',
  textDim: '#94A3B8',
};

const QUICK_ACTIONS = [
  { name: 'Faculty', icon: GraduationCap, from: '#F0A500', to: '#C07000', num: '01' },
  { name: 'Attendance', icon: ClipboardCheck, from: '#F05252', to: '#B02020', num: '02' },
  { name: 'Inventory', icon: Archive, from: '#6366F1', to: '#3730A3', num: '03' },
  { name: 'Timetable', icon: Calendar, from: '#F472B6', to: '#BE185D', num: '04' },
  { name: 'Library', icon: Book, from: '#38BDF8', to: '#0369A1', num: '05' },
  { name: 'Gate Passes', icon: Shield, from: '#1DB874', to: '#065F46', num: '06' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconColor, title, value, sub, subColor, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 550, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 550, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.statAccentLine, { backgroundColor: iconColor }]} />
      <View style={styles.statInner}>
        <View style={[styles.statIconRing, { borderColor: iconColor + '55', backgroundColor: iconColor + '15' }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={[styles.statSub, { color: subColor || C.textDim }]}>{sub}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Quick Tile ───────────────────────────────────────────────────────────────
function QuickTile({ name, icon: Icon, from, to, num, delay = 0 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.93, friction: 5, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateX: slideX }, { scale }] }}>
      <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.quickTile}>
        <View style={[styles.quickTileBg, { backgroundColor: from }]}>
          <View style={[styles.quickTileShade, { backgroundColor: to }]} />
        </View>
        <Text style={styles.quickTileNum}>{num}</Text>
        <View style={styles.quickTileContent}>
          <View style={styles.quickTileIconBox}>
            <Icon size={22} color="#fff" strokeWidth={2} />
          </View>
          <View style={styles.quickTileFooter}>
            <Text style={styles.quickTileName}>{name}</Text>
            <ArrowUpRight size={13} color="rgba(255,255,255,0.65)" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionPip} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <ChevronRight size={12} color={C.amber} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, meta, labels, values, color, MetaIcon }) {
  const hexToRgba = (hex, op) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${op})`;
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.chartMetaRow}>
            <View style={[styles.chartDot, { backgroundColor: color }]} />
            <Text style={styles.chartMetaText}>{meta}</Text>
            {MetaIcon && <MetaIcon size={13} color={color} style={{ marginLeft: 4 }} />}
          </View>
        </View>
        <View style={[styles.chartBadge, { backgroundColor: color + '18', borderColor: color + '44' }]}>
          <Text style={[styles.chartBadgeText, { color }]}>YTD</Text>
        </View>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={SW - 76}
        height={190}
        chartConfig={{
          backgroundColor: C.surface,
          backgroundGradientFrom: C.surface,
          backgroundGradientTo: C.surface,
          decimalPlaces: 0,
          color: (op = 1) => hexToRgba(color, op),
          labelColor: () => C.textDim,
          propsForBackgroundLines: { stroke: C.border, strokeDasharray: '3 3' },
          propsForDots: { r: '4', strokeWidth: '2', stroke: color },
        }}
        bezier
        withOuterLines={false}
        style={styles.chartLine}
      />
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const { userToken, signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    fetchData();
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://192.168.1.21:5050/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${userToken}` }, withCredentials: true,
      });
      if (res.data?.success && res.data?.data?.stats) setStats(res.data.data.stats);
    } catch (_) { }
    finally { setLoading(false); }
  };

  const fmt = (n) => {
    if (!n) return '$0';
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
    return `$${n}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.amber} />
        <Text style={styles.loaderText}>Loading Dashboard…</Text>
      </View>
    );
  }

  const revLabels = stats?.revenueData?.map(i => i.name) || ['Jan'];
  const revVals = stats?.revenueData?.map(i => i.revenue || 0) || [0];
  const admLabels = stats?.admissionData?.map(i => i.name) || ['W1'];
  const admVals = stats?.admissionData?.map(i => i.students || 0) || [0];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 20) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
          <View style={styles.headerText}>
            <Text style={styles.headerEyebrow}>State Institute of Technology</Text>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Analytics</Text>
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Operations · Finance · Insights</Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity style={styles.hBtn} onPress={() => navigation.navigate('Notifications')}>
              <Bell size={17} color={C.textMid} />
              <View style={styles.hBtnDot} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.hBtn, styles.hBtnRed]} onPress={signOut}>
              <LogOut size={17} color={C.red} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats */}
        <SectionHeader title="Key Metrics" />
        <View style={styles.statGrid}>
          <StatCard icon={Users} iconColor={C.blue} title="Students" value={stats?.totalStudents || 0} sub="Active Enrolled" delay={0} />
          <StatCard icon={BookOpen} iconColor={C.violet} title="Faculty" value={stats?.totalFaculty || 0} sub={`${stats?.totalDepartments || 0} Depts`} delay={80} />
          <StatCard icon={DollarSign} iconColor={C.green} title="Revenue" value={fmt(stats?.revenue)} sub="Total Collected" subColor={C.green} delay={160} />
          <StatCard icon={Clock} iconColor={C.amber} title="Pending" value={stats?.pendingApprovals || 0} sub="Approvals" delay={240} />
        </View>

        {/* Quick Access */}
        <SectionHeader title="Quick Access" />
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <QuickTile key={i} {...a} delay={i * 65} />
          ))}
        </View>

        {/* Charts */}
        <SectionHeader title="Financial Overview" action="Full Report" />
        <ChartCard title="Revenue" meta="Year to date" labels={revLabels} values={revVals} color="#1DB874" MetaIcon={TrendingUp} />

        <SectionHeader title="Admission Trends" action="Full Report" />
        <ChartCard title="Admissions" meta="Current cycle" labels={admLabels} values={admVals} color="#4B8EF5" />

        <View style={{ height: 48 }} />
      </ScrollView>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const TILE_W = Math.floor((SW - 40 - 20) / 3); // 3 cols, 20px side padding, 10px gaps

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  loader: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { color: C.textDim, fontSize: 13 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerText: { flex: 1 },
  headerEyebrow: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: {
    color: C.cream,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.green + '20',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: C.green + '50',
    marginTop: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveLabel: { color: C.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  headerSub: { color: C.textDim, fontSize: 11, marginTop: 5, letterSpacing: 0.3 },
  headerBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  hBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  hBtnDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: C.amber, borderWidth: 1.5, borderColor: C.bg,
  },
  hBtnRed: { borderColor: C.red + '44', backgroundColor: C.red + '10' },

  // Section
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionPip: { width: 3, height: 16, borderRadius: 2, backgroundColor: C.amber },
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionActionText: { color: C.amber, fontSize: 12, fontWeight: '600' },

  // Stat cards
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', marginBottom: 30,
  },
  statCard: {
    width: '48.5%', backgroundColor: C.surface,
    borderRadius: 18, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  statAccentLine: { height: 2, width: '100%' },
  statInner: { padding: 16 },
  statIconRing: {
    width: 34, height: 34, borderRadius: 11,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  statLabel: {
    color: C.textDim, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 5,
  },
  statValue: {
    color: C.cream, fontSize: 28, fontWeight: '800',
    letterSpacing: -0.8, marginBottom: 3,
  },
  statSub: { fontSize: 11, fontWeight: '500' },

  // Quick tiles — 3-column grid
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30,
  },
  quickTile: {
    width: TILE_W,
    height: TILE_W * 1.22,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickTileBg: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
  quickTileShade: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '55%', opacity: 0.6,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  quickTileNum: {
    position: 'absolute', top: 9, right: 11,
    color: 'rgba(255,255,255,0.16)', fontSize: 24,
    fontWeight: '900', letterSpacing: -1,
  },
  quickTileContent: {
    flex: 1, padding: 12, justifyContent: 'space-between',
  },
  quickTileIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  quickTileFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  quickTileName: {
    color: '#fff', fontSize: 11, fontWeight: '700',
    letterSpacing: 0.1, flex: 1, lineHeight: 14,
  },

  // Charts
  chartCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    marginBottom: 28, borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  chartTitle: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 5 },
  chartMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chartDot: { width: 7, height: 7, borderRadius: 4 },
  chartMetaText: { color: C.textDim, fontSize: 12, fontWeight: '500' },
  chartBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  chartBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  chartLine: { marginLeft: -18, borderRadius: 0 },
});