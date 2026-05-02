import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  TextInput,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import StatusBadge from '../../../components/common/StatusBadge';
import CustomButton from '../../../components/common/CustomButton';

const { width } = Dimensions.get('window');

const ListingDashboard = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const fetchMyListings = async () => {
    try {
      // In a real app, this might be /listings/me or similar
      const response = await api.get('/listings/seller/my-listings');
      setListings(response.data.data);
    } catch (error) {
      console.error('Error fetching listings', error);
      Alert.alert('Error', 'Failed to fetch your listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyListings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyListings();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/listings/${id}`);
          setListings(listings.filter(item => item._id !== id));
          Alert.alert('Success', 'Listing deleted');
        } catch (error) {
          Alert.alert('Error', 'Failed to delete listing');
        }
      }},
    ]);
  };

  const handleMarkSold = async (id) => {
    try {
      await api.put(`/listings/${id}`, { status: 'sold' });
      Alert.alert('Success', 'Gear marked as sold!');
      fetchMyListings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const filteredListings = listings.filter(item => 
    item && item.title && (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderListing = ({ item }) => {
    if (!item) return null;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity 
          style={styles.gridCard}
          onPress={() => navigation.navigate('Dashboard', { screen: 'EditListing', params: { listing: item } })}
        >
          <Image source={{ uri: getImageUrl(item.photos?.[0]) }} style={styles.gridImage} />
          <View style={styles.gridInfo}>
            <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.gridPrice}>Rs. {item.price?.toLocaleString() || '0'}</Text>
            <StatusBadge status={item.status} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.listCard}>
        <Image source={{ uri: getImageUrl(item.photos?.[0]) }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.listBrand}>{item.brand || 'No Brand'}</Text>
          <Text style={styles.listPrice}>Rs. {item.price?.toLocaleString() || '0'}</Text>
          
          <View style={styles.listActions}>
            <TouchableOpacity style={styles.iconAction} onPress={() => navigation.navigate('Dashboard', { screen: 'EditListing', params: { listing: item } })}>
              <Text style={styles.actionEmoji}>✏️</Text>
            </TouchableOpacity>
            {item.status !== 'sold' && (
              <TouchableOpacity style={styles.iconAction} onPress={() => handleMarkSold(item._id)}>
                <Text style={styles.actionEmoji}>💰</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconAction} onPress={() => handleDelete(item._id)}>
              <Text style={styles.actionEmoji}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your gear..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.viewToggle} 
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            <Text style={styles.toggleText}>{viewMode === 'list' ? '📊 Grid View' : '📜 List View'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Add Listing')}>
            <Text style={styles.addBtnText}>+ Add Gear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderListing}
          keyExtractor={item => item._id}
          key={viewMode}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎸</Text>
              <Text style={styles.emptyTitle}>No gear found</Text>
              <Text style={styles.emptySub}>Time to list some awesome music gear!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, backgroundColor: COLORS.white, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  searchContainer: { backgroundColor: COLORS.background, borderRadius: 15, paddingHorizontal: 15, height: 50, justifyContent: 'center', marginBottom: 15 },
  searchInput: { fontSize: 16, color: COLORS.text },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewToggle: { padding: 10 },
  toggleText: { fontWeight: 'bold', color: COLORS.primary },
  addBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  listCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 25, padding: 15, marginBottom: 15, elevation: 3 },
  listImage: { width: 100, height: 100, borderRadius: 20 },
  listInfo: { flex: 1, marginLeft: 15 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, flex: 1, marginRight: 10 },
  listBrand: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  listPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginTop: 5 },
  listActions: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end' },
  iconAction: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  actionEmoji: { fontSize: 16 },
  gridCard: { width: (width - 60) / 2, backgroundColor: COLORS.white, borderRadius: 25, padding: 12, marginBottom: 20, marginHorizontal: 5, elevation: 3 },
  gridImage: { width: '100%', height: 140, borderRadius: 20, marginBottom: 10 },
  gridInfo: { alignItems: 'flex-start' },
  gridTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  gridPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 100 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  emptySub: { fontSize: 14, color: COLORS.gray, marginTop: 5, textAlign: 'center' }
});

export default ListingDashboard;
