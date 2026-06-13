import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Radius, FontSize, FontWeight } from '../../constants/theme';

interface ProgressBarProps {
  value: number; // 0–100
  total?: number;
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  total,
  color,
  trackColor = Colors.slate[100],
  height = 6,
  showLabel = false,
  label,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.primary[500];
  const pct = total ? Math.min((value / total) * 100, 100) : Math.min(value, 100);
  const displayPct = Math.round(pct);

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showLabel && (
            <Text style={styles.pctText}>
              {total ? `${value}/${total}` : `${displayPct}%`}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${displayPct}%` as `${number}%`,
              backgroundColor: fillColor,
              height,
              borderRadius: height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  pctText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});
