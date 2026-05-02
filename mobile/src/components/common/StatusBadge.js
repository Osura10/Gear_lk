import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: COLORS.success + '20', text: COLORS.success };
      case 'inactive':
        return { bg: COLORS.error + '20', text: COLORS.error };
      case 'pending':
        return { bg: COLORS.secondary + '20', text: COLORS.secondary };
      default:
        return { bg: COLORS.gray + '20', text: COLORS.gray };
    }
  };

  const style = getStatusStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default StatusBadge;
