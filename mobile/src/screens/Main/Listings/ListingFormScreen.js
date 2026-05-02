import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api from '../../../utils/api';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import ImagePickerPreview from '../../../components/common/ImagePickerPreview';
import SearchableSelector from '../../../components/common/SearchableSelector';
import { CATEGORIES, CONDITIONS, DISTRICTS } from '../../../utils/constants';

const ListingFormScreen = ({ route, navigation }) => {
  const { listing } = route.params || {};
  const isEdit = !!listing;

  const [formData, setFormData] = useState({
    title: listing?.title || '',
    brand: listing?.brand || '',
    model: listing?.model || '',
    category: listing?.category || '',
    condition: listing?.condition || CONDITIONS[0] || 'Used',
    price: listing?.price?.toString() || '',
    description: listing?.description || '',
    specifications: listing?.specifications || '',
    district: listing?.district || DISTRICTS[0] || '',
    location: listing?.location || '',
    status: listing?.status || 'active',
  });

  const [images, setImages] = useState(listing?.photos || []);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill required fields (Title, Category, Price)');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append photos
      images.forEach((uri, index) => {
        // If it's a new file (local uri), append as file object
        if (uri.startsWith('file') || uri.startsWith('content')) {
          const filename = uri.split('/').pop();
          let ext = 'jpg'; // Default
          const match = /\.(\w+)$/.exec(filename);
          if (match) ext = match[1];
          
          const finalName = match ? filename : `${filename}.${ext}`;
          
          data.append('photos', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: finalName,
            type: `image/${ext}`
          });
        } else {
          // If it's an existing image (URL from server), send it back as string
          data.append('existingPhotos', uri);
        }
      });

      if (isEdit) {
        await api.put(`/listings/${listing._id}`, data);
      } else {
        await api.post('/listings', data);
      }

      Alert.alert('Success', `Listing ${isEdit ? 'updated' : 'created'} successfully!`);
      navigation.goBack();
    } catch (error) {
      console.error('Save listing error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || error.response?.data || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  const ChipSelector = ({ label, options, value, onSelect }) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const optValue = typeof opt === 'string' ? opt : opt.value;
          return (
            <TouchableOpacity 
              key={optValue} 
              style={[styles.chip, value === optValue ? styles.activeChip : null]}
              onPress={() => onSelect(optValue)}
            >
              <Text style={[styles.chipText, value === optValue ? styles.activeChipText : null]}>{optLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{isEdit ? 'Edit Your Gear' : 'Post Your Ad'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ImagePickerPreview
            images={images}
            onImagesSelected={setImages}
            multiple
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Details</Text>
          <CustomInput
            label="Listing Title *"
            placeholder="e.g. 1965 Fender Stratocaster"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, formData.category === cat ? styles.activeChip : null]}
                  onPress={() => setFormData({...formData, category: cat})}
                >
                  <Text style={[styles.chipText, formData.category === cat ? styles.activeChipText : null]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <CustomInput
              label="Brand *"
              placeholder="e.g. Fender, Gibson, Yamaha"
              value={formData.brand}
              onChangeText={(val) => setFormData({...formData, brand: val})}
              containerStyle={{ flex: 1, marginRight: 10 }}
            />
            <CustomInput
              label="Model"
              placeholder="e.g. Stratocaster"
              value={formData.model}
              onChangeText={(text) => setFormData({...formData, model: text})}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <CustomInput
            label="Price (Rs.) *"
            placeholder="0.00"
            value={formData.price}
            onChangeText={(text) => setFormData({...formData, price: text})}
            keyboardType="numeric"
          />

          <ChipSelector
            label="Condition"
            options={CONDITIONS}
            value={formData.condition}
            onSelect={(val) => setFormData({...formData, condition: val})}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description & Specs</Text>
          <CustomInput
            label="Description"
            placeholder="Describe the sound, history, and condition..."
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline
            numberOfLines={6}
          />
          <CustomInput
            label="Specifications"
            placeholder="Technical specs..."
            value={formData.specifications}
            onChangeText={(text) => setFormData({...formData, specifications: text})}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <ChipSelector
            label="District *"
            options={DISTRICTS}
            value={formData.district}
            onSelect={(val) => setFormData({...formData, district: val})}
          />

          <CustomInput
            label="Exact Location *"
            placeholder="e.g. Colombo 07"
            value={formData.location}
            onChangeText={(text) => setFormData({...formData, location: text})}
          />
        </View>

        <CustomButton 
          title={isEdit ? "Update Listing" : "Publish Listing"} 
          onPress={handleSubmit} 
          loading={loading}
          style={styles.submitBtn} 
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginBottom: 25 },
  section: { backgroundColor: COLORS.white, padding: 20, borderRadius: 25, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.background, paddingBottom: 10 },
  row: { flexDirection: 'row' },
  pickerContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chipScroll: { flexDirection: 'row', paddingVertical: 10 },
  chip: { backgroundColor: COLORS.white, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 25, marginRight: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  activeChipText: { color: COLORS.secondary, fontWeight: 'bold' },
  submitBtn: { height: 60, marginTop: 10, borderRadius: 15 },
});

export default ListingFormScreen;
