import React, { useState, useRef } from 'react'
import { View, Image, StyleSheet, Dimensions, TextInput, TouchableOpacity, Text, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function BotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi, how can I assist you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: Message = { role: 'user', content: inputText };
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, newMessage];
        setTimeout(() => scrollViewRef.current?.scrollToEnd({animated: true}), 0);
        return newMessages;
      });
      setInputText('');

      try {
        console.log('Sending request to API...');
        const response = await fetch("https://api.vectorshift.ai/api/chatbots/run", {
          method: 'POST',
          headers: {
            "Api-Key": "sk_76HXup1F4O5JdZp1mWUGhWvQ4gtwL0X811c0oFpmgKafhEAZ",
            "Content-Type": 'application/json',
          },
          body: JSON.stringify({
            input: inputText,
            chatbot_name: "Zenova",
            username: "zwarichayma", // You might want to replace this with actual user info
            conversation_id: conversationId
          })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.output) {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages, { role: 'assistant', content: data.output }];
            setTimeout(() => scrollViewRef.current?.scrollToEnd({animated: true}), 0);
            return newMessages;
          });
        } else {
          console.error('No output in response');
          setMessages(prevMessages => {
            const newMessages = [...prevMessages, { role: 'assistant', content: "Sorry, I couldn't process your request." }];
            setTimeout(() => scrollViewRef.current?.scrollToEnd({animated: true}), 0);
            return newMessages;
          });
        }
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, { role: 'assistant', content: "Sorry, an error occurred." }];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({animated: true}), 0);
          return newMessages;
        });
      }
    }
  };

  return (
    <View style={styles.container}>
              <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
      >
        {messages.map((message, index) => (
          <View key={index} style={[
            styles.messageBox,
            message.role === 'user' ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.role === 'user' ? styles.userMessageText : styles.botMessageText
            ]}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.messageBar}>
        <TextInput
          style={styles.input}
          placeholder="Write a message"
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Feather name="send" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 0,
    paddingVertical: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.05,
    paddingTop: 10,
    backgroundColor: '#1F2428',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerLogo: {
    width: width * 0.2,
    height: height * 0.03,
    resizeMode: "contain",
    paddingTop: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.1,
  },
  messageBox: {
    borderRadius: 8,
    padding: width * 0.03,
    marginBottom: height * 0.03,
    maxWidth: '60%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F7FF',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  messageBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.03,
    borderTopWidth: 1,
    borderColor: "#1C2536",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 35,
    borderColor: "#1C2536",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    color: '#1F2428',
  },
  sendButton: {
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
});