import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

export interface StatusBadgeProps {
  status?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showDot?: boolean;
}

export default function StatusBadge({
  status = 'ONGOING',
  label,
  style,
  textStyle,
  showDot = true,
}: StatusBadgeProps) {
  const isOngoing = status?.toUpperCase() === 'ONGOING';

  const defaultLabel = isOngoing ? 'Aktif' : 'Selesai';
  const displayLabel = label || defaultLabel;

  const bg = isOngoing ? Colors.successLight : Colors.errorLight;
  const dotColor = isOngoing ? Colors.success : Colors.error;
  const textColor = isOngoing ? '#15803D' : Colors.error;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.round,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
