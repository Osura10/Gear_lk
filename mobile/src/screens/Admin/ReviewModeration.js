import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../utils/api';
import StarRating from '../../components/common/StarRating';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingReviews = async () => {
    try {
      // In a real app, /reviews/admin/pending
      const response = await api.get('/reviews?status=pending');
      setReviews(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleModerate = async (id, action) => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { status: action });
      Alert.alert('Success', `Review ${action}`);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.user}>{item.user?.name}</Text>
        <StarRating rating={item.rating} size={12} />
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, styles.approveBtn]} 
          onPress={() => handleModerate(item._id, 'approved')}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.rejectBtn]} 
          onPress={() => handleModerate(item._id, 'rejected')}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Moderation</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.secondary} />
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No reviews pending moderation.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  user: { fontWeight: 'bold', color: COLORS.primary },
  comment: { color: COLORS.textSecondary, marginBottom: 15 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  approveBtn: { backgroundColor: COLORS.success },
  rejectBtn: { backgroundColor: COLORS.error },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 50, color: COLORS.gray }
});

export default ReviewModeration;
