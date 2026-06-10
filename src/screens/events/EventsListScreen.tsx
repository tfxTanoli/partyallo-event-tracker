import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterTabs } from '../../components/common/FilterTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EventsStackParamList, Event, EventStatus } from '../../types';
import { formatDate, formatTime, getEventProgress, getDaysUntilEvent } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;

const STATUS_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Planning', label: 'Planning' },
  { key: 'Packing', label: 'Packing' },
  { key: 'In progress', label: 'In Progress' },
  { key: 'Completed', label: 'Done' },
];

export function EventsListScreen() {
  const navigation = useNavigation<Nav>();
  const { events, deleteEvent, selectEventForPacking } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const tabsWithCounts = STATUS_TABS.map((t) => ({
    ...t,
    count:
      t.key === 'All'
        ? events.length
        : events.filter((e) => e.status === t.key).length,
  }));

  const filtered = useMemo(() => {
    let list = events;
    if (statusFilter !== 'All') list = list.filter((e) => e.status === statusFilter);
    if (search.trim())
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(search.toLowerCase()) ||
          e.clientName.toLowerCase().includes(search.toLowerCase()) ||
          e.venue.toLowerCase().includes(search.toLowerCase())
      );
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, search, statusFilter]);

  const handleDelete = () => {
    if (deleteTarget) {
      deleteEvent(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handlePackNow = (event: Event) => {
    selectEventForPacking(event.id);
    // Navigate to Packing tab — done via tab navigator
  };

  const renderEvent = ({ item: event }: { item: Event }) => {
    const { packed, loaded, total } = getEventProgress(event);
    const days = getDaysUntilEvent(event.date);
    const packedPct = total > 0 ? Math.round((packed / total) * 100) : 0;
    const loadedPct = total > 0 ? Math.round((loaded / total) * 100) : 0;

    return (
      <Card style={styles.card}>
        {/* Status stripe */}
        <View style={[styles.statusStripe, { backgroundColor: StatusColors[event.status]?.text ?? Colors.slate[300] }]} />

        <View style={styles.cardContent}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.eventName} numberOfLines={1}>{event.eventName}</Text>
              <Text style={styles.clientName}>{event.clientName}</Text>
            </View>
            <Badge label={event.status} variant="status" />
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{formatTime(event.startTime)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{event.servings} pax</Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
          </View>

          {/* Stations */}
          {event.assignedStationIds.length > 0 && (
            <View style={styles.stationsRow}>
              <Ionicons name="storefront-outline" size={12} color={Colors.primary[500]} />
              <Text style={styles.stationsText}>
                {event.assignedStationIds.length} station{event.assignedStationIds.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Progress */}
          {total > 0 && (
            <View style={styles.progressBlock}>
              <ProgressBar value={packed} total={total} color={Colors.primary[500]} showLabel label="Packed" height={5} />
              <ProgressBar value={loaded} total={total} color={Colors.emerald[500]} showLabel label="Loaded" height={5} style={{ marginTop: 4 }} />
            </View>
          )}

          {/* Days chip */}
          {event.status !== 'Completed' && (
            <View style={[styles.daysChip, days < 3 && days >= 0 ? styles.daysChipUrgent : null]}>
              <Ionicons
                name="alarm-outline"
                size={11}
                color={days < 3 && days >= 0 ? Colors.rose[500] : Colors.textMuted}
              />
              <Text style={[styles.daysText, days < 3 && days >= 0 ? styles.daysTextUrgent : null]}>
                {days === 0
                  ? 'Today!'
                  : days === 1
                  ? 'Tomorrow'
                  : days < 0
                  ? `${Math.abs(days)}d overdue`
                  : `${days} days away`}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            {event.status !== 'Completed' && (
              <TouchableOpacity
                style={styles.packBtn}
                onPress={() => handlePackNow(event)}
                activeOpacity={0.8}
              >
                <Ionicons name="cube-outline" size={14} color={Colors.white} />
                <Text style={styles.packBtnText}>Pack Items</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('EventForm', { eventId: event.id })}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnDanger]}
              onPress={() => setDeleteTarget(event.id)}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.rose[500]} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Fixed header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Events</Text>
            <Text style={styles.headerSub}>{events.length} total events</Text>
          </View>
          <Button
            label="New Event"
            onPress={() => navigation.navigate('EventForm', {})}
            size="sm"
            icon={<Ionicons name="add" size={14} color={Colors.white} />}
          />
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search events, clients, venues…"
          style={styles.searchBar}
        />
        <FilterTabs tabs={tabsWithCounts} activeKey={statusFilter} onSelect={setStatusFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={search ? 'No results found' : 'No events yet'}
            description={search ? 'Try a different search term.' : 'Tap "New Event" to create your first event.'}
            actionLabel={search ? undefined : 'Create Event'}
            onAction={search ? undefined : () => navigation.navigate('EventForm', {})}
            style={{ marginTop: Spacing['3xl'] }}
          />
        }
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  searchBar: {},
  list: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },
  card: {
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 0,
  },
  statusStripe: {
    width: 4,
    borderRadius: 0,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleBlock: { flex: 1, marginRight: Spacing.sm },
  eventName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  clientName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  metaRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  stationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stationsText: { fontSize: FontSize.xs, color: Colors.primary[600], fontWeight: FontWeight.medium },
  progressBlock: { marginTop: Spacing.xs },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: Colors.slate[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 2,
  },
  daysChipUrgent: { backgroundColor: Colors.rose[50] },
  daysText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  daysTextUrgent: { color: Colors.rose[500] },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  packBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.lg,
  },
  packBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDanger: { backgroundColor: Colors.rose[50] },
});
