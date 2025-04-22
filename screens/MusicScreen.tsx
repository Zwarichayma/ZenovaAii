"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  StatusBar,
  Platform,
  ImageBackground,
  Animated, // Import Animated
} from "react-native"
import { Search, Play, Pause, MoreVertical, ArrowLeft, Youtube, Heart, ChevronRight } from "lucide-react-native"
import axios from "axios"
import { API_BASE_URL } from "@env"

const { width, height } = Dimensions.get("window")

// Define the Music type based on your API response
type MusicTrack = {
  id: number
  documentId: string
  title: string
  description: string | null
  duration: number | null
  createdAt: string
  updatedAt: string
  publishedAt: string
  url_audio?: string
  url_spotify?: string | null
  url_youtube?: string | null
}

// Placeholder image mapping for different music types
const getImageForMusic = (title: string) => {
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes("forest") || lowerTitle.includes("jungle") || lowerTitle.includes("birds")) {
    return require("../assets/images/paceful.jpeg")
  } else if (lowerTitle.includes("rain") || lowerTitle.includes("storm")) {
    return require("../assets/images/classique.jpg")
  } else if (lowerTitle.includes("waves") || lowerTitle.includes("river") || lowerTitle.includes("water")) {
    return require("../assets/images/paceful.jpeg")
  } else {
    // Default image
    return require("../assets/images/paceful.jpeg")
  }
}

