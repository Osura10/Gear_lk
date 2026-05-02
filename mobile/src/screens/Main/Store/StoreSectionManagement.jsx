import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api from '../../../utils/api';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';
import StatusBadge from '../../../components/common/StatusBadge';

const { width } = Dimensions.get('window');

const StoreSectionManagement = ({ route, navigation }) => {
  const [sections, setSections] = useState(route.params?.sections || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentSection, setCurrentSection] = useState({
    title: '',
    description: '',
    displayOrder: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSaveSection = () => {
    if (!currentSection.title) {
      Alert.alert('Error', 'Section title is required');
      return;
    }

    let newSections = [...sections];
    if (editingIndex !== null) {
      newSections[editingIndex] = currentSection;
    } else {
      newSections.push(currentSection);
    }

    setSections(newSections);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentSection({
      title: '',
      description: '',
      displayOrder: sections.length,
      status: 'active'
    });
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setCurrentSection(sections[index]);
    setModalVisible(true);
  };

  const handleDelete = (index) => {
    Alert.alert('Delete Section', 'Are you sure you want to delete this section?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          const newSections = sections.filter((_, i) => i !== index);
          setSections(newSections);
        }
      }
    ]);
  };

  const saveToBackend = async () => {
    setLoading(true);
    try {
      await api.put('/stores/sections', { sections });
      Alert.alert('Success', 'Store sections updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update sections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Store Sections</Text>
          <Text style={styles.subtitle}>Organize your gear into collections that make sense for your customers.</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleArea}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderNum}>{section.displayOrder}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <StatusBadge status={section.status} />
            </View>
            <Text style={styles.sectionDesc} numberOfLines={2}>{section.description || 'No description'}</Text>
            
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(index)} style={styles.actionBtn}>
                <Text style={styles.actionText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)} style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={styles.deleteText}>🗑️ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {sections.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>No custom sections yet.</Text>
            <Text style={styles.emptySub}>Create sections like "Sale" or "New Arrivals" to highlight specific items.</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => { resetForm(); setModalVisible(true); }}
          activeOpacity={0.7}
        >
          <Text style={styles.addBtnText}>+ Create New Section</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton 
          title="Save Store Layout" 
          onPress={saveToBackend} 
          loading={loading}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null ? 'Edit Section' : 'New Section'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput
                label="Section Title"
                value={currentSection.title}
                onChangeText={(text) => setCurrentSection({...currentSection, title: text})}
                placeholder="e.g. Vintage Treasures"
              />

              <CustomInput
                label="Description"
                value={currentSection.description}
                onChangeText={(text) => setCurrentSection({...currentSection, description: text})}
                placeholder="What can buyers find here?"
                multiline
                numberOfLines={3}
              />

              <CustomInput
                label="Display Priority"
                value={currentSection.displayOrder.toString()}
                onChangeText={(text) => setCurrentSection({...currentSection, displayOrder: parseInt(text) || 0})}
                keyboardType="numeric"
                placeholder="Order (0, 1, 2...)"
              />

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Visibility:</Text>
                <TouchableOpacity 
                  style={[styles.statusOption, currentSection.status === 'active' && styles.statusActive]}
                  onPress={() => setCurrentSection({...currentSection, status: 'active'})}
                >
                  <Text style={[styles.statusOptionText, currentSection.status === 'active' && styles.whiteText]}>Public</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.statusOption, currentSection.status === 'inactive' && styles.statusInactive]}
                  onPress={() => setCurrentSection({...currentSection, status: 'inactive'})}
                >
                  <Text style={[styles.statusOptionText, currentSection.status === 'inactive' && styles.whiteText]}>Hidden</Text>
                </TouchableOpacity>
              </View>

              <CustomButton 
                title="Confirm Section" 
                onPress={handleSaveSection} 
                style={styles.modalSubmit}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, lineHeight: 20 },
  sectionCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  orderBadge: { 
    width: 24, 
    height: 24, 
    borderRadius: 8, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10
  },
  orderNum: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  sectionDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, lineHeight: 20 },
  cardActions: { flexDirection: 'row', marginTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  deleteText: { color: COLORS.error, fontWeight: '600', fontSize: 14 },
  addBtn: {
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.secondary + '05',
  },
  addBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
  footer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: COLORS.white, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25,
    maxHeight: '80%'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  closeX: { fontSize: 20, color: COLORS.gray, padding: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  statusLabel: { marginRight: 15, fontWeight: 'bold', color: COLORS.primary },
  statusOption: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, marginRight: 10 },
  statusOptionText: { fontWeight: '600', color: COLORS.textSecondary },
  statusActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  statusInactive: { backgroundColor: COLORS.gray, borderColor: COLORS.gray },
  whiteText: { color: COLORS.white },
  modalSubmit: { marginTop: 10, height: 55 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  emptySub: { color: COLORS.gray, textAlign: 'center', marginTop: 5, fontSize: 13 },
});

export default StoreSectionManagement;
