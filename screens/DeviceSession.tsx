import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../api/auth/auth-service";

export default function DeviceSessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deviceUUID, setDeviceUUID] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigation = useNavigation();

  // Charger les sessions au montage du composant
  useEffect(() => {
    const initScreen = async () => {
      const uuid = await authService.getDeviceUUID();
      setDeviceUUID(uuid);
      
      const user = await authService.getUserData();
      setUserData(user);
      
      loadSessions();
    };
    
    initScreen();
  }, []);

  // Fonction pour charger les sessions
  const loadSessions = async () => {
    if (!userData) {
      const user = await authService.getUserData();
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setUserData(user);
    }
    
    try {
      setLoading(true);
      const deviceSessions = await authService.getDeviceSessions(userData.id);
      setSessions(deviceSessions);
    } catch (error) {
      console.error("Erreur lors du chargement des sessions:", error);
      Alert.alert("Erreur", "Impossible de charger les sessions d'appareil");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour rafraîchir les sessions
  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  // Fonction pour déconnecter un appareil
  const handleRemoveSession = (session: any) => {
    // Vérifier si c'est l'appareil actuel
    const isCurrentDevice = session.attributes.deviceUuid === deviceUUID;
    
    Alert.alert(
      "Déconnecter l'appareil",
      isCurrentDevice 
        ? "Voulez-vous vraiment déconnecter cet appareil ? Vous serez déconnecté."
        : `Voulez-vous vraiment déconnecter l'appareil "${session.attributes.deviceName || 'Sans nom'}" ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.removeDeviceSession(session.id);
              
              if (isCurrentDevice) {
                // Si c'est l'appareil actuel, déconnecter l'utilisateur
                await authService.clearAuthData();
                navigation.navigate("Auth" as never);
              } else {
                // Sinon, simplement rafraîchir la liste
                loadSessions();
              }
            } catch (error) {
              console.error("Erreur lors de la déconnexion de l'appareil:", error);
              Alert.alert("Erreur", "Impossible de déconnecter l'appareil");
            }
          },
        },
      ]
    );
  };

  // Formater la date de dernière activité
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Rendu d'un élément de session
  const renderSessionItem = ({ item }: { item: any }) => {
    const isCurrentDevice = item.attributes.deviceUuid === deviceUUID;
    
    return (
      <View style={[styles.sessionItem, isCurrentDevice && styles.currentDevice]}>
        <View style={styles.sessionInfo}>
          <Text style={styles.deviceName}>
            {item.attributes.deviceName || "Appareil sans nom"}
            {isCurrentDevice && " (Cet appareil)"}
          </Text>
          <Text style={styles.lastActive}>
            Dernière activité: {formatLastActive(item.attributes.lastActive)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveSession(item)}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement des sessions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Appareils connectés</Text>
        <View style={styles.placeholder} />
      </View>
      
      <Text style={styles.subtitle}>
        Gérez les appareils connectés à votre compte. Vous pouvez déconnecter un appareil à distance.
      </Text>
      
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun appareil connecté</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sessionItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentDevice: {
    borderLeftWidth: 4,
    borderLeftColor: "#007aff",
  },
  sessionInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});