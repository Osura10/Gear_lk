import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import apiService from '../../utils/apiService';
import { COLORS } from '../../theme/colors';

const BuyerOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiService.getMyOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.log('Error fetching orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return COLORS.success;
      case 'rejected': return COLORS.error;
      case 'completed': return '#007BFF';
      default: return COLORS.gray;
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.listingTitle}>{item.listing.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.price}>Rs. {item.totalPrice.toLocaleString()}</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.label}>Seller:</Text>
        <Text style={styles.value}>{item.seller.name}</Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.value}>{item.seller.phone}</Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Your Message:</Text>
        <Text style={styles.messageText}>"{item.message}"</Text>
      </View>
      
      {item.status === 'accepted' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>The seller has accepted your request! You can now coordinate the pickup and payment.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.secondary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>You haven't sent any purchase requests yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 50 },
  list: { padding: 15 },
  card: { backgroundColor: COLORS.white, borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  listingTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  price: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent, marginBottom: 15 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: COLORS.gray, width: 70 },
  value: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  messageBox: { backgroundColor: COLORS.background, padding: 12, borderRadius: 10, marginVertical: 10 },
  messageLabel: { fontSize: 10, color: COLORS.gray, marginBottom: 4 },
  messageText: { fontSize: 13, color: COLORS.primary, fontStyle: 'italic' },
  infoBox: { backgroundColor: COLORS.success + '10', padding: 12, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  infoText: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: COLORS.gray },
});

export default BuyerOrdersScreen;
