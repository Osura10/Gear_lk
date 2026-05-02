import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  Image, 
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import StoreHeader from '../../../components/store/StoreHeader';

const { width } = Dimensions.get('window');

const StorefrontView = ({ route, navigation }) => {
  const { storeId } = route.params;
  const [store, setStore] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Gear');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/stores/${storeId}`);
        setStore(res.data.data);
        
        const [listingsRes, reviewsRes] = await Promise.all([
          api.get(`/listings?seller=${res.data.data.seller}`),
          api.get(`/reviews?store=${storeId}`)
        ]);
        
        setListings(listingsRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [storeId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Opening Storefront...</Text>
      </View>
    );
  }

  const renderListing = ({ item }) => (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={() => navigation.navigate('InstrumentDetails', { id: item._id })}
      activeOpacity={0.9}
    >
      <View style={styles.listingImageContainer}>
        <Image source={{ uri: getImageUrl(item.images?.[0]) }} style={styles.listingImage} />
        {item.condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.listingPrice}>Rs. {item.price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Store Reviews</Text>
        <Text style={styles.countText}>{reviews.length} Reviews</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.reviewBtn}
        onPress={() => navigation.navigate('AddReview', { store })}
      >
        <Text style={styles.reviewBtnText}>⭐ Write a Review</Text>
      </TouchableOpacity>

      {reviews.length > 0 ? (
        reviews.map(review => (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.user?.name || 'Customer'}</Text>
              <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.ratingText}>{'⭐'.repeat(review.rating)}</Text>
            <Text style={styles.reviewTitle}>{review.title}</Text>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            {review.mediaUrls && review.mediaUrls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewMedia}>
                {review.mediaUrls.map((uri, idx) => (
                  <Image key={idx} source={{ uri: getImageUrl(uri) }} style={styles.reviewImage} />
                ))}
              </ScrollView>
            )}
            {review.reply && (
              <View style={styles.sellerReply}>
                <Text style={styles.replyLabel}>Seller Reply:</Text>
                <Text style={styles.replyText}>{review.reply.comment}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySub}>Be the first to share your experience!</Text>
        </View>
      )}
    </View>
  );

  const renderPolicies = () => (
    <View style={styles.tabContent}>
      <PolicyCard title="Shipping" content={store?.policies?.shipping} icon="🚚" />
      <PolicyCard title="Returns" content={store?.policies?.return} icon="🔄" />
      <PolicyCard title="Warranty" content={store?.policies?.warranty} icon="🛡️" />
      <PolicyCard title="Terms" content={store?.policies?.terms} icon="📄" />
    </View>
  );

  const PolicyCard = ({ title, content, icon }) => (
    <View style={styles.policyCard}>
      <View style={styles.policyHeader}>
        <Text style={styles.policyIcon}>{icon}</Text>
        <Text style={styles.policyTitle}>{title} Policy</Text>
      </View>
      <Text style={styles.policyText}>{content || `Our standard ${title.toLowerCase()} policy applies. Contact us for details.`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <StoreHeader store={store} />
        
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            {['Gear', 'Gallery', 'Reviews', 'Policies'].map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === 'Gear' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Current Listings</Text>
              <Text style={styles.countText}>{listings.length} Items</Text>
            </View>
            {listings.length > 0 ? (
              <FlatList
                data={listings}
                renderItem={renderListing}
                keyExtractor={item => item._id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎸</Text>
                <Text style={styles.emptyTitle}>No gear listed yet</Text>
                <Text style={styles.emptySub}>Check back soon for new arrivals!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Gallery' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Inside the Store</Text>
            <View style={styles.galleryGrid}>
              {store?.gallery?.length > 0 ? store.gallery.map((uri, index) => (
                <View key={index} style={styles.galleryImageWrapper}>
                  <Image source={{ uri: getImageUrl(uri) }} style={styles.galleryImage} />
                </View>
              )) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📸</Text>
                  <Text style={styles.emptyTitle}>No photos yet</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'Policies' && renderPolicies()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontWeight: '600',
  },
  tabBarContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  countText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  listingCard: {
    backgroundColor: COLORS.white,
    width: (width - 55) / 2,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  listingImageContainer: {
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: 160,
  },
  conditionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    height: 40,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 5,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryImageWrapper: {
    width: (width - 55) / 2,
    height: (width - 55) / 2,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  policyCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  policyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  reviewCard: { backgroundColor: COLORS.white, padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  reviewerName: { fontWeight: 'bold', color: COLORS.primary },
  reviewDate: { fontSize: 12, color: COLORS.gray },
  ratingText: { fontSize: 16, marginBottom: 5 },
  reviewTitle: { fontWeight: 'bold', fontSize: 15, color: COLORS.primary, marginBottom: 5 },
  reviewComment: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 10 },
  reviewMedia: { flexDirection: 'row', marginTop: 10 },
  reviewImage: { width: 80, height: 80, borderRadius: 10, marginRight: 10, backgroundColor: COLORS.border },
  reviewBtn: { backgroundColor: COLORS.white, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  reviewBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  sellerReply: { backgroundColor: COLORS.background, padding: 10, borderRadius: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: COLORS.secondary },
  replyLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
  replyText: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
  }
});

export default StorefrontView;
