"use client"

import React, { useEffect } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack" // Stack Navigator
import { BlurView } from "expo-blur"
import { Dimensions, StyleSheet, Animated, View } from "react-native"
import { Airplay, Dumbbell, Bot, ChefHat, Brain } from "lucide-react-native"
import HomeScreen from "../screens/HomeScreen"
import TrainingScreen from "./TrainingScreen"
import MentalHealthScreen from "./MentalHealthScreen"
import BotScreen from "./BotScreen"
import NutritionScreen from "./NutritionScreen"
import RecetteScreen from "./RecetteScreen" // Recette Screen
import ExerciceScreen from "./ExerciceScreen"
import ProfileScreen from "./ProfileScreen"
import { RootStackParamList } from "../types/navigation"
import SignUpScreen from "./SignUpScreen"
import AuthScreen from "./AuthScreen"
import RecipeDetailScreen from "./RecipeDetailScreen"
import TestScreen from "./TestScreen"
import TestDetailScreen from "./TestDetailScreen"
import MusicScreen from "./MusicScreen"
import FitnessScreen from "./FitnessScreen"
const { height, width } = Dimensions.get("window")
const Tab = createBottomTabNavigator()
const Stack = createStackNavigator() // Définition du Stack Navigator
interface AnimatedBotButtonProps {
  color: string
  size: number
}

// Composant de bouton animé pour le bot
function AnimatedBotButton({ color, size }: AnimatedBotButtonProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const Stack = createStackNavigator<RootStackParamList>();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([ 
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [pulseAnim])

  return (
    <View style={styles.botButtonContainer}>
      <Animated.View
        style={[ 
          styles.botButtonGlow,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View style={styles.botButton}>
        <Bot color="#000000" size={size * 1.5} />
      </View>
    </View>
  )
}

// Stack Navigator pour Recette et Exercice
function RecetteExerciceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Recette" component={RecetteScreen} />
      <Stack.Screen name="Exercice" component={ExerciceScreen} />
    </Stack.Navigator>
  )
}


export default function RootNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="RecetteExercice" component={RecetteExerciceStack} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Recette" component={RecetteScreen} />
      <Stack.Screen name="Bot" component={BotScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="TestDetail" component={TestDetailScreen} />
      <Stack.Screen name="Music" component={MusicScreen} />
      <Stack.Screen name="Fitness" component={FitnessScreen} />


    </Stack.Navigator>
  )
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView tint="light" intensity={50} style={[StyleSheet.absoluteFill, styles.tabBarContainer]} />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#666",
        tabBarIconStyle: styles.iconStyle,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Airplay color={color} size={size * 1.1} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Training"
        component={TrainingScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size * 1.1} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Bot"
        component={BotScreen}
        options={{
          tabBarIcon: ({ color, size }) => <AnimatedBotButton color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ChefHat color={color} size={size * 1.1} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Mental Health"
        component={MentalHealthScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size * 1.1} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.01,
    elevation: 20,
    height: height * 0.07,
    justifyContent: "center",
    alignItems: "center",
    left: 1,
    right: 5,
  },
  tabBarContainer: {
    borderRadius: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  iconStyle: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.01,
  },
  botButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  botButton: {
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botButtonGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    opacity: 0.7,
  },
})
