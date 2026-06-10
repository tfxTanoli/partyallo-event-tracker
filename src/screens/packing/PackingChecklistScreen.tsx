import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { PackingStackParamList, PackingItem, PackingItemCategory } from '../../types';
import { groupItemsByCategory, formatTimestamp, generateId } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<PackingStackParamList, 'PackingChecklist'>;
type RouteType = RouteProp<PackingStackParamList, 'PackingChecklist'>;

const CATEGORY_ORDER: PackingItemCategory[] = ['default', 'Live station', 'Fresh food', 'Others'];
const CATEGORY_LABELS: Record<string, string> = {
  default: 'General',
  'Live station': 'Live Station Equipment',
  'Fresh food': 'Fresh Food',
  Others: 'Others',
};
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  default: 'list-outline',
  'Live station': 'flash-outline',
  'Fresh food': 'leaf-outline',
  Others: 'ellipsis-horizontal-outline',
};

type FilterKey = 'all' | 'unpacked' | 'packed';

export function PackingChecklistScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { events, stations, currentPacker, setCurrentPacker, updatePackingItem, markAllPacked } = useApp();

  const event = events.find((e) => e.id === route.params.eventId);
  const station = stations.find((s) => s.id === route.params.stationId);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [packerInput, setPackerInput] = useState(currentPacker);
  const [showPackerModal, setShowPackerModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);

  const stationItems = useMemo(() => {
    if (!event || !station) return [];
    return event.packingList.filter((i) => i.stationName === station.name && i.isToPack);
  }, [event, station]);

  const filteredItems = useMemo(() => {
    if (filter === 'packed') return stationItems.filter((i) => i.isPacked);
    if (filter === 'unpacked') return stationItems.filter((i) => !i.isPacked);
    return stationItems;
  }, [stationItems, filter]);

  const grouped = useMemo(() => groupItemsByCategory(filteredItems), [filteredItems]);

  const progress = {
    packed: stationItems.filter((i) => i.isPacked).length,
    loaded: stationItems.filter((i) => i.isLoaded).length,
    total: stationItems.length,
  };

  const pct = progress.total > 0 ? Math.round((progress.packed / progress.total) * 100) : 0;

  const togglePacked = (item: PackingItem) => {
    if (!currentPacker) {
      setShowPackerModal(true);
      return;
    }
    updatePackingItem(route.params.eventId, {
      ...item,
      isPacked: !item.isPacked,
      packedBy: !item.isPacked ? currentPacker : undefined,
      packedAt: !item.isPacked ? new Date().toISOString() : undefined,
    });
  };

  const toggleLoaded = (item: PackingItem) => {
    updatePackingItem(route.params.eventId, { ...item, isLoaded: !item.isLoaded });
  };

  const handleSignIn = () => {
    if (!packerInput.trim()) return;
    setCurrentPacker(packerInput.trim());
    setShowPackerModal(false);
  };

  const handleMarkAll = () => {
    if (!currentPacker) { setShowPackerModal(true); return; }
    setShowMarkAllConfirm(true);
  };

  const confirmMarkAll = () => {
    if (station) markAllPacked(route.params.eventId, station.name);
    setShowMarkAllConfirm(false);
  };

  if (!event || !station) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader title="Packing Checklist" onBack={() => navigation.goBack()} />
        <EmptyState icon="cube-outline" title="Not found" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: PackingItem }) => (
    <View style={styles.itemRow}>
      {/* Packed checkbox */}
      <TouchableOpacity
        onPress={() => togglePacked(item)}
        style={[styles.checkbox, item.isPacked && styles.checkboxPacked]}
        activeOpacity={0.7}
      >
        {item.isPacked && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </TouchableOpacity>

      {/* Item info */}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.isPacked && styles.itemNameDone]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
          {item.packedBy && (
            <Text style={styles.packedBy}>by {item.packedBy}</Text>
          )}
        </View>
      </View>

      {/* Loaded checkbox */}
      <TouchableOpacity
        onPress={() => toggleLoaded(item)}
        style={[styles.loadedBtn, item.isLoaded && styles.loadedBtnActive]}
        activeOpacity={0.7}
      >
        <Ionicons name="car-outline" size={13} color={item.isLoaded ? Colors.white : Colors.textMuted} />
        <Text style={[styles.loadedText, item.isLoaded && styles.loadedTextActive]}>
          {item.isLoaded ? 'Loaded' : 'Load'}
        </Text>
      </TouchableOpacity>

      {/* Edit button */}
      <TouchableOpacity onPress={() => setEditingItem(item)} style={styles.editBtn}>
        <Ionicons name="create-outline" size={15} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderCategory = (cat: PackingItemCategory) => {
    const items = grouped[cat];
    if (!items || items.length === 0) return null;
    const catPacked = items.filter((i) => i.isPacked).length;

    return (
      <View key={cat} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleRow}>
            <Ionicons name={CATEGORY_ICONS[cat]} size={14} color={Colors.primary[600]} />
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[cat]}</Text>
            <View style={styles.catCountChip}>
              <Text style={styles.catCountText}>{catPacked}/{items.length}</Text>
            </View>
          </View>
          {catPacked === items.length && items.length > 0 && (
            <Ionicons name="checkmark-circle" size={16} color={Colors.emerald[500]} />
          )}
        </View>
        {items.map((item) => renderItem({ item }))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader
        title={station.name}
        subtitle={event.eventName}
        onBack={() => navigation.goBack()}
        actions={[
          {
            icon: 'person-outline',
            onPress: () => setShowPackerModal(true),
            color: currentPacker ? Colors.primary[600] : Colors.textMuted,
          },
        ]}
      />

      {/* Progress hero */}
      <View style={styles.progressHero}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPct}>{pct}%</Text>
          <Text style={styles.progressLabel}>Packed</Text>
        </View>
        <View style={styles.progressDetails}>
          <ProgressBar value={progress.packed} total={progress.total} color={Colors.primary[500]} showLabel label="Packed" height={6} />
          <ProgressBar value={progress.loaded} total={progress.total} color={Colors.emerald[500]} showLabel label="Loaded" height={6} style={{ marginTop: 6 }} />
          {currentPacker ? (
            <TouchableOpacity onPress={() => setShowPackerModal(true)} style={styles.packerChip}>
              <Ionicons name="person-circle-outline" size={14} color={Colors.primary[600]} />
              <Text style={styles.packerChipText}>{currentPacker}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowPackerModal(true)} style={styles.signInBtn}>
              <Ionicons name="person-add-outline" size={14} color={Colors.primary[600]} />
              <Text style={styles.signInText}>Sign in as packer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'unpacked', 'packed'] as FilterKey[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.filterSpacer} />
        <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
          <Ionicons name="checkmark-done-outline" size={14} color={Colors.primary[600]} />
          <Text style={styles.markAllText}>Mark All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {CATEGORY_ORDER.map(renderCategory)}

        {filteredItems.length === 0 && (
          <EmptyState
            icon="checkmark-circle-outline"
            title={filter === 'unpacked' ? 'All items packed!' : 'No items to show'}
            style={{ marginTop: Spacing['3xl'] }}
          />
        )}

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>

      {/* Packer sign-in modal */}
      <Modal transparent visible={showPackerModal} animationType="slide" onRequestClose={() => setShowPackerModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPackerModal(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{currentPacker ? 'Change Packer' : 'Sign In as Packer'}</Text>
            <Text style={styles.modalSub}>Your name will be logged with each packed item.</Text>
            <TextInput
              value={packerInput}
              onChangeText={setPackerInput}
              placeholder="Enter your name"
              style={styles.packerInput}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
            />
            <View style={styles.modalActions}>
              {currentPacker && (
                <Button label="Sign Out" onPress={() => { setCurrentPacker(''); setPackerInput(''); setShowPackerModal(false); }} variant="danger" style={styles.flex1} />
              )}
              <Button label="Confirm" onPress={handleSignIn} style={styles.flex1} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm mark all modal */}
      <Modal transparent visible={showMarkAllConfirm} animationType="fade" onRequestClose={() => setShowMarkAllConfirm(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMarkAllConfirm(false)}>
          <Pressable style={styles.confirmModal}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={Colors.primary[500]} />
            <Text style={styles.modalTitle}>Mark All Packed?</Text>
            <Text style={styles.modalSub}>This will mark all {progress.total} items as packed by {currentPacker}.</Text>
            <View style={styles.modalActions}>
              <Button label="Cancel" onPress={() => setShowMarkAllConfirm(false)} variant="secondary" style={styles.flex1} />
              <Button label="Mark All" onPress={confirmMarkAll} style={styles.flex1} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit item modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={(updated) => {
            updatePackingItem(route.params.eventId, updated);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </SafeAreaView>
  );
}

function EditItemModal({ item, onSave, onClose }: { item: PackingItem; onSave: (item: PackingItem) => void; onClose: () => void }) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.qty));
  const [unit, setUnit] = useState(item.unit);
  const [notes, setNotes] = useState(item.notes ?? '');

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Item</Text>
          <View style={editStyles.field}>
            <Text style={editStyles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={editStyles.input} placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={editStyles.row}>
            <View style={[editStyles.field, { flex: 1 }]}>
              <Text style={editStyles.label}>Qty</Text>
              <TextInput value={qty} onChangeText={setQty} style={editStyles.input} keyboardType="numeric" />
            </View>
            <View style={[editStyles.field, { flex: 1 }]}>
              <Text style={editStyles.label}>Unit</Text>
              <TextInput value={unit} onChangeText={setUnit} style={editStyles.input} />
            </View>
          </View>
          <View style={editStyles.field}>
            <Text style={editStyles.label}>Notes</Text>
            <TextInput value={notes} onChangeText={setNotes} style={[editStyles.input, editStyles.textarea]} multiline placeholder="Optional notes…" placeholderTextColor={Colors.textMuted} />
          </View>
          <View style={styles.modalActions}>
            <Button label="Cancel" onPress={onClose} variant="secondary" style={styles.flex1} />
            <Button label="Save" onPress={() => onSave({ ...item, name, qty: parseFloat(qty) || item.qty, unit, notes })} style={styles.flex1} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  field: { marginBottom: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.base, color: Colors.textPrimary, backgroundColor: Colors.white },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  progressHero: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary[50],
    borderWidth: 3,
    borderColor: Colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary[700], lineHeight: 24 },
  progressLabel: { fontSize: 9, fontWeight: FontWeight.semibold, color: Colors.primary[500], textTransform: 'uppercase' },
  progressDetails: { flex: 1, justifyContent: 'center', gap: 4 },
  packerChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary[50], paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4 },
  packerChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary[700] },
  signInBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  signInText: { fontSize: FontSize.xs, color: Colors.primary[600], fontWeight: FontWeight.semibold },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterTab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.slate[100] },
  filterTabActive: { backgroundColor: Colors.primary[600] },
  filterTabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.white },
  filterSpacer: { flex: 1 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.primary[50] },
  markAllText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary[600] },

  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 80 },

  categorySection: { gap: Spacing.xs },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  categoryTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  catCountChip: { backgroundColor: Colors.slate[100], paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.full },
  catCountText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.semibold },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  checkboxPacked: { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  itemNameDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  itemMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 1 },
  itemQty: { fontSize: FontSize.xs, color: Colors.textMuted },
  packedBy: { fontSize: FontSize.xs, color: Colors.primary[500], fontStyle: 'italic' },
  loadedBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.slate[100] },
  loadedBtnActive: { backgroundColor: Colors.emerald[500] },
  loadedText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted },
  loadedTextActive: { color: Colors.white },
  editBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.slate[100], alignItems: 'center', justifyContent: 'center' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: Spacing['3xl'], gap: Spacing.md },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.slate[300], borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  modalSub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  packerInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.xl, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  flex1: { flex: 1 },
  confirmModal: { backgroundColor: Colors.white, borderRadius: 24, padding: Spacing.xl, margin: Spacing.xl, alignItems: 'center', gap: Spacing.md, ...Shadow.lg },
});
