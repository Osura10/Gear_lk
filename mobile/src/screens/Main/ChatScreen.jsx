import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import apiService from '../../utils/apiService';
import { COLORS } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

const ChatScreen = ({ route }) => {
  const { conversationId, userName, listingTitle } = route.params;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s for new messages
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await apiService.getMessages(conversationId);
      setMessages(response.data.data.reverse()); // Reverse for inverted list
    } catch (error) {
      console.log('Error fetching messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const msgText = text;
    setText('');
    try {
      await apiService.sendMessage(conversationId, msgText);
      fetchMessages();
    } catch (error) {
      console.log('Error sending message', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender === user._id;
    return (
      <View style={[styles.msgWrapper, isMine ? styles.myMsgWrapper : styles.theirMsgWrapper]}>
        <View style={[styles.msgBubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.msgText, isMine ? styles.myText : styles.theirText]}>{item.text}</Text>
        </View>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerName}>{userName}</Text>
        <Text style={styles.headerListing}>{listingTitle}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={COLORS.secondary} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          inverted={true}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline={true}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray, alignItems: 'center' },
  headerName: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary },
  headerListing: { fontSize: 10, color: COLORS.secondary, textTransform: 'uppercase' },
  loader: { flex: 1, justifyContent: 'center' },
  list: { padding: 15 },
  msgWrapper: { marginBottom: 15, maxWidth: '80%' },
  myMsgWrapper: { alignSelf: 'flex-end' },
  theirMsgWrapper: { alignSelf: 'flex-start' },
  msgBubble: { padding: 12, borderRadius: 20 },
  myBubble: { backgroundColor: COLORS.secondary, borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 2, elevation: 1 },
  msgText: { fontSize: 15 },
  myText: { color: COLORS.primary, fontWeight: '500' },
  theirText: { color: COLORS.primary },
  timeText: { fontSize: 9, color: COLORS.gray, marginTop: 4, alignSelf: 'flex-end' },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: COLORS.white, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.lightGray },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, maxHeight: 100, color: COLORS.primary },
  sendBtn: { marginLeft: 10, paddingHorizontal: 20 },
  sendBtnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
});

export default ChatScreen;
