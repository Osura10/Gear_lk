import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../utils/apiService';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { DISTRICTS, CATEGORIES, CONDITIONS } from '../../utils/constants';

const AddListingScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: CATEGORIES[0],
    price: '',
    condition: CONDITIONS[0],
    description: '',
    district: user?.district || DISTRICTS[0],
    location: '',
    contactNumber: user?.phone || '',
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `photo-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }));
      setPhotos([...photos, ...selectedImages].slice(0, 5));
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const { title, brand, category, price, condition, description, district, location, contactNumber } = formData;
    if (!title || !brand || !price || !description || !district || !location || !contactNumber) {
      Alert.alert('Error', 'Please fill all text fields');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      photos.forEach((photo, index) => {
        const fileUri = Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri;
        data.append('photos', {
          uri: photo.uri, // Keep file:// for React Native native layer
          name: photo.name || `photo-${index}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });

      await apiService.createListing(data);
      
      Alert.alert('Success', 'Gear listed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('My Listings') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>List your Gear</Text>

      <Text style={styles.sectionLabel}>Photos (Up to 5)</Text>
      <View style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < 5 && (
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
            <Text style={styles.addPhotoText}>+</Text>
            <Text style={styles.addPhotoSub}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Title (e.g. Fender Stratocaster)"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={formData.brand}
        onChangeText={(text) => setFormData({ ...formData, brand: text })}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category:</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.chip, formData.category === cat ? styles.activeChip : null]}
            onPress={() => setFormData({ ...formData, category: cat })}
          >
            <Text style={[styles.chipText, formData.category === cat ? styles.activeChipText : null]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Price (Rs.)"
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
        keyboardType="numeric"
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Condition:</Text>
        {CONDITIONS.map((cond) => (
          <TouchableOpacity 
            key={cond} 
            style={[styles.chip, formData.condition === cond ? styles.activeChip : null]}
            onPress={() => setFormData({ ...formData, condition: cond })}
          >
            <Text style={[styles.chipText, formData.condition === cond ? styles.activeChipText : null]}>{cond}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline={true}
        numberOfLines={4}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>District:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DISTRICTS.map((dist) => (
            <TouchableOpacity 
              key={dist} 
              style={[styles.chip, formData.district === dist ? styles.activeChip : null]}
              onPress={() => setFormData({ ...formData, district: dist })}
            >
              <Text style={[styles.chipText, formData.district === dist ? styles.activeChipText : null]}>{dist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Exact Location"
        value={formData.location}
        onChangeText={(text) => setFormData({ ...formData, location: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
        keyboardType="phone-pad"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text style={styles.buttonText}>Publish Listing</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 10 },
  photoContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  photoWrapper: { width: 100, height: 100, marginRight: 10, marginBottom: 10, borderRadius: 10, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  addPhotoBtn: { width: 100, height: 100, borderRadius: 10, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.gray, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  addPhotoText: { fontSize: 32, color: COLORS.gray },
  addPhotoSub: { fontSize: 10, color: COLORS.gray },
  input: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, width: '100%', color: COLORS.primary },
  pickerContainer: { marginBottom: 20 },
  chip: { backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, marginBottom: 10 },
  activeChip: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  chipText: { color: COLORS.textSecondary, fontSize: 12 },
  activeChipText: { color: COLORS.primary, fontWeight: 'bold' },
  button: { backgroundColor: COLORS.secondary, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  buttonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
});

export default AddListingScreen;
