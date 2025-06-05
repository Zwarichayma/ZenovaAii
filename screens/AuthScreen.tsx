"use client"

import { useState } from "react"
import {
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  View,
  SafeAreaView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { ArrowLeft } from "lucide-react-native"
import { useAuth } from "@/context/AuthContext"

const { width, height } = Dimensions.get("window")
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()
  const navigation = useNavigation<AuthScreenNavigationProp>()

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password")
      return
    }

    try {
      await login(email, password)
      // La navigation sera gérée automatiquement par le contexte d'authentification
      navigation.navigate("Profile")
    } catch (error: any) {
      console.error("Login error:", error)
      Alert.alert("Login failed", error.message || "Please check your credentials and try again")
    }
  }

  // Function to return to home screen
  const goToHome = () => {
    navigation.navigate("MainTabs", { screen: "Home" })
  }

  return (
    <ImageBackground
      source={require("../assets/images/back.jpg")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with back arrow */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToHome} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
          {/* Centered Logo */}
          <Image source={require("../assets/images/33.png")} style={styles.logo} />

          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome! Please login to continue</Text>

          {/* Google login button */}
          <TouchableOpacity style={styles.googleButton}>
            <Image source={require("../assets/images/goo.png")} style={styles.googleLogo} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          {/* Email and Password fields */}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.signUpText}>
            Don't have an account?{" "}
            <Text style={styles.signUpLink} onPress={() => navigation.navigate("SignUp")}>
              Sign up
            </Text>
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
  },
  innerContainer: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.67)",
    borderRadius: 25,
    padding: width * 0.08,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 120,
  },
  logo: {
    width: width * 0.2,
    height: height * 0.1,
    resizeMode: "contain",
    marginBottom: width * 0.06,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: width * 0.08,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    padding: width * 0.03,
    borderRadius: 25,
    width: width * 0.8,
    justifyContent: "center",
    marginBottom: width * 0.04,
    backgroundColor: "#fff",
  },
  googleButtonText: {
    fontSize: 14,
    marginLeft: 11,
    color: "#333",
  },
  orText: {
    marginVertical: width * 0.04,
    color: "gray",
  },
  input: {
    width: width * 0.8,
    height: width * 0.12,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    marginBottom: width * 0.04,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#000",
    padding: width * 0.03,
    alignItems: "center",
    width: width * 0.8,
    borderRadius: 25,
    marginTop: width * 0.02,
    height: width * 0.12,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: width * 0.04,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  signUpLink: {
    fontWeight: "bold",
    color: "#000",
    textDecorationLine: "underline",
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
})
