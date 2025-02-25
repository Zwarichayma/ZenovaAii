import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Menu, Search, Play, MoreVertical } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const relaxationTracks = [
  {
    id: '1',
    title: 'Mindful Meditation',
    artist: 'Zen Series',
    duration: '10:00',
    image: require('../assets/images/paceful.jpeg')
  },
  {
    id: '2',
    title: 'Deep Sleep',
    artist: 'Relaxation Guide',
    duration: '15:00',
    image: require('../assets/images/classique.jpg')
  },
  {
    id: '3',
    title: 'Stress Relief',
    artist: 'Wellness Audio',
    duration: '12:00',
    image: require('../assets/images/paceful.jpeg')
  }
];

export default function MusicWellnessScreen() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Menu size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <Text style={styles.searchText}>Search music, artists...</Text>
          </View>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Music Trending</Text>
            <TouchableOpacity>
              <Text style={styles.seeMore}>See more</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trendingContainer}>
              {relaxationTracks.slice(0, 2).map((track) => (
                <TouchableOpacity key={track.id} style={styles.trendingCard}>
                  <Image source={track.image} style={styles.trendingImage} />
                  <View style={styles.playButton}>
                    <Play size={20} color="#fff" fill="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recently Played */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently</Text>
            <View style={styles.categoryTabs}>
              <Text style={[styles.categoryTab, styles.activeTab]}>Popular</Text>
              <Text style={styles.categoryTab}>Playlist</Text>
            </View>
          </View>

          {relaxationTracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.trackItem}>
              <Image source={track.image} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
              <TouchableOpacity style={styles.trackMoreButton}>
                <MoreVertical size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Currently Playing Bar */}
      <View style={styles.playingBar}>
        <Image 
          source={require('../assets/images/paceful.jpeg')} 
          style={styles.miniTrackImage} 
        />
        <View style={styles.miniTrackInfo}>
          <Text style={styles.miniTrackTitle}>Mindful Meditation</Text>
          <Text style={styles.miniTrackArtist}>Zen Series</Text>
        </View>
        <TouchableOpacity 
          style={styles.miniPlayButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Play size={20} color="#fff" fill="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  searchText: {
    marginLeft: 8,
    color: '#666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeMore: {
    color: '#666',
  },
  trendingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingCard: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#000',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 16,
  },
  categoryTab: {
    color: '#666',
    fontSize: 14,
  },
  activeTab: {
    color: '#000',
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  trackMoreButton: {
    padding: 8,
  },
  playingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  miniTrackImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  miniTrackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTrackTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  miniTrackArtist: {
    fontSize: 12,
    color: '#666',
  },
  miniPlayButton: {
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});