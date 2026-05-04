import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import BuyerRegisterScreen from '../screens/Auth/BuyerRegisterScreen';
import SellerRegisterScreen from '../screens/Auth/SellerRegisterScreen';

// Main Screens
import BuyerHomeScreen from '../screens/Main/BuyerHomeScreen';
import SellerDashboardScreen from '../screens/Main/SellerDashboardScreen';
import EditListingScreen from '../screens/Main/Listings/ListingFormScreen';
import ListingDetailsScreen from '../screens/Main/Listings/ListingDetailsView';
import MyListingsScreen from '../screens/Main/Listings/ListingDashboard';
import AddListingScreen from '../screens/Main/Listings/ListingFormScreen';
import OrdersScreen from '../screens/Main/OrdersScreen';
import CartScreen from '../screens/Main/CartScreen';
import BuyerOrdersScreen from '../screens/Main/BuyerOrdersScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import CategoryManagement from '../screens/Admin/CategoryManagement';
import BrandManagement from '../screens/Admin/BrandManagement';
import ReviewsDashboard from '../screens/Main/Reviews/ReviewsDashboard';
import AddReviewScreen from '../screens/Main/Reviews/AddReviewScreen';
import ReviewModeration from '../screens/Admin/ReviewModeration';

// Store Screens
import StoreDashboard from '../screens/Main/Store/StoreDashboard';
import StoreProfileForm from '../screens/Main/Store/StoreProfileForm';
import StorefrontView from '../screens/Main/Store/StorefrontView';
import StoreSectionManagement from '../screens/Main/Store/StoreSectionManagement';
import StorePolicyManagement from '../screens/Main/Store/StorePolicyManagement';
import PricingDashboard from '../screens/Main/Store/Pricing/PricingDashboard';
import PriceDropScreen from '../screens/Main/Store/Pricing/PriceDropScreen';
import ManageDealScreen from '../screens/Main/Store/Pricing/ManageDealScreen';
import VoucherManagement from '../screens/Main/Store/VoucherManagement';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="BuyerRegister" component={BuyerRegisterScreen} />
    <AuthStack.Screen name="SellerRegister" component={SellerRegisterScreen} />
  </AuthStack.Navigator>
);

const HomeStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="Marketplace" component={BuyerHomeScreen} options={{ headerShown: false }} />
    <MainStack.Screen name="InstrumentDetails" component={ListingDetailsScreen} options={{ title: 'Details' }} />
    <MainStack.Screen name="EditListing" component={EditListingScreen} options={{ title: 'Edit Listing' }} />
    <MainStack.Screen name="StoreDashboard" component={StoreDashboard} options={{ title: 'Store Management' }} />
    <MainStack.Screen name="StoreProfile" component={StoreProfileForm} options={{ title: 'Store Profile' }} />
    <MainStack.Screen name="StorefrontView" component={StorefrontView} options={{ title: 'Storefront' }} />
    <MainStack.Screen name="StoreSections" component={StoreSectionManagement} options={{ title: 'Store Sections' }} />
    <MainStack.Screen name="StorePolicies" component={StorePolicyManagement} options={{ title: 'Store Policies' }} />
    <MainStack.Screen name="CategoryManagement" component={CategoryManagement} options={{ title: 'Manage Categories' }} />
    <MainStack.Screen name="BrandManagement" component={BrandManagement} options={{ title: 'Manage Brands' }} />
    <MainStack.Screen name="AddReview" component={AddReviewScreen} options={{ title: 'Write a Review' }} />
    <MainStack.Screen name="ReviewModeration" component={ReviewModeration} options={{ title: 'Moderate Reviews' }} />
  </MainStack.Navigator>
);

const BuyerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: { backgroundColor: COLORS.primary, height: 60, paddingBottom: 10 },
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
    <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Requests' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Account' }} />
  </Tab.Navigator>
);

const SellerStack = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="SellerDashboardMain" component={SellerDashboardScreen} options={{ headerShown: false }} />
    <MainStack.Screen name="StoreDashboard" component={StoreDashboard} options={{ title: 'Store Management' }} />
    <MainStack.Screen name="StoreProfile" component={StoreProfileForm} options={{ title: 'Store Profile' }} />
    <MainStack.Screen name="StorefrontView" component={StorefrontView} options={{ title: 'Storefront' }} />
    <MainStack.Screen name="StoreSections" component={StoreSectionManagement} options={{ title: 'Store Sections' }} />
    <MainStack.Screen name="StorePolicies" component={StorePolicyManagement} options={{ title: 'Store Policies' }} />
    <MainStack.Screen name="EditListing" component={EditListingScreen} options={{ title: 'Edit Listing' }} />
    <MainStack.Screen name="PricingDashboard" component={PricingDashboard} options={{ title: 'Pricing & Deals' }} />
    <MainStack.Screen name="PriceDrop" component={PriceDropScreen} options={{ title: 'Price Drop' }} />
    <MainStack.Screen name="ManageDeal" component={ManageDealScreen} options={{ title: 'Launch Promotion' }} />
    <MainStack.Screen name="VoucherManagement" component={VoucherManagement} options={{ headerShown: false }} />
    <MainStack.Screen name="CategoryManagement" component={CategoryManagement} options={{ title: 'Manage Categories' }} />
    <MainStack.Screen name="BrandManagement" component={BrandManagement} options={{ title: 'Manage Brands' }} />
    <MainStack.Screen name="ReviewsDashboard" component={ReviewsDashboard} options={{ title: 'Customer Reviews' }} />
  </MainStack.Navigator>
);

const SellerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: { backgroundColor: COLORS.primary, height: 60, paddingBottom: 10 },
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Tab.Screen name="Dashboard" component={SellerStack} options={{ headerShown: false }} />
    <Tab.Screen name="My Listings" component={MyListingsScreen} options={{ title: 'My Ads' }} />
    <Tab.Screen name="Add Listing" component={AddListingScreen} options={{ title: 'Post Ad' }} />
    <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Sales' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'seller' ? (
        <SellerNavigator />
      ) : (
        <BuyerNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
