import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { Colors, CategoryColors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterTabs } from '../../components/common/FilterTabs';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ProgressBar } from '../../components/common/ProgressBar';
import { PurchaseRegistryItem, PurchaseCategory, PurchaseSupplier } from '../../types';
import { formatDate, generateId } from '../../utils/helpers';

const CATEGORIES: PurchaseCategory[] = ['Frozen', 'Room temp goods', 'Fridge'];
const SUPPLIERS: PurchaseSupplier[] = ['NTUC / SS', 'Whatsapp Supplier', 'Online purchases', 'Others'];

const SUPPLIER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'NTUC / SS': 'storefront-outline',
  'Whatsapp Supplier': 'chatbubble-ellipses-outline',
  'Online purchases': 'globe-outline',
  Others: 'ellipsis-horizontal-outline',
};

const CAT_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Frozen', label: 'Frozen' },
  { key: 'Room temp goods', label: 'Room Temp' },
  { key: 'Fridge', label: 'Fridge' },
];

const DEFAULT_FORM: Omit<PurchaseRegistryItem, 'id' | 'createdAt'> = {
  name: '',
  qtyNeeded: 1,
  unit: 'pcs',
  category: 'Room temp goods',
  supplier: 'NTUC / SS',
  requiredDate: '',
  notes: '',
  purchased: false,
};

