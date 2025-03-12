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
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'

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
    { role: "assistant", content: "Hi, how can I assist you today?" },
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
            conversation_id: conversationId
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
            { role: "assistant", content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
          ]
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0)
          return newMessages
        })
        setIsLoading(false)
      }
    }
  }

  const sendImageToAPI = async (imageUri: string) => {
    setIsLoading(true);
    
    try {
      // Create a form data object
      const formData = new FormData();
      
      // Get the file name and type
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Add the image to form data
      formData.append('image', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      // Add conversation ID if available
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }
      
      console.log("Sending image to API...");
      const response = await fetch("http://10.0.2.2:5678/webhook/8f2da8e3-f738-4163-9b77-8dcaa9a4fd2f", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.output) {
        const cleanedOutput = cleanBotMessage(data.output);
        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages, 
            { role: "assistant", content: cleanedOutput }
          ];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
          return newMessages;
        });
      } else {
        console.error("No output in response");
        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages,
            { role: "assistant", content: "Sorry, I couldn't process your image." },
          ];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
          return newMessages;
        });
      }
      
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
    } catch (error) {
      console.error("Error sending image:", error);
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { role: "assistant", content: `Sorry, I couldn't process your image: ${error instanceof Error ? error.message : 'Unknown error'}` },
        ];
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 0);
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to take pictures",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // For iOS, permissions are handled by the image picker
      return true;
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (parseInt(Platform.Version as string, 10) >= 33) {
          // Pour Android 13+ (API 33+), nous devons demander READ_MEDIA_IMAGES
          const permissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            // Optionnel : si vous voulez aussi accéder aux vidéos
            // PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
          ];
  
          const statuses = await PermissionsAndroid.requestMultiple(permissions);
          
          return Object.values(statuses).every(
            status => status === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          // Pour Android 12 et versions antérieures
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Accès à la galerie photo",
              message: "L'application a besoin d'accéder à vos photos pour pouvoir les envoyer",
              buttonNeutral: "Me le demander plus tard",
              buttonNegative: "Annuler",
              buttonPositive: "OK"
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn("Erreur lors de la demande de permission :", err);
        return false;
      }
    }
    return true; // Pour iOS
  };

  const handleCameraPress = async () => {
    setShowImageOptions(true);
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowImageOptions(false)
        },
        {
          text: "Take Photo",
          onPress: () => {
            setShowImageOptions(false);
            takePicture();
          }
        },
        {
          text: "Choose from Library",
          onPress: () => {
            setShowImageOptions(false);
            chooseFromLibrary();
          }
        }
      ]
    );
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to use this feature",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
        }, 
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled camera');
          } else if (response.errorCode) {
            console.log('Camera Error: ', response.errorMessage);
            Alert.alert("Camera Error", response.errorMessage || "Unknown error occurred");
          } else if (response.assets && response.assets.length > 0) {
            const imageUri = response.assets[0].uri;
            console.log("Image captured:", imageUri);
            
            // Add the image to messages
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: "user", content: `[Image from camera]`, imageUri }
            ]);
            
            // Send the image to API
            sendImageToAPI(imageUri);
          }
        }
      );
    } catch (error) {
      console.error("Camera launch error:", error);
      Alert.alert("Error", "Failed to launch camera. Please try again.");
    }
  };

  const chooseFromLibrary = async () => {
  const hasPermission = await requestStoragePermission();
  
  if (!hasPermission) {
    Alert.alert(
      "Permission refusée",
      "L'accès à la galerie photo est nécessaire pour utiliser cette fonctionnalité. Veuillez l'activer dans les paramètres de votre appareil.",
      [
        { 
          text: "Annuler", 
          style: "cancel" 
        },
        { 
          text: "Ouvrir les paramètres", 
          onPress: () => {
            // Ouvre les paramètres de l'application
            if (Platform.OS === 'android') {
              Linking.openSettings();
            }
          }
        }
      ]
    );
    return;
  }

  try {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        selectionLimit: 1,
      }, 
      (response) => {
        if (response.didCancel) {
          console.log('Sélection annulée');
        } else if (response.errorCode) {
          console.log('Erreur galerie : ', response.errorMessage);
          Alert.alert("Erreur", response.errorMessage || "Une erreur est survenue");
        } else if (response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri;
          console.log("Image sélectionnée:", imageUri);
          
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: `[Image from gallery]`, imageUri }
          ]);
          
          sendImageToAPI(imageUri);
        }
      }
    );
  } catch (error) {
    console.error("Erreur galerie:", error);
    Alert.alert("Erreur", "Impossible d'ouvrir la galerie. Veuillez réessayer.");
  }
};

  const handleClearConversation = () => {
    setMessages([{ role: "assistant", content: "Hi, how can I assist you today?" }])
    setConversationId(null)
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\n[1-9]\. |\n• )/)
    return parts.map((part, index) => {
      if (part.match(/^\n[1-9]\. |\n• /)) {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatbot</Text>
        <TouchableOpacity onPress={handleClearConversation} style={styles.clearButton}>
          <Feather name="refresh-cw" size={18} color="#666" />
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
            style={[styles.messageBox, message.role === "user" ? styles.userMessage : styles.botMessage]}
          >
            <Text
              style={[styles.messageText, message.role === "user" ? styles.userMessageText : styles.botMessageText]}
            >
              {renderMessageContent(message.content)}
            </Text>
            
            {message.imageUri && (
              <Image 
                source={{ uri: message.imageUri }} 
                style={styles.messageImage} 
                resizeMode="contain"
              />
            )}
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBox, styles.botMessage]}>
            <Text style={[styles.messageText, styles.botMessageText]}>
              <Text>...</Text>
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.messageBar}>
        <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
          <Feather name="camera" size={20} color="#666" />
        </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#EFEFEF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBox: {
    borderRadius: 25,
    padding: 16,
    marginBottom: 30,
    maxWidth: "100%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
    maxWidth: "80%",
    marginLeft: "20%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EFEFEF",
    maxWidth: "80%",
    marginRight: "20%",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#000",
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
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
  cameraButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderColor: "#EFEFEF",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 10,
    backgroundColor: "#F7F7F7",
    fontSize: 16,
    color: "#000",
    marginHorizontal: 1,
  },
  sendButton: {
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  userMessageText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#fff",
  },
  botMessageText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#000",
  },
  listItem: {
    marginTop: 4,
  },
})