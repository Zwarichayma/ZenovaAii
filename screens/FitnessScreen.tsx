import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  StatusBar 
} from 'react-native';
import { ChevronLeft, Clock, Calendar, Star, Users, BarChart2, Bookmark } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const workoutDetails = {
  title: 'Cardio Program',
  duration: '4 weeks',
  sessionsPerWeek: '3 sessions per week',
  difficulty: 'Beginner-Intermediate',
  slots: '8 available/15 max',
  description: 'High-intensity cardio workouts designed to improve your endurance and burn calories effectively. Perfect for all fitness levels.',
};

const episodes = [
  {
    id: 1,
    title: 'Warm Up Routine',
    duration: '15 min',
    image: require('../assets/images/fitness (3).jpg')
  },
  {
    id: 2,
    title: 'HIIT Session',
    duration: '20 min',
    image: require('../assets/images/yooga.jpg')
  },
  {
    id: 3,
    title: 'Cool Down',
    duration: '10 min',
    image: require('../assets/images/yoooga.jpg')
  }
];

const relatedCourses = [
  {
    id: 1,
    title: 'Full Body Workout',
    duration: '45 min',
    image: require('../assets/images/fitness (3).jpg')
  },
  {
    id: 2,
    title: 'Strength Training',
    duration: '30 min',
    image: require('../assets/images/yooga.jpg')
  }
];

export default function FitnessScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
          <Image 
            source={require('../assets/images/fitness (3).jpg')}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay}>
            <View style={styles.headerTop}>
              <Image 
                source={require('../assets/images/33.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Bookmark size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.cardioText}>CARDIO</Text>
            </View>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          {/* Workout Details */}
          <Text style={styles.detailsTitle}>Details</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Calendar size={20} color="#666" />
              <Text style={styles.infoText}>{workoutDetails.sessionsPerWeek}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={20} color="#666" />
              <Text style={styles.infoText}>{workoutDetails.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <BarChart2 size={20} color="#666" />
              <Text style={styles.infoText}>{workoutDetails.difficulty}</Text>
            </View>
            <View style={styles.infoItem}>
              <Users size={20} color="#666" />
              <Text style={styles.infoText}>{workoutDetails.slots}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Program</Text>
          </TouchableOpacity>

          {/* Title and Description */}
          <Text style={styles.title}>{workoutDetails.title}</Text>
          <Text style={styles.description}>{workoutDetails.description}</Text>

          {/* Episodes */}
          <Text style={styles.sectionTitle}>Workout Sessions</Text>
          {episodes.map((episode) => (
            <TouchableOpacity key={episode.id} style={styles.episodeCard}>
              <Image source={episode.image} style={styles.episodeImage} />
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>{episode.title}</Text>
                <Text style={styles.episodeDuration}>{episode.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Related Courses */}
          <View style={styles.relatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Related Programs</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedCourses.map((course) => (
                <TouchableOpacity key={course.id} style={styles.courseCard}>
                  <Image source={course.image} style={styles.courseImage} />
                  <View style={styles.courseOverlay}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseDuration}>{course.duration}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            </View>


          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Sarah Johnson</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      color="#FFD700"
                      fill="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>
                Amazing program! The workouts are challenging but achievable. I've seen great improvements in my cardio fitness level. Highly recommended!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    height: 400,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 99, 99, 0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 70,
  },
  logo: {
    width: 60,
    height: 22,
    tintColor: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 50,
    height: 30,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom:30,
    left: 20,
  },
  programText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '500',
    fontFamily:'fantasy',
    marginBottom: 8,
  },
  cardioText: {
    color: '#fff',
    fontSize: 35,
    fontWeight: '800',
    fontFamily:'fantasy',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    marginTop: -50,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  infoList: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  startButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 24,
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
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#666',
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  episodeImage: {
    width: 80,
    height: 80,
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  episodeDuration: {
    fontSize: 14,
    color: '#666',
  },
  relatedSection: {
    marginTop: 24,
  },
  courseCard: {
    width: 200,
    height: 120,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.26)',
  },
  courseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  courseDuration: {
    color: '#fff',
    fontSize: 12,
  },
  reviewsSection: {
    marginTop: 24,
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});