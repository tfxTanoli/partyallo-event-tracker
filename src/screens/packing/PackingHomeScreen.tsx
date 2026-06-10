import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../../context/AppContext';
import { Colors, StatusColors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterTabs } from '../../components/common/FilterTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgressBar } from '../../components/common/ProgressBar';
import { PackingStackParamList, Event } from '../../types';
import { formatDate, formatTime, getEventProgress, getDaysUntilEvent } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<PackingStackParamList, 'PackingHome'>;

const STATUS_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Packing', label: 'Packing' },
  { key: 'In progress', label: 'In Progress' },
  { key: 'Planning', label: 'Planning' },
];

export function PackingHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { events, selectedEventId, selectEventForPacking } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    let list = events.filter((e) => e.status !== 'Completed');
    if (filter !== 'All') list = list.filter((e) => e.status === filter);
    if (search.trim())
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(search.toLowerCase()) ||
          e.clientName.toLowerCase().includes(search.toLowerCase())
      );
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, search, filter]);

  const tabsWithCounts = STATUS_TABS.map((t) => ({
    ...t,
    count:
      t.key === 'All'
        ? events.filter((e) => e.status !== 'Completed').length
        : events.filter((e) => e.status === t.key).length,
  }));

  const handleSelectEvent = (event: Event) => {
    selectEventForPacking(event.id);
    navigation.navigate('StationSelector', { eventId: event.id });
  };

  const renderEvent = ({ item: event }: { item: Event }) => {
    const { packed, loaded, total } = getEventProgress(event);
    const days = getDaysUntilEvent(event.date);
    const isSelected = selectedEventId === event.id;

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => handleSelectEvent(event)}>
        <Card style={[styles.card, isSelected ? styles.cardSelected : null]}>
          <View style={[styles.statusBar, { backgroundColor: StatusColors[event.status]?.text ?? Colors.slate[300] }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={styles.datePill}>
                <Text style={styles.dateDay}>{new Date(event.date).getDate()}</Text>
                <Text style={styles.dateMonth}>{new Date(event.date).toLocaleString('default', { month: 'short' })}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName} numberOfLines={1}>{event.eventName}</Text>
                <Text style={styles.clientName}>{event.clientName}</Text>
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
                  <Text style={styles.venueText} numberOfLines={1}>{event.venue}</Text>
                </View>
              </View>
              <View style={styles.rightCol}>
                <Badge label={event.status} variant="status" />
                <View style={styles.row}>
                  <Ionicons name="storefront-outline" size={11} color={Colors.primary[500]} />
                  <Text style={styles.stationCount}>{event.assignedStationIds.length} stations</Text>
                </View>
                {days >= 0 && (
                  <Text style={[styles.daysText, days <= 2 && styles.daysUrgent]}>
                    {days === 0 ? 'TODAY' : days === 1 ? 'Tomorrow' : `${days}d away`}
                  </Text>
                )}
              </View>
            </View>

            {total > 0 && (
              <View style={styles.progressRow}>
                <ProgressBar value={packed} total={total} color={Colors.primary[500]} showLabel label="Packed" height={5} />
              </View>
            )}

            <TouchableOpacity style={styles.startBtn} onPress={() => handleSelectEvent(event)} activeOpacity={0.8}>
              <Ionicons name="cube-outline" size={15} color={Colors.white} />
              <Text style={styles.startBtnText}>Open Packing Checklist</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Packing</Text>
            <Text style={styles.headerSub}>Select an event to start packing</Text>
          </View>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search events…" />
        <FilterTabs tabs={tabsWithCounts} activeKey={filter} onSelect={setFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title={search ? 'No events found' : 'No active events'}
            description={
              search
                ? 'Try different search terms.'
                : 'Events in Planning, Packing, or In Progress status will appear here.'
            }
            style={{ marginTop: Spacing['3xl'] }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
    ...Shadow.xs,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },
  card: { overflow: 'hidden', flexDirection: 'row', padding: 0 },
  cardSelected: { borderColor: Colors.primary[400], borderWidth: 2 },
  statusBar: { width: 4 },
  cardContent: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  cardTop: { flexDirection: 'row', gap: Spacing.sm },
  datePill: { width: 44, height: 50, backgroundColor: Colors.primary[50], borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary[100] },
  dateDay: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary[700], lineHeight: 24 },
  dateMonth: { fontSize: 10, fontWeight: FontWeight.semibold, color: Colors.primary[500], textTransform: 'uppercase' },
  eventInfo: { flex: 1 },
  eventName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  clientName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  venueText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  stationCount: { fontSize: FontSize.xs, color: Colors.primary[600], fontWeight: FontWeight.medium },
  daysText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted },
  daysUrgent: { color: Colors.rose[500] },
  progressRow: {},
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  startBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white, flex: 1, textAlign: 'center' },
});
