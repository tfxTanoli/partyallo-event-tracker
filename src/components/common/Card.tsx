import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Spacing, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  noBorder?: boolean;
  noShadow?: boolean;
}

export function Card({ children, style, padding = Spacing.base, noBorder = false, noShadow = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding },
        noBorder && styles.noBorder,
        noShadow && styles.noShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  noBorder: {
    borderWidth: 0,
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
