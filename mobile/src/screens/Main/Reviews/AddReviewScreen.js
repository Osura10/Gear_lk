import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api, { getImageUrl } from '../../../utils/api';
import StarRating from '../../../components/common/StarRating';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import ImagePickerPreview from '../../../components/common/ImagePickerPreview';

const AddReviewScreen = ({ route, navigation }) => {
  const { listing, store } = route.params;
  
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !comment.trim()) {
      return Alert.alert('Incomplete', 'Please provide a title and comment for your review.');
    }

    setLoading(true);
    try {
      const data = new FormData();
      if (listing?._id) data.append('listingId', listing._id);
      if (store?._id) data.append('storeId', store._id);
      data.append('rating', rating.toString());
      data.append('title', title);
      data.append('comment', comment);

      images.forEach((uri) => {
        if (!uri) return;
        if (uri.startsWith('file') || uri.startsWith('content')) {
          const filename = uri.split('/').pop();
          let ext = 'jpg';
          const match = /\.(\w+)$/.exec(filename);
          if (match) ext = match[1];
          const finalName = match ? filename : `${filename}.${ext}`;

          data.append('images', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: finalName,
            type: `image/${ext}`
          });
        }
      });

      await api.post('/reviews', data);
      Alert.alert('Success', 'Thank you for your feedback! Your review has been submitted.');
      navigation.goBack();
    } catch (error) {
      console.error('Review submit error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.targetCard}>
          {listing ? (
            <>
              <Image source={{ uri: getImageUrl(listing.photos?.[0]) }} style={styles.targetImage} />
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>Reviewing Gear</Text>
                <Text style={styles.targetName}>{listing.title}</Text>
              </View>
            </>
          ) : (
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Reviewing Store</Text>
              <Text style={styles.targetName}>{store.storeName}</Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={rating} 
              onRatingPress={setRating} 
              interactive 
              size={40} 
            />
            <Text style={styles.ratingLabel}>
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
            </Text>
          </View>

          <CustomInput
            label="Review Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Summarize your experience"
          />

          <CustomInput
            label="Review Details"
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like or dislike?"
            multiline
            numberOfLines={5}
          />

          <ImagePickerPreview
            label="Add Photos (Optional)"
            images={images}
            onImagesSelected={setImages}
            multiple
          />

          <CustomButton 
            title="Submit Review" 
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  targetCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 25, marginBottom: 20, elevation: 3 },
  targetImage: { width: 50, height: 50, borderRadius: 10 },
  targetInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  targetLabel: { fontSize: 11, color: COLORS.gray, textTransform: 'uppercase' },
  targetName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  formCard: { backgroundColor: COLORS.white, padding: 25, borderRadius: 30, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 25, textAlign: 'center' },
  ratingContainer: { alignItems: 'center', marginBottom: 30 },
  ratingLabel: { marginTop: 10, fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  submitBtn: { marginTop: 10, height: 55 }
});

export default AddReviewScreen;
