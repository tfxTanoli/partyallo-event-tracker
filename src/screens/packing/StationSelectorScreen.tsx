import React from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../../context/AppContext';
import { Colors, Palette, CategoryColors } from '../../constants/colors';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { AppHeader } from '../../components/common/AppHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { PackingStackParamList } from '../../types';
import { getStationProgress } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<PackingStackParamList, 'StationSelector'>;
type RouteType = RouteProp<PackingStackParamList, 'StationSelector'>;

export function StationSelectorScreen() {
  const { colors: Colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { events, stations } = useApp();

  const event = events.find((e) => e.id === route.params.eventId);
  if (!event) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Select Station" onBack={() => navigation.goBack()} />
        <EmptyState icon="calendar-outline" title="Event not found" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const eventStations = event.assignedStationIds
    .map((id) => stations.find((s) => s.id === id))
    .filter(Boolean) as typeof stations;

  const handleSelectStation = (stationId: string) => {
    navigation.navigate('PackingChecklist', { eventId: event.id, stationId });
  };

  const overallProgress = (() => {
    const total = event.packingList.filter((i) => i.isToPack).length;
    const packed = event.packingList.filter((i) => i.isPacked).length;
    const loaded = event.packingList.filter((i) => i.isLoaded).length;
    return { total, packed, loaded };
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader
        title="Select Station"
        subtitle={event.eventName}
        onBack={() => navigation.goBack()}
      />

      {/* Event summary banner */}
      <View style={styles.eventBannerWrap}>
        <View style={styles.eventBanner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerEvent} numberOfLines={1}>{event.eventName}</Text>
            <Text style={styles.bannerClient}>{event.clientName}</Text>
            <View style={styles.bannerMeta}>
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.bannerMetaText}>{event.date} · {event.startTime}</Text>
              <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.75)" />
              <Text style={styles.bannerMetaText}>{event.servings} pax</Text>
            </View>
          </View>
          <View style={styles.bannerRight}>
            <Text style={styles.bannerPackedNum}>{overallProgress.packed}</Text>
            <Text style={styles.bannerPackedLabel}>/ {overallProgress.total} packed</Text>
          </View>
        </View>
        {/* Rainbow accent strip */}
        <View style={styles.rainbowStrip}>
          {Colors.rainbow.map((color, i) => (
            <View key={i} style={[styles.rainbowSegment, { backgroundColor: color }]} />
          ))}
        </View>
      </View>

      {/* Overall progress */}
      {overallProgress.total > 0 && (
        <View style={styles.overallProgress}>
          <ProgressBar value={overallProgress.packed} total={overallProgress.total} color={Colors.primary[500]} showLabel label="Overall Packed" height={6} />
          <ProgressBar value={overallProgress.loaded} total={overallProgress.total} color={Colors.emerald[500]} showLabel label="Overall Loaded" height={6} style={{ marginTop: 6 }} />
        </View>
      )}

      <Text style={styles.listLabel}>Tap a station to open its packing list</Text>

      <FlatList
        data={eventStations}
        keyExtractor={(item) => item.id}
        renderItem={({ item: station }) => {
          const { packed, loaded, total } = getStationProgress(event.packingList, station.name);
          const catColors = CategoryColors[station.category] ?? { bg: Colors.slate[100], text: Colors.slate[600] };
          const isComplete = total > 0 && packed === total;

          return (
            <TouchableOpacity activeOpacity={0.85} onPress={() => handleSelectStation(station.id)}>
              <View style={[styles.stationCard, isComplete ? styles.stationCardComplete : null]}>
                <View style={styles.stationHeader}>
                  <View style={[styles.stationIcon, { backgroundColor: catColors.bg }]}>
                    <Ionicons
                      name={isComplete ? 'checkmark-circle' : 'storefront-outline'}
                      size={22}
                      color={isComplete ? Colors.emerald[600] : catColors.text}
                    />
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Badge label={station.category} variant="category" />
                  </View>
                  <View style={styles.stationRight}>
                    <View style={styles.stationCountChip}>
                      <Text style={styles.stationCountText}>{total} items</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </View>
                </View>

                {total > 0 && (
                  <View style={styles.stationProgress}>
                    <ProgressBar value={packed} total={total} color={isComplete ? Colors.emerald[500] : Colors.primary[500]} showLabel label="Packed" height={5} />
                    <ProgressBar value={loaded} total={total} color={Colors.emerald[500]} showLabel label="Loaded" height={5} style={{ marginTop: 4 }} />
                  </View>
                )}

                {isComplete && (
                  <View style={styles.completeBanner}>
                    <Ionicons name="checkmark-circle" size={13} color={Colors.emerald[600]} />
                    <Text style={styles.completeBannerText}>All items packed!</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="storefront-outline"
            title="No stations assigned"
            description="Edit the event to assign stations."
            style={{ marginTop: Spacing['3xl'] }}
          />
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  eventBannerWrap: {
    overflow: 'hidden',
  },
  eventBanner: {
    backgroundColor: Colors.primary[800],
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rainbowStrip: {
    flexDirection: 'row',
    height: 4,
  },
  rainbowSegment: {
    flex: 1,
  },
  bannerLeft: { flex: 1 },
  bannerEvent: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  bannerClient: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  bannerMetaText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  bannerRight: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.lg, padding: Spacing.sm, minWidth: 60 },
  bannerPackedNum: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, color: Colors.white },
  bannerPackedLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },

  overallProgress: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },

  listLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },

  stationCard: {
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  stationCardComplete: { borderColor: Colors.emerald[200], backgroundColor: Colors.emerald[50] + '44' },
  stationHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stationIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  stationInfo: { flex: 1, gap: 4 },
  stationName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  stationRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  stationCountChip: { backgroundColor: Colors.slate[100], paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  stationCountText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  stationProgress: {},
  completeBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.emerald[50], paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.md, alignSelf: 'flex-start' },
  completeBannerText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.emerald[700] },
});
