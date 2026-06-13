import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useApp } from '../../context/AppContext';
import { Colors, Palette } from '../../constants/colors';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { AppHeader } from '../../components/common/AppHeader';
import { EventsStackParamList, Event, PackingItem, EventStatus, PackingItemCategory } from '../../types';
import { generateId } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<EventsStackParamList, 'EventForm'>;
type RouteType = RouteProp<EventsStackParamList, 'EventForm'>;

const STATUS_OPTIONS: EventStatus[] = ['Planning', 'Packing', 'In progress', 'Completed'];
const CATEGORY_OPTIONS: PackingItemCategory[] = ['default', 'Live station', 'Fresh food', 'Others'];

const EMPTY_ITEM: Omit<PackingItem, 'id'> = {
  name: '',
  qty: 1,
  unit: 'pcs',
  category: 'default',
  isPacked: false,
  isLoaded: false,
  isFixed: true,
  baseQty: 1,
  isToPack: true,
};

export function EventFormScreen() {
  const { colors: Colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { events, stations, createEvent, updateEvent } = useApp();
  const isEdit = !!route.params?.eventId;
  const existingEvent = isEdit ? events.find((e) => e.id === route.params!.eventId) : undefined;

  // Form state
  const [eventName, setEventName] = useState(existingEvent?.eventName ?? '');
  const [clientName, setClientName] = useState(existingEvent?.clientName ?? '');
  const [venue, setVenue] = useState(existingEvent?.venue ?? '');
  const [date, setDate] = useState(existingEvent?.date ?? '');
  const [startTime, setStartTime] = useState(existingEvent?.startTime ?? '');
  const [endTime, setEndTime] = useState(existingEvent?.endTime ?? '');
  const [setupTime, setSetupTime] = useState(existingEvent?.setupTime ?? '');
  const [servings, setServings] = useState(String(existingEvent?.servings ?? 100));
  const [notes, setNotes] = useState(existingEvent?.notes ?? '');
  const [status, setStatus] = useState<EventStatus>(existingEvent?.status ?? 'Planning');
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>(existingEvent?.assignedStationIds ?? []);

  // Custom item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemCategory, setNewItemCategory] = useState<PackingItemCategory>('default');
  const [newItemFixed, setNewItemFixed] = useState(true);
  const [customItems, setCustomItems] = useState<PackingItem[]>(
    existingEvent?.packingList.filter((i) => !i.stationName) ?? []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const toggleStation = (stationId: string) => {
    setSelectedStationIds((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const addCustomItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Missing field', 'Please enter an item name.');
      return;
    }
    const qty = parseFloat(newItemQty) || 1;
    const item: PackingItem = {
      id: `custom-${generateId()}`,
      name: newItemName.trim(),
      qty,
      baseQty: qty,
      unit: newItemUnit || 'pcs',
      category: newItemCategory,
      isPacked: false,
      isLoaded: false,
      isFixed: newItemFixed,
      isToPack: true,
    };
    setCustomItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemQty('1');
  };

  const removeCustomItem = (id: string) => setCustomItems((prev) => prev.filter((i) => i.id !== id));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!eventName.trim()) errs.eventName = 'Event name is required';
    if (!clientName.trim()) errs.clientName = 'Client name is required';
    if (!venue.trim()) errs.venue = 'Venue is required';
    if (!date.trim()) errs.date = 'Date is required (YYYY-MM-DD)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPackingList = (): PackingItem[] => {
    const stationItems: PackingItem[] = selectedStationIds.flatMap((stId) => {
      const station = stations.find((s) => s.id === stId);
      if (!station) return [];
      return station.defaultPackingList.map((item) => ({
        ...item,
        id: `${stId}-${item.id}-${generateId()}`,
        stationName: station.name,
        isPacked: false,
        isLoaded: false,
        packedBy: undefined,
        packedAt: undefined,
      }));
    });
    return [...stationItems, ...customItems];
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const packingList = isEdit
        ? existingEvent!.packingList
        : buildPackingList();

      const payload = {
        eventName: eventName.trim(),
        clientName: clientName.trim(),
        venue: venue.trim(),
        date: date.trim(),
        startTime,
        endTime,
        setupTime,
        servings: parseInt(servings, 10) || 100,
        status,
        assignedStationIds: selectedStationIds,
        packingList,
        notes: notes.trim(),
        stationServings: existingEvent?.stationServings ?? {},
        categoryPackedIn: existingEvent?.categoryPackedIn ?? {},
      };

      if (isEdit && existingEvent) {
        updateEvent({ ...existingEvent, ...payload });
      } else {
        createEvent(payload);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <AppHeader
        title={isEdit ? 'Edit Event' : 'New Event'}
        subtitle={isEdit ? existingEvent?.eventName : 'Fill in the event details'}
        onBack={() => navigation.goBack()}
        actions={[]}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Event Details */}
        <SectionCard title="Event Details" icon="calendar-outline">
          <Input label="Event Name" value={eventName} onChangeText={setEventName} placeholder="e.g. Sarah's Birthday Party" error={errors.eventName} required />
          <Input label="Client Name" value={clientName} onChangeText={setClientName} placeholder="e.g. Sarah Tan" error={errors.clientName} required />
          <Input label="Venue" value={venue} onChangeText={setVenue} placeholder="e.g. The Grand Ballroom" error={errors.venue} required />
          <View style={styles.row2}>
            <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2025-08-15" error={errors.date} required containerStyle={styles.flex1} keyboardType="numeric" />
            <Input label="Servings (pax)" value={servings} onChangeText={setServings} placeholder="100" keyboardType="numeric" containerStyle={styles.half} />
          </View>
          <View style={styles.row2}>
            <Input label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="14:00" containerStyle={styles.flex1} />
            <Input label="End Time" value={endTime} onChangeText={setEndTime} placeholder="18:00" containerStyle={styles.flex1} />
            <Input label="Setup" value={setupTime} onChangeText={setSetupTime} placeholder="12:00" containerStyle={styles.flex1} />
          </View>
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Special instructions, dietary notes…" multiline numberOfLines={3} />
        </SectionCard>

        {/* Status */}
        <SectionCard title="Event Status" icon="flag-outline">
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.statusChip, status === s && styles.statusChipActive]}
                activeOpacity={0.7}
              >
                <Badge label={s} variant="status" />
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Station Selector */}
        <SectionCard title="Live Stations" icon="storefront-outline">
          {stations.length === 0 ? (
            <Text style={styles.hint}>No stations in catalog. Go to Catalog to create stations.</Text>
          ) : (
            <View style={styles.stationGrid}>
              {stations.map((station) => {
                const isSelected = selectedStationIds.includes(station.id);
                return (
                  <TouchableOpacity
                    key={station.id}
                    onPress={() => toggleStation(station.id)}
                    style={[styles.stationChip, isSelected && styles.stationChipActive]}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.stationChipIcon, isSelected && styles.stationChipIconActive]}>
                      {isSelected
                        ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                        : <Ionicons name="add" size={12} color={Colors.textMuted} />}
                    </View>
                    <Text style={[styles.stationChipText, isSelected && styles.stationChipTextActive]} numberOfLines={2}>
                      {station.name}
                    </Text>
                    <Badge label={station.category} variant="category" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {selectedStationIds.length > 0 && (
            <View style={styles.selectedInfo}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.primary[600]} />
              <Text style={styles.selectedInfoText}>{selectedStationIds.length} station{selectedStationIds.length !== 1 ? 's' : ''} selected</Text>
            </View>
          )}
        </SectionCard>

        {/* Custom Packing Items */}
        <SectionCard title="Custom Packing Items" icon="cube-outline">
          {customItems.length > 0 && (
            <View style={styles.customItemsList}>
              {customItems.map((item) => (
                <View key={item.id} style={styles.customItemRow}>
                  <View style={styles.customItemInfo}>
                    <Text style={styles.customItemName}>{item.name}</Text>
                    <Text style={styles.customItemMeta}>{item.qty} {item.unit} · {item.category} · {item.isFixed ? 'Fixed' : 'Scaled'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCustomItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={Colors.rose[400]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.addItemForm}>
            <Input label="Item Name" value={newItemName} onChangeText={setNewItemName} placeholder="e.g. Extra napkins" containerStyle={styles.noMargin} />
            <View style={styles.row2}>
              <Input label="Qty" value={newItemQty} onChangeText={setNewItemQty} keyboardType="numeric" containerStyle={styles.qtyField} />
              <Input label="Unit" value={newItemUnit} onChangeText={setNewItemUnit} placeholder="pcs" containerStyle={styles.unitField} />
            </View>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setNewItemCategory(cat)} style={[styles.catChip, newItemCategory === cat && styles.catChipActive]}>
                  <Text style={[styles.catChipText, newItemCategory === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.fixedRow}>
              <Text style={styles.fieldLabel}>Fixed Quantity (doesn't scale with servings)</Text>
              <Switch value={newItemFixed} onValueChange={setNewItemFixed} trackColor={{ true: Colors.primary[500] }} />
            </View>
            <Button label="Add Item" onPress={addCustomItem} variant="outline" size="sm" icon={<Ionicons name="add" size={14} color={Colors.primary[600]} />} />
          </View>
        </SectionCard>

        {/* Save */}
        <View style={styles.saveRow}>
          <Button label="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={styles.flex1} />
          <Button label={isEdit ? 'Save Changes' : 'Create Event'} onPress={handleSave} loading={saving} style={styles.flex1} />
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) {
  const { colors: Colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={15} color={Colors.primary[600]} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing['4xl'] },

  sectionCard: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },

  row2: { flexDirection: 'row', gap: Spacing.sm },
  flex1: { flex: 1, marginBottom: 0 },
  half: { width: 100, marginBottom: 0 },
  noMargin: { marginBottom: 0 },
  qtyField: { width: 70, marginBottom: 0 },
  unitField: { width: 80, marginBottom: 0 },

  hint: { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic' },

  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusChip: { padding: 2, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.transparent },
  statusChipActive: { borderColor: Colors.primary[500] },

  stationGrid: { gap: Spacing.sm },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  stationChipActive: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[50] },
  stationChipIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.slate[100], alignItems: 'center', justifyContent: 'center' },
  stationChipIconActive: { backgroundColor: Colors.primary[600] },
  stationChipText: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  stationChipTextActive: { color: Colors.primary[700] },
  selectedInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  selectedInfoText: { fontSize: FontSize.sm, color: Colors.primary[600], fontWeight: FontWeight.medium },

  customItemsList: { gap: Spacing.sm, marginBottom: Spacing.sm },
  customItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.slate[50], borderRadius: Radius.md },
  customItemInfo: { flex: 1 },
  customItemName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  customItemMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },

  addItemForm: { gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.slate[50], borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  catRow: { gap: Spacing.xs },
  catChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.slate[100] },
  catChipActive: { backgroundColor: Colors.primary[600] },
  catChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white },
  fixedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  saveRow: { flexDirection: 'row', gap: Spacing.sm },
});
