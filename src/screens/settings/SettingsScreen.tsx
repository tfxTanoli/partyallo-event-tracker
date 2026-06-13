import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppHeader } from '../../components/common/AppHeader';
import { useApp } from '../../context/AppContext';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { Palette } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';

export function SettingsScreen() {
  const { colors: Colors, themeId, themes, setThemeId } = useTheme();
  const { settings } = useApp();
  const styles = useThemedStyles(makeStyles);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <AppHeader title="Settings" subtitle="Personalise your app" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme picker */}
        <Text style={styles.sectionTitle}>App Theme</Text>
        <Text style={styles.sectionHint}>
          Choose an accent colour. Your choice applies across the whole app instantly and is
          remembered next time you open it.
        </Text>

        <View style={styles.grid}>
          {themes.map((theme) => {
            const selected = theme.id === themeId;
            return (
              <TouchableOpacity
                key={theme.id}
                activeOpacity={0.8}
                onPress={() => setThemeId(theme.id)}
                style={[
                  styles.swatchCard,
                  selected && { borderColor: theme.swatch, borderWidth: 2 },
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: theme.swatch }]}>
                  {selected && <Ionicons name="checkmark" size={20} color={Colors.white} />}
                </View>
                <Text style={[styles.swatchLabel, selected && { color: theme.swatch }]}>
                  {theme.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live preview */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewHeaderText}>{settings.companyName}</Text>
            <Text style={styles.previewHeaderSub}>{settings.appSubtitle}</Text>
          </View>
          <View style={styles.previewBody}>
            <View style={styles.previewChip}>
              <Text style={styles.previewChipText}>Accent</Text>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.previewButton}>
              <Ionicons name="cube-outline" size={16} color={Colors.white} />
              <Text style={styles.previewButtonText}>Primary Button</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerNote}>More appearance options coming soon.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    content: {
      padding: Spacing.base,
      paddingBottom: Spacing['3xl'],
    },
    sectionTitle: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      color: Colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.xs,
      marginTop: Spacing.lg,
    },
    sectionHint: {
      fontSize: FontSize.sm,
      color: Colors.textSecondary,
      marginBottom: Spacing.base,
      lineHeight: 19,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    swatchCard: {
      width: '30%',
      flexGrow: 1,
      backgroundColor: Colors.white,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingVertical: Spacing.base,
      alignItems: 'center',
      ...Shadow.xs,
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    swatchLabel: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
      color: Colors.textPrimary,
    },
    previewCard: {
      backgroundColor: Colors.white,
      borderRadius: Radius['2xl'],
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
      ...Shadow.sm,
    },
    previewHeader: {
      backgroundColor: Colors.primary[800],
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.base,
    },
    previewHeaderText: {
      color: Colors.white,
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
    },
    previewHeaderSub: {
      color: Colors.primary[200],
      fontSize: FontSize.xs,
      marginTop: 2,
    },
    previewBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      padding: Spacing.base,
    },
    previewChip: {
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[100],
      borderWidth: 1,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
    },
    previewChipText: {
      color: Colors.primary[700],
      fontSize: FontSize.sm,
      fontWeight: FontWeight.semibold,
    },
    previewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: Colors.primary[600],
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
    },
    previewButtonText: {
      color: Colors.white,
      fontSize: FontSize.base,
      fontWeight: FontWeight.semibold,
    },
    footerNote: {
      textAlign: 'center',
      color: Colors.textMuted,
      fontSize: FontSize.xs,
      marginTop: Spacing['2xl'],
    },
  });