export function PurchasesScreen() {
  const { purchases, createPurchase, updatePurchase, deletePurchase, togglePurchased } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PurchaseRegistryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabsWithCounts = CAT_TABS.map((t) => ({
    ...t,
    count: t.key === 'All' ? purchases.length : purchases.filter((p) => p.category === t.key).length,
  }));

  const filtered = useMemo(() => {
    let list = purchases;
    if (catFilter !== 'All') list = list.filter((p) => p.category === catFilter);
    if (search.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [purchases, search, catFilter]);

  const stats = useMemo(() => {
    const total = purchases.length;
    const done = purchases.filter((p) => p.purchased).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [purchases]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (item: PurchaseRegistryItem) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      qtyNeeded: item.qtyNeeded,
      unit: item.unit,
      category: item.category,
      supplier: item.supplier,
      requiredDate: item.requiredDate ?? '',
      notes: item.notes ?? '',
      purchased: item.purchased,
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Item name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editTarget) {
      updatePurchase({ ...editTarget, ...form, name: form.name.trim() });
    } else {
      createPurchase({ ...form, name: form.name.trim() });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteTarget) { deletePurchase(deleteTarget); setDeleteTarget(null); }
  };

  const updateForm = (key: keyof typeof form, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const renderItem = ({ item }: { item: PurchaseRegistryItem }) => (
    <View style={[styles.itemRow, item.purchased && styles.itemRowDone]}>
      {/* Checkbox */}
      <TouchableOpacity onPress={() => togglePurchased(item.id)} style={[styles.checkbox, item.purchased && styles.checkboxDone]} activeOpacity={0.7}>
        {item.purchased && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, item.purchased && styles.itemNameDone]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={14} color={Colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(item.id)} style={[styles.actionBtn, styles.actionBtnDanger]}>
              <Ionicons name="trash-outline" size={14} color={Colors.rose[500]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.qtyText}>{item.qtyNeeded} {item.unit}</Text>
          </View>
          <Badge label={item.category} variant="category" />
          <View style={styles.metaChip}>
            <Ionicons name={SUPPLIER_ICONS[item.supplier]} size={11} color={Colors.textMuted} />
            <Text style={styles.metaText}>{item.supplier}</Text>
          </View>
        </View>

        {item.requiredDate && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={Colors.amber[600]} />
            <Text style={styles.dateText}>By {formatDate(item.requiredDate)}</Text>
          </View>
        )}
        {item.notes && <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Purchase List</Text>
            <Text style={styles.headerSub}>{stats.done}/{stats.total} items fulfilled</Text>
          </View>
          <Button label="Add Item" onPress={openCreate} size="sm" icon={<Ionicons name="add" size={14} color={Colors.white} />} />
        </View>
        {stats.total > 0 && <ProgressBar value={stats.pct} color={Colors.emerald[500]} showLabel label="Fulfillment" height={6} />}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search items…" />
        <FilterTabs tabs={tabsWithCounts} activeKey={catFilter} onSelect={setCatFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title={search ? 'No items found' : 'No purchase items yet'}
            description={search ? 'Try a different search.' : 'Add items to your purchase registry.'}
            actionLabel={search ? undefined : 'Add Item'}
            onAction={search ? undefined : openCreate}
            style={{ marginTop: Spacing['3xl'] }}
          />
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowForm(false)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editTarget ? 'Edit Item' : 'Add Purchase Item'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input label="Item Name" value={form.name} onChangeText={(v) => updateForm('name', v)} placeholder="e.g. Fresh limes" error={errors.name} required />

              <View style={styles.row2}>
                <Input label="Qty Needed" value={String(form.qtyNeeded)} onChangeText={(v) => updateForm('qtyNeeded', parseFloat(v) || 1)} keyboardType="numeric" containerStyle={styles.flex1} />
                <Input label="Unit" value={form.unit} onChangeText={(v) => updateForm('unit', v)} placeholder="kg" containerStyle={styles.unitField} />
              </View>

              <Input label="Required Date (YYYY-MM-DD)" value={form.requiredDate ?? ''} onChangeText={(v) => updateForm('requiredDate', v)} placeholder="2025-08-15" keyboardType="numeric" />
              <Input label="Notes" value={form.notes ?? ''} onChangeText={(v) => updateForm('notes', v)} placeholder="Optional notes…" multiline numberOfLines={2} />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.optionRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => updateForm('category', cat)}
                    style={[styles.optionChip, form.category === cat && styles.optionChipActive]}
                  >
                    <Text style={[styles.optionText, form.category === cat && styles.optionTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Supplier</Text>
              <View style={styles.optionRow}>
                {SUPPLIERS.map((sup) => (
                  <TouchableOpacity
                    key={sup}
                    onPress={() => updateForm('supplier', sup)}
                    style={[styles.optionChip, form.supplier === sup && styles.optionChipActive]}
                  >
                    <Ionicons name={SUPPLIER_ICONS[sup]} size={12} color={form.supplier === sup ? Colors.white : Colors.textMuted} />
                    <Text style={[styles.optionText, form.supplier === sup && styles.optionTextActive]}>{sup}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.saveRow}>
                <Button label="Cancel" onPress={() => setShowForm(false)} variant="secondary" style={styles.flex1} />
                <Button label={editTarget ? 'Save' : 'Add Item'} onPress={handleSave} style={styles.flex1} />
              </View>

              <View style={{ height: Spacing['2xl'] }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Remove Item"
        message="Remove this item from the purchase list?"
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.white, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider, gap: Spacing.md, ...Shadow.xs },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },

  itemRow: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, flexDirection: 'row', gap: Spacing.sm, ...Shadow.xs },
  itemRowDone: { opacity: 0.65 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxDone: { backgroundColor: Colors.emerald[500], borderColor: Colors.emerald[500] },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  itemNameDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  itemActions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { width: 28, height: 28, borderRadius: Radius.sm, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  actionBtnDanger: { backgroundColor: Colors.rose[50] },
  itemMeta: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', alignItems: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.slate[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  qtyText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dateText: { fontSize: FontSize.xs, color: Colors.amber[700], fontWeight: FontWeight.medium },
  notesText: { fontSize: FontSize.xs, color: Colors.textMuted, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: 0, maxHeight: '90%' },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.slate[300], borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.base },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.slate[100], borderWidth: 1.5, borderColor: Colors.transparent },
  optionChipActive: { backgroundColor: Colors.primary[600], borderColor: Colors.primary[700] },
  optionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  optionTextActive: { color: Colors.white },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  flex1: { flex: 1, marginBottom: 0 },
  unitField: { width: 90, marginBottom: 0 },
  saveRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
});
