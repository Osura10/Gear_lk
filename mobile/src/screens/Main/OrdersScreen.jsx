import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import apiService from '../../utils/apiService';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const OrdersScreen = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(user.role === 'seller' ? 'selling' : 'buying');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const response = activeTab === 'buying' 
        ? await apiService.getMyOrders() 
        : await apiService.getIncomingOrders();
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

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiService.updateOrderStatus(id, status);
      Alert.alert('Success', `Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update order');
    }
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
        <Text style={styles.label}>{activeTab === 'buying' ? 'Seller:' : 'Buyer:'}</Text>
        <Text style={styles.value}>{activeTab === 'buying' ? item.seller.name : item.buyer.name}</Text>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Message:</Text>
        <Text style={styles.messageText}>"{item.message}"</Text>
      </View>
      
      {activeTab === 'selling' && item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => handleStatusUpdate(item._id, 'rejected')}
          >
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => handleStatusUpdate(item._id, 'accepted')}
          >
            <Text style={styles.acceptBtnText}>Accept Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'selling' && item.status === 'accepted' && (
        <TouchableOpacity 
          style={styles.completeBtn} 
          onPress={() => handleStatusUpdate(item._id, 'completed')}
        >
          <Text style={styles.completeBtnText}>Mark as Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'buying' ? styles.activeTab : null]}
          onPress={() => setActiveTab('buying')}
        >
          <Text style={[styles.tabText, activeTab === 'buying' ? styles.activeTabText : null]}>Sent Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'selling' ? styles.activeTab : null]}
          onPress={() => setActiveTab('selling')}
        >
          <Text style={[styles.tabText, activeTab === 'selling' ? styles.activeTabText : null]}>Received Requests</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={styles.emptyText}>No purchase requests found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingTop: 50 },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.secondary },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' },
  activeTabText: { color: COLORS.secondary },
  loader: { marginTop: 50 },
  list: { padding: 15 },
  card: { backgroundColor: COLORS.white, borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  listingTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  price: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent, marginBottom: 15 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 14, color: COLORS.gray, width: 60 },
  value: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  messageBox: { backgroundColor: COLORS.background, padding: 12, borderRadius: 10, marginVertical: 10 },
  messageLabel: { fontSize: 10, color: COLORS.gray, marginBottom: 4 },
  messageText: { fontSize: 13, color: COLORS.primary, fontStyle: 'italic' },
  actions: { flexDirection: 'row', marginTop: 15 },
  actionBtn: { flex: 1, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { backgroundColor: COLORS.secondary, marginLeft: 10 },
  acceptBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  rejectBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.lightGray },
  rejectBtnText: { color: COLORS.error, fontWeight: '600' },
  completeBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  completeBtnText: { color: COLORS.white, fontWeight: 'bold' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: COLORS.gray },
});

export default OrdersScreen;
