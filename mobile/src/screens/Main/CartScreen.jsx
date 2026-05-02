import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import apiService from '../../utils/apiService';
import { getImageUrl } from '../../utils/api';
import { COLORS } from '../../theme/colors';

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await apiService.getCart();
      setCart(response.data.data);
    } catch (error) {
      console.log('Error fetching cart', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiService.removeFromCart(itemId);
      fetchCart(); // Refresh to get updated totals
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    Alert.alert('Clear Cart', 'Are you sure you want to empty your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        try {
          await apiService.clearCart();
          setCart({ ...cart, items: [], totalPrice: 0 });
        } catch (error) {
          Alert.alert('Error', 'Failed to clear cart');
        }
      }},
    ]);
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;

    Alert.alert(
      'Checkout',
      'This will send purchase requests to all sellers. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Requests', 
          onPress: async () => {
            try {
              await apiService.checkout();
              Alert.alert('Success', 'Purchase requests sent to all sellers!');
              fetchCart();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: getImageUrl(item.listing.photos?.[0]) }} 
        style={styles.thumbnail} 
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.listing.title}</Text>
          <TouchableOpacity onPress={() => removeItem(item.listing._id)}>
            <Text style={styles.removeIcon}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.brand}>{item.listing.brand}</Text>
        <Text style={styles.price}>Rs. {item.listing.price.toLocaleString()}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.secondary} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {cart?.items?.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart?.items || []}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.empty}>Your cart is empty.</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Market')}>
              <Text style={styles.shopBtnText}>Browse Marketplace</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {cart?.items?.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>Rs. {cart.totalPrice.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Send Purchase Requests</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  clearText: { color: COLORS.error, fontWeight: '600' },
  loader: { marginTop: 50 },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 15, padding: 12, marginBottom: 15, elevation: 2 },
  thumbnail: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, flex: 1 },
  removeIcon: { fontSize: 24, color: COLORS.gray, marginTop: -5 },
  brand: { color: COLORS.gray, fontSize: 12, marginBottom: 4 },
  price: { color: COLORS.accent, fontWeight: 'bold', fontSize: 16 },
  footer: { backgroundColor: COLORS.white, padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: COLORS.gray },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  checkoutBtn: { backgroundColor: COLORS.secondary, padding: 18, borderRadius: 15, alignItems: 'center' },
  checkoutBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  empty: { fontSize: 18, color: COLORS.gray, marginBottom: 30 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 },
  shopBtnText: { color: COLORS.white, fontWeight: 'bold' }
});

export default CartScreen;
