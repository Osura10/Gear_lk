import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import apiService from '../../utils/apiService';
import { getImageUrl } from '../../utils/api';
import { COLORS } from '../../theme/colors';

const ListingItem = ({ item, navigation, handleMarkAsSold, handleDelete }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(item.photos?.[0]);

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: imageError ? 'https://via.placeholder.com/150?text=No+Image' : imageUrl }} 
        style={styles.thumbnail} 
        onError={() => setImageError(true)}
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, item.status === 'sold' ? styles.soldBadge : null]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.price}>Rs. {item.price?.toLocaleString()}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditListing', { listing: item })}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          {item.status !== 'sold' && (
            <TouchableOpacity style={[styles.actionBtn, styles.soldBtn]} onPress={() => handleMarkAsSold(item._id)}>
              <Text style={styles.soldBtnText}>Mark as Sold</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MyListingsScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await apiService.getMyListings();
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
    fetchMyListings();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiService.deleteListing(id);
          setListings(listings.filter(item => item._id !== id));
          Alert.alert('Success', 'Listing deleted');
        } catch (error) {
          Alert.alert('Error', 'Failed to delete listing');
        }
      }},
    ]);
  };

  const handleMarkAsSold = async (id) => {
    try {
      await apiService.updateListing(id, { status: 'sold' });
      Alert.alert('Success', 'Listing marked as sold');
      fetchMyListings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderItem = ({ item }) => (
    <ListingItem 
      item={item} 
      navigation={navigation} 
      handleMarkAsSold={handleMarkAsSold} 
      handleDelete={handleDelete} 
    />
  );

  if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.secondary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>You haven't listed any gear yet.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('List Gear')}>
              <Text style={styles.addBtnText}>List Your First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 50 },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 15, padding: 12, marginBottom: 15, elevation: 2 },
  thumbnail: { width: 90, height: 90, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, flex: 1, marginRight: 5 },
  statusBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  soldBadge: { backgroundColor: '#ffebee' },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: COLORS.primary },
  price: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 10 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: COLORS.lightGray, marginRight: 8 },
  actionText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  soldBtn: { backgroundColor: COLORS.secondary },
  soldBtnText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  deleteBtn: { backgroundColor: '#fff0f0' },
  deleteBtnText: { fontSize: 12, fontWeight: 'bold', color: COLORS.error },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: COLORS.gray, marginBottom: 20 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: COLORS.white, fontWeight: 'bold' },
});

export default MyListingsScreen;
