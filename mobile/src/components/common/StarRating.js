import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';

const StarRating = ({ 
  rating, 
  maxStars = 5, 
  onRatingPress, 
  size = 20, 
  showNumber = false,
  interactive = false 
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <TouchableOpacity 
        key={i} 
        disabled={!interactive} 
        onPress={() => onRatingPress && onRatingPress(i)}
      >
        <Text style={[
          styles.star, 
          { fontSize: size },
          i <= rating ? styles.activeStar : styles.inactiveStar
        ]}>
          ★
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>{stars}</View>
      {showNumber && (
        <Text style={[styles.ratingNumber, { fontSize: size * 0.7 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  starsRow: { flexDirection: 'row' },
  star: { marginRight: 2 },
  activeStar: { color: '#FFD700' }, // Gold
  inactiveStar: { color: '#E0E0E0' }, // Light Gray
  ratingNumber: { marginLeft: 8, fontWeight: 'bold', color: COLORS.gray }
});

export default StarRating;