export default function MusicWellnessScreen() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [musicList, setMusicList] = useState<MusicTrack[]>([])
  const [trendingMusic, setTrendingMusic] = useState<MusicTrack[]>([])
  const [streamingTracks, setStreamingTracks] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("Popular")
  const [favorites, setFavorites] = useState<Record<number, boolean>>({})

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, Platform.OS === "ios" ? 90 : 60],
    extrapolate: "clamp",
  })



  
  useEffect(() => {
    fetchMusic()
  }, [])

  const fetchMusic = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/musics`)
  
      if (response.data && response.data.data) {
        const allTracks = response.data.data
        setMusicList(allTracks)
  
        // Set trending music (first 3 items)
        setTrendingMusic(allTracks.slice(0, 3))
  
        // Filter tracks with streaming links
        const tracksWithStreaming = allTracks.filter(
          (track: MusicTrack) => track.url_spotify || track.url_youtube
        )
        setStreamingTracks(tracksWithStreaming)
  
        // Set initial current track
        if (allTracks.length > 0) {
          setCurrentTrack(allTracks[0])
        }
      }
    } catch (error) {
      console.error("Error fetching music:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePlayTrack = (track: MusicTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const openYoutubeLink = (url: string | undefined | null, e?: any) => {
    if (e) e.stopPropagation()
    if (!url) return
    Linking.openURL(url).catch((err) => console.error("Error opening YouTube link:", err))
  }

  const openSpotifyLink = (url: string | undefined | null, e?: any) => {
    if (e) e.stopPropagation()
    if (!url) return
    Linking.openURL(url).catch((err) => console.error("Error opening Spotify link:", err))
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleFavorite = (id: number, e?: any) => {
    if (e) e.stopPropagation()
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const formatDuration = (duration: number | null) => {
    if (!duration) return "3:00" // Default duration
    const minutes = Math.floor(duration)
    return `${minutes}:00`
  }

  return (
    <View style={styles.container}>
      {/* Modifier la barre d'état pour un thème clair */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Animated Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness Sounds</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading relaxing sounds...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <ImageBackground source={require("../assets/images/paceful.jpeg")} style={styles.heroBackground}>
              <View style={styles.heroOverlay}>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>Wellness Sounds</Text>
                  <Text style={styles.heroSubtitle}>Relax your mind with soothing sounds</Text>

                  <View style={styles.searchBar}>
                    <Search size={20} color="#fff" />
                    <Text style={styles.searchText}>Search relaxing sounds...</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Featured Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color="#1DB954" />
              </TouchableOpacity>
            </View>

            {/* Remplacer la FlatList par un ScrollView */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              pagingEnabled
              decelerationRate="fast"
            >
              {trendingMusic.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.featuredCard}
                  onPress={() => handlePlayTrack(item)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={getImageForMusic(item.title)}
                    style={styles.featuredImage}
                    imageStyle={styles.featuredImageStyle}
                  >
                    <View style={styles.featuredGradient}>
                      <View style={styles.featuredContent}>
                        <Text style={styles.featuredTitle}>{item.title}</Text>
                        <Text style={styles.featuredSubtitle}>Nature Sounds</Text>

                        <View style={styles.featuredControls}>
                          <TouchableOpacity style={styles.featuredPlayButton} onPress={() => handlePlayTrack(item)}>
                            <Play size={24} color="#fff" fill="#fff" />
                          </TouchableOpacity>

                          <View style={styles.featuredServiceButtons}>
                            {/* Modifier les icônes Spotify dans la section Featured */}
                            {item.url_spotify && (
                              <TouchableOpacity
                                style={styles.featuredServiceButton}
                                onPress={(e) => openSpotifyLink(item.url_spotify, e)}
                              >
                                <Image
                                  source={require("../assets/images/spotify.png")}
                                  style={[styles.featuredSpotifyIcon, { tintColor: "#1DB954" }]}
                                />
                              </TouchableOpacity>
                            )}
                            {item.url_youtube && (
                              <TouchableOpacity
                                style={styles.featuredServiceButton}
                                onPress={(e) => openYoutubeLink(item.url_youtube, e)}
                              >
<Image
                    source={require("../assets/images/youtube.png")}
                    style={[styles.miniBadgeIcon]}
                  />                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.featuredFavoriteButton}
                        onPress={(e) => toggleFavorite(item.id, e)}
                      >
                        <Heart size={20} color="#fff" fill={favorites[item.id] ? "#fff" : "transparent"} />
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Streaming Section */}
          {streamingTracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available on Streaming</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Remplacer la FlatList par un ScrollView */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.streamingList}
              >
                {streamingTracks.map((item) => (
                  <TouchableOpacity
                    key={`streaming-${item.id}`}
                    style={styles.streamingCard}
                    onPress={() => handlePlayTrack(item)}
                    activeOpacity={0.9}
                  >
                    <Image source={getImageForMusic(item.title)} style={styles.streamingImage} />
                    <View style={styles.streamingContent}>
                      <Text style={styles.streamingTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.streamingSubtitle} numberOfLines={1}>
                        Nature Sounds
                      </Text>

                      <View style={styles.streamingBadges}>
                        {/* Modifier les icônes Spotify dans la section Streaming */}
                        {item.url_spotify && (
                          <TouchableOpacity
                            style={styles.streamingBadge}
                            onPress={(e) => openSpotifyLink(item.url_spotify, e)}
                          >
                            <Image
                              source={require("../assets/images/spotify.png")}
                              style={[styles.streamingBadgeIcon, { tintColor: "#1DB954" }]}
                            />
                          </TouchableOpacity>
                        )}
                        {item.url_youtube && (
                          <TouchableOpacity
                            style={styles.streamingBadge}
                            onPress={(e) => openYoutubeLink(item.url_youtube, e)}
                          >
                            <Image
                    source={require("../assets/images/youtube.png")}
                    style={[styles.streamingBadgeIcon]}
                  />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* All Sounds */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Sounds</Text>
              <View style={styles.categoryTabs}>
                <TouchableOpacity onPress={() => setActiveCategory("Popular")}>
                  <Text style={[styles.categoryTab, activeCategory === "Popular" && styles.activeTab]}>Popular</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveCategory("Recent")}>
                  <Text style={[styles.categoryTab, activeCategory === "Recent" && styles.activeTab]}>Recent</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tracksList}>
              {musicList.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackItem}
                  onPress={() => handlePlayTrack(track)}
                  activeOpacity={0.7}
                >
                  <Image source={getImageForMusic(track.title)} style={styles.trackImage} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <View style={styles.trackMeta}>
                      <Text style={styles.trackArtist}>Nature Sounds</Text>

                      {/* Streaming badges */}
                      <View style={styles.trackBadges}>
                        {/* Modifier les icônes Spotify dans la liste des pistes */}
                        {track.url_spotify && (
                          <Image
                            source={require("../assets/images/spotify.png")}
                            style={[styles.trackBadgeIcon, { tintColor: "#1DB954" }]}
                          />
                        )}
                        {track.url_youtube && <Image
                    source={require("../assets/images/youtube.png")}
                    style={[styles.trackBadgeIcon]}
                  />}
                      </View>
                    </View>
                  </View>

                  <View style={styles.trackRightContent}>
                    <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>

                    <TouchableOpacity style={styles.trackFavoriteButton} onPress={(e) => toggleFavorite(track.id, e)}>
                      <Heart
                        size={16}
                        color={favorites[track.id] ? "#1DB954" : "#888"}
                        fill={favorites[track.id] ? "#1DB954" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Extra space at bottom to account for player bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Currently Playing Bar */}
      {currentTrack && (
        <View style={styles.playingBar}>
          <Image source={getImageForMusic(currentTrack.title)} style={styles.miniTrackImage} />
          <View style={styles.miniTrackInfo}>
            <Text style={styles.miniTrackTitle}>{currentTrack.title}</Text>
            <View style={styles.miniTrackMeta}>
              <Text style={styles.miniTrackArtist}>Nature Sounds</Text>

              {/* Mini streaming badges */}
              <View style={styles.miniBadges}>
                {/* Modifier les badges Spotify dans la barre de lecture */}
                {currentTrack.url_spotify && (
                  <Image
                    source={require("../assets/images/spotify.png")}
                    style={[styles.miniBadgeIcon, { tintColor: "#1DB954" }]}
                  />
                )}
                {currentTrack.url_youtube && (
                  <TouchableOpacity
                    style={styles.miniServiceButton}
                    onPress={() => openYoutubeLink(currentTrack.url_youtube)}
                  >
                    <Image
                    source={require("../assets/images/youtube.png")}
                    style={[styles.miniBadgeIcon]}
                  />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.miniControls}>
            {/* Mini music service icons */}
            {/* Modifier les icônes Spotify dans la barre de lecture */}
            {currentTrack.url_spotify && (
              <TouchableOpacity
                style={styles.miniServiceButton}
                onPress={() => openSpotifyLink(currentTrack.url_spotify)}
              >
                <Image
                  source={require("../assets/images/spotify.png")}
                  style={[styles.miniSpotifyIcon]}
                />
              </TouchableOpacity>
            )}
            {currentTrack.url_youtube && (
              <TouchableOpacity
                style={styles.miniServiceButton}
                onPress={() => openYoutubeLink(currentTrack.url_youtube)}
              >
                <Image
                    source={require("../assets/images/youtube.png")}
                    style={[styles.miniSpotifyIcon]}
                  />
              </TouchableOpacity>
            )}

            
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  heroSection: {
    height: 280,
    width: "100%",
  },
  heroBackground: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  searchText: {
    marginLeft: 8,
    color: "rgba(255,255,255,0.6)",
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#000",
    fontWeight: "600",
    marginRight: 4,
  },
  featuredList: {
    paddingRight: 16,
  },
  featuredCard: {
    width: width - 60,
    height: 220,
    marginLeft: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredImageStyle: {
    borderRadius: 16,
  },
  featuredGradient: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    padding: 16,
  },
  featuredContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  featuredControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  featuredPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredServiceButtons: {
    flexDirection: "row",
  },
  featuredServiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  featuredYoutubeButton: {
    backgroundColor: "transparent",
  },
  featuredSpotifyIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  featuredFavoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  streamingList: {
    paddingRight: 16,
  },
  streamingCard: {
    width: 160,
    marginLeft: 16,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streamingImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  streamingContent: {
    padding: 12,
  },
  streamingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  streamingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  streamingBadges: {
    flexDirection: "row",
    marginTop: 8,
  },
  streamingBadge: {
    width: 15,
    height: 24,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  youtubeBadge: {
    backgroundColor: "transparent",
  },
  streamingBadgeIcon: {
    width: 16,
    height: 14,
    resizeMode: "contain",
  },
  categoryTabs: {
    flexDirection: "row",
    gap: 16,
  },
  categoryTab: {
    color: "#999",
    fontSize: 14,
  },
  activeTab: {
    color: "#000",
    fontWeight: "600",
  },
  tracksList: {
    marginTop: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  trackImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackArtist: {
    fontSize: 14,
    color: "#666",
  },
  trackBadges: {
    flexDirection: "row",
    marginLeft: 8,
    alignItems: "center",
  },
  trackBadgeIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
    marginRight: 6,
  },
  trackYoutubeBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },
  trackRightContent: {
    alignItems: "flex-end",
  },
  trackDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  trackFavoriteButton: {
    padding: 4,
  },
  playingBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  miniTrackImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  miniTrackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTrackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  miniTrackMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniTrackArtist: {
    fontSize: 14,
    color: "#666",
  },
  miniBadges: {
    flexDirection: "row",
    marginLeft: 8,
    alignItems: "center",
  },
  miniBadgeIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    marginRight: 4,
  },
  miniYoutubeBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },
  miniControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniServiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  miniPlayButton: {
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  miniYoutubeButton: {
    backgroundColor: "transparent",
  },
  miniSpotifyIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#121212",
    zIndex: 100,
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  }
})

