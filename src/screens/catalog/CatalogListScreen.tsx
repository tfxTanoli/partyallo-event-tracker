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
import { Colors, Palette, CategoryColors } from '../../constants/colors';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterTabs } from '../../components/common/FilterTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CatalogStackParamList, LiveStation } from '../../types';
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

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Food Live Station': 'fast-food-outline',
  'Drinks Live Station': 'wine-outline',
  'Desserts Live Station': 'ice-cream-outline',
  'Party Package': 'balloon-outline',
  'Craft Workshop': 'color-palette-outline',
  Others: 'storefront-outline',
};

export function CatalogListScreen() {
  const { colors: Colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
      defaultPackingList: station.defaultPackingList.map((i) => ({
        ...i,
        id: `clone-${generateId()}`,
      })),
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
    const catColors = CategoryColors[station.category] ?? {
      bg: Colors.slate[100],
      text: Colors.slate[600],
    };
    const catIcon =
      CATEGORY_ICONS[station.category] ?? 'storefront-outline';

    return (
      <View style={styles.card}>
        {/* Category colour bar */}
        <View style={[styles.categoryBar, { backgroundColor: catColors.text }]} />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.catIconWrap, { backgroundColor: catColors.bg }]}>
                <Ionicons name={catIcon} size={18} color={catColors.text} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.stationName}>{station.name}</Text>
                <Badge label={station.category} variant="category" />
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() =>
                  navigation.navigate('StationForm', { stationId: station.id })
                }
              >
                <Ionicons name="create-outline" size={15} color={Colors.primary[600]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: Colors.sky[50], borderColor: Colors.sky[100] }]}
                onPress={() => handleClone(station)}
              >
                <Ionicons name="copy-outline" size={15} color={Colors.sky[600]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconBtnDanger]}
                onPress={() => setDeleteTarget(station.id)}
              >
                <Ionicons name="trash-outline" size={15} color={Colors.rose[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {station.description ? (
            <Text
              style={styles.description}
              numberOfLines={isOpen ? undefined : 2}
            >
              {station.description}
            </Text>
          ) : null}

          {/* Meta chips */}
          <View style={styles.metaChips}>
            <View style={styles.metaChip}>
              <Ionicons name="flash-outline" size={11} color={Colors.amber[600]} />
              <Text style={styles.metaChipText}>
                {station.powerRequired || 'No power'}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={11} color={Colors.sky[600]} />
              <Text style={styles.metaChipText}>
                {station.helperCount} helper
                {station.helperCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="list-outline" size={11} color={Colors.primary[600]} />
              <Text style={styles.metaChipText}>
                {station.defaultPackingList.length} items
              </Text>
            </View>
          </View>

          {/* Expand toggle */}
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpanded(isOpen ? null : station.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandBtnText}>
              {isOpen ? 'Hide packing list' : 'Show packing list'}
            </Text>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.primary[600]}
            />
          </TouchableOpacity>

          {/* Packing list (expanded) */}
          {isOpen && (
            <View style={styles.packingList}>
              {station.defaultPackingList.map((item) => (
                <View key={item.id} style={styles.packingItem}>
                  <View style={[styles.packingBullet, { backgroundColor: catColors.text }]} />
                  <Text style={styles.packingItemText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.packingItemQty}>
                    {item.baseQty} {item.unit}
                  </Text>
                  <View
                    style={[
                      styles.packingItemTag,
                      item.isFixed
                        ? styles.packingItemTagFixed
                        : styles.packingItemTagScaled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.packingItemTagText,
                        item.isFixed
                          ? styles.packingItemTagTextFixed
                          : styles.packingItemTagTextScaled,
                      ]}
                    >
                      {item.isFixed ? 'Fixed' : 'Scaled'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Station Catalog</Text>
            <Text style={styles.headerSub}>
              {stations.length} station template
              {stations.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            label="New Station"
            onPress={() => navigation.navigate('StationForm', {})}
            size="sm"
            icon={<Ionicons name="add" size={15} color={Colors.white} />}
          />
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search stations…"
        />
        <FilterTabs
          tabs={tabsWithCounts}
          activeKey={catFilter}
          onSelect={setCatFilter}
        />
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
            description={
              search
                ? 'Try a different search.'
                : 'Create reusable station templates to use in your events.'
            }
            actionLabel={search ? undefined : 'Create Station'}
            onAction={
              search ? undefined : () => navigation.navigate('StationForm', {})
            }
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

const makeStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

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
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },

  // ─── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  categoryBar: { width: 4 },
  cardContent: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: { flexDirection: 'row', gap: Spacing.sm, flex: 1 },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBlock: { flex: 1, gap: 4 },
  stationName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaChips: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.slate[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  metaChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  cardActions: { flexDirection: 'row', gap: Spacing.xs, marginLeft: Spacing.xs },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
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

  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
  },

  packingList: {
    gap: 6,
    backgroundColor: Colors.slate[50],
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  packingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  packingItemText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  packingItemQty: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.semibold,
  },
  packingItemTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  packingItemTagFixed: { backgroundColor: Colors.slate[200] },
  packingItemTagScaled: { backgroundColor: Colors.primary[50] },
  packingItemTagText: { fontSize: 10, fontWeight: FontWeight.semibold },
  packingItemTagTextFixed: { color: Colors.textMuted },
  packingItemTagTextScaled: { color: Colors.primary[600] },
});
