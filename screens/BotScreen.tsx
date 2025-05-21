"use client"

import { useState, useRef } from "react"
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  Image,
  Linking,
  Modal,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { Feather, Ionicons } from "@expo/vector-icons"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"
import { BotMessageSquare } from "lucide-react-native"

const { width, height } = Dimensions.get("window")

interface Message {
  role: "user" | "assistant"
  content: string
  imageUri?: string
}

const cleanBotMessage = (message: string) => {
  return message
    .replace(/<Thinking>[\s\S]*?<\/think>/gi, "")
    .replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\*/g, "")
    .replace(/\n\s*\n/g, "\n")
    .trim()
}

export default function BotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help answer questions, provide information, or assist with various tasks. How can I help you today?",
    }
  
  ])
  const [inputText, setInputText] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
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
      setIsLoading(true)

      try {
        console.log("Sending request to API...")
        const response = await fetch("http://10.0.2.2:5678/webhook/8f2da8e3-f738-4163-9b77-8dcaa9a4fd2f", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: inputText,
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
        setIsLoading(false)
      } catch (error) {
        console.error("Error:", error)
        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages,
            {
              role: "assistant",
              content: `Sorry, an error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ]
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
          return newMessages
        })
        setIsLoading(false)
      }
    }
  }

  const sendImageToAPI = async (imageUri: string) => {
    setIsLoading(true)

    try {
      // Create a form data object
      const formData = new FormData()

      // Get the file name and type
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1]

      // Add the image to form data
      formData.append("image", {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any)

      // Add conversation ID if available
      if (conversationId) {
        formData.append("conversation_id", conversationId)
      }

      console.log("Sending image to API...")
      const response = await fetch("http://10.0.2.2:5678/webhook/8f2da8e3-f738-4163-9b77-8dcaa9a4fd2f", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
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
          const newMessages = [...prevMessages, { role: "assistant", content: "Sorry, I couldn't process your image." }]
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
          return newMessages
        })
      }

      if (data.conversation_id) {
        setConversationId(data.conversation_id)
      }
    } catch (error) {
      console.error("Error sending image:", error)
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          {
            role: "assistant",
            content: `Sorry, I couldn't process your image: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ]
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: "Camera Permission",
          message: "App needs camera permission to take pictures",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    } else {
      // For iOS, permissions are handled by the image picker
      return true
    }
  }

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        if (Number.parseInt(Platform.Version as string, 10) >= 33) {
          const permissions = [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]

          const statuses = await PermissionsAndroid.requestMultiple(permissions)

          return Object.values(statuses).every((status) => status === PermissionsAndroid.RESULTS.GRANTED)
        } else {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
            title: "Accès à la galerie photo",
            message: "L'application a besoin d'accéder à vos photos pour pouvoir les envoyer",
            buttonNeutral: "Me le demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK",
          })
          return granted === PermissionsAndroid.RESULTS.GRANTED
        }
      } catch (err) {
        console.warn("Erreur lors de la demande de permission :", err)
        return false
      }
    }
    return true // Pour iOS
  }

  const handleCameraPress = async () => {
    setShowImageOptions(true)
  }

  const takePicture = async () => {
    setShowImageOptions(false)
    const hasPermission = await requestCameraPermission()

    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required to use this feature", [{ text: "OK" }])
      return
    }

    try {
      launchCamera(
        {
          mediaType: "photo",
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
        },
        (response) => {
          if (response.didCancel) {
            console.log("User cancelled camera")
          } else if (response.errorCode) {
            console.log("Camera Error: ", response.errorMessage)
            Alert.alert("Camera Error", response.errorMessage || "Unknown error occurred")
          } else if (response.assets && response.assets.length > 0) {
            const imageUri = response.assets[0].uri
            console.log("Image captured:", imageUri)

            // Add the image to messages
            setMessages((prevMessages) => [...prevMessages, { role: "user", content: "", imageUri }])

            // Send the image to API
            sendImageToAPI(imageUri)
          }
        },
      )
    } catch (error) {
      console.error("Camera launch error:", error)
      Alert.alert("Error", "Failed to launch camera. Please try again.")
    }
  }

  const chooseFromLibrary = async () => {
    setShowImageOptions(false)
    const hasPermission = await requestStoragePermission()

    if (!hasPermission) {
      Alert.alert(
        "Permission refusée",
        "L'accès à la galerie photo est nécessaire pour utiliser cette fonctionnalité. Veuillez l'activer dans les paramètres de votre appareil.",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Ouvrir les paramètres",
            onPress: () => {
              if (Platform.OS === "android") {
                Linking.openSettings()
              }
            },
          },
        ],
      )
      return
    }

    try {
      launchImageLibrary(
        {
          mediaType: "photo",
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          selectionLimit: 1,
        },
        (response) => {
          if (response.didCancel) {
            console.log("Sélection annulée")
          } else if (response.errorCode) {
            console.log("Erreur galerie : ", response.errorMessage)
            Alert.alert("Erreur", response.errorMessage || "Une erreur est survenue")
          } else if (response.assets && response.assets.length > 0) {
            const imageUri = response.assets[0].uri
            console.log("Image sélectionnée:", imageUri)

            setMessages((prevMessages) => [...prevMessages, { role: "user", content: "", imageUri }])

            sendImageToAPI(imageUri)
          }
        },
      )
    } catch (error) {
      console.error("Erreur galerie:", error)
      Alert.alert("Erreur", "Impossible d'ouvrir la galerie. Veuillez réessayer.")
    }
  }

  const handleClearConversation = () => {
    setMessages([{ role: "assistant", content: "Hi, how can I assist you today?" }])
    setConversationId(null)
  }

  const renderMessageContent = (content: string) => {
    // Check if content contains checkmarks
    if (content.includes("✓")) {
      return content.split("\n").map((line, index) => (
        <Text key={index} style={styles.messageTextLine}>
          {line}
        </Text>
      ))
    }

    // Check if content contains JSON
    if (content.includes("{") && content.includes("}")) {
      return <Text style={styles.messageText}>{content}</Text>
    }

    // Regular text
    return <Text style={styles.messageTextbot}>{content}</Text>
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Zenova Ai</Text>
          <TouchableOpacity onPress={handleClearConversation} style={styles.menuButton}>
            <Feather name="more-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === "user" ? styles.userMessageContainer : styles.botMessageContainer,
              ]}
            >
              {message.role === "assistant" && (
                <View style={styles.botIconContainer}>
                  <BotMessageSquare size={21} color="#000" />
                  </View>
              )}

              {message.role === "user" && (
                <View style={styles.userAvatarContainer}>
                  <Text style={styles.userAvatarText}>👤</Text>
                </View>
              )}

              <View
                style={[
                  styles.messageBox,
                  message.role === "user" ? styles.userMessage : styles.botMessage,
                  message.imageUri ? styles.messageWithImage : null,
                ]}
              >
                {message.content ? (
                  <View style={styles.textContainer}>{renderMessageContent(message.content)}</View>
                ) : null}

                {message.imageUri && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: message.imageUri }} style={styles.messageImage} resizeMode="cover" />
                  </View>
                )}
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.botIconContainer}>
              <BotMessageSquare size={21} color="#000" />
              </View>
              <View style={[styles.messageBox, styles.botMessage, styles.loadingMessage]}>
                <Text style={styles.loadingDots}>...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.messageBar}>
          <TouchableOpacity style={styles.attachButton} onPress={handleCameraPress}>
            <Feather name="image" size={24} color="#000" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim()}>
            <Ionicons name={inputText.trim() ? "send" : "send"} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Selection Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImageOptions(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandleBar} />
              <Text style={styles.modalTitle}>Add Photo</Text>
            </View>

            <TouchableOpacity style={styles.modalOption} onPress={takePicture}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="camera" size={24} color="#000" />
              </View>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={chooseFromLibrary}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="images" size={24} color="#000" />
              </View>
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowImageOptions(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFF",
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom:70,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFF",
    backgroundColor: "#FFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  botIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
  },
  userAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 4,
  },
  userAvatarText: {
    fontSize: 14,
  },
  messageBox: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "80%",
  },
  messageWithImage: {
    padding: 0,
    overflow: "hidden",
  },
  userMessage: {
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#F0F0F0",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  textContainer: {
    padding: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#000",
  },
  messageTextbot: {
    fontSize: 15,
    lineHeight: 20,
    color: "#000",
  },
  messageTextLine: {
    fontSize: 15,
    lineHeight: 24,
    color: "#000",
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
  },
  messageImage: {
    width: 240,
    height: 180,
    backgroundColor: "#E5E7EB",
  },
  loadingContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  loadingMessage: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingDots: {
    fontSize: 18,
    color: "#666",
  },
  messageBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#FFF",
    backgroundColor: "#FFFF",
  },
  attachButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#000",
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.24)",
    justifyContent: "flex-end",
    alignItems: "center",

  },
  modalContent: {
    width: 300,
    height: 300,
    padding: 10,
    borderRadius: 30,
    marginBottom: 270,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalHandleBar: {
    width: 50,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000",
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
})

