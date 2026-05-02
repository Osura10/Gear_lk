import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

const SellerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone || !address || !district) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone, 'seller', address, district);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seller Sign Up</Text>
      <Text style={styles.subtitle}>Reach thousands of musicians in Sri Lanka</Text>

      <TextInput style={styles.input} placeholder="Store/Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Business Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Store Address" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="District" value={district} onChangeText={setDistrict} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.buttonText}>Join as Seller</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('BuyerRegister')}>
        <Text style={styles.linkText}>Just looking to buy? Register as Buyer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.accent, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.gray, textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: COLORS.white, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: COLORS.lightGray },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  linkText: { color: COLORS.gray, textAlign: 'center', marginTop: 20 },
});

export default SellerRegisterScreen;
