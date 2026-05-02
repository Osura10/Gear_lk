import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>District</Text>
          <Text style={styles.value}>{user?.district}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{user?.address}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}>GearLK v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: COLORS.secondary, fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  email: { color: COLORS.gray, marginBottom: 10 },
  roleBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  roleText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  section: { backgroundColor: COLORS.white, marginTop: 20, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  label: { color: COLORS.gray },
  value: { color: COLORS.primary, fontWeight: '500' },
  logoutBtn: { margin: 20, backgroundColor: '#fff0f0', padding: 18, borderRadius: 12, alignItems: 'center' },
  logoutBtnText: { color: COLORS.error, fontWeight: 'bold', fontSize: 16 },
  version: { textAlign: 'center', color: COLORS.gray, fontSize: 10, marginBottom: 30 },
});

export default ProfileScreen;
