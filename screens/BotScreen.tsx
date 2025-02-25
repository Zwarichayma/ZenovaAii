import { View, Image, StyleSheet, Dimensions, TextInput, TouchableOpacity, Text } from "react-native"
import { Feather } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

export default function BotScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
                <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
        
      </View>
      <View style={styles.content}>
        <View style={styles.capabilityBox}>
          <Text style={styles.capabilityText}>Answer all your questions</Text>
          <Text style={styles.capabilitySubtext}>(Just ask me anything you like!)</Text>
        </View>
        <View style={styles.capabilityBox}>
          <Text style={styles.capabilityText}>Generate all the text you want</Text>
          <Text style={styles.capabilitySubtext}>(essays, articles, reports, stories, & more)</Text>
        </View>
        <View style={styles.capabilityBox}>
          <Text style={styles.capabilityText}>Conversational AI</Text>
          <Text style={styles.capabilitySubtext}>(I can talk to you like a natural human)</Text>
        </View>
      </View>
      <View style={styles.messageBar}>
        <TextInput style={styles.input} placeholder="Ask me anything" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.sendButton}>
          <Feather name="send" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Prend toute la hauteur disponible
    backgroundColor: "#FFFFFF", // Fond blanc pour la lisibilité
    paddingHorizontal: 0, // Espacement horizontal standard
    paddingVertical: 10, // Espacement vertical
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.05,
    paddingTop: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    zIndex: 10,
},
headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: 'contain',
},
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.07,
  },
  capabilityBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 13,
    padding: width * 0.07,
    marginBottom: height * 0.03,
    width: "100%",
  },
  capabilityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  capabilitySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  messageBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.03,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  sendButton: {
    borderRadius: 27,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
})

