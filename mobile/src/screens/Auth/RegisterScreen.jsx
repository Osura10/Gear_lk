import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone || !address || !district) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone, role, address, district);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Join the GearLK community</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="District"
        value={district}
        onChangeText={setDistrict}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <Text style={styles.label}>I want to:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'buyer' ? styles.roleButtonActive : null]} 
          onPress={() => setRole('buyer')}
        >
          <Text style={[styles.roleButtonText, role === 'buyer' ? styles.roleButtonActiveText : null]}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'seller' ? styles.roleButtonActive : null]} 
          onPress={() => setRole('seller')}
        >
          <Text style={[styles.roleButtonText, role === 'seller' ? styles.roleButtonActiveText : null]}>Sell</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  roleButtonActiveText: {
    color: COLORS.white,
  },
});

export default RegisterScreen;
