import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../theme/colors';
import { getImageUrl } from '../../utils/api';

const ImagePickerPreview = ({ 
  label, 
  images, 
  onImagesSelected, 
  multiple = false,
  aspect = [16, 9]
}) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: !multiple,
      aspect: aspect,
      quality: 0.8,
      allowsMultipleSelection: multiple,
    });

    if (!result.canceled) {
      if (multiple) {
        const selectedUris = result.assets.map(asset => asset.uri);
        onImagesSelected([...images, ...selectedUris]);
      } else {
        onImagesSelected([result.assets[0].uri]);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesSelected(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: getImageUrl(uri) }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeBtn} 
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {(multiple || images.length === 0) && (
          <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
            <Text style={styles.pickIcon}>+</Text>
            <Text style={styles.pickText}>Upload</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  scroll: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  removeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: -2,
  },
  pickBtn: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '05',
  },
  pickIcon: {
    fontSize: 32,
    color: COLORS.secondary,
  },
  pickText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 5,
  },
});

export default ImagePickerPreview;
