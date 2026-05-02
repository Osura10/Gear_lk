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
import { COLORS } from '../../../../theme/colors';
import api, { getImageUrl } from '../../../../utils/api';
import CustomInput from '../../../../components/common/CustomInput';
import CustomButton from '../../../../components/common/CustomButton';
import ImagePickerPreview from '../../../../components/common/ImagePickerPreview';

const ManageDealScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  
  const [formData, setFormData] = useState({
    dealTitle: listing.dealTitle || 'Special Offer',
    dealDescription: listing.dealDescription || '',
    discountPrice: listing.discountPrice?.toString() || (listing.price * 0.9).toFixed(2),
    startDate: listing.dealStartDate || new Date().toISOString().split('T')[0],
    endDate: listing.dealEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: listing.dealStatus || 'active'
  });

  const [banner, setBanner] = useState(listing.dealBanner ? [listing.dealBanner] : []);
  const [loading, setLoading] = useState(false);

  const calculateDiscount = () => {
    const original = listing.price;
    const discounted = parseFloat(formData.discountPrice) || original;
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleSaveDeal = async () => {
    const discPrice = parseFloat(formData.discountPrice);
    if (isNaN(discPrice) || discPrice <= 0 || discPrice >= listing.price) {
      return Alert.alert('Invalid Price', 'Discount price must be lower than the current price.');
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dealStatus: 'active',
        dealBanner: banner[0],
        price: discPrice, // Update main price to reflect deal
        originalPrice: listing.originalPrice || listing.price
      };

      await api.put(`/listings/${listing._id}`, payload);
      Alert.alert('Success', 'Promotion launched successfully! Your gear will now be featured with the deal badge.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save deal');
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
        <View style={styles.gearCard}>
          <Image source={{ uri: getImageUrl(listing.photos?.[0]) }} style={styles.image} />
          <View style={styles.gearInfo}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.basePrice}>Base Price: Rs. {listing.price.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Campaign Details</Text>
          
          <CustomInput
            label="Deal Title"
            value={formData.dealTitle}
            onChangeText={t => setFormData({...formData, dealTitle: t})}
            placeholder="e.g. Flash Sale, Holiday Deal"
          />

          <View style={styles.priceContainer}>
            <CustomInput
              label="Deal Price (Rs.)"
              value={formData.discountPrice}
              onChangeText={t => setFormData({...formData, discountPrice: t})}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
            />
            <View style={styles.percentBox}>
              <Text style={styles.percentText}>{calculateDiscount()}% OFF</Text>
            </View>
          </View>

          <View style={styles.row}>
            <CustomInput
              label="Start Date"
              value={formData.startDate}
              onChangeText={t => setFormData({...formData, startDate: t})}
              placeholder="YYYY-MM-DD"
              containerStyle={{ flex: 1, marginRight: 10 }}
            />
            <CustomInput
              label="End Date"
              value={formData.endDate}
              onChangeText={t => setFormData({...formData, endDate: t})}
              placeholder="YYYY-MM-DD"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <CustomInput
            label="Deal Description"
            value={formData.dealDescription}
            onChangeText={t => setFormData({...formData, dealDescription: t})}
            placeholder="Extra value? Limited time?"
            multiline
            numberOfLines={3}
          />

          <ImagePickerPreview
            label="Promo Banner (Optional)"
            images={banner}
            onImagesSelected={setBanner}
            aspect={[16, 9]}
          />

          <CustomButton 
            title="Launch Promotion" 
            onPress={handleSaveDeal}
            loading={loading}
            style={styles.launchBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  gearCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 15, borderRadius: 25, marginBottom: 20, elevation: 3 },
  image: { width: 60, height: 60, borderRadius: 12 },
  gearInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  basePrice: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  formCard: { backgroundColor: COLORS.white, padding: 25, borderRadius: 30, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 },
  percentBox: { backgroundColor: COLORS.secondary + '20', height: 50, paddingHorizontal: 15, borderRadius: 12, justifyContent: 'center', marginLeft: 15, marginBottom: 20 },
  percentText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14 },
  row: { flexDirection: 'row' },
  launchBtn: { marginTop: 10, height: 55 }
});

export default ManageDealScreen;
