import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../../theme/colors';
import api, { getImageUrl } from '../../../../utils/api';
import StatusBadge from '../../../../components/common/StatusBadge';

const { width } = Dimensions.get('window');

const PricingDashboard = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('/listings/seller/my-listings');
      setListings(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }) => {
    const hasDeal = item.dealStatus === 'active';
    const currentPrice = item.price;
    const originalPrice = item.originalPrice || item.price;
    const discountPercent = originalPrice > currentPrice 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    return (
      <View style={styles.card}>
        <Image source={{ uri: getImageUrl(item.photos?.[0]) }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.currentPrice}>Rs. {currentPrice.toLocaleString()}</Text>
              {originalPrice > currentPrice && (
                <Text style={styles.originalPrice}>Rs. {originalPrice.toLocaleString()}</Text>
              )}
            </View>
            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.statusRow}>
            <StatusBadge status={hasDeal ? 'Deal Active' : 'Standard'} color={hasDeal ? COLORS.secondary : COLORS.gray} />
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => navigation.navigate('PriceDrop', { listing: item })}
              >
                <Text style={styles.actionEmoji}>📉</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.dealBtn]}
                onPress={() => navigation.navigate('ManageDeal', { listing: item })}
              >
                <Text style={styles.actionEmoji}>🔥</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pricing & Deals</Text>
        <Text style={styles.headerSub}>Manage your gear prices and promotional campaigns.</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.secondary} />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No listings to manage pricing for.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 25, backgroundColor: COLORS.white, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  headerSub: { fontSize: 14, color: COLORS.gray, marginTop: 5 },
  list: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 25, padding: 15, marginBottom: 15, elevation: 3 },
  image: { width: 80, height: 80, borderRadius: 15 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  currentPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
  originalPrice: { fontSize: 12, color: COLORS.gray, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#FFEDEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FF4D4D', fontSize: 10, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  actions: { flexDirection: 'row' },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  dealBtn: { backgroundColor: COLORS.secondary + '20' },
  actionEmoji: { fontSize: 16 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.gray }
});

export default PricingDashboard;
