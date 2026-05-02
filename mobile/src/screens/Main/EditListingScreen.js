import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../utils/apiService';
import { COLORS } from '../../theme/colors';

const EditListingScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const [formData, setFormData] = useState({
    title: listing.title,
    brand: listing.brand,
    category: listing.category,
    price: listing.price.toString(),
    condition: listing.condition,
    description: listing.description,
    district: listing.district,
    location: listing.location,
    contactNumber: listing.contactNumber,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { title, brand, price, description, district, location, contactNumber } = formData;
    if (!title || !brand || !price || !description || !district || !location || !contactNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // In this simple edit version, we're only updating text fields.
      // Image update would require more complex logic (swapping photos).
      await apiService.updateListing(listing._id, {
        ...formData,
        price: Number(price),
      });
      
      Alert.alert('Success', 'Listing updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Listing</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={formData.brand}
        onChangeText={(text) => setFormData({ ...formData, brand: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (Rs.)"
        value={formData.price}
        onChangeText={(text) => setFormData({ ...formData, price: text })}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline={true}
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="District"
        value={formData.district}
        onChangeText={(text) => setFormData({ ...formData, district: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
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
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  input: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: COLORS.lightGray },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: COLORS.secondary, padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  buttonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
});

export default EditListingScreen;
