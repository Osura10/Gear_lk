import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import apiService from '../../../utils/apiService';
import { AuthContext } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const ListingDetailsView = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    fetchListing();
    checkIfInCart();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data.data);
    } catch (error) {
      console.error(error);
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
      navigation.navigate('Cart');
      return;
    }
    setCartLoading(true);
    try {
      const response = await apiService.addToCart(id, 1);
      console.log('Add to Cart Response:', JSON.stringify(response.data, null, 2));
      setInCart(true);
      Alert.alert('Added to Cart 🛒', 'Item added! Go to cart to checkout.', [
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



  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (!listing) return null;

  const isOwner = user?._id === listing?.seller?._id;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {(listing.photos?.length > 0 ? listing.photos : [null]).map((photo, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(photo) }}
                style={styles.mainImage}
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {(listing.photos?.length > 0 ? listing.photos : [null]).map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.activeDot]} />
            ))}
          </View>

          {/* Cart overlay button (top-right) */}
          {!isOwner && (
            <View style={styles.cartOverlayWrapper}>
              <TouchableOpacity
                style={[styles.cartOverlayBtn, inCart && styles.cartOverlayBtnActive]}
                onPress={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <ActivityIndicator color={inCart ? COLORS.primary : COLORS.white} size="small" />
                ) : (
                  <Text style={styles.cartOverlayIcon}>{inCart ? '✔' : '🛒'}</Text>
                )}
              </TouchableOpacity>
              {inCart && (
                <Text style={styles.inCartLabel}>In Cart</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.headerRow}>
            <Text style={styles.brand}>{listing.brand}</Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{listing.condition}</Text>
            </View>
          </View>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>Rs. {listing.price.toLocaleString()}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>District</Text>
              <Text style={styles.metaValue}>{listing.district || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{listing.location || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{listing.category || '-'}</Text>
            </View>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>{listing.seller?.name?.charAt(0) || 'S'}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller?.name || 'Trusted Seller'}</Text>
              <Text style={styles.sellerVerified}>✓ Verified GearLK Seller</Text>
            </View>
            <TouchableOpacity
              style={styles.visitBtn}
              onPress={() => navigation.navigate('StorefrontView', { storeId: listing.store?._id || listing.seller?._id })}
            >
              <Text style={styles.visitText}>Visit Store →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>About this Gear</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {listing.specifications && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <Text style={styles.specs}>{listing.specifications}</Text>
            </View>
          )}

          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            <Text style={styles.reviewSub}>
              Bought this item? Share your experience with the community.
            </Text>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('AddReview', { listing, store: listing.seller })}
            >
              <Text style={styles.reviewBtnText}>⭐ Write a Review</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.cartActionBtn, inCart && styles.cartActionBtnActive, { flex: 1 }]}
            onPress={handleAddToCart}
            disabled={cartLoading}
          >
            {cartLoading ? (
              <ActivityIndicator color={inCart ? COLORS.primary : COLORS.white} size="small" />
            ) : (
              <Text style={[styles.cartActionText, inCart && { color: COLORS.primary }]}>
                {inCart ? '✔ In Cart' : '🛒 Add to Cart'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Images
  imageContainer: { height: width, backgroundColor: COLORS.white },
  mainImage: { width: width, height: width, resizeMode: 'cover' },
  pagination: {
    position: 'absolute', bottom: 18, width: '100%',
    flexDirection: 'row', justifyContent: 'center',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3 },
  activeDot: { backgroundColor: COLORS.white, width: 18, borderRadius: 4 },

  // Cart overlay
  cartOverlayWrapper: { position: 'absolute', top: 18, right: 16, alignItems: 'center' },
  cartOverlayBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  cartOverlayBtnActive: { backgroundColor: COLORS.secondary },
  cartOverlayIcon: { fontSize: 20 },
  inCartLabel: {
    marginTop: 4, color: COLORS.white, fontSize: 10, fontWeight: 'bold',
    backgroundColor: COLORS.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },

  // Info
  infoBox: {
    padding: 22, backgroundColor: COLORS.white,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  brand: { fontSize: 13, color: COLORS.gray, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  conditionBadge: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  conditionText: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, lineHeight: 30 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  price: { fontSize: 28, fontWeight: 'bold', color: COLORS.accent },

  metaRow: {
    flexDirection: 'row', backgroundColor: COLORS.background,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 9, color: COLORS.gray, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },

  sellerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, padding: 15, borderRadius: 20, marginBottom: 22,
  },
  sellerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  sellerAvatarText: { fontSize: 20, color: COLORS.secondary, fontWeight: 'bold' },
  sellerInfo: { flex: 1, marginLeft: 14 },
  sellerName: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  sellerVerified: { fontSize: 11, color: COLORS.success, marginTop: 2, fontWeight: '600' },
  visitBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  visitText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 13 },

  detailsSection: { marginBottom: 22 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
  specs: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 22,
    backgroundColor: COLORS.background, padding: 16, borderRadius: 14,
  },

  reviewSection: {
    marginBottom: 20, backgroundColor: COLORS.background, padding: 18, borderRadius: 18,
  },
  reviewSub: { fontSize: 13, color: COLORS.gray, marginBottom: 14, lineHeight: 20 },
  reviewBtn: {
    backgroundColor: COLORS.white, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  reviewBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },

  // Bottom
  bottomActions: {
    flexDirection: 'row', gap: 12,
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, elevation: 10,
  },
  cartActionBtn: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  cartActionBtnActive: { backgroundColor: COLORS.secondary },
  cartActionText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  msgActionBtn: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  msgActionText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
});

export default ListingDetailsView;
