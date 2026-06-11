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
  };

  const renderEvent = ({ item: event }: { item: Event }) => {
    const { packed, loaded, total } = getEventProgress(event);
    const days = getDaysUntilEvent(event.date);
    const isUrgent = days >= 0 && days < 3;
    const statusColor = StatusColors[event.status]?.text ?? Colors.slate[400];

    return (
      <View style={styles.card}>
        {/* Status accent stripe */}
        <View style={[styles.statusStripe, { backgroundColor: statusColor }]} />

        <View style={styles.cardContent}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.eventName} numberOfLines={1}>
                {event.eventName}
              </Text>
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
            <Text style={styles.metaText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>

          {/* Stations & days row */}
          <View style={styles.tagsRow}>
            {event.assignedStationIds.length > 0 && (
              <View style={styles.stationChip}>
                <Ionicons name="storefront-outline" size={11} color={Colors.primary[600]} />
                <Text style={styles.stationChipText}>
                  {event.assignedStationIds.length} station
                  {event.assignedStationIds.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {event.status !== 'Completed' && (
              <View style={[styles.daysChip, isUrgent && styles.daysChipUrgent]}>
                <Ionicons
                  name="alarm-outline"
                  size={10}
                  color={isUrgent ? Colors.rose[500] : Colors.textMuted}
                />
                <Text style={[styles.daysText, isUrgent && styles.daysTextUrgent]}>
                  {days === 0
                    ? 'Today!'
                    : days === 1
                    ? 'Tomorrow'
                    : days < 0
                    ? `${Math.abs(days)}d overdue`
                    : `${days}d away`}
                </Text>
              </View>
            )}
          </View>

          {/* Progress bars */}
          {total > 0 && (
            <View style={styles.progressBlock}>
              <ProgressBar
                value={packed}
                total={total}
                color={Colors.primary[500]}
                showLabel
                label="Packed"
                height={5}
              />
              <ProgressBar
                value={loaded}
                total={total}
                color={Colors.emerald[500]}
                showLabel
                label="Loaded"
                height={5}
                style={{ marginTop: 5 }}
              />
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
      </View>
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
            <Text style={styles.headerSub}>
              {events.length} total event{events.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            label="New Event"
            onPress={() => navigation.navigate('EventForm', {})}
            size="sm"
            icon={<Ionicons name="add" size={15} color={Colors.white} />}
          />
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search events, clients, venues…"
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
            description={
              search
                ? 'Try a different search term.'
                : 'Tap "New Event" to create your first event.'
            }
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

  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // ─── List ─────────────────────────────────────────────────────────────────
  list: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },

  // ─── Event card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  statusStripe: {
    width: 4,
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
  cardTitleBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  eventName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  clientName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  stationChipText: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.slate[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  daysChipUrgent: {
    backgroundColor: Colors.rose[50],
  },
  daysText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
  },
  daysTextUrgent: {
    color: Colors.rose[500],
  },
  progressBlock: {
    marginTop: Spacing.xs,
  },
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
    gap: 5,
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  packBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  iconBtnDanger: {
    backgroundColor: Colors.rose[50],
    borderColor: Colors.rose[100],
  },
});
