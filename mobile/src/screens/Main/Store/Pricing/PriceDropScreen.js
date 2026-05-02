import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS } from '../../../../theme/colors';
import api, { getImageUrl } from '../../../../utils/api';
import CustomInput from '../../../../components/common/CustomInput';
import CustomButton from '../../../../components/common/CustomButton';

const PriceDropScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const [newPrice, setNewPrice] = useState(listing.price.toString());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePriceDrop = async () => {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return Alert.alert('Invalid Price', 'Please enter a valid price.');
    }

    if (priceNum >= listing.price) {
      return Alert.alert('Error', 'New price must be lower than current price for a price drop.');
    }

    setLoading(true);
    try {
      // Logic: Update price and store originalPrice if not already stored
      const payload = {
        price: priceNum,
        originalPrice: listing.originalPrice || listing.price,
        priceDropReason: reason,
        status: 'active'
      };

      await api.put(`/listings/${listing._id}`, payload);
      Alert.alert('Success', 'Price dropped successfully! This listing will now show a discount badge.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gearCard}>
          <Image source={{ uri: getImageUrl(listing.photos?.[0]) }} style={styles.image} />
          <View style={styles.gearInfo}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.currentPrice}>Current Price: Rs. {listing.price.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Drop the Price</Text>
          <Text style={styles.formSub}>Lower prices often lead to faster sales. This will highlight your listing to potential buyers.</Text>
          
          <CustomInput
            label="New Price (Rs.)"
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <CustomInput
            label="Reason (Optional)"
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Moving sale, clearing inventory"
            multiline
            numberOfLines={3}
          />

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Savings for buyer: <Text style={styles.savings}>Rs. {(listing.price - (parseFloat(newPrice) || 0)).toLocaleString()}</Text>
            </Text>
          </View>

          <CustomButton 
            title="Confirm Price Drop" 
            onPress={handlePriceDrop}
            loading={loading}
            style={styles.dropBtn}
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
  currentPrice: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  formCard: { backgroundColor: COLORS.white, padding: 25, borderRadius: 30, elevation: 5 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  formSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8, marginBottom: 25, lineHeight: 20 },
  summaryBox: { backgroundColor: COLORS.background, padding: 15, borderRadius: 15, marginVertical: 20, alignItems: 'center' },
  summaryText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  savings: { color: COLORS.success, fontWeight: 'bold' },
  dropBtn: { height: 55 }
});

export default PriceDropScreen;
