import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../../theme/colors';
import api from '../../../utils/api';
import CustomInput from '../../../components/common/CustomInput';
import CustomButton from '../../../components/common/CustomButton';

const StorePolicyManagement = ({ route, navigation }) => {
  const [policies, setPolicies] = useState({
    shipping: route.params?.policies?.shipping || '',
    return: route.params?.policies?.return || '',
    warranty: route.params?.policies?.warranty || '',
    terms: route.params?.policies?.terms || '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('shipping');

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/stores/policies', { policies });
      Alert.alert('Success', 'Store policies updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update policies');
    } finally {
      setLoading(false);
    }
  };

  const PolicyEditor = ({ type, icon, label, placeholder }) => (
    <View style={styles.editorBox}>
      <View style={styles.editorHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.editorIcon}>{icon}</Text>
        </View>
        <Text style={styles.editorLabel}>{label}</Text>
      </View>
      <CustomInput
        placeholder={placeholder}
        value={policies[type]}
        onChangeText={(text) => setPolicies({ ...policies, [type]: text })}
        multiline
        numberOfLines={8}
        containerStyle={styles.inputContainer}
      />
      <Text style={styles.hintText}>This will be displayed clearly on your storefront to help buyers feel confident.</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Trust & Policies</Text>
        <Text style={styles.subtitle}>Clear policies lead to faster sales and fewer disputes.</Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'shipping', label: 'Shipping', icon: '🚚' },
            { id: 'return', label: 'Returns', icon: '🔄' },
            { id: 'warranty', label: 'Warranty', icon: '🛡️' },
            { id: 'terms', label: 'Terms', icon: '📄' },
          ].map(tab => (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'shipping' && (
          <PolicyEditor 
            type="shipping" 
            icon="🚚" 
            label="Shipping Policy" 
            placeholder="e.g. Items are packed professionally and shipped within 48 hours of payment. We use UPS Ground for most shipments."
          />
        )}
        {activeTab === 'return' && (
          <PolicyEditor 
            type="return" 
            icon="🔄" 
            label="Return Policy" 
            placeholder="e.g. 7-day return period for gear that arrives non-functional or significantly different than described."
          />
        )}
        {activeTab === 'warranty' && (
          <PolicyEditor 
            type="warranty" 
            icon="🛡️" 
            label="Warranty" 
            placeholder="e.g. All used items come with a 30-day functional warranty provided by our store."
          />
        )}
        {activeTab === 'terms' && (
          <PolicyEditor 
            type="terms" 
            icon="📄" 
            label="Additional Terms" 
            placeholder="Any other specific conditions for your store..."
          />
        )}

        <CustomButton
          title="Save All Policies"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 25, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 5 },
  tabContainer: { paddingVertical: 15 },
  tabsScroll: { paddingHorizontal: 20 },
  tab: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 15, 
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeTab: { backgroundColor: COLORS.primary },
  tabIcon: { fontSize: 16, marginRight: 8 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  activeTabLabel: { color: COLORS.white },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  editorBox: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  editorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.secondary + '20', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  editorIcon: { fontSize: 20 },
  editorLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  inputContainer: { marginBottom: 15 },
  hintText: { fontSize: 12, color: COLORS.gray, lineHeight: 18 },
  saveBtn: { marginTop: 30, height: 55 }
});

export default StorePolicyManagement;
