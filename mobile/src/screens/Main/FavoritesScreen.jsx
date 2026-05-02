import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import apiService from '../../utils/apiService';
import { IMAGE_URL } from '../../utils/api';
import { COLORS } from '../../theme/colors';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await apiService.getMyFavorites();
      setFavorites(response.data.data);
    } catch (error) {
      console.log('Error fetching favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('InstrumentDetails', { id: item.instrument._id })}
    >
        source={{ uri: `${IMAGE_URL}${item.instrument.image}` }} 
        style={styles.thumbnail} 
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.instrument.title}</Text>
        <Text style={styles.price}>Rs. {item.instrument.price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No favorites yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 10 },
  loader: { marginTop: 50 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 10, padding: 10, marginBottom: 10, elevation: 2 },
  thumbnail: { width: 60, height: 60, borderRadius: 5 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  price: { color: COLORS.accent, marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: COLORS.gray }
});

export default FavoritesScreen;
