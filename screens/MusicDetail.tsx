"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  ImageBackground,
  Alert,
  Linking,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft } from "lucide-react-native"
import { getMusic } from "@/api/music/route"
import * as WebBrowser from "expo-web-browser"

const { width, height } = Dimensions.get("window")

interface MusicDetailScreenProps {
  route: {
    params: {
      id: number
    }
  }
  navigation: any
}

export default function MusicDetailScreen({ route, navigation }: MusicDetailScreenProps) {
  const { id } = route.params
  const [music, setMusic] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Format time for audio player
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        console.log("🎵 === MUSIC DETAIL SCREEN LOADING ===")
        setLoading(true)
        setError(null)

        const allMusic = await getMusic()
        const musicItem = allMusic.find((item: any) => item.id === id || item.id === Number(id))

        if (!musicItem) {
          throw new Error("Musique non trouvée")
        }

        setMusic(musicItem)

        // Set duration
        if (musicItem.duration) {
          const durationValue = musicItem.duration
          if (typeof durationValue === "string" && durationValue.includes(":")) {
            const [minutes, seconds] = durationValue.split(":").map(Number)
            setDuration((minutes * 60 + seconds) * 1000)
          } else if (typeof durationValue === "number") {
            setDuration(durationValue * 1000)
          } else {
            setDuration(5 * 60 * 1000)
          }
        } else {
          setDuration(5 * 60 * 1000)
        }

        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start()
      } catch (err) {
        console.error("❌ Error fetching music:", err)
        setError("Impossible de charger les données audio. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMusic()
    } else {
      setError("ID de musique manquant")
      setLoading(false)
    }
  }, [id])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      const interval = setInterval(() => {
        setPosition((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            clearInterval(interval)
            return 0
          }
          return prev + 1000
        })
      }, 1000)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    Alert.alert(
      isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      `"${getMusicTitle()}" ${isFavorite ? "a été retiré de" : "a été ajouté à"} vos favoris.`,
    )
  }

  const shareMusic = () => {
    Alert.alert("Partager la musique", `Partager "${getMusicTitle()}" par ${getMusicArtist()}`)
  }

  const openYouTube = async () => {
    try {
      const youtubeUrl = music?.url_youtube
      if (!youtubeUrl) {
        Alert.alert("Lien non disponible", "Le lien YouTube n'est pas disponible pour cette musique.")
        return
      }

      const youtubeAppUrl = youtubeUrl.replace("https://www.youtube.com/watch?v=", "youtube://watch?v=")

      try {
        const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl)
        if (canOpenYouTubeApp) {
          await Linking.openURL(youtubeAppUrl)
          return
        }
      } catch (appError) {
        console.log("YouTube app not available, trying WebBrowser...")
      }

      await WebBrowser.openBrowserAsync(youtubeUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: "#ff0000",
        toolbarColor: "#ffffff",
      })
    } catch (error) {
      console.error("❌ Error opening YouTube:", error)
      Alert.alert("Erreur", "Impossible d'ouvrir le lien YouTube.")
    }
  }

  const openSpotify = async () => {
    try {
      const spotifyUrl = music?.url_spotify
      if (!spotifyUrl) {
        Alert.alert("Lien non disponible", "Le lien Spotify n'est pas disponible pour cette musique.")
        return
      }

      let spotifyAppUrl = spotifyUrl
      if (spotifyUrl.includes("open.spotify.com")) {
        spotifyAppUrl = spotifyUrl.replace("https://open.spotify.com/", "spotify:")
        spotifyAppUrl = spotifyAppUrl.replace("/track/", "track:")
      }

      try {
        const canOpenSpotifyApp = await Linking.canOpenURL(spotifyAppUrl)
        if (canOpenSpotifyApp) {
          await Linking.openURL(spotifyAppUrl)
          return
        }
      } catch (appError) {
        console.log("Spotify app not available, trying WebBrowser...")
      }

      await WebBrowser.openBrowserAsync(spotifyUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: "#1db954",
        toolbarColor: "#ffffff",
      })
    } catch (error) {
      console.error("❌ Error opening Spotify:", error)
      Alert.alert("Erreur", "Impossible d'ouvrir le lien Spotify.")
    }
  }

  const getSafeImageUrl = () => {
    try {
      if (!music || !music.image) {
        return null
      }

      if (music.image.url) {
        const baseUrl = "http://192.168.100.7:1337"
        const fullUrl = `${baseUrl}${music.image.url}`
        return fullUrl
      }
    } catch (error) {
      console.warn("❌ Error getting image URL:", error)
    }
    return null
  }

  const getMusicTitle = () => {
    return music?.title || "Sans titre"
  }

  const getMusicArtist = () => {
    return music?.artist || "Artiste inconnu"
  }

  const hasYouTubeLink = () => {
    return !!music?.url_youtube
  }

  const hasSpotifyLink = () => {
    return !!music?.url_spotify
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement de l'audio...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!music) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Données de musique non disponibles</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const imageUrl = getSafeImageUrl()
  const fallbackImage = require("../assets/images/paceful.jpeg")

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Album Art */}
        <View style={styles.albumContainer}>
          <View style={styles.albumArtWrapper}>
            <ImageBackground
              source={imageUrl ? { uri: imageUrl } : fallbackImage}
              style={styles.albumArt}
              imageStyle={styles.albumArtImage}
              defaultSource={fallbackImage}
            >
              <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(0,0,0,0.1)"]} style={styles.albumOverlay} />
            </ImageBackground>
          </View>
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{getMusicTitle()}</Text>
          <Text style={styles.artistName}>{getMusicArtist()}</Text>
        </View>

        {/* External Links - Simple Icons */}
        {(hasYouTubeLink() || hasSpotifyLink()) && (
          <View style={styles.externalLinksSection}>
            <View style={styles.externalLinksContainer}>
              {hasSpotifyLink() && (
                <TouchableOpacity style={styles.iconButton} onPress={openSpotify}>
                  <Image source={require("../assets/images/spotify.png")} style={styles.serviceIconSimple} />
                </TouchableOpacity>
              )}

              {hasYouTubeLink() && (
                <TouchableOpacity style={styles.iconButton} onPress={openYouTube}>
                  <Image source={require("../assets/images/youtube.png")} style={styles.serviceIconSimple} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  albumContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  albumArtWrapper: {
    width: width * 0.9,
    height: width * 1.2,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: "#F5F5F5",
  },
  albumArt: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  albumArtImage: {
    borderRadius: 20,
  },
  albumOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  songInfo: {
    alignItems: "center",
    marginBottom: 50,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
    textAlign: "center",
  },
  artistName: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  externalLinksSection: {
    marginBottom: 40,
    marginTop: 20,
  },
  externalLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "transparent",
  },
  serviceIconSimple: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  upNextSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  upNextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upNextTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  upNextExpand: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
})
