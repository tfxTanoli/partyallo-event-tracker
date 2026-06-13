import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Palette } from '../../constants/colors';
import { useThemedStyles } from '../../context/ThemeContext';
import { Radius, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeKey: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export function FilterTabs({ tabs, activeKey, onSelect, style }: FilterTabsProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {tab.count !== undefined && (
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.slate[100],
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary[600],
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: Colors.slate[200],
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: Colors.primary[700],
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  countTextActive: {
    color: Colors.white,
  },
});
