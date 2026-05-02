import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../theme/colors';
import api from '../../../utils/api';
import StoreHeader from '../../../components/store/StoreHeader';
import CustomButton from '../../../components/common/CustomButton';

const { width } = Dimensions.get('window');

const StoreDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeDeals: 0,
    monthlyViews: 1250,
    pendingOrders: 2
  });

  const fetchStoreData = async () => {
    try {
      const response = await api.get('/stores/me');
      setStore(response.data.data);
      
      // Mock stats for better UI demonstration
      setStats({
        totalListings: 24,
        activeDeals: 5,
        monthlyViews: 3420,
        pendingOrders: 3
      });
    } catch (error) {
      if (error.response?.status === 404) {
        navigation.navigate('StoreProfile', { isNew: true });
      } else {
        Alert.alert('Error', 'Failed to fetch store details');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStoreData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStoreData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  const ManagementCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.mgmtCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.mgmtIconBox, { backgroundColor: color + '15' }]}>
        <Text style={[styles.mgmtIcon, { color: color }]}>{icon}</Text>
      </View>
      <View style={styles.mgmtInfo}>
        <Text style={styles.mgmtTitle}>{title}</Text>
        <Text style={styles.mgmtSub}>Manage your store {title.toLowerCase()}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <StoreHeader store={store} />

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderLeftColor: '#4361EE' }]}>
            <Text style={styles.statLabel}>Active Gear</Text>
            <Text style={styles.statValue}>{stats.totalListings}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#4CC9F0' }]}>
            <Text style={styles.statLabel}>Store Views</Text>
            <Text style={styles.statValue}>{stats.monthlyViews}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#7209B7' }]}>
            <Text style={styles.statLabel}>Open Orders</Text>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#F72585' }]}>
            <Text style={styles.statLabel}>Active Deals</Text>
            <Text style={styles.statValue}>{stats.activeDeals}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Store Management</Text>
        <ManagementCard 
          title="Store Profile" 
          icon="🏢" 
          color="#4361EE"
          onPress={() => navigation.navigate('StoreProfile', { isNew: false, storeData: store })}
        />
        <ManagementCard 
          title="Store Sections" 
          icon="📁" 
          color="#4CC9F0"
          onPress={() => navigation.navigate('StoreSections', { sections: store?.sections })}
        />
        <ManagementCard 
          title="Store Policies" 
          icon="📜" 
          color="#7209B7"
          onPress={() => navigation.navigate('StorePolicies', { policies: store?.policies })}
        />
        <ManagementCard 
          title="Pricing & Deals" 
          icon="🔥" 
          color="#F72585"
          onPress={() => navigation.navigate('PricingDashboard')}
        />
      </View>

      <View style={styles.previewContainer}>
        <TouchableOpacity 
          style={styles.previewBtn}
          onPress={() => navigation.navigate('StorefrontView', { storeId: store?._id })}
        >
          <Text style={styles.previewBtnText}>🌐 View Public Storefront</Text>
        </TouchableOpacity>
        <Text style={styles.previewHint}>Check how customers see your store profile and gear listings.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: COLORS.white,
    width: (width - 45) / 2,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  },
  actionsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  mgmtCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  mgmtIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mgmtIcon: {
    fontSize: 24,
  },
  mgmtInfo: {
    flex: 1,
    marginLeft: 15,
  },
  mgmtTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mgmtSub: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  previewContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  previewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
  },
  previewBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  }
});

export default StoreDashboard;
