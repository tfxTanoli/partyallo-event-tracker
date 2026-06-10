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
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { RootTabParamList, EventStatus } from '../../types';
import {
  formatDate,
  formatTime,
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
}> = [
  { status: 'Planning', icon: 'calendar-outline', color: Colors.sky[600], bg: Colors.sky[50] },
  { status: 'Packing', icon: 'cube-outline', color: '#7c3aed', bg: '#f5f3ff' },
  { status: 'In progress', icon: 'play-circle-outline', color: Colors.amber[600], bg: Colors.amber[50] },
  { status: 'Completed', icon: 'checkmark-circle-outline', color: Colors.emerald[600], bg: Colors.emerald[50] },
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.logoMark}>
              <Ionicons name="sparkles" size={18} color={Colors.white} />
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

        {/* KPI Stats */}
        <View style={styles.statsGrid}>
          {STAT_CONFIG.map(({ status, icon, color, bg }) => (
            <View key={status} style={[styles.statCard, { backgroundColor: bg, borderColor: color + '33' }]}>
              <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={[styles.statNum, { color }]}>{stats[status]}</Text>
              <Text style={styles.statLabel}>{status}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="calendar-outline"
                title="No upcoming events"
                description="Create your first event to get started."
                actionLabel="Go to Events"
                onAction={() => navigation.navigate('Events')}
              />
            </Card>
          ) : (
            upcomingEvents.map((event) => {
              const { packed, total } = getEventProgress(event);
              const days = getDaysUntilEvent(event.date);
              const daysLabel =
                days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 0 ? `${Math.abs(days)}d ago` : `In ${days}d`;

              return (
                <Card key={event.id} style={styles.eventCard}>
                  <TouchableOpacity onPress={() => handleEventPress(event.id)} activeOpacity={0.8}>
                    <View style={styles.eventCardHeader}>
                      <View style={styles.eventDateBox}>
                        <Text style={styles.eventDateDay}>
                          {new Date(event.date).getDate()}
                        </Text>
                        <Text style={styles.eventDateMonth}>
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventName} numberOfLines={1}>
                          {event.eventName}
                        </Text>
                        <Text style={styles.eventClient} numberOfLines={1}>
                          {event.clientName}
                        </Text>
                        <View style={styles.eventMeta}>
                          <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                          <Text style={styles.eventMetaText} numberOfLines={1}>
                            {truncateText(event.venue, 30)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.eventRight}>
                        <Badge label={event.status} variant="status" />
                        <Text style={[styles.daysLabel, days <= 1 && days >= 0 && styles.daysUrgent]}>
                          {daysLabel}
                        </Text>
                      </View>
                    </View>

                    {total > 0 && (
                      <View style={styles.progressSection}>
                        <ProgressBar
                          value={packed}
                          total={total}
                          color={Colors.primary[500]}
                          showLabel
                          label="Packing"
                          height={5}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickRow}>
          <Card style={styles.quickCard} padding={Spacing.md}>
            <View style={styles.quickCardInner}>
              <View style={[styles.quickIcon, { backgroundColor: Colors.violet[50] }]}>
                <Ionicons name="storefront-outline" size={18} color="#7c3aed" />
              </View>
              <View>
                <Text style={styles.quickNum}>{stations.length}</Text>
                <Text style={styles.quickLabel}>Stations</Text>
              </View>
            </View>
          </Card>
          <Card style={styles.quickCard} padding={Spacing.md}>
            <View style={styles.quickCardInner}>
              <View style={[styles.quickIcon, { backgroundColor: Colors.amber[50] }]}>
                <Ionicons name="cart-outline" size={18} color={Colors.amber[600]} />
              </View>
              <View>
                <Text style={styles.quickNum}>{purchases.filter((p) => !p.purchased).length}</Text>
                <Text style={styles.quickLabel}>To Buy</Text>
              </View>
            </View>
          </Card>
          <Card style={styles.quickCard} padding={Spacing.md}>
            <TouchableOpacity onPress={() => navigation.navigate('Purchases')} activeOpacity={0.8}>
              <View style={styles.quickCardInner}>
                <View style={[styles.quickIcon, { backgroundColor: Colors.emerald[50] }]}>
                  <Ionicons name="checkmark-done-outline" size={18} color={Colors.emerald[600]} />
                </View>
                <View>
                  <Text style={styles.quickNum}>{totalPurchasePct}%</Text>
                  <Text style={styles.quickLabel}>Fulfilled</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Purchase Preview */}
        {pendingPurchases.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Purchases</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Purchases')}>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <Card>
              {pendingPurchases.map((item, idx) => (
                <View key={item.id}>
                  <View style={styles.purchaseRow}>
                    <View style={styles.purchaseDot} />
                    <View style={styles.purchaseInfo}>
                      <Text style={styles.purchaseName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.purchaseMeta}>
                        {item.qtyNeeded} {item.unit} · {item.supplier}
                      </Text>
                    </View>
                    <Badge label={item.category} variant="category" />
                  </View>
                  {idx < pendingPurchases.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </Card>
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
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
  },

  // Hero
  heroBanner: {
    backgroundColor: Colors.primary[700],
    borderRadius: Radius['2xl'],
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.md,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  heroSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  totalBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  totalNum: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  totalLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadow.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNum: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: 30,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Sections
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[600],
  },
  emptyCard: {},

  // Event card
  eventCard: {
    marginBottom: Spacing.xs,
  },
  eventCardHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  eventDateBox: {
    width: 44,
    height: 50,
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  eventDateDay: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
    lineHeight: 24,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[500],
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  eventClient: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  eventMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  eventRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  daysLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  daysUrgent: {
    color: Colors.rose[500],
  },
  progressSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  // Quick row
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickCard: {
    flex: 1,
  },
  quickCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNum: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },

  // Purchase preview
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  purchaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amber[400],
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
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
