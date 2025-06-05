import { registerRootComponent } from 'expo'
import React, { useState, useEffect, useCallback } from "react"
import { NavigationContainer } from "@react-navigation/native"
import RootNavigation from "./screens/RootNavigation"
import SplashScreen from "./screens/SplashScreen"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from './context/AuthContext'

export default function App() {
  const [isSplash, setIsSplash] = useState(true)

  // Utilisation de useCallback pour éviter les recréations de fonction à chaque rendu
  const hideSplash = useCallback(() => {
    setIsSplash(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(hideSplash, 3000)
    return () => clearTimeout(timer) // Clear le timer si le composant est démonté
  }, [hideSplash])

  if (isSplash) {
    return <SplashScreen />
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  )
}

registerRootComponent(App)
