import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import {
  ArrowLeft, Bell, CheckCheck, Trash2,
  Info, AlertTriangle, Calendar, MessageSquare,
  Inbox, Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'http://192.168.1.21:5050';

// ─── Palette (matches Dashboard light theme) ─────────────────────────────────
const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  accent: '#F59E0B',   // amber — primary brand
  accentDim: '#FEF3C7',
  blue: '#3B82F6',
  blueDim: '#EFF6FF',
  green: '#10B981',
  greenDim: '#ECFDF5',
  red: '#EF4444',
  redDim: '#FEF2F2',
  violet: '#8B5CF6',
  violetDim: '#F5F3FF',
  text: '#0F172A',
  textMuted: '#475569',
  textSub: '#94A3B8',
  unreadBg: '#FFFBEB',
  unreadBorder: '#FDE68A',
};

// ─── Category Config ─────────────────────────────────────────────────────────
function getCategoryConfig(type) {
  switch (type?.toLowerCase()) {
    case 'alert':
    case 'warning':
      return { Icon: AlertTriangle, color: C.red, bg: C.redDim, label: 'Alert' };
    case 'event':
    case 'calendar':
      return { Icon: Calendar, color: C.violet, bg: C.violetDim, label: 'Event' };
    case 'message':
      return { Icon: MessageSquare, color: C.blue, bg: C.blueDim, label: 'Message' };
    default:
      return { Icon: Info, color: C.accent, bg: C.accentDim, label: 'Notice' };
  }
}

// ─── Time Ago ────────────────────────────────────────────────────────────────
function timeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Notification Card ───────────────────────────────────────────────────────
function NotificationCard({ item, onMarkRead, onDelete, index }) {
  const isUnread = !item.isRead;
  const { Icon, color, bg, label } = getCategoryConfig(item.type);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay: index * 55, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale: pressScale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => { if (isUnread) onMarkRead(item._id); }}
        style={[styles.card, isUnread && styles.cardUnread]}
      >
        {/* Unread left-bar */}
        {isUnread && <View style={[styles.unreadBar, { backgroundColor: color }]} />}

        <View style={styles.cardInner}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <Icon size={20} color={color} />
          </View>

          {/* Content */}
          <View style={styles.cardBody}>
            {/* Tag + time row */}
            <View style={styles.cardMeta}>
              <View style={[styles.tagPill, { backgroundColor: bg }]}>
                <Text style={[styles.tagText, { color }]}>{label}</Text>
              </View>
              <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
            </View>

            <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} numberOfLines={1}>
              {item.title || 'Notification'}
            </Text>
            <Text style={styles.cardMessage} numberOfLines={2}>
              {item.message || ''}
            </Text>

            {/* Actions */}
            <View style={styles.cardActions}>
              {isUnread && (
                <TouchableOpacity
                  style={[styles.actionPill, { backgroundColor: C.greenDim }]}
                  onPress={() => onMarkRead(item._id)}
                >
                  <CheckCheck size={12} color={C.green} />
                  <Text style={[styles.actionPillText, { color: C.green }]}>Mark read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionPill, { backgroundColor: C.redDim, marginLeft: isUnread ? 8 : 0 }]}
                onPress={() => onDelete(item._id)}
              >
                <Trash2 size={12} color={C.red} />
                <Text style={[styles.actionPillText, { color: C.red }]}>Delete</Text>
              </TouchableOpacity>

              {isUnread && (
                <View style={styles.unreadDot} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────
function FilterTabs({ active, onChange }) {
  const tabs = ['All', 'Unread', 'Alerts', 'Events'];
  return (
    <View style={styles.tabsRow}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, active === tab && styles.tabActive]}
          onPress={() => onChange(tab)}
        >
          <Text style={[styles.tabText, active === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyContainer, { opacity, transform: [{ scale }] }]}>
      <View style={styles.emptyIconOuter}>
        <View style={styles.emptyIconInner}>
          <Inbox size={36} color={C.accent} />
        </View>
        <View style={styles.emptySparkle}>
          <Sparkles size={14} color={C.accent} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>No notifications here.{'\n'}Check back later.</Text>
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userToken } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('All');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const headers = { Authorization: `Bearer ${userToken}` };

  const fetchNotifications = useCallback(async (pageNum = 1, refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else if (pageNum === 1) setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications/my`, {
        headers,
        params: { page: pageNum, limit: 20 },
      });
      if (res.data?.success) {
        const data = res.data.data;
        setNotifications(prev =>
          pageNum === 1 ? (data.notifications || []) : [...prev, ...(data.notifications || [])]
        );
        setUnreadCount(data.unreadCount || 0);
        setTotalPages(data.pagination?.pages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      console.log('Fetch error:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken]);

  useEffect(() => {
    fetchNotifications(1);
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, null, { headers });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/mark-all-read`, null, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Notification',
      'Remove this notification permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/notifications/${id}`, { headers });
              const removed = notifications.find(n => n._id === id);
              setNotifications(prev => prev.filter(n => n._id !== id));
              if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) { }
          },
        },
      ]
    );
  };

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'Alerts') return ['alert', 'warning'].includes(n.type?.toLowerCase());
    if (activeTab === 'Events') return ['event', 'calendar'].includes(n.type?.toLowerCase());
    return true;
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading notifications…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={18} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllRead}>
            <CheckCheck size={14} color={C.green} />
            <Text style={styles.readAllText}>All read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 76 }} />
        )}
      </Animated.View>

      {/* ── Unread Banner ── */}
      {unreadCount > 0 && (
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Bell size={14} color={C.accent} />
          </View>
          <Text style={styles.bannerText}>
            <Text style={styles.bannerCount}>{unreadCount} unread</Text>
            {' '}notification{unreadCount !== 1 ? 's' : ''} waiting for you
          </Text>
        </View>
      )}

      {/* ── Filter Tabs ── */}
      <FilterTabs active={activeTab} onChange={setActiveTab} />

      {/* ── List ── */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => (
          <NotificationCard
            item={item}
            index={index}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[
          styles.listContent,
          filteredNotifications.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (page < totalPages) fetchNotifications(page + 1); }}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchNotifications(1, true)}
            tintColor={C.accent}
            colors={[C.accent]}
          />
        }
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
    gap: 12,
  },
  loadingText: {
    color: C.textMuted,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: C.red,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.greenDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.green + '33',
  },
  readAllText: {
    color: C.green,
    fontSize: 12,
    fontWeight: '600',
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: C.accentDim,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.accent + '44',
  },
  bannerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.accent + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  bannerCount: {
    color: C.accent,
    fontWeight: '700',
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.text,
    borderColor: C.text,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: C.unreadBg,
    borderColor: C.unreadBorder,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardInner: {
    flexDirection: 'row',
    padding: 14,
    paddingLeft: 18,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardTime: {
    fontSize: 11,
    color: C.textSub,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  cardMessage: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    marginLeft: 'auto',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: C.accent + '33',
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  emptySparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});