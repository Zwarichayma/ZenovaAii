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

interface ConversationHistory {
  id: string
  title: string
  messages: Message[]
  date: string
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

const API_URL = "https://fc70-197-14-182-93.ngrok-free.app/webhook/43c2985c-fb3c-43c9-be8b-d3cbe66323e3"

export default function BotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help answer questions, provide information, or assist with various tasks. How can I help you today?",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)

  // ─── Menu 3 points ───────────────────────────────────────────────────────────
  const [showMenu, setShowMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])

  const scrollViewRef = useRef<ScrollView>(null)

  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
  }

  // ─── Sauvegarde la conversation dans l'historique ────────────────────────────
  const saveCurrentConversation = () => {
    if (messages.length <= 1) return // rien à sauvegarder si juste le message de bienvenue

    const firstUserMsg = messages.find((m) => m.role === "user")
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "")
      : "Conversation"

    const newHistory: ConversationHistory = {
      id: Date.now().toString(),
      title,
      messages: [...messages],
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setConversationHistory((prev) => [newHistory, ...prev])
  }

  // ─── Supprimer la conversation courante ──────────────────────────────────────
  const handleDeleteConversation = () => {
    setShowMenu(false)
    Alert.alert(
      "Supprimer la discussion",
      "Voulez-vous vraiment supprimer cette discussion ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            saveCurrentConversation()
            setMessages([{ role: "assistant", content: "Hi, how can I assist you today?" }])
            setConversationId(null)
          },
        },
      ],
    )
  }

  // ─── Voir l'historique ───────────────────────────────────────────────────────
  const handleViewHistory = () => {
    setShowMenu(false)
    setShowHistory(true)
  }

  // ─── Charger une conversation depuis l'historique ────────────────────────────
  const loadConversation = (conv: ConversationHistory) => {
    setMessages(conv.messages)
    setShowHistory(false)
  }

  // ─── Supprimer une entrée de l'historique ────────────────────────────────────
  const deleteHistoryItem = (id: string) => {
    Alert.alert("Supprimer", "Supprimer cette conversation de l'historique ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () =>
          setConversationHistory((prev) => prev.filter((c) => c.id !== id)),
      },
    ])
  }

  // ─── Safe JSON parser ────────────────────────────────────────────────────────
  const safeParseJSON = async (response: Response): Promise<any> => {
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error ${response.status}: ${errorText.slice(0, 200)}`)
    }
    const text = await response.text()
    if (!text || text.trim() === "") throw new Error("Server returned an empty response")
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`Invalid JSON from server: ${text.slice(0, 200)}`)
    }
  }

  // ─── Send text message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = { role: "user", content: inputText }
    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputText, conversation_id: conversationId }),
      })

      const data = await safeParseJSON(response)
      const reply = data.output ? cleanBotMessage(data.output) : "Sorry, I couldn't process your request."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
      if (data.conversation_id) setConversationId(data.conversation_id)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      console.error("handleSend error:", msg)
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, an error occurred: ${msg}` }])
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  // ─── Send image ──────────────────────────────────────────────────────────────
  const sendImageToAPI = async (imageUri: string) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      const uriParts = imageUri.split(".")
      const fileType = uriParts[uriParts.length - 1]
      formData.append("image", { uri: imageUri, name: `photo.${fileType}`, type: `image/${fileType}` } as any)
      if (conversationId) formData.append("conversation_id", conversationId)

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      })

      const data = await safeParseJSON(response)
      const reply = data.output ? cleanBotMessage(data.output) : "Sorry, I couldn't process your image."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
      if (data.conversation_id) setConversationId(data.conversation_id)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      console.error("sendImageToAPI error:", msg)
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, I couldn't process your image: ${msg}` }])
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  // ─── Permissions ─────────────────────────────────────────────────────────────
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
    }
    return true
  }

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        if (Number.parseInt(Platform.Version as string, 10) >= 33) {
          const statuses = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES])
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
    return true
  }

  // ─── Camera / Gallery ────────────────────────────────────────────────────────
  const handleCameraPress = () => setShowImageOptions(true)

  const takePicture = async () => {
    setShowImageOptions(false)
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required to use this feature")
      return
    }
    try {
      launchCamera({ mediaType: "photo", includeBase64: false, maxHeight: 2000, maxWidth: 2000 }, (response) => {
        if (response.didCancel) return
        if (response.errorCode) { Alert.alert("Camera Error", response.errorMessage || "Unknown error occurred"); return }
        if (response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri!
          setMessages((prev) => [...prev, { role: "user", content: "", imageUri }])
          sendImageToAPI(imageUri)
        }
      })
    } catch (error) {
      console.error("Camera launch error:", error)
      Alert.alert("Error", "Failed to launch camera. Please try again.")
    }
  }

  const chooseFromLibrary = async () => {
    setShowImageOptions(false)
    const hasPermission = await requestStoragePermission()
    if (!hasPermission) {
      Alert.alert("Permission refusée", "L'accès à la galerie photo est nécessaire.", [
        { text: "Annuler", style: "cancel" },
        { text: "Ouvrir les paramètres", onPress: () => Platform.OS === "android" && Linking.openSettings() },
      ])
      return
    }
    try {
      launchImageLibrary({ mediaType: "photo", includeBase64: false, maxHeight: 2000, maxWidth: 2000, selectionLimit: 1 }, (response) => {
        if (response.didCancel) return
        if (response.errorCode) { Alert.alert("Erreur", response.errorMessage || "Une erreur est survenue"); return }
        if (response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri!
          setMessages((prev) => [...prev, { role: "user", content: "", imageUri }])
          sendImageToAPI(imageUri)
        }
      })
    } catch (error) {
      console.error("Erreur galerie:", error)
      Alert.alert("Erreur", "Impossible d'ouvrir la galerie. Veuillez réessayer.")
    }
  }

  // ─── Render message content ──────────────────────────────────────────────────
  const renderMessageContent = (content: string) => {
    if (content.includes("✓")) {
      return content.split("\n").map((line, index) => (
        <Text key={index} style={styles.messageTextLine}>{line}</Text>
      ))
    }
    if (content.includes("{") && content.includes("}")) {
      return <Text style={styles.messageText}>{content}</Text>
    }
    return <Text style={styles.messageTextbot}>{content}</Text>
  }

  // ─── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Zenova Ai</Text>
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
            <Feather name="more-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={scrollToBottom}
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

        {/* Input bar */}
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
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Modal Menu 3 points ────────────────────────────────────────────────── */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuDropdown}>
            {/* Voir l'historique */}
            <TouchableOpacity style={styles.menuItem} onPress={handleViewHistory}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="time-outline" size={20} color="#000" />
              </View>
              <Text style={styles.menuItemText}>Voir l'historique</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Supprimer la discussion */}
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteConversation}>
              <View style={[styles.menuItemIcon, styles.menuItemIconDanger]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Supprimer la discussion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal Historique ──────────────────────────────────────────────────── */}
      <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <View style={styles.historyOverlay}>
          <View style={styles.historyModal}>
            {/* Header historique */}
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Historique</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.historyClose}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {conversationHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyHistoryText}>Aucune conversation sauvegardée</Text>
                <Text style={styles.emptyHistorySubtext}>
                  Les discussions supprimées apparaîtront ici
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.historyList}>
                {conversationHistory.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.historyItem}
                    onPress={() => loadConversation(conv)}
                  >
                    <View style={styles.historyItemIcon}>
                      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemTitle} numberOfLines={1}>{conv.title}</Text>
                      <Text style={styles.historyItemDate}>{conv.date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteHistoryItem(conv.id)} style={styles.historyItemDelete}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Modal Image Options ───────────────────────────────────────────────── */}
      <Modal visible={showImageOptions} transparent animationType="slide" onRequestClose={() => setShowImageOptions(false)}>
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
  safeArea: { flex: 1, backgroundColor: "#FFFF", paddingHorizontal: 10, paddingTop: 5, paddingBottom: 70 },
  container: { flex: 1, backgroundColor: "#FFFF" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#FFFF", backgroundColor: "#FFFF" },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  menuButton: { padding: 8 },

  // Messages
  content: { flex: 1, backgroundColor: "#FFFF" },
  scrollContent: { padding: 16, paddingBottom: 20 },
  messageContainer: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  userMessageContainer: { justifyContent: "flex-end" },
  botMessageContainer: { justifyContent: "flex-start" },
  botIconContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginRight: 8, marginTop: 4 },
  userAvatarContainer: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginLeft: 8, marginTop: 4 },
  userAvatarText: { fontSize: 14 },
  messageBox: { borderRadius: 16, padding: 12, maxWidth: "80%" },
  messageWithImage: { padding: 0, overflow: "hidden" },
  userMessage: { backgroundColor: "#E5E7EB", marginLeft: 8, alignSelf: "flex-end" },
  botMessage: { backgroundColor: "#F0F0F0", marginRight: 8, alignSelf: "flex-start" },
  textContainer: { padding: 12 },
  messageText: { fontSize: 15, lineHeight: 20, color: "#000" },
  messageTextbot: { fontSize: 15, lineHeight: 20, color: "#000" },
  messageTextLine: { fontSize: 15, lineHeight: 24, color: "#000" },
  imageContainer: { borderRadius: 16, overflow: "hidden", width: "100%" },
  messageImage: { width: 240, height: 180, backgroundColor: "#E5E7EB" },
  loadingContainer: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  loadingMessage: { paddingVertical: 12, paddingHorizontal: 16 },
  loadingDots: { fontSize: 18, color: "#666" },

  // Input bar
  messageBar: { flexDirection: "row", alignItems: "center", padding: 8, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: "#FFF", backgroundColor: "#FFFF" },
  attachButton: { padding: 8, justifyContent: "center", alignItems: "center" },
  input: { flex: 1, minHeight: 40, maxHeight: 100, borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#FFFFFF", fontSize: 16, color: "#000", marginHorizontal: 8 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },

  // ── Menu 3 points ─────────────────────────────────────────────────────────
  menuOverlay: { flex: 1, backgroundColor: "transparent" },
  menuDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  menuItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuItemIconDanger: { backgroundColor: "#FEE2E2" },
  menuItemText: { fontSize: 15, color: "#000", fontWeight: "500" },
  menuItemTextDanger: { color: "#EF4444" },
  menuDivider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },

  // ── Historique ────────────────────────────────────────────────────────────
  historyOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  historyModal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%", paddingBottom: Platform.OS === "ios" ? 34 : 16 },
  historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  historyTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  historyClose: { padding: 4 },
  historyList: { paddingHorizontal: 16, paddingTop: 8 },
  historyItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  historyItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  historyItemContent: { flex: 1 },
  historyItemTitle: { fontSize: 15, fontWeight: "500", color: "#000", marginBottom: 2 },
  historyItemDate: { fontSize: 12, color: "#9CA3AF" },
  historyItemDelete: { padding: 8 },
  emptyHistory: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyHistoryText: { fontSize: 16, fontWeight: "600", color: "#6B7280", marginTop: 16, textAlign: "center" },
  emptyHistorySubtext: { fontSize: 13, color: "#9CA3AF", marginTop: 8, textAlign: "center" },

  // ── Image Modal ───────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.24)", justifyContent: "flex-end", alignItems: "center" },
  modalContent: { width: 300, height: 300, padding: 10, borderRadius: 30, marginBottom: 270, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: Platform.OS === "ios" ? 30 : 16 },
  modalHeader: { alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  modalHandleBar: { width: 50, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2, marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: "600", color: "#000" },
  modalOption: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  modalIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F8FF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  modalOptionText: { fontSize: 16, color: "#000" },
  cancelButton: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelText: { fontSize: 16, color: "#000", fontWeight: "600" },
})