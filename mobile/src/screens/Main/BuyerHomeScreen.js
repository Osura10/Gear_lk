import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput, ScrollView, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiService from '../../utils/apiService';
import { getImageUrl } from '../../utils/api';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { DISTRICTS, CATEGORIES, CONDITIONS } from '../../utils/constants';

const BuyerHomeScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchListings();
  }, [category]);

  const fetchListings = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await apiService.getAllListings(params);
      setListings(response.data.data);
    } catch (error) {
      console.log('Error fetching listings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchListings();
  };

  const renderListing = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('InstrumentDetails', { id: item._id })}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getImageUrl(item.photos?.[0]) }} 
          style={styles.image} 
        />
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.brandText}>{item.brand}</Text>
          <Text style={styles.districtText}>{item.district}</Text>
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.priceText}>Rs. {item.price.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ImageBackground 
        source={{ uri: process.env.EXPO_PUBLIC_HOME_BANNER_URL || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.hero}
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.welcomeText}>Ayubowan, {user?.name.split(' ')[0]}!</Text>
          <Text style={styles.heroSubText}>Find the perfect instrument for your soul.</Text>
          
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search guitars, drums, keys..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          <TouchableOpacity 
            style={[styles.filterChip, !category ? styles.activeChip : null]} 
            onPress={() => setCategory('')}
          >
            <Text style={[styles.filterChipText, !category ? styles.activeChipText : null]}>All Gear</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, category === cat ? styles.activeChip : null]} 
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.filterChipText, category === cat ? styles.activeChipText : null]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loaderText}>Tuning the marketplace...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          renderItem={renderListing}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎸</Text>
              <Text style={styles.emptyTitle}>No gear found</Text>
              <Text style={styles.emptySub}>Try searching for something else or browse another category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { width: '100%', height: 260 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 25, justifyContent: 'flex-end' },
  welcomeText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  heroSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20 },
  searchBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 30, height: 50, alignItems: 'center', paddingHorizontal: 5 },
  searchInput: { flex: 1, height: '100%', paddingHorizontal: 15, fontSize: 14, color: COLORS.primary },
  searchBtn: { width: 40, height: 40, backgroundColor: COLORS.secondary, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { fontSize: 18 },
  filterSection: { paddingVertical: 15, backgroundColor: COLORS.white, elevation: 2 },
  filterBar: { paddingHorizontal: 15 },
  filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: COLORS.background, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { color: COLORS.gray, fontWeight: '600', fontSize: 13 },
  activeChipText: { color: COLORS.secondary },
  list: { padding: 10 },
  columnWrapper: { justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.white, width: '48%', borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imageContainer: { width: '100%', height: 160 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  conditionBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  conditionText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  cardContent: { padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  brandText: { fontSize: 10, color: COLORS.gray, fontWeight: 'bold', textTransform: 'uppercase' },
  districtText: { fontSize: 10, color: COLORS.gray },
  listingTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 6 },
  priceText: { fontSize: 16, fontWeight: 'bold', color: COLORS.accent },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, color: COLORS.gray, fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 100, padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20 },
});

export default BuyerHomeScreen;
