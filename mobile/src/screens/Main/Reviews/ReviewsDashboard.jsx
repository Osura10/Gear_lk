import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import StarRating from '../../../components/common/StarRating';
import CustomButton from '../../../components/common/CustomButton';

const ReviewsDashboard = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    try {
      // In a real app, this would be /reviews/seller/my-reviews
      const response = await api.get('/reviews/store/my-store');
      setReviews(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      await api.post(`/reviews/${selectedReview._id}/reply`, { comment: replyText });
      Alert.alert('Success', 'Reply posted');
      setReplyModalVisible(false);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user?.name || 'Customer'}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <StarRating rating={item.rating} size={14} />
      </View>

      <Text style={styles.reviewTitle}>{item.title}</Text>
      <Text style={styles.reviewText}>{item.comment}</Text>

      {item.listing && (
        <View style={styles.listingBox}>
          <Text style={styles.listingLabel}>Product: <Text style={styles.listingName}>{item.listing.title}</Text></Text>
        </View>
      )}

      {item.reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Your Reply:</Text>
          <Text style={styles.replyText}>{item.reply.comment}</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.replyBtn}
          onPress={() => { setSelectedReview(item); setReplyModalVisible(true); }}
        >
          <Text style={styles.replyBtnText}>Reply to Customer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reviews & Ratings</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Total Reviews</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg. Rating</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.secondary} />
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReviews} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyText}>No reviews yet.</Text>
            </View>
          }
        />
      )}

      <Modal visible={replyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reply to Review</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Write your reply here..."
              multiline
              numberOfLines={4}
              value={replyText}
              onChangeText={setReplyText}
            />
            <View style={styles.modalButtons}>
              <CustomButton title="Cancel" type="outline" onPress={() => setReplyModalVisible(false)} style={styles.modalBtn} />
              <CustomButton title="Post Reply" onPress={handleReply} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 25, backgroundColor: COLORS.white, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  statsRow: { flexDirection: 'row', marginTop: 20 },
  stat: { marginRight: 40 },
  statVal: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
  statLabel: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  list: { padding: 20 },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: 25, padding: 20, marginBottom: 15, elevation: 3 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  userName: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  date: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  reviewTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  reviewText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  listingBox: { marginTop: 12, backgroundColor: COLORS.background, padding: 8, borderRadius: 10 },
  listingLabel: { fontSize: 11, color: COLORS.gray },
  listingName: { color: COLORS.primary, fontWeight: '600' },
  replyBox: { marginTop: 15, backgroundColor: '#F0F7FF', padding: 15, borderRadius: 15, borderLeftWidth: 3, borderLeftColor: COLORS.secondary },
  replyLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
  replyText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  replyBtn: { marginTop: 15, borderTopWidth: 1, borderTopColor: COLORS.background, paddingTop: 15, alignItems: 'center' },
  replyBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { color: COLORS.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  replyInput: { backgroundColor: COLORS.background, borderRadius: 15, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { width: '48%' }
});

export default ReviewsDashboard;
