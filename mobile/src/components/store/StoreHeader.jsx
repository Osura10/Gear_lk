import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import StatusBadge from '../common/StatusBadge';
import { getImageUrl } from '../../utils/api';

const { width } = Dimensions.get('window');

const defaultBanner = process.env.EXPO_PUBLIC_DEFAULT_BANNER_URL || 'https://images.unsplash.com/photo-1514525253344-f814d074358a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';

const StoreHeader = ({ store }) => {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: store?.bannerUrl ? getImageUrl(store.bannerUrl) : defaultBanner }} 
        style={styles.banner}
      >
        <View style={styles.overlay} />
      </ImageBackground>
      
      <View style={styles.contentContainer}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: store?.logoUrl ? getImageUrl(store.logoUrl) : getImageUrl(null) }} 
              style={styles.logo} 
            />
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.mainInfo}>
            <Text style={styles.name} numberOfLines={1}>{store?.name || 'My Music Shop'}</Text>
            <StatusBadge status={store?.status || 'Active'} />
          </View>
          
          <View style={styles.subInfo}>
            <Text style={styles.location}>📍 {store?.location || 'Nashville, TN'}</Text>
            <View style={styles.divider} />
            <Text style={styles.category}>🎸 {store?.category || 'Guitars & Bass'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {store?.rating || '0.0'}</Text>
            </View>
            <Text style={styles.reviewsText}>{store?.reviewsCount || 0} Reviews</Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.description} numberOfLines={3}>
          {store?.description || 'Providing the finest music gear for professionals and enthusiasts alike.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 180,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  contentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  logoWrapper: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: COLORS.white,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
    paddingTop: 55,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    marginRight: 10,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  divider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
    marginHorizontal: 8,
  },
  category: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBox: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  reviewsText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default StoreHeader;
