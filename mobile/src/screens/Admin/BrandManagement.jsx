import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api, { getImageUrl } from '../../utils/api';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import ImagePickerPreview from '../../components/common/ImagePickerPreview';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    website: '',
    status: 'active',
  });
  const [logo, setLogo] = useState([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return Alert.alert('Error', 'Brand name is required');
    
    setLoading(true);
    try {
      const payload = { ...formData, logo: logo[0] };
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, payload);
        Alert.alert('Success', 'Brand updated');
      } else {
        await api.post('/brands', payload);
        Alert.alert('Success', 'Brand created');
      }
      setModalVisible(false);
      fetchBrands();
      resetForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Brand', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/brands/${id}`);
          fetchBrands();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete brand');
        }
      }}
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', country: '', website: '', status: 'active' });
    setLogo([]);
    setEditingBrand(null);
  };

  const renderBrand = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: getImageUrl(item.logo) }} style={styles.brandLogo} />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{item.name}</Text>
          <Text style={styles.brandCountry}>🏳️ {item.country || 'N/A'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setEditingBrand(item); setFormData(item); setLogo(item.logo ? [item.logo] : []); setModalVisible(true); }}>
            <Text style={styles.editEmoji}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={styles.deleteEmoji}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brands</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Text style={styles.addBtnText}>+ Add Brand</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.secondary} /> : (
        <FlatList
          data={brands}
          renderItem={renderBrand}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBrand ? 'Edit Brand' : 'New Brand'}</Text>
            <ScrollView>
              <CustomInput label="Brand Name" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <View style={styles.row}>
                <CustomInput label="Country" value={formData.country} onChangeText={t => setFormData({...formData, country: t})} containerStyle={{ flex: 1, marginRight: 10 }} />
                <CustomInput label="Website" value={formData.website} onChangeText={t => setFormData({...formData, website: t})} containerStyle={{ flex: 1 }} />
              </View>
              <CustomInput label="Description" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} multiline />
              <ImagePickerPreview label="Brand Logo" images={logo} onImagesSelected={setLogo} aspect={[1, 1]} />
              
              <View style={styles.modalButtons}>
                <CustomButton title="Cancel" type="outline" onPress={() => setModalVisible(false)} style={styles.btn} />
                <CustomButton title="Save" onPress={handleSave} style={styles.btn} loading={loading} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  addBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  list: { padding: 20 },
  card: { backgroundColor: COLORS.white, padding: 15, borderRadius: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: { width: 50, height: 50, borderRadius: 10, backgroundColor: COLORS.background, resizeMode: 'contain' },
  brandInfo: { flex: 1, marginLeft: 15 },
  brandName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  brandCountry: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  actions: { flexDirection: 'row' },
  editEmoji: { fontSize: 18, marginRight: 15 },
  deleteEmoji: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  row: { flexDirection: 'row' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { width: '48%' }
});

export default BrandManagement;
