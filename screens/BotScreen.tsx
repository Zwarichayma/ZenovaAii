"use client"

import { useState, useRef } from "react"
import { View, Image, StyleSheet, Dimensions, TextInput, TouchableOpacity, Text, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

interface Message {
  role: "user" | "assistant"
  content: string
}

const cleanBotMessage = (message: string) => {
  return (
    message
      .replace(/<Thinking>[\s\S]*?<\/think>/gi, "")
      .replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\*/g, "")
      .replace(/\n\s*\n/g, "\n")
      .trim()
  )
}

export default function BotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, how can I assist you today?" },
  ])
  const [inputText, setInputText] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: Message = { role: "user", content: inputText }
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, newMessage]
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
        return newMessages
      })
      setInputText("")

      try {
        console.log("Sending request to API...")
        const response = await fetch("https://api.vectorshift.ai/api/chatbots/run", {
          method: "POST",
          headers: {
            "Api-Key": "sk_76HXup1F4O5JdZp1mWUGhWvQ4gtwL0X811c0oFpmgKafhEAZ",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: inputText,
            chatbot_name: "Zenova",
            username: "zwarichayma", 
            conversation_id: conversationId,
          }),
        })

        console.log("Response status:", response.status)
        const data = await response.json()
        console.log("Response data:", data)

        if (data.output) {
          const cleanedOutput = cleanBotMessage(data.output)
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages, { role: "assistant", content: cleanedOutput }]
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
            return newMessages
          })
        } else {
          console.error("No output in response")
          setMessages((prevMessages) => {
            const newMessages = [
              ...prevMessages,
              { role: "assistant", content: "Sorry, I couldn't process your request." },
            ]
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
            return newMessages
          })
        }
        if (data.conversation_id) {
          setConversationId(data.conversation_id)
        }
      } catch (error) {
        console.error("Error:", error)
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages, { role: "assistant", content: "Sorry, an error occurred." }]
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
          return newMessages
        })
      }
    }
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\n[1-4]\. )/)
    return parts.map((part, index) => {
      if (part.match(/^\n[1-4]\. /)) {
        return (
          <Text key={index} style={styles.listItem}>
            {part}
          </Text>
        )
      }
      return <Text key={index}>{part}</Text>
    })
  }

  return (
    <View style={styles.container}>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[styles.messageBox, message.role === "user" ? styles.userMessage : styles.botMessage]}
          >
            <Text
              style={[styles.messageText, message.role === "user" ? styles.userMessageText : styles.botMessageText]}
            >
              {renderMessageContent(message.content)}
            </Text>
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
    paddingHorizontal: 20, 
    paddingVertical: 60, 
  },
  
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBox: {
    borderRadius: 22,
    padding: 15,
    marginBottom: 30,
    maxWidth: "100%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EFEFEF",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#000",
  },
  messageBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "#EFEFEF",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderColor: "#EFEFEF",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F7F7F7",
    fontSize: 16,
    color: "#000",
    marginHorizontal: 8,
  },
  sendButton: {
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  userMessageText:{
    fontSize: 14,
    fontFamily: "Inter",
    color: "#fff",
  },
  botMessageText:{
    fontSize: 14,
    fontFamily: "Inter",
    color: "#000",
  },
  listItem: {
    marginTop: 4,
  },
})

