import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, ActivityIndicator,
  Dimensions, TouchableOpacity, Animated, StatusBar, Image,
  RefreshControl,
} from 'react-native';
import {
  Users, BookOpen, DollarSign, Clock, Bell, LogOut,
  GraduationCap, Calendar, ClipboardCheck, Archive,
  Book, Shield, TrendingUp, ChevronRight, Zap,
  Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getDashboardStats } from '../api/dashboard.api';

const { width: SW } = Dimensions.get('window');

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  // Page
  bg: '#F0F3FA',
  bgDeep: '#E3E8F2',
  // Hero banner
  hero1: '#0F1B44',
  hero2: '#1E3A8A',
  hero3: '#3B5BDB',
  heroRing: 'rgba(255,255,255,0.06)',
  heroText: '#FFFFFF',
  heroSub: 'rgba(255,255,255,0.55)',
  // Cards
  card: '#FFFFFF',
  cardHover: '#FAFBFF',
  border: 'rgba(99,120,180,0.10)',
  borderFocus: 'rgba(59,91,219,0.18)',
  // Brand
  indigo: '#3B5BDB',
  indigoDim: '#EEF2FF',
  // Semantic
  emerald: '#0D9488',
  emeraldDim: '#F0FDFA',
  rose: '#E11D48',
  roseDim: '#FFF1F2',
  violet: '#7C3AED',
  violetDim: '#F5F3FF',
  amber: '#D97706',
  amberDim: '#FFFBEB',
  sky: '#0284C7',
  skyDim: '#F0F9FF',
  // Text
  ink: '#111827',
  inkMid: '#374151',
  inkSoft: '#6B7280',
  inkFaint: '#9CA3AF',
  shadow: '#0F1B44',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(n) {
  if (!n) return '₹0';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}k`;
  return `₹${n}`;
}

// ─── Animated entry hook ──────────────────────────────────────────────────────
function useEntry(delay = 0, dy = 20) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return [op, ty];
}

// ─── Pulse animation for live dot ─────────────────────────────────────────────
function PulseDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOp, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseOp, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 6, height: 6 }}>
      <Animated.View style={{
        position: 'absolute', width: 6, height: 6, borderRadius: 3,
        backgroundColor: '#4ADE80', transform: [{ scale: pulse }], opacity: pulseOp,
      }} />
      <View style={{
        width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80',
      }} />
    </View>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function Label({ text, action, delay = 0 }) {
  const [op, ty] = useEntry(delay);
  return (
    <Animated.View style={[labelSt.row, { opacity: op, transform: [{ translateY: ty }] }]}>
      <Text style={labelSt.text}>{text}</Text>
      {action && (
        <TouchableOpacity style={labelSt.btn} activeOpacity={0.6}>
          <Text style={labelSt.btnText}>{action}</Text>
          <ChevronRight size={12} color={C.indigo} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
const labelSt = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  text: { fontSize: 11, fontWeight: '700', color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  btnText: { fontSize: 12, fontWeight: '600', color: C.indigo },
});

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ stats }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Animated.View style={[heroSt.card, { opacity: op, transform: [{ translateY: ty }] }]}>
      {/* Accent bar on the left */}
      <View style={heroSt.accentBar} />

      {/* Main content */}
      <View style={heroSt.body}>
        {/* Top row: greeting + live */}
        <View style={heroSt.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={heroSt.greeting}>{getGreeting()} 👋</Text>
            <Text style={heroSt.collegeName}>SK Patil College</Text>
          </View>
          <View style={heroSt.liveRow}>
            <PulseDot />
            <Text style={heroSt.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Date row */}
        <View style={heroSt.dateRow}>
          <Calendar size={13} color={C.inkSoft} strokeWidth={2} />
          <Text style={heroSt.date}>{today}</Text>
        </View>

        {/* Divider */}
        <View style={heroSt.divider} />

        {/* Stats row */}
        <View style={heroSt.statsRow}>
          <View style={heroSt.statItem}>
            <View style={[heroSt.statDot, { backgroundColor: C.indigo }]} />
            <Text style={heroSt.statVal}>{stats?.totalStudents || '—'}</Text>
            <Text style={heroSt.statLabel}>Students</Text>
          </View>
          <View style={heroSt.statItem}>
            <View style={[heroSt.statDot, { backgroundColor: C.emerald }]} />
            <Text style={heroSt.statVal}>{fmt(stats?.revenue)}</Text>
            <Text style={heroSt.statLabel}>Revenue</Text>
          </View>
          <View style={heroSt.statItem}>
            <View style={[heroSt.statDot, { backgroundColor: C.amber }]} />
            <Text style={heroSt.statVal}>{stats?.pendingApprovals || '—'}</Text>
            <Text style={heroSt.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
const heroSt = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 22,
    marginBottom: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  accentBar: {
    width: 5,
    backgroundColor: C.indigo,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkSoft,
    letterSpacing: 0.1,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.emeraldDim,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.emerald + '30',
  },
  liveText: {
    color: C.emerald,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: C.inkFaint,
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: C.bgDeep,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

// ─── Metric Chip (horizontal scroll) ──────────────────────────────────────────
function MetricChip({ icon: Icon, color, dimColor, label, value, trend, delay = 0 }) {
  const [op, ty] = useEntry(delay, 14);
  const isPositive = trend >= 0;
  return (
    <Animated.View style={[chipSt.chip, { opacity: op, transform: [{ translateY: ty }] }]}>
      <View style={chipSt.topRow}>
        <View style={[chipSt.iconBox, { backgroundColor: dimColor }]}>
          <Icon size={16} color={color} strokeWidth={2.2} />
        </View>
        {trend !== undefined && (
          <View style={[chipSt.trendBadge, { backgroundColor: isPositive ? C.emeraldDim : C.roseDim }]}>
            {isPositive
              ? <ArrowUpRight size={10} color={C.emerald} strokeWidth={2.5} />
              : <ArrowDownRight size={10} color={C.rose} strokeWidth={2.5} />}
            <Text style={[chipSt.trendText, { color: isPositive ? C.emerald : C.rose }]}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={chipSt.val}>{value}</Text>
      <Text style={chipSt.label}>{label}</Text>
    </Animated.View>
  );
}
const chipSt = StyleSheet.create({
  chip: {
    backgroundColor: C.card, borderRadius: 18, padding: 16,
    width: 120, marginRight: 10,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    alignItems: 'flex-start',
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', width: '100%', marginBottom: 12,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 1,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6,
  },
  trendText: { fontSize: 9, fontWeight: '700' },
  val: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 2 },
  label: { fontSize: 10, fontWeight: '600', color: C.inkSoft, letterSpacing: 0.3 },
});

// ─── Activity Summary Card ────────────────────────────────────────────────────
function ActivitySummary({ stats, delay = 0 }) {
  const [op, ty] = useEntry(delay);
  const items = [
    { icon: Users, color: C.indigo, label: 'New admissions today', value: stats?.todayAdmissions || 0 },
    { icon: DollarSign, color: C.emerald, label: 'Fees collected today', value: fmt(stats?.todayFees || 0) },
    { icon: Activity, color: C.violet, label: 'Active classes now', value: stats?.activeClasses || 0 },
  ];
  return (
    <Animated.View style={[actSt.card, { opacity: op, transform: [{ translateY: ty }] }]}>
      <View style={actSt.header}>
        <View style={actSt.headerIcon}>
          <Activity size={14} color={C.indigo} strokeWidth={2.5} />
        </View>
        <Text style={actSt.headerTitle}>Today's Activity</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={[actSt.row, i < items.length - 1 && actSt.rowBorder]}>
          <View style={[actSt.dot, { backgroundColor: item.color }]} />
          <Text style={actSt.label}>{item.label}</Text>
          <Text style={[actSt.value, { color: item.color }]}>{item.value}</Text>
        </View>
      ))}
    </Animated.View>
  );
}
const actSt = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  headerIcon: {
    width: 28, height: 28, borderRadius: 9, backgroundColor: C.indigoDim,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 13, fontWeight: '700', color: C.ink, letterSpacing: -0.1 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.bgDeep },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  label: { flex: 1, fontSize: 13, fontWeight: '500', color: C.inkMid },
  value: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
});

// ─── Quick Access Row ─────────────────────────────────────────────────────────
function QuickRow({ name, icon: Icon, color, dimColor, hint, delay = 0 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [op, ty] = useEntry(delay, 12);
  const onIn = () => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: ty }, { scale }] }}>
      <TouchableOpacity activeOpacity={1} onPressIn={onIn} onPressOut={onOut} style={quickRowSt.row}>
        <View style={[quickRowSt.iconPill, { backgroundColor: dimColor }]}>
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <View style={quickRowSt.textBlock}>
          <Text style={quickRowSt.name}>{name}</Text>
          <Text style={quickRowSt.hint}>{hint}</Text>
        </View>
        <View style={[quickRowSt.arrow, { backgroundColor: dimColor }]}>
          <ChevronRight size={16} color={color} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
const quickRowSt = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  iconPill: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  textBlock: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 2 },
  hint: { fontSize: 11, color: C.inkSoft, fontWeight: '400' },
  arrow: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
});

// ─── Quick data ───────────────────────────────────────────────────────────────
const QUICK = [
  { name: 'Faculty', icon: GraduationCap, color: C.amber, dimColor: C.amberDim, hint: 'Staff records & schedules' },
  { name: 'Attendance', icon: ClipboardCheck, color: C.rose, dimColor: C.roseDim, hint: 'Daily tracking & reports' },
  { name: 'Inventory', icon: Archive, color: C.violet, dimColor: C.violetDim, hint: 'Assets & stock management' },
  { name: 'Timetable', icon: Calendar, color: C.indigo, dimColor: C.indigoDim, hint: 'Class schedules & rooms' },
  { name: 'Library', icon: Book, color: C.sky, dimColor: C.skyDim, hint: 'Books & issue management' },
  { name: 'Gate Passes', icon: Shield, color: C.emerald, dimColor: C.emeraldDim, hint: 'Entry & exit permissions' },
];

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, meta, labels, values, color, MetaIcon, delay = 0 }) {
  const [op, ty] = useEntry(delay);
  const hexToRgba = (hex, a) => {
    const h = hex.replace('#', '');
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  return (
    <Animated.View style={[chartSt.card, { opacity: op, transform: [{ translateY: ty }] }]}>
      <View style={chartSt.header}>
        <View>
          <Text style={chartSt.title}>{title}</Text>
          <View style={chartSt.metaRow}>
            <View style={[chartSt.dot, { backgroundColor: color }]} />
            <Text style={chartSt.metaText}>{meta}</Text>
            {MetaIcon && <MetaIcon size={12} color={color} style={{ marginLeft: 3 }} />}
          </View>
        </View>
        <TouchableOpacity style={[chartSt.viewBtn, { borderColor: color + '44', backgroundColor: color + '10' }]}>
          <Text style={[chartSt.viewBtnText, { color }]}>View full</Text>
          <ChevronRight size={11} color={color} />
        </TouchableOpacity>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={SW - 76}
        height={180}
        chartConfig={{
          backgroundColor: C.card,
          backgroundGradientFrom: C.card,
          backgroundGradientTo: C.card,
          decimalPlaces: 0,
          color: (a = 1) => hexToRgba(color, a),
          labelColor: () => C.inkFaint,
          propsForBackgroundLines: { stroke: C.bgDeep, strokeDasharray: '3 3' },
          propsForDots: { r: '4', strokeWidth: '2', stroke: color },
        }}
        bezier
        withOuterLines={false}
        style={chartSt.line}
      />
    </Animated.View>
  );
}
const chartSt = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: 20, padding: 18,
    marginBottom: 24, borderWidth: 1, borderColor: C.border,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 15, fontWeight: '700', color: C.ink, letterSpacing: -0.2, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  metaText: { color: C.inkSoft, fontSize: 12, fontWeight: '500' },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1,
  },
  viewBtnText: { fontSize: 11, fontWeight: '600' },
  line: { marginLeft: -18, borderRadius: 0 },
});

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  const shimmer = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const Bar = ({ width, height = 14, mb = 8 }) => (
    <Animated.View style={{
      width, height, borderRadius: height / 2,
      backgroundColor: '#D1D5DB', opacity: shimmer, marginBottom: mb,
    }} />
  );

  return (
    <View style={skelSt.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {/* Hero skeleton */}
      <View style={skelSt.hero}>
        <Bar width="45%" height={12} />
        <Bar width="65%" height={22} mb={12} />
        <Bar width="30%" height={10} mb={20} />
        <View style={skelSt.spotRow}>
          <Bar width="60" height={18} />
          <Bar width="60" height={18} />
          <Bar width="60" height={18} />
        </View>
      </View>
      {/* Chips skeleton */}
      <View style={skelSt.chipRow}>
        {[0,1,2,3].map(i => (
          <Animated.View key={i} style={[skelSt.chip, { opacity: shimmer }]} />
        ))}
      </View>
      {/* Rows skeleton */}
      {[0,1,2].map(i => (
        <Animated.View key={i} style={[skelSt.row, { opacity: shimmer }]} />
      ))}
    </View>
  );
}
const skelSt = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 60 },
  hero: {
    backgroundColor: '#1E293B', borderRadius: 24, padding: 22,
    marginBottom: 24, minHeight: 190,
  },
  spotRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: { width: 110, height: 100, borderRadius: 16, backgroundColor: '#E2E8F0' },
  row: { height: 60, borderRadius: 16, backgroundColor: '#E2E8F0', marginBottom: 8 },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);
  const { userToken, signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getDashboardStats();
      if (res.data?.success && res.data?.data?.stats) setStats(res.data.data.stats);
    } catch (_) { }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => fetchData(true), []);

  if (isLoading) return <SkeletonLoader />;

  const revLabels = stats?.revenueData?.map(i => i.name) || ['Jan'];
  const revVals = stats?.revenueData?.map(i => i.revenue || 0) || [0];
  const admLabels = stats?.admissionData?.map(i => i.name) || ['W1'];
  const admVals = stats?.admissionData?.map(i => i.students || 0) || [0];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        style={st.root}
        contentContainerStyle={[st.scroll, { paddingTop: Math.max(insets.top + 8, 24) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={C.indigo}
            colors={[C.indigo]}
            progressBackgroundColor={C.card}
          />
        }
      >

        {/* ── Top bar ────────────────────────────────────────── */}
        <View style={st.topBar}>
          <View style={st.topBarLeft}>
            <Image source={require('../../assets/logo.png')} style={st.logo} />
            <View style={st.topBarTitle}>
              <Text style={st.topBarName}>SK Patil</Text>
              <Text style={st.topBarSub}>Admin Portal</Text>
            </View>
          </View>
          <View style={st.topBarRight}>
            <TouchableOpacity style={st.iconBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
              <Bell size={18} color={C.inkMid} strokeWidth={2} />
              <View style={st.notifBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={[st.iconBtn, st.iconBtnRed]} onPress={signOut} activeOpacity={0.7}>
              <LogOut size={18} color={C.rose} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Banner ────────────────────────────────────── */}
        <HeroBanner stats={stats} />

        {/* ── Overview chips ──────────────────────────────────── */}
        <Label text="Overview" delay={200} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <MetricChip icon={Users} color={C.indigo} dimColor={C.indigoDim} label="Students" value={stats?.totalStudents || 0} trend={12} delay={220} />
          <MetricChip icon={BookOpen} color={C.violet} dimColor={C.violetDim} label="Faculty" value={stats?.totalFaculty || 0} trend={3} delay={280} />
          <MetricChip icon={Zap} color={C.amber} dimColor={C.amberDim} label="Depts" value={stats?.totalDepartments || 0} delay={340} />
          <MetricChip icon={Clock} color={C.rose} dimColor={C.roseDim} label="Pending" value={stats?.pendingApprovals || 0} trend={-5} delay={400} />
        </ScrollView>

        {/* ── Today's Activity ────────────────────────────────── */}
        <ActivitySummary stats={stats} delay={420} />

        {/* ── Quick Access ───────────────────────────────────── */}
        <Label text="Quick Access" delay={460} />
        <View style={st.quickGrid}>
          {QUICK.map((q, i) => (
            <QuickRow key={i} {...q} delay={480 + i * 50} />
          ))}
        </View>

        {/* ── Charts ─────────────────────────────────────────── */}
        <Label text="Financial Overview" action="Full report" delay={620} />
        <ChartCard title="Revenue" meta="Year to date" labels={revLabels} values={revVals} color={C.emerald} MetaIcon={TrendingUp} delay={640} />

        <Label text="Admissions" action="Full report" delay={700} />
        <ChartCard title="New Admissions" meta="Current cycle" labels={admLabels} values={admVals} color={C.indigo} delay={720} />

        <View style={{ height: 48 }} />
      </ScrollView>
    </>
  );
}

// ─── Root Styles ─────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center' },
  topBarRight: { flexDirection: 'row', gap: 8 },
  logo: { width: 36, height: 36, resizeMode: 'contain' },
  topBarTitle: { marginLeft: 10 },
  topBarName: { fontSize: 16, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  topBarSub: { fontSize: 11, fontWeight: '500', color: C.inkSoft, marginTop: 1 },

  iconBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  notifBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: C.rose, borderWidth: 1.5, borderColor: C.card,
  },
  iconBtnRed: {
    borderColor: C.rose + '33', backgroundColor: C.roseDim,
  },

  quickGrid: { marginBottom: 24 },
});