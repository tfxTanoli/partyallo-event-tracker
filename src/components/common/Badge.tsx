import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Palette, StatusColors, CategoryColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'status' | 'category' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  dot?: boolean;
}

export function Badge({ label, variant = 'default', size = 'sm', style, textStyle, dot }: BadgeProps) {
  const { colors: palette } = useTheme();
  const colors = getBadgeColors(variant, label, palette);

  return (
    <View style={[styles.base, size === 'md' ? styles.md : styles.sm, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: colors.text }]} />}
      <Text style={[styles.text, size === 'md' ? styles.textMd : styles.textSm, { color: colors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

function getBadgeColors(variant: string, label: string, Colors: Palette): { bg: string; text: string; border: string } {
  if (variant === 'status' && StatusColors[label]) {
    const c = StatusColors[label];
    return { bg: c.bg, text: c.text, border: c.border };
  }
  if (variant === 'category' && CategoryColors[label]) {
    const c = CategoryColors[label];
    return { bg: c.bg, text: c.text, border: 'transparent' };
  }
  switch (variant) {
    case 'success':
      return { bg: Colors.emerald[50], text: Colors.emerald[700], border: Colors.emerald[200] };
    case 'warning':
      return { bg: Colors.amber[50], text: Colors.amber[600], border: Colors.amber[200] };
    case 'danger':
      return { bg: Colors.rose[50], text: Colors.rose[600], border: Colors.rose[200] };
    case 'info':
      return { bg: Colors.sky[50], text: Colors.sky[600], border: Colors.sky[200] };
    case 'neutral':
      return { bg: Colors.slate[100], text: Colors.slate[600], border: Colors.slate[200] };
    default:
      return { bg: Colors.primary[50], text: Colors.primary[700], border: Colors.primary[100] };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
  textSm: {
    fontSize: FontSize.xs,
  },
  textMd: {
    fontSize: FontSize.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
});
