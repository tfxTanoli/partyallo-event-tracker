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
import { Colors, CategoryColors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterTabs } from '../../components/common/FilterTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CatalogStackParamList, LiveStation, LiveStationCategory } from '../../types';
import { generateId } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<CatalogStackParamList, 'CatalogList'>;

const CATEGORY_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Food Live Station', label: 'Food' },
  { key: 'Drinks Live Station', label: 'Drinks' },
  { key: 'Desserts Live Station', label: 'Desserts' },
  { key: 'Party Package', label: 'Party' },
  { key: 'Craft Workshop', label: 'Craft' },
  { key: 'Others', label: 'Others' },
];

export function CatalogListScreen() {
  const navigation = useNavigation<Nav>();
  const { stations, deleteStation, createStation } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const tabsWithCounts = CATEGORY_TABS.map((t) => ({
    ...t,
    count:
      t.key === 'All'
        ? stations.length
        : stations.filter((s) => s.category === t.key).length,
  }));

  const filtered = useMemo(() => {
    let list = stations;
    if (catFilter !== 'All') list = list.filter((s) => s.category === catFilter);
    if (search.trim())
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.description ?? '').toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [stations, search, catFilter]);

  const handleClone = (station: LiveStation) => {
    createStation({
      name: `${station.name} (Copy)`,
      category: station.category,
      description: station.description,
      defaultPackingList: station.defaultPackingList.map((i) => ({ ...i, id: `clone-${generateId()}` })),
      powerRequired: station.powerRequired,
      helperCount: station.helperCount,
    });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteStation(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const renderStation = ({ item: station }: { item: LiveStation }) => {
    const isOpen = expanded === station.id;
    const catColors = CategoryColors[station.category] ?? { bg: Colors.slate[100], text: Colors.slate[600] };

    return (
      <Card style={styles.card}>
        {/* Category colour bar */}
        <View style={[styles.categoryBar, { backgroundColor: catColors.text }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.catIcon, { backgroundColor: catColors.bg }]}>
                <Ionicons name="storefront-outline" size={16} color={catColors.text} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.stationName}>{station.name}</Text>
                <Badge label={station.category} variant="category" />
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('StationForm', { stationId: station.id })}>
                <Ionicons name="create-outline" size={16} color={Colors.primary[600]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleClone(station)}>
                <Ionicons name="copy-outline" size={16} color={Colors.sky[600]} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => setDeleteTarget(station.id)}>
                <Ionicons name="trash-outline" size={16} color={Colors.rose[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {station.description ? (
            <Text style={styles.description} numberOfLines={isOpen ? undefined : 2}>{station.description}</Text>
          ) : null}

          {/* Meta chips */}
          <View style={styles.metaChips}>
            <View style={styles.metaChip}>
              <Ionicons name="flash-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{station.powerRequired || 'No power'}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{station.helperCount} helper{station.helperCount !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="list-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.metaChipText}>{station.defaultPackingList.length} items</Text>
            </View>
          </View>

          {/* Expand toggle */}
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpanded(isOpen ? null : station.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandBtnText}>{isOpen ? 'Hide items' : 'Show packing list'}</Text>
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.primary[600]} />
          </TouchableOpacity>

          {/* Packing list */}
          {isOpen && (
            <View style={styles.packingList}>
              {station.defaultPackingList.map((item, idx) => (
                <View key={item.id} style={styles.packingItem}>
                  <View style={styles.packingBullet} />
                  <Text style={styles.packingItemText} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.packingItemQty}>{item.baseQty} {item.unit}</Text>
                  <Text style={styles.packingItemFixed}>{item.isFixed ? 'Fixed' : 'Scaled'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Station Catalog</Text>
            <Text style={styles.headerSub}>{stations.length} station templates</Text>
          </View>
          <Button
            label="New Station"
            onPress={() => navigation.navigate('StationForm', {})}
            size="sm"
            icon={<Ionicons name="add" size={14} color={Colors.white} />}
          />
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search stations…" />
        <FilterTabs tabs={tabsWithCounts} activeKey={catFilter} onSelect={setCatFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderStation}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="storefront-outline"
            title={search ? 'No stations found' : 'No stations yet'}
            description={search ? 'Try a different search.' : 'Create reusable station templates to use in your events.'}
            actionLabel={search ? undefined : 'Create Station'}
            onAction={search ? undefined : () => navigation.navigate('StationForm', {})}
            style={{ marginTop: Spacing['3xl'] }}
          />
        }
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Station"
        message="Are you sure? This station template will be removed from the catalog (existing events are not affected)."
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },

  card: { overflow: 'hidden', flexDirection: 'row', padding: 0 },
  categoryBar: { width: 4 },
  cardContent: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitleBlock: { flex: 1, gap: 4 },
  stationName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  metaChips: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.slate[100], paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  metaChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  cardActions: { flexDirection: 'row', gap: Spacing.xs, marginLeft: Spacing.sm },
  iconBtn: { width: 30, height: 30, borderRadius: Radius.sm, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  iconBtnDanger: { backgroundColor: Colors.rose[50] },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandBtnText: { fontSize: FontSize.sm, color: Colors.primary[600], fontWeight: FontWeight.semibold },
  packingList: { gap: 6, backgroundColor: Colors.slate[50], padding: Spacing.sm, borderRadius: Radius.md },
  packingItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  packingBullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary[400] },
  packingItemText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  packingItemQty: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  packingItemFixed: { fontSize: FontSize.xs, color: Colors.textMuted, backgroundColor: Colors.slate[200], paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
});
