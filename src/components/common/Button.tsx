import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Palette } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, FontSize, FontWeight, Shadow } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const makeVariantStyles = (Colors: Palette): Record<Variant, { container: ViewStyle; text: TextStyle }> => ({
  primary: {
    container: { backgroundColor: Colors.primary[600] },
    text: { color: Colors.white },
  },
  secondary: {
    container: {
      backgroundColor: Colors.white,
      borderWidth: 1.5,
      borderColor: Colors.border,
    },
    text: { color: Colors.textPrimary },
  },
  danger: {
    container: { backgroundColor: Colors.rose[500] },
    text: { color: Colors.white },
  },
  ghost: {
    container: { backgroundColor: Colors.transparent },
    text: { color: Colors.primary[600] },
  },
  outline: {
    container: {
      backgroundColor: Colors.transparent,
      borderWidth: 1.5,
      borderColor: Colors.primary[500],
    },
    text: { color: Colors.primary[600] },
  },
});

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      borderRadius: Radius.lg,
    },
    text: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  },
  md: {
    container: {
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.xl,
    },
    text: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  },
  lg: {
    container: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: Radius.xl,
    },
    text: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors: Colors } = useTheme();
  const vs = makeVariantStyles(Colors)[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        vs.container,
        ss.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text.color as string} />
      ) : (
        <View style={styles.inner}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[vs.text, ss.text, textStyle]}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadow.xs,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
