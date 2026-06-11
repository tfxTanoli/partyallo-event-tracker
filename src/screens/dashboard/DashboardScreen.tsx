import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { RootTabParamList, EventStatus } from '../../types';
import {
  formatDate,
  getEventProgress,
  getDaysUntilEvent,
  truncateText,
} from '../../utils/helpers';

type DashboardNav = BottomTabNavigationProp<RootTabParamList, 'Dashboard'>;

const STATUS_ORDER: EventStatus[] = ['Planning', 'Packing', 'In progress', 'Completed'];

const STAT_CONFIG: Array<{
  status: EventStatus;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  border: string;
}> = [
  { status: 'Planning', icon: 'calendar-outline', color: Colors.sky[600], bg: Colors.sky[50], border: Colors.sky[200] },
  { status: 'Packing', icon: 'cube-outline', color: Colors.violet[600], bg: Colors.violet[50], border: Colors.violet[200] },
  { status: 'In progress', icon: 'play-circle-outline', color: Colors.amber[600], bg: Colors.amber[50], border: Colors.amber[200] },
  { status: 'Completed', icon: 'checkmark-circle-outline', color: Colors.emerald[600], bg: Colors.emerald[50], border: Colors.emerald[200] },
];

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const { events, stations, purchases, selectEventForPacking, settings } = useApp();

  const stats = useMemo(
    () =>
      STATUS_ORDER.reduce<Record<EventStatus, number>>(
        (acc, s) => {
          acc[s] = events.filter((e) => e.status === s).length;
          return acc;
        },
        { Planning: 0, Packing: 0, 'In progress': 0, Completed: 0 }
      ),
    [events]
  );

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => e.status !== 'Completed' && new Date(e.date) >= new Date(new Date().toDateString()))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [events]
  );

  const pendingPurchases = useMemo(
    () => purchases.filter((p) => !p.purchased).slice(0, 4),
    [purchases]
  );

  const totalPurchasePct = purchases.length
    ? Math.round((purchases.filter((p) => p.purchased).length / purchases.length) * 100)
    : 0;

  const handleEventPress = (eventId: string) => {
    selectEventForPacking(eventId);
    navigation.navigate('Packing');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[800]} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          {/* Decorative background circles */}
          <View style={styles.heroDecorTL} />
          <View style={styles.heroDecorBR} />

          <View style={styles.heroBody}>
            <View style={styles.heroLeft}>
              <View style={styles.logoMark}>
                <Ionicons name="sparkles" size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.heroTitle}>{settings.companyName}</Text>
                <Text style={styles.heroSubtitle}>{settings.appSubtitle}</Text>
              </View>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalNum}>{events.length}</Text>
              <Text style={styles.totalLabel}>Events</Text>
            </View>
          </View>

          {/* Rainbow accent strip — mirrors the logo arc */}
          <View style={styles.rainbowStrip}>
            {Colors.rainbow.map((color, i) => (
              <View key={i} style={[styles.rainbowSegment, { backgroundColor: color }]} />
            ))}
          </View>
        </View>

        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          {STAT_CONFIG.map(({ status, icon, color, bg, border }) => (
            <View
              key={status}
              style={[styles.statCard, { backgroundColor: bg, borderColor: border }]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={18} color={color} />
              </View>
              <Text style={[styles.statNum, { color }]}>{stats[status]}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>{status}</Text>
            </View>
          ))}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Catalog')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: Colors.violet[50] }]}>
              <Ionicons name="storefront-outline" size={18} color={Colors.violet[600]} />
            </View>
            <View style={styles.quickInfo}>
              <Text style={styles.quickNum}>{stations.length}</Text>
              <Text style={styles.quickLabel}>Stations</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Purchases')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: Colors.amber[50] }]}>
              <Ionicons name="cart-outline" size={18} color={Colors.amber[600]} />
            </View>
            <View style={styles.quickInfo}>
              <Text style={styles.quickNum}>{purchases.filter((p) => !p.purchased).length}</Text>
              <Text style={styles.quickLabel}>To Buy</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Purchases')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIcon, { backgroundColor: Colors.emerald[50] }]}>
              <Ionicons name="checkmark-done-outline" size={18} color={Colors.emerald[600]} />
            </View>
            <View style={styles.quickInfo}>
              <Text style={styles.quickNum}>{totalPurchasePct}%</Text>
              <Text style={styles.quickLabel}>Fulfilled</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.primary[500] }]} />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Events')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAll}>See all</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>

          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <EmptyState
                icon="calendar-outline"
                title="No upcoming events"
                description="Create your first event to get started."
                actionLabel="Go to Events"
                onAction={() => navigation.navigate('Events')}
              />
            </View>
          ) : (
            upcomingEvents.map((event) => {
              const { packed, total } = getEventProgress(event);
              const days = getDaysUntilEvent(event.date);
              const isUrgent = days >= 0 && days <= 1;
              const daysLabel =
                days === 0
                  ? 'Today!'
                  : days === 1
                  ? 'Tomorrow'
                  : days < 0
                  ? `${Math.abs(days)}d ago`
                  : `${days}d away`;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                  activeOpacity={0.85}
                >
                  {/* Left date column */}
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDateDay}>
                      {new Date(event.date).getDate()}
                    </Text>
                    <Text style={styles.eventDateMonth}>
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </Text>
                  </View>

                  {/* Main info */}
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName} numberOfLines={1}>
                      {event.eventName}
                    </Text>
                    <Text style={styles.eventClient} numberOfLines={1}>
                      {event.clientName}
                    </Text>
                    <View style={styles.eventVenueRow}>
                      <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                      <Text style={styles.eventVenueText} numberOfLines={1}>
                        {truncateText(event.venue, 28)}
                      </Text>
                    </View>

                    {total > 0 && (
                      <View style={styles.eventProgress}>
                        <ProgressBar
                          value={packed}
                          total={total}
                          color={Colors.primary[500]}
                          showLabel
                          label="Packed"
                          height={4}
                        />
                      </View>
                    )}
                  </View>

                  {/* Right column */}
                  <View style={styles.eventRight}>
                    <Badge label={event.status} variant="status" />
                    <View style={[styles.daysChip, isUrgent && styles.daysChipUrgent]}>
                      <Text style={[styles.daysLabel, isUrgent && styles.daysLabelUrgent]}>
                        {daysLabel}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Pending Purchases Preview */}
        {pendingPurchases.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionDot, { backgroundColor: Colors.amber[500] }]} />
                <Text style={styles.sectionTitle}>Pending Purchases</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Purchases')}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAll}>View all</Text>
                <Ionicons name="chevron-forward" size={12} color={Colors.primary[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.purchaseCard}>
              {pendingPurchases.map((item, idx) => (
                <View key={item.id}>
                  <View style={styles.purchaseRow}>
                    <View style={[styles.purchaseDot, { backgroundColor: Colors.amber[400] }]} />
                    <View style={styles.purchaseInfo}>
                      <Text style={styles.purchaseName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.purchaseMeta}>
                        {item.qtyNeeded} {item.unit} · {item.supplier}
                      </Text>
                    </View>
                    <Badge label={item.category} variant="category" />
                  </View>
                  {idx < pendingPurchases.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary[800],
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  heroBanner: {
    backgroundColor: Colors.primary[800],
    overflow: 'hidden',
  },
  heroDecorTL: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroDecorBR: {
    position: 'absolute',
    bottom: 20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  totalBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  totalNum: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    lineHeight: 32,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Rainbow strip
  rainbowStrip: {
    flexDirection: 'row',
    height: 5,
  },
  rainbowSegment: {
    flex: 1,
  },

  // ─── Stats grid ───────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadow.xs,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statNum: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 1,
  },

  // ─── Quick row ────────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfo: {
    flex: 1,
  },
  quickNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  quickLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },

  // ─── Sections ─────────────────────────────────────────────────────────────
  section: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[600],
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },

  // ─── Event card ───────────────────────────────────────────────────────────
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    ...Shadow.sm,
  },
  eventDateBox: {
    width: 46,
    minHeight: 52,
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[100],
    paddingVertical: Spacing.xs,
  },
  eventDateDay: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    color: Colors.primary[700],
    lineHeight: 26,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  eventClient: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  eventVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  eventVenueText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  eventProgress: {
    marginTop: Spacing.xs,
  },
  eventRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  daysChip: {
    backgroundColor: Colors.slate[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  daysChipUrgent: {
    backgroundColor: Colors.rose[50],
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  daysLabelUrgent: {
    color: Colors.rose[500],
  },

  // ─── Purchase preview ─────────────────────────────────────────────────────
  purchaseCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    ...Shadow.xs,
  },
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  purchaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  purchaseMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
