import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import apiService, { IMAGE_URL } from '../../utils/apiService';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await apiService.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.log('Error fetching conversations', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderConversation = ({ item }) => {
    const otherParticipant = item.participants.find(p => p._id !== user._id);
    
    return (
      <TouchableOpacity 
        style={styles.convCard}
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item._id, 
          userName: otherParticipant?.name || 'User',
          listingTitle: item.listing.title
        })}
      >
        <Image 
          source={{ uri: getImageUrl(item.listing?.photos?.[0] || null) }} 
          style={styles.listingImage} 
        />
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.userName}>{otherParticipant?.name}</Text>
            <Text style={styles.time}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.listingTitle}>{item.listing.title}</Text>
          <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || 'Start a conversation...'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} color={COLORS.secondary} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: 50 },
  list: { padding: 15 },
  convCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, alignItems: 'center' },
  listingImage: { width: 60, height: 60, borderRadius: 10 },
  content: { flex: 1, marginLeft: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  userName: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary },
  time: { fontSize: 10, color: COLORS.gray },
  listingTitle: { fontSize: 12, color: COLORS.secondary, fontWeight: '600', marginBottom: 4 },
  lastMsg: { fontSize: 14, color: COLORS.gray },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: COLORS.gray },
});

export default MessagesScreen;
