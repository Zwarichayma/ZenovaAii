"use client"

import { useState, useCallback, useEffect } from "react"
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
  ScrollView,
  View,
  SafeAreaView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation"
import { authService } from "../api/auth/auth-service"
import { ArrowLeft } from "lucide-react-native"

const { width, height } = Dimensions.get("window")
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>

export default function SignUpScreen() {
  // Form state
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  // Form validation state
  const [emailError, setEmailError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Navigation
  const navigation = useNavigation<AuthScreenNavigationProp>()

  // Define validation functions
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)
    setEmailError(isValid ? "" : "Please enter a valid email address")
    return isValid
  }, [])

  const validateUsername = useCallback((username: string): boolean => {
    const isValid = username.length >= 3
    setUsernameError(isValid ? "" : "Username must be at least 3 characters")
    return isValid
  }, [])

  const validatePassword = useCallback((password: string): boolean => {
    const isValid = password.length >= 6
    setPasswordError(isValid ? "" : "Password must be at least 6 characters")
    return isValid
  }, [])

  const validateConfirmPassword = useCallback((password: string, confirmPassword: string): boolean => {
    const isValid = password === confirmPassword
    setConfirmPasswordError(isValid ? "" : "Passwords do not match")
    return isValid
  }, [])

  // Handle form input changes with validation
  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text)
      if (emailError) validateEmail(text)
    },
    [emailError, validateEmail],
  )

  const handleUsernameChange = useCallback(
    (text: string) => {
      setUsername(text)
      if (usernameError) validateUsername(text)
    },
    [usernameError, validateUsername],
  )

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text)
      if (passwordError) validatePassword(text)
      if (confirmPasswordError && confirmPassword) validateConfirmPassword(text, confirmPassword)
    },
    [passwordError, confirmPasswordError, confirmPassword, validatePassword, validateConfirmPassword],
  )

  const handleConfirmPasswordChange = useCallback(
    (text: string) => {
      setConfirmPassword(text)
      if (confirmPasswordError) validateConfirmPassword(password, text)
    },
    [confirmPasswordError, password, validateConfirmPassword],
  )

  // Validate all form fields
  const validateForm = useCallback((): boolean => {
    const isEmailValid = validateEmail(email)
    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword)

    return isEmailValid && isUsernameValid && isPasswordValid && isConfirmPasswordValid
  }, [
    email,
    username,
    password,
    confirmPassword,
    validateEmail,
    validateUsername,
    validatePassword,
    validateConfirmPassword,
  ])

  // Handle sign up submission
  const handleSignUp = useCallback(async () => {
    // Clear any previous errors
    setEmailError("")
    setUsernameError("")
    setPasswordError("")
    setConfirmPasswordError("")

    // Validate all inputs
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Call the register method from our auth service
      const response = await authService.register(email, username, password)

      // Registration successful
      console.log("Registration successful:", response.user)

      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => navigation.navigate("Profile") },
      ])
    } catch (error: any) {
      // Handle registration error
      console.error("Registration error:", error)

      // Display specific error messages based on the error
      if (error.message?.includes("email")) {
        setEmailError(error.message || "Email is invalid or already taken")
      } else if (error.message?.includes("username")) {
        setUsernameError(error.message || "Username is invalid or already taken")
      } else if (error.message?.includes("password")) {
        setPasswordError(error.message || "Password is invalid")
      } else {
        // Generic error
        Alert.alert("Registration Failed", error.message || "An error occurred during registration")
      }
    } finally {
      setIsLoading(false)
    }
  }, [email, username, password, navigation, validateForm])

  // Handle Google sign-in with a mock implementation
  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true)
    try {
      // Since we don't have the Google Sign-In module working,
      // show an alert explaining the situation
      Alert.alert(
        "Google Sign-In Not Available",
        "The Google Sign-In module is not properly linked. Please use email/password registration instead.",
        [{ text: "OK" }],
      )
    } catch (error: any) {
      console.error("Error with Google Sign-In:", error)
      Alert.alert("Error", error.message || "An error occurred")
    } finally {
      setGoogleLoading(false)
    }
  }, [])

  // Function to go back to previous screen
  const goBack = () => {
    navigation.goBack()
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
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
            {/* Centered Logo */}
            <Image source={require("../assets/images/33.png")} style={styles.logo} />

            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>Create an account to get started</Text>

            {/* Google Sign-Up Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <>
                  <Image source={require("../assets/images/goo.png")} style={styles.googleLogo} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.orText}>or</Text>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Email Address"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Username Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, usernameError ? styles.inputError : null]}
                placeholder="Username"
                value={username}
                onChangeText={handleUsernameChange}
                onBlur={() => validateUsername(username)}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                secureTextEntry
                editable={!isLoading}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => validateConfirmPassword(password, confirmPassword)}
                secureTextEntry
                editable={!isLoading}
              />
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading || googleLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.signUpText}>
              Already have an account?{" "}
              <Text style={styles.signUpLink} onPress={() => navigation.navigate("Auth")}>
                Sign in
              </Text>
            </Text>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    marginTop: 60, // Add space for the header
  },
  logo: {
    width: width * 0.20,
    height: height * 0.10,
    resizeMode: "contain",
    marginBottom: width * 0.06,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: width * 0.06,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    padding: width * 0.03,
    borderRadius: 25,
    width: "100%",
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
  inputContainer: {
    width: "100%",
    marginBottom: width * 0.03,
  },
  input: {
    width: "100%",
    height: width * 0.12,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#000",
    padding: width * 0.03,
    alignItems: "center",
    width: "100%",
    borderRadius: 25,
    marginTop: width * 0.04,
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