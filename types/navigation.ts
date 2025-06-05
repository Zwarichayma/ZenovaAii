// types/navigation.ts

import { Exercise, SubCategory } from "@/api/fitness-plans/route"
import { NavigatorScreenParams } from "@react-navigation/native"

// Onglets principaux de l'app
export type MainTabParamList = {
  Home: undefined
  Training: undefined
  Bot: undefined
  Nutrition: undefined
  "Mental Health": undefined
}

// Navigation principale (Stack)
export type RootStackParamList = {
  // Authentification
  Auth: undefined
  SignUp: undefined

  // Navigation principale avec onglets
  MainTabs: NavigatorScreenParams<MainTabParamList>

  // Pages standards
  Home: undefined
  Profile: undefined
  Bot: undefined
  Music: undefined
  Quote: undefined
  Fitness: undefined
  Recette: undefined
  RecipeDetail: undefined
  Test: undefined
  TestDetail: undefined
  DeviceSessions: undefined
  SubCategories: { fitnessId: number; fitnessTitle: string }
  ExerciseList: { subCategory: SubCategory }
  ExerciseDetail: { exercise: Exercise; subCategoryName: string }
WellnessProfile: undefined
}
