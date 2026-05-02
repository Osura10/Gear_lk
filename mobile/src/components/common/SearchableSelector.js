import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList 
} from 'react-native';
import { COLORS } from '../../theme/colors';

const SearchableSelector = ({ 
  label, 
  data, 
  value, 
  onSelect, 
  placeholder = "Select an option..." 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = data.find(item => item._id === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.valueText, !selectedItem && styles.placeholder]}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <FlatList
              data={filteredData}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.item} 
                  onPress={() => {
                    onSelect(item._id);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={[styles.itemText, value === item._id && styles.selectedItemText]}>
                    {item.name}
                  </Text>
                  {value === item._id && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  selector: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    paddingVertical: 12 
  },
  valueText: { fontSize: 16, color: COLORS.text },
  placeholder: { color: COLORS.gray },
  arrow: { color: COLORS.gray, fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 25, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  closeBtn: { fontSize: 20, color: COLORS.gray, padding: 5 },
  searchInput: { backgroundColor: COLORS.background, borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 16 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  itemText: { fontSize: 16, color: COLORS.textSecondary },
  selectedItemText: { color: COLORS.secondary, fontWeight: 'bold' },
  check: { color: COLORS.secondary, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', padding: 20, color: COLORS.gray }
});

export default SearchableSelector;
