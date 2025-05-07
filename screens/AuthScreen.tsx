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
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { authService } from "../api/auth/auth-service" // Fixed import path

const { width, height } = Dimensions.get("window")
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<AuthScreenNavigationProp>()

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setIsLoading(true)
    try {
      // Call the login method from our auth service
      const response = await authService.login(email, password)

      // Login successful
      console.log("Login successful:", response.user)

      // Navigate to Profile screen
      navigation.navigate("Profile")
    } catch (error: any) {
      // Handle login error
      console.error("Login error:", error)
      Alert.alert("Login Failed", error.message || "Please check your credentials and try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ImageBackground
      source={require("../assets/images/back.jpg")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
        {/* Logo (Retour à HomeScreen) */}
        <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}>
          <Image source={require("../assets/images/33.png")} style={styles.logo} />
        </TouchableOpacity>

        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity style={styles.googleButton}>
          <Image source={require("../assets/images/goo.png")} style={styles.googleLogo} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        {/* Email & Password Fields */}
        <TextInput
          style={styles.input}
          placeholder="Email Address"
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

        {/* Continue Button */}
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
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    resizeMode: "cover",
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
  },
  logo: {
    width: width * 0.15,
    height: height * 0.08,
    resizeMode: "contain",
    marginBottom: width * 0.02,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#332",
  },
  subtitle: {
    fontSize: 13,
    color: "gray",
    marginBottom: width * 0.08,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    padding: width * 0.03,
    borderRadius: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: width * 0.01,
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
    width: "100%",
    height: width * 0.11,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    marginBottom: width * 0.04,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#000",
    padding: width * 0.03,
    alignItems: "center",
    width: "100%",
    borderRadius: 20,
    marginTop: width * 0.01,
    height: width * 0.11,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: width * 0.02,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    padding: width * 0.04,
  },
  signUpLink: {
    fontWeight: "bold",
    color: "#000",
    textDecorationLine: "underline",
  },
  googleLogo: {
    width: 19,
    height: 19,
    marginRight: 8,
    resizeMode: "contain",
  },
})
