import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import CustomButton from '../../../components/common/CustomButton';

const { width } = Dimensions.get('window');

const ListingDetailsView = ({ route, navigation }) => {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchListing();
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (!listing) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / width));
            }}
          >
            {listing.photos?.map((photo, index) => (
              <Image key={index} source={{ uri: getImageUrl(photo) }} style={styles.mainImage} />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {listing.photos?.map((_, i) => (
              <View key={i} style={[styles.dot, activeImage === i && styles.activeDot]} />
            ))}
          </View>
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
            {listing.originalPrice > listing.price && (
              <Text style={styles.originalPrice}>Rs. {listing.originalPrice.toLocaleString()}</Text>
            )}
          </View>

          <View style={styles.sellerCard}>
            <Image 
              source={{ uri: getImageUrl(null) }} 
              style={styles.sellerAvatar} 
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller?.name || 'Trusted Seller'}</Text>
              <Text style={styles.sellerLocation}>📍 {listing.location || 'USA'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.visitBtn}
              onPress={() => navigation.navigate('StorefrontView', { storeId: listing.seller?._id })}
            >
              <Text style={styles.visitText}>Visit Store</Text>
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
            <Text style={styles.reviewSub}>Bought this item? Share your experience and photos with the community.</Text>
            <TouchableOpacity 
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('AddReview', { listing, store: listing.seller })}
            >
              <Text style={styles.reviewBtnText}>⭐ Write a Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
        <CustomButton 
          title="Buy Now" 
          onPress={() => Alert.alert('Order', 'Checkout coming soon!')} 
          style={styles.buyBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: width, backgroundColor: COLORS.white },
  mainImage: { width: width, height: width, resizeMode: 'cover' },
  pagination: { position: 'absolute', bottom: 20, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: COLORS.white, width: 20 },
  infoBox: { padding: 20, backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brand: { fontSize: 16, color: COLORS.gray, fontWeight: 'bold', textTransform: 'uppercase' },
  conditionBadge: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  conditionText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  price: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary },
  originalPrice: { fontSize: 18, color: COLORS.gray, textDecorationLine: 'line-through', marginLeft: 15 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 15, borderRadius: 20, marginBottom: 25 },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25 },
  sellerInfo: { flex: 1, marginLeft: 15 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  sellerLocation: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  visitBtn: { padding: 8 },
  visitText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 12 },
  detailsSection: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  specs: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, backgroundColor: COLORS.background, padding: 15, borderRadius: 15 },
  bottomActions: { padding: 20, backgroundColor: COLORS.white, flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  chatBtn: { width: 55, height: 55, borderRadius: 15, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  chatIcon: { fontSize: 24 },
  buyBtn: { flex: 1, height: 55 },
  reviewSection: { marginTop: 10, marginBottom: 25, backgroundColor: COLORS.background, padding: 15, borderRadius: 20 },
  reviewSub: { fontSize: 13, color: COLORS.gray, marginBottom: 15 },
  reviewBtn: { backgroundColor: COLORS.white, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  reviewBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 }
});

export default ListingDetailsView;
