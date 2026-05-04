import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, FlatList, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiService from '../../utils/apiService';
import { getImageUrl } from '../../utils/api';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ListingDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    fetchDetails();
    checkIfInCart();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await apiService.getListingById(id);
      setListing(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkIfInCart = async () => {
    try {
      const response = await apiService.getCart();
      const cart = response.data.data;
      const found = cart?.items?.some((item) => item.listing?._id === id || item.listing === id);
      setInCart(!!found);
    } catch (_) {}
  };

  const handleAddToCart = async () => {
    if (inCart) {
      // Navigate directly to cart tab
      navigation.navigate('Cart');
      return;
    }
    setCartLoading(true);
    try {
      await apiService.addToCart(id, 1);
      setInCart(true);
      Alert.alert('Added to Cart 🛒', 'Item added successfully! View your cart to checkout.', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add to cart';
      if (msg === 'Item already in cart') {
        setInCart(true);
        navigation.navigate('Cart');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setCartLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await apiService.startConversation(listing.seller._id, id);
      navigation.navigate('Chat', {
        conversationId: response.data.data._id,
        userName: listing.seller.name,
        listingTitle: listing.title
      });
    } catch (error) {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    }
  };

  const handlePurchaseRequest = async () => {
    Alert.alert(
      'Send Purchase Request',
      'This will notify the seller that you want to buy this item. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              await apiService.createOrder({
                listing: id,
                seller: listing.seller._id,
                totalPrice: listing.price
              });
              Alert.alert('Success', 'Request sent! The seller will get back to you soon.');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
            }
          }
        }
      ]
    );
  };

  const isOwner = user?._id === listing?.seller?._id;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  const DetailPhoto = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = getImageUrl(item);

    return (
      <Image
        source={{ uri: imageError ? 'https://via.placeholder.com/600x400?text=Image+Unavailable' : imageUrl }}
        style={styles.carouselImage}
        onError={() => setImageError(true)}
      />
    );
  };

  const renderPhoto = ({ item }) => (
    <DetailPhoto item={item} />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Horizontal Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={listing.photos && listing.photos.length > 0 ? listing.photos : [null]}
            renderItem={renderPhoto}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
          />
          {/* Back Button */}
          <View style={styles.backBtnWrapper}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
          </View>
          {/* Cart Button Overlay (top-right) */}
          {!isOwner && listing.status === 'active' && (
            <View style={styles.cartBtnWrapper}>
              <TouchableOpacity
                style={[styles.cartOverlayBtn, inCart && styles.cartOverlayBtnActive]}
                onPress={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <ActivityIndicator color={inCart ? COLORS.primary : COLORS.secondary} size="small" />
                ) : (
                  <Text style={styles.cartOverlayIcon}>{inCart ? '✔' : '🛒'}</Text>
                )}
              </TouchableOpacity>
              {inCart && <Text style={styles.inCartLabel}>In Cart</Text>}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.category}>{listing.category}</Text>
            <View style={[styles.statusBadge, listing.status === 'sold' ? styles.soldBadge : null]}>
              <Text style={styles.statusText}>{listing.status}</Text>
            </View>
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.brand}>{listing.brand}</Text>
          <Text style={styles.price}>Rs. {listing.price.toLocaleString()}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CONDITION</Text>
              <Text style={styles.infoValue}>{listing.condition}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>DISTRICT</Text>
              <Text style={styles.infoValue}>{listing.district}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>LOCATION</Text>
              <Text style={styles.infoValue}>{listing.location}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          <View style={styles.sellerCard}>
            <Text style={styles.sellerTitle}>Sold by</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.avatarText}>{listing.seller.name.charAt(0)}</Text>
              </View>
              <View style={styles.sellerText}>
                <Text style={styles.sellerName}>{listing.seller.name}</Text>
                <Text style={styles.sellerVerified}>✓ Verified GearLK Seller</Text>
              </View>
              <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert('Contact', `Phone: ${listing.contactNumber}`)}>
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons Footer — Non-owner, active listings */}
      {!isOwner && listing.status === 'active' && (
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.cartBtn, inCart && styles.cartBtnActive]}
            onPress={handleAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.cartBtnText}>{inCart ? '✔ In Cart' : '🛒 Add'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtn} onPress={handlePurchaseRequest}>
            <Text style={styles.buyBtnText}>Request to Buy</Text>
          </TouchableOpacity>
        </View>
      )}

      {isOwner && (
        <View style={styles.ownerFooter}>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditListing', { listing })}>
            <Text style={styles.editBtnText}>Manage Listing</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carouselContainer: { height: 400 },
  carouselImage: { width: width, height: 400, resizeMode: 'cover' },

  // Overlays
  backBtnWrapper: { position: 'absolute', top: 50, left: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },

  cartBtnWrapper: { position: 'absolute', top: 50, right: 20, alignItems: 'center' },
  cartOverlayBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cartOverlayBtnActive: { backgroundColor: COLORS.secondary },
  cartOverlayIcon: { fontSize: 20 },
  inCartLabel: { color: COLORS.white, fontSize: 10, fontWeight: 'bold', marginTop: 4, backgroundColor: COLORS.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },

  // Content
  content: { padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: COLORS.white, marginTop: -30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  category: { color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10, fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  soldBadge: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: COLORS.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, lineHeight: 34 },
  brand: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 15 },
  price: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, marginBottom: 25 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.background, padding: 20, borderRadius: 20, marginBottom: 25 },
  infoItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: '100%', backgroundColor: '#DDD' },
  infoLabel: { fontSize: 9, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  description: { fontSize: 15, color: '#444', lineHeight: 24 },
  sellerCard: { backgroundColor: COLORS.background, padding: 20, borderRadius: 20, marginBottom: 100 },
  sellerTitle: { fontSize: 12, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  sellerInfo: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: COLORS.secondary, fontSize: 22, fontWeight: 'bold' },
  sellerText: { flex: 1 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  sellerVerified: { fontSize: 11, color: COLORS.success, marginTop: 2, fontWeight: '600' },
  callBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  callIcon: { fontSize: 20 },

  // Footer
  footerActions: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: COLORS.white, padding: 15, flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    alignItems: 'center', gap: 10,
  },
  cartBtn: {
    minWidth: 90, height: 50, backgroundColor: COLORS.background,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary, paddingHorizontal: 12,
  },
  cartBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  cartBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  msgBtn: { flex: 1, height: 50, backgroundColor: COLORS.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  msgBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  buyBtn: { flex: 1.3, height: 50, backgroundColor: COLORS.secondary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  buyBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },

  ownerFooter: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.white,
    padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  editBtn: { width: '100%', height: 55, backgroundColor: COLORS.primary, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});

export default ListingDetailsScreen;
