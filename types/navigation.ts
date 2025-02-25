// types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Training: undefined;
  Bot: undefined;
  Nutrition: undefined;
  'Mental Health': undefined;
};

export type RecetteExerciceParamList = {
  Recette: undefined;
  Exercice: undefined;
};

  
export type RootStackParamList = {
    Home: undefined;
    MainTabs: NavigatorScreenParams<MainTabParamList>; 
    RecetteExercice: NavigatorScreenParams<RecetteExerciceParamList>;
    Profile: undefined;
    Auth: undefined;
    SignUp: undefined;
    Bot: undefined;
    Recette: undefined; 
    RecipeDetail: undefined; 
    Test: undefined; 
    TestDetail: undefined; 
    Music: undefined; 
    Fitness:undefined;

  };
  
  