import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Play, Pause, Volume2, Share, Clock } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { getMusicById, getImageUrl, getPlainTextDescription } from '@/api/categories/route';

const { width, height } = Dimensions.get('window');

interface MusicDetailScreenProps {
  route: {
    params: {
      id: number;
    };
  };
  navigation: any;
}

export default function MusicDetailScreen({ route, navigation }: MusicDetailScreenProps) {
  const { id } = route.params;
  const [music, setMusic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Audio player states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 90, 120],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // Format time for audio player
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Load music data
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        const data = await getMusicById(id);
        setMusic(data);
        console.log("Music data:", data);
      } catch (err) {
        console.error("Error fetching music:", err);
        setError("Impossible de charger les données audio. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [id]);

  // Load and manage audio
  useEffect(() => {
    let isMounted = true;
    
    const loadAudio = async () => {
      if (!music?.attributes?.audioUrl) return;
      
      try {
        // Unload any existing sound
        if (sound) {
          await sound.unloadAsync();
        }
      
       
        if (isMounted) {
          setSound(newSound);
        }
      } catch (err) {
        console.error("Error loading audio:", err);
        if (isMounted) {
          setError("Impossible de charger l'audio. Veuillez réessayer.");
        }
      }
    };
    
    loadAudio();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [music]);

  // Audio status update callback
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Loop the audio when it reaches the end
      if (status.didJustFinish) {
        sound?.replayAsync();
      }
    }
  };

  // Play/pause toggle
  const togglePlayPause = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      console.error("Error toggling play/pause:", err);
    }
  };

  // Seek to position
  const seekAudio = async (value: number) => {
    if (!sound) return;
    
    try {
      await sound.setPositionAsync(value);
    } catch (err) {
      console.error("Error seeking audio:", err);
    }
  };

  // Change volume
  const changeVolume = async (value: number) => {
    if (!sound) return;
    
    try {
      await sound.setVolumeAsync(value);
      setVolume(value);
    } catch (err) {
      console.error("Error changing volume:", err);
    }
  };

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would also update your favorites storage
  };

  // Share music
  const shareMusic = () => {
    // Implement sharing functionality
    console.log("Share music:", music?.attributes?.title);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f4f4f" />
        <Text style={styles.loadingText}>Chargement de l'audio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated header */}
      <Animated.View style={[
        styles.animatedHeader,
        { opacity: headerOpacity }
      ]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {music?.attributes?.title || "Musique"}
        </Text>
      </Animated.View>
      
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero image with gradient */}
        <Animated.View style={[
          styles.imageContainer,
          { transform: [{ scale: imageScale }] }
        ]}>
          <ImageBackground
            source={
              music?.attributes?.image?.data?.attributes?.url
                ? { uri: getImageUrl(music) }
                : require('../assets/images/paceful.jpeg')
            }
            style={styles.heroImage}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
              style={styles.gradient}
            />
          </ImageBackground>
        </Animated.View>
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title and actions */}
          <View style={styles.titleContainer}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{music?.attributes?.title || "Sans titre"}</Text>
              <Text style={styles.subtitle}>{music?.attributes?.artist || "Artiste inconnu"}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={toggleFavorite}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? "#ff4757" : "#fff"} 
                  fill={isFavorite ? "#ff4757" : "transparent"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={shareMusic}
              >
                <Share size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Audio player */}
          <View style={styles.playerContainer}>
            {/* Play/Pause button */}
            <TouchableOpacity 
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause size={32} color="#fff" fill="#fff" />
              ) : (
                <Play size={32} color="#fff" fill="#fff" />
              )}
            </TouchableOpacity>
            
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={seekAudio}
                minimumTrackTintColor="#2f4f4f"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#2f4f4f"
              />
              
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
          
          {/* Volume control */}
          <View style={styles.volumeContainer}>
            <Volume2 size={20} color="#666" />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={changeVolume}
              minimumTrackTintColor="#2f4f4f"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#2f4f4f"
            />
          </View>
          
          {/* Description */}
          {music?.attributes?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>À propos de cette musique</Text>
              <Text style={styles.descriptionText}>
                {getPlainTextDescription(music.attributes.description) || 
                 "Aucune description disponible."}
              </Text>
            </View>
          )}
          
          {/* Duration info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Clock size={18} color="#666" />
              <Text style={styles.infoText}>
                {music?.attributes?.duration || formatTime(duration)}
              </Text>
            </View>
            
            {music?.attributes?.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {music.attributes.category}
                </Text>
              </View>
            )}
          </View>
          
          {/* Recommendations would go here */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Vous pourriez aussi aimer</Text>
            {/* Recommendations would be rendered here */}
            <Text style={styles.comingSoonText}>Recommandations à venir...</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2f4f4f',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: '#121212',
    zIndex: 100,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    height: height * 0.5,
    width: width,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  contentContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 15,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2f4f4f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  volumeSlider: {
    flex: 1,
    marginLeft: 10,
    height: 40,
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#aaa',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    marginLeft: 5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(47, 79, 79, 0.3)',
    borderRadius: 15,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  comingSoonText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});