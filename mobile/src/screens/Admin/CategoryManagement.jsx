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

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: null,
    status: 'active',
  });
  const [icon, setIcon] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return Alert.alert('Error', 'Category name is required');
    
    setLoading(true);
    try {
      const payload = { ...formData, icon: icon[0] };
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        Alert.alert('Success', 'Category updated');
      } else {
        await api.post('/categories', payload);
        Alert.alert('Success', 'Category created');
      }
      setModalVisible(false);
      fetchCategories();
      resetForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Category', 'Are you sure? This will affect subcategories.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/categories/${id}`);
          fetchCategories();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete category');
        }
      }}
    ]);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parent: null, status: 'active' });
    setIcon([]);
    setEditingCategory(null);
  };

  const renderCategory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: getImageUrl(item.icon) }} style={styles.catIcon} />
        <View style={styles.catInfo}>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={styles.catDesc} numberOfLines={1}>{item.description || 'No description'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setEditingCategory(item); setFormData(item); setIcon(item.icon ? [item.icon] : []); setModalVisible(true); }}>
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
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Text style={styles.addBtnText}>+ New Category</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.secondary} /> : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'New Category'}</Text>
            <ScrollView>
              <CustomInput label="Name" value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />
              <CustomInput label="Description" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} multiline />
              <ImagePickerPreview label="Category Icon" images={icon} onImagesSelected={setIcon} aspect={[1, 1]} />
              
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
  catIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.background },
  catInfo: { flex: 1, marginLeft: 15 },
  catName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  catDesc: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  actions: { flexDirection: 'row' },
  editEmoji: { fontSize: 18, marginRight: 15 },
  deleteEmoji: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btn: { width: '48%' }
});

export default CategoryManagement;
