import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AppHeader } from '../../components/common/AppHeader';
import { CatalogStackParamList, LiveStation, LiveStationCategory, PackingItem, PackingItemCategory } from '../../types';
import { generateId } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<CatalogStackParamList, 'StationForm'>;
type RouteType = RouteProp<CatalogStackParamList, 'StationForm'>;

const CATEGORIES: LiveStationCategory[] = [
  'Food Live Station',
  'Drinks Live Station',
  'Desserts Live Station',
  'Party Package',
  'Craft Workshop',
  'Others',
];

const ITEM_CATEGORIES: PackingItemCategory[] = ['default', 'Live station', 'Fresh food', 'Others'];

export function StationFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { stations, createStation, updateStation } = useApp();
  const isEdit = !!route.params?.stationId;
  const existing = isEdit ? stations.find((s) => s.id === route.params!.stationId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<LiveStationCategory>(existing?.category ?? 'Food Live Station');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [powerRequired, setPowerRequired] = useState(existing?.powerRequired ?? '');
  const [helperCount, setHelperCount] = useState(String(existing?.helperCount ?? 1));
  const [packingList, setPackingList] = useState<PackingItem[]>(
    existing?.defaultPackingList ?? []
  );

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemCategory, setNewItemCategory] = useState<PackingItemCategory>('default');
  const [newItemFixed, setNewItemFixed] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Missing field', 'Please enter an item name.');
      return;
    }
    const qty = parseFloat(newItemQty) || 1;
    setPackingList((prev) => [
      ...prev,
      {
        id: `item-${generateId()}`,
        name: newItemName.trim(),
        qty,
        baseQty: qty,
        unit: newItemUnit || 'pcs',
        category: newItemCategory,
        isPacked: false,
        isLoaded: false,
        isFixed: newItemFixed,
        isToPack: true,
      },
    ]);
    setNewItemName('');
    setNewItemQty('1');
  };

  const removeItem = (id: string) => setPackingList((prev) => prev.filter((i) => i.id !== id));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Station name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      category,
      description: description.trim(),
      powerRequired: powerRequired.trim(),
      helperCount: parseInt(helperCount, 10) || 1,
      defaultPackingList: packingList,
    };
    if (isEdit && existing) {
      updateStation({ ...existing, ...payload });
    } else {
      createStation(payload);
    }
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader
        title={isEdit ? 'Edit Station' : 'New Station'}
        subtitle={isEdit ? existing?.name : 'Create a reusable template'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Station Info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Station Details</Text>
          <Input label="Station Name" value={name} onChangeText={setName} placeholder="e.g. Hotdog Bun" error={errors.name} required />
          <Input label="Description" value={description} onChangeText={setDescription} placeholder="Describe this live station…" multiline numberOfLines={3} />
          <View style={styles.row2}>
            <Input label="Power Required" value={powerRequired} onChangeText={setPowerRequired} placeholder="13A / None" containerStyle={styles.flex1} />
            <Input label="Helpers" value={helperCount} onChangeText={setHelperCount} keyboardType="numeric" containerStyle={styles.helperField} />
          </View>
        </Card>

        {/* Category */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.catOption, category === cat && styles.catOptionActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.catOptionText, category === cat && styles.catOptionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Packing List */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Default Packing List ({packingList.length} items)</Text>

          {packingList.length > 0 && (
            <View style={styles.itemsList}>
              {packingList.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.baseQty} {item.unit} · {item.category} · {item.isFixed ? 'Fixed' : 'Scaled'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={20} color={Colors.rose[400]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add item form */}
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add Item</Text>
            <Input label="Item Name" value={newItemName} onChangeText={setNewItemName} placeholder="e.g. Hotdog buns" containerStyle={styles.noMargin} />
            <View style={styles.row2}>
              <Input label="Qty" value={newItemQty} onChangeText={setNewItemQty} keyboardType="numeric" containerStyle={styles.qtyField} />
              <Input label="Unit" value={newItemUnit} onChangeText={setNewItemUnit} placeholder="pcs" containerStyle={styles.flex1} />
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
              <View style={styles.catRow}>
                {ITEM_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewItemCategory(cat)}
                    style={[styles.itemCatChip, newItemCategory === cat && styles.itemCatChipActive]}
                  >
                    <Text style={[styles.itemCatText, newItemCategory === cat && styles.itemCatTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.fixedRow}>
              <Text style={styles.fieldLabel}>Quantity type</Text>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggleBtn, newItemFixed && styles.toggleBtnActive]}
                  onPress={() => setNewItemFixed(true)}
                >
                  <Text style={[styles.toggleBtnText, newItemFixed && styles.toggleBtnTextActive]}>Fixed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !newItemFixed && styles.toggleBtnActive]}
                  onPress={() => setNewItemFixed(false)}
                >
                  <Text style={[styles.toggleBtnText, !newItemFixed && styles.toggleBtnTextActive]}>Scaled</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button label="Add Item" onPress={addItem} variant="outline" size="sm" icon={<Ionicons name="add" size={14} color={Colors.primary[600]} />} />
          </View>
        </Card>

        {/* Save */}
        <View style={styles.saveRow}>
          <Button label="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={styles.flex1} />
          <Button label={isEdit ? 'Save Changes' : 'Create Station'} onPress={handleSave} loading={saving} style={styles.flex1} />
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['4xl'] },
  sectionCard: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  flex1: { flex: 1, marginBottom: 0 },
  helperField: { width: 80, marginBottom: 0 },
  qtyField: { width: 80, marginBottom: 0 },
  noMargin: { marginBottom: 0 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, borderRadius: Radius.full, backgroundColor: Colors.slate[100], borderWidth: 1.5, borderColor: Colors.transparent },
  catOptionActive: { backgroundColor: Colors.primary[50], borderColor: Colors.primary[500] },
  catOptionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  catOptionTextActive: { color: Colors.primary[700] },

  itemsList: { gap: Spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, backgroundColor: Colors.slate[50], borderRadius: Radius.md, gap: Spacing.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  itemMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

  addForm: { padding: Spacing.md, backgroundColor: Colors.slate[50], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', gap: Spacing.sm },
  addFormTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  catRow: { flexDirection: 'row', gap: Spacing.xs },
  itemCatChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.slate[200] },
  itemCatChipActive: { backgroundColor: Colors.primary[600] },
  itemCatText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  itemCatTextActive: { color: Colors.white },
  fixedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleGroup: { flexDirection: 'row', gap: Spacing.xs },
  toggleBtn: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.slate[200] },
  toggleBtnActive: { backgroundColor: Colors.primary[600] },
  toggleBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  toggleBtnTextActive: { color: Colors.white },

  saveRow: { flexDirection: 'row', gap: Spacing.sm },
});
