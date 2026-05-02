import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

const SellerDashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { title: 'My Listings', icon: '🎸', screen: 'My Listings' },
    { title: 'List New Gear', icon: '➕', screen: 'Add Listing' },
    { title: 'Messages', icon: '💬', screen: 'Messages' },
    { title: 'Order Requests', icon: '📋', screen: 'Orders' },
    { title: 'Manage Store', icon: '🏪', screen: 'StoreDashboard' },
    { title: 'Categories', icon: '📁', screen: 'CategoryManagement' },
    { title: 'Brands', icon: '🏷️', screen: 'BrandManagement' },
    { title: 'Customer Reviews', icon: '⭐', screen: 'ReviewsDashboard' },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Verified Seller</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Active Ads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 30, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  headerInfo: { marginLeft: 20 },
  welcome: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  name: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  roleBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 5, alignSelf: 'flex-start' },
  roleText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.white, width: '47%', padding: 25, borderRadius: 15, marginBottom: 20, alignItems: 'center', elevation: 2 },
  icon: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  statsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1, backgroundColor: COLORS.white, padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
  statLabel: { fontSize: 10, color: COLORS.gray, marginTop: 5 },
  logoutBtn: { margin: 20, padding: 18, backgroundColor: COLORS.error + '10', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.error + '30' },
  logoutBtnText: { color: COLORS.error, fontWeight: 'bold', fontSize: 16 },
});

export default SellerDashboardScreen;
