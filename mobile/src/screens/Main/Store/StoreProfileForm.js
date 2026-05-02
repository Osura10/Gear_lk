import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api from '../../../utils/api';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import ImagePickerPreview from '../../../components/common/ImagePickerPreview';

const StoreProfileForm = ({ route, navigation }) => {
  const { isNew, storeData } = route.params || { isNew: true };

  const [formData, setFormData] = useState({
    name: storeData?.name || '',
    description: storeData?.description || '',
    businessName: storeData?.businessName || '',
    email: storeData?.email || '',
    contactNumber: storeData?.contactNumber || '',
    location: storeData?.location || '',
    category: storeData?.category || '',
    status: storeData?.status || 'active',
  });

  const [logo, setLogo] = useState(storeData?.logoUrl ? [storeData.logoUrl] : []);
  const [banner, setBanner] = useState(storeData?.bannerUrl ? [storeData.bannerUrl] : []);
  const [gallery, setGallery] = useState(storeData?.gallery || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Basic Info', 'Contact', 'Media'];

  const validateStep = (step) => {
    let newErrors = {};
    if (step === 0) {
      if (!formData.name) newErrors.name = 'Store name is required';
      if (!formData.description) newErrors.description = 'Description is required';
      if (!formData.category) newErrors.category = 'Specialty is required';
    } else if (step === 1) {
      if (!formData.location) newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Helper function to append images safely
      const appendImage = (uri, fieldName) => {
        if (!uri) return;
        if (uri.startsWith('file') || uri.startsWith('content')) {
          const filename = uri.split('/').pop();
          let ext = 'jpg';
          const match = /\.(\w+)$/.exec(filename);
          if (match) ext = match[1];
          const finalName = match ? filename : `${filename}.${ext}`;

          data.append(fieldName, {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            name: finalName,
            type: `image/${ext}`
          });
        }
      };

      if (logo.length > 0) appendImage(logo[0], 'logo');
      if (banner.length > 0) appendImage(banner[0], 'banner');

      if (isNew) {
        await api.post('/stores', data);
      } else {
        await api.put(`/stores/${storeData._id}`, data);
      }
      
      Alert.alert('Success', `Store ${isNew ? 'created' : 'updated'} successfully!`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save store profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepDot, 
              activeStep >= index && styles.stepDotActive,
              activeStep === index && styles.stepDotCurrent
            ]}>
              {activeStep > index ? <Text style={styles.check}>✓</Text> : <Text style={[styles.stepNum, activeStep >= index && styles.stepNumActive]}>{index + 1}</Text>}
            </View>
            <Text style={[styles.stepText, activeStep >= index && styles.stepTextActive]}>{step}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeStep === 0 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <CustomInput
              label="Store Name *"
              placeholder="e.g. Nashville Guitar Co."
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
            />
            <CustomInput
              label="Specialty / Category *"
              placeholder="e.g. Vintage Guitars, Pro Audio"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
              error={errors.category}
            />
            <CustomInput
              label="Store Description *"
              placeholder="Tell your story..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </View>
        )}

        {activeStep === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact & Business</Text>
            <CustomInput
              label="Legal Business Name"
              placeholder="Your Registered Business Name"
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            />
            <CustomInput
              label="Store Email"
              placeholder="contact@yourstore.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />
            <CustomInput
              label="Contact Number"
              placeholder="+1 234 567 890"
              value={formData.contactNumber}
              onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
              keyboardType="phone-pad"
            />
            <CustomInput
              label="Store Location *"
              placeholder="City, State"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              error={errors.location}
            />
          </View>
        )}

        {activeStep === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Store Media</Text>
            <ImagePickerPreview
              label="Store Logo (Square)"
              images={logo}
              onImagesSelected={setLogo}
              aspect={[1, 1]}
            />
            <ImagePickerPreview
              label="Cover Banner (Wide)"
              images={banner}
              onImagesSelected={setBanner}
              aspect={[16, 9]}
            />
          </View>
        )}

        <View style={styles.buttonRow}>
          {activeStep > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setActiveStep(activeStep - 1)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          {activeStep < steps.length - 1 ? (
            <CustomButton
              title="Next Step"
              onPress={handleNext}
              style={styles.nextBtn}
            />
          ) : (
            <CustomButton
              title={isNew ? "Launch Store" : "Save Changes"}
              onPress={handleSubmit}
              loading={loading}
              style={styles.nextBtn}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepDotActive: {
    backgroundColor: COLORS.secondary,
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  stepNumActive: {
    color: COLORS.primary,
  },
  check: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '600',
  },
  stepTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  backBtnText: {
    color: COLORS.gray,
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextBtn: {
    flex: 1,
    height: 55,
  }
});

export default StoreProfileForm;
