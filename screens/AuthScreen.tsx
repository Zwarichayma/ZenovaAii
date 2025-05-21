"use client"

import { useState, useEffect } from "react"
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
import { authService } from "../api/auth/auth-service" 

const { width, height } = Dimensions.get("window")
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList>

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<AuthScreenNavigationProp>()

  // Suppression de la fonction loadDeviceUUID et de l'état deviceUUID

  const handleContinue = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez saisir votre email et votre mot de passe")
      return
    }

    setIsLoading(true)
    try {
      // Appeler la méthode de connexion de notre service d'authentification
      const response = await authService.login(email, password)

      // Connexion réussie
      console.log("Connexion réussie:", response.user)

      // Naviguer vers l'écran de profil
      navigation.navigate("Profile")
    } catch (error: any) {
      // Gérer l'erreur de connexion
      console.error("Erreur de connexion:", error)
      Alert.alert("Échec de la connexion", error.message || "Veuillez vérifier vos identifiants et réessayer")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour retourner à l'écran d'accueil
  const goToHome = () => {
    navigation.navigate("MainTabs", { screen: "Home" })
  }

  return (
    <ImageBackground
      source={require("../assets/images/back.jpg")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
        {/* Logo (Retour à HomeScreen) avec un texte explicite */}
        <TouchableOpacity onPress={goToHome} style={styles.backContainer}>
          <Image source={require("../assets/images/33.png")} style={styles.logo} />
          <Text style={styles.backText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Bienvenue ! Veuillez vous connecter pour continuer</Text>

        {/* Suppression de l'affichage de l'UUID */}

        {/* Bouton de connexion Google */}
        <TouchableOpacity style={styles.googleButton}>
          <Image source={require("../assets/images/goo.png")} style={styles.googleLogo} />
          <Text style={styles.googleButtonText}>Continuer avec Google</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>ou</Text>

        {/* Champs Email et Mot de passe */}
        <TextInput
          style={styles.input}
          placeholder="Adresse email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        {/* Bouton Continuer */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continuer</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Vous n'avez pas de compte ?{" "}
          <Text style={styles.signUpLink} onPress={() => navigation.navigate("SignUp")}>
            S'inscrire
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
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: width * 0.04,
  },
  logo: {
    width: width * 0.15,
    height: height * 0.08,
    resizeMode: "contain",
  },
  backText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    textDecorationLine: "underline",
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
  // Suppression du style uuidText
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