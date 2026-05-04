import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Platform, ScrollView,
  KeyboardAvoidingView, Animated, Easing, RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../utils/apiService';
import { getImageUrl } from '../../utils/api';
import { COLORS } from '../../theme/colors';
import ImagePickerPreview from '../../components/common/ImagePickerPreview';

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyCart = ({ navigation }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>🛒</Text>
    <Text style={styles.emptyTitle}>Your cart is empty</Text>
    <Text style={styles.emptySubtitle}>
      Discover amazing musical gear and start adding items to your cart.
    </Text>
    <TouchableOpacity
      style={styles.browseBtn}
      onPress={() => {
        // Navigate to the Home tab's Marketplace screen
        navigation.navigate('Home', { screen: 'Marketplace' });
      }}
    >
      <Text style={styles.browseBtnText}>🎸  Browse Marketplace</Text>
    </TouchableOpacity>
  </View>
);

// ─── Cart Item Card ───────────────────────────────────────────────────────────
const CartItemCard = ({ item, onRemove, onUpdateQuantity, navigation }) => {
  const [imageError, setImageError] = useState(false);
  const listing = item.listing;
  const imageUrl = getImageUrl(listing?.photos?.[0]);

  if (!listing) return null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home', { screen: 'InstrumentDetails', params: { id: listing._id } })}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: imageError ? 'https://via.placeholder.com/120x120?text=GearLK' : imageUrl }}
          style={styles.cardImage}
          onError={() => setImageError(true)}
        />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
          <TouchableOpacity onPress={() => onRemove(listing._id)} style={styles.removeBtn}>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardBrand}>{listing.brand} · {listing.condition}</Text>
        <Text style={styles.cardPrice}>Rs. {listing.price?.toLocaleString()}</Text>

        {/* Quantity stepper */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQuantity(listing._id, Math.max(1, item.quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQuantity(listing._id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.itemSubtotal}>
            Rs. {(listing.price * item.quantity).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Voucher Section ──────────────────────────────────────────────────────────
const VoucherSection = ({ cart, onApply, onRemove, loading }) => {
  const [code, setCode] = useState('');
  const hasVoucher = cart?.appliedVoucher?.code;

  return (
    <View style={styles.voucherCard}>
      <Text style={styles.voucherLabel}>🎟  Voucher / Promo Code</Text>
      {hasVoucher ? (
        <View style={styles.appliedVoucher}>
          <View style={styles.appliedLeft}>
            <Text style={styles.appliedCode}>{cart.appliedVoucher.code}</Text>
            <Text style={styles.appliedSaving}>
              You save Rs. {cart.appliedVoucher.discountAmount?.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.removeVoucherBtn} onPress={onRemove}>
            <Text style={styles.removeVoucherText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.voucherRow}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Enter voucher code"
            placeholderTextColor={COLORS.gray}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.applyBtn, loading && { opacity: 0.6 }]}
            onPress={() => { onApply(code); setCode(''); }}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.applyBtnText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Order Summary ────────────────────────────────────────────────────────────
const OrderSummary = ({ cart, onCheckout, onClear }) => {
  const hasDiscount = cart?.discountAmount > 0;
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Order Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal ({cart?.items?.length} items)</Text>
        <Text style={styles.summaryValue}>Rs. {cart?.subTotal?.toLocaleString()}</Text>
      </View>

      {hasDiscount && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: COLORS.success }]}>
            Voucher ({cart.appliedVoucher.code})
          </Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            − Rs. {cart.discountAmount?.toLocaleString()}
          </Text>
        </View>
      )}

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>Rs. {cart?.totalPrice?.toLocaleString()}</Text>
      </View>

      <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
        <Text style={styles.checkoutBtnText}>Send Purchase Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
        <Text style={styles.clearBtnText}>Clear Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherImages, setVoucherImages] = useState([]);

  const fetchCart = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await apiService.getCart();
      console.log('Fetched Cart Data:', JSON.stringify(response.data.data, null, 2));
      setCart(response.data.data);
    } catch (error) {
      console.log('Error fetching cart', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCart(true);
  };

  const handleRemove = async (listingId) => {
    try {
      const response = await apiService.removeFromCart(listingId);
      setCart(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (listingId, quantity) => {
    try {
      const response = await apiService.updateCartItem(listingId, { quantity });
      setCart(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleApplyVoucher = async (code) => {
    if (!code.trim()) return;
    setVoucherLoading(true);
    try {
      const response = await apiService.applyVoucher(code.trim());
      setCart(response.data.data);
      Alert.alert('✅ Voucher Applied!', response.data.message);
    } catch (error) {
      Alert.alert('Invalid Voucher', error.response?.data?.message || 'Voucher could not be applied');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = async () => {
    try {
      const response = await apiService.removeVoucher();
      setCart(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Could not remove voucher');
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try {
            await apiService.clearCart();
            setCart({ ...cart, items: [], subTotal: 0, discountAmount: 0, totalPrice: 0, appliedVoucher: {} });
          } catch (error) {
            Alert.alert('Error', 'Failed to clear cart');
          }
        }
      },
    ]);
  };

  const handleCheckout = () => {
    if (!cart?.items?.length) return;
    Alert.alert(
      'Send Purchase Requests',
      'This will notify all sellers in your cart. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Requests', onPress: async () => {
            try {
              const formData = new FormData();
              if (voucherImages.length > 0) {
                const uri = voucherImages[0];
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const ext = match ? match[1] : 'jpg';
                formData.append('voucherImage', {
                  uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                  name: filename,
                  type: `image/${ext}`
                });
              }
              if (cart.appliedVoucher?.code) {
                formData.append('voucherCode', cart.appliedVoucher.code);
              }

              await apiService.checkout(formData);
              Alert.alert('🎸 Requests Sent!', 'Sellers have been notified. Check your orders for updates.');
              setVoucherImages([]);
              fetchCart();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  const hasItems = cart?.items?.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {hasItems && (
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{cart.items.length}</Text>
          </View>
        )}
      </View>

      {!hasItems ? (
        <EmptyCart navigation={navigation} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.secondary]} />
          }
        >
          {/* Cart Items */}
          {cart.items.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
              navigation={navigation}
            />
          ))}

          {/* Voucher Section */}
          <VoucherSection
            cart={cart}
            onApply={handleApplyVoucher}
            onRemove={handleRemoveVoucher}
            loading={voucherLoading}
          />

          <View style={styles.voucherUploadSection}>
            <ImagePickerPreview 
              label="Voucher / Promo Proof (Optional)"
              images={voucherImages}
              onImagesSelected={setVoucherImages}
              multiple={false}
            />
          </View>

          {/* Order Summary */}
          <OrderSummary
            cart={cart}
            onCheckout={handleCheckout}
            onClear={handleClear}
          />
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemCountBadge: {
    marginLeft: 10,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  itemCountText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },

  // ─── Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 35,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 35,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 4,
  },
  browseBtnText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // ─── Card
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardImage: {
    width: 110,
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  cardBrand: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 3,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 20,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  itemSubtotal: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ─── Voucher
  voucherCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.secondary,
  },
  voucherLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.primary,
    backgroundColor: COLORS.background,
    marginRight: 10,
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.secondary,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 14,
  },
  appliedVoucher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  appliedLeft: {
    flex: 1,
  },
  appliedCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.success,
    letterSpacing: 1,
  },
  appliedSaving: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  removeVoucherBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  removeVoucherText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // ─── Summary
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  checkoutBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  voucherUploadSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingTop: 15,
  },
});

export default CartScreen;
