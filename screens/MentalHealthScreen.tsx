import React, { useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  StatusBar,
  ImageBackground,
  Platform
} from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Detail: { type: string; title: string; image: any };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface CardProps {
  image: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  size?: "large" | "medium" | "small";
}

const FeaturedCard = ({ image, title, subtitle, onPress }: CardProps) => (
  <TouchableOpacity 
    style={styles.featuredCard}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <ImageBackground 
      source={image} 
      style={styles.featuredImage}
      imageStyle={{ borderRadius: 16 }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.featuredGradient}
      >
        {subtitle && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{subtitle}</Text>
          </View>
        )}
        <Text style={styles.featuredTitle}>{title}</Text>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

const Card = ({ image, title, subtitle, onPress, size = "medium" }: CardProps) => (
  <TouchableOpacity 
    style={[styles.card, styles[`${size}Card`]]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <ImageBackground 
      source={image} 
      style={styles.cardImage}
      imageStyle={{ borderRadius: 12 }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.cardGradient}
      >
        {subtitle && (
          <View style={styles.miniTagContainer}>
            <Text style={styles.miniTagText}>{subtitle}</Text>
          </View>
        )}
        <Text style={styles.cardTitle}>{title}</Text>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  // Animation for the welcome text
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  // Animation for the cards
  const translateX = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Animate welcome text
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate cards
    Animated.timing(translateX, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const navigateToDetail = (type: string, title: string, image: any) => {
    navigation.navigate('Detail', { type, title, image });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
          <Image source={require("../assets/images/yooga.jpg")} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateText}>{currentDate}</Text>
        
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ translateY }]
        }}>
          <Text style={styles.welcomeTitle}>Start Your</Text>
          <Text style={styles.welcomeSubtitle}>Mindfulness Journey</Text>
        </Animated.View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <FeaturedCard 
            image={require("../assets/images/yooga.jpg")}
            title="Full Body Yoga"
            subtitle="Exercise"
            onPress={() => navigateToDetail("yoga", "Full Body Yoga", require("../assets/images/yooga.jpg"))}
          />
        </View>

        {/* Sounds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relaxing Sounds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ 
              flexDirection: "row",
              transform: [{ translateX }]
            }}>
              <Card 
                image={require("../assets/images/rain.jpg")}
                title="Sound of Rain"
                subtitle="Listening"
                onPress={() => navigateToDetail("sound", "Sound of Rain", require("../assets/images/rain.jpg"))}
              />
              <Card 
                image={require("../assets/images/amb.jpg")}
                title="Ambient Music"
                subtitle="Relaxation"
                onPress={() => navigateToDetail("sound", "Ambient Music", require("../assets/images/amb.jpg"))}
              />
              <Card 
                image={require("../assets/images/ambient.jpg")}
                title="Nature Ambience"
                subtitle="Calming"
                onPress={() => navigateToDetail("sound", "Nature Ambience", require("../assets/images/ambient.jpg"))}
              />
            </Animated.View>
          </ScrollView>
        </View>

        {/* Tests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Self-Discovery Tests</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ 
              flexDirection: "row",
              transform: [{ translateX }]
            }}>
              <Card 
                image={require("../assets/images/testint.jpg")}
                title="Anxiety Test"
                subtitle="5 min"
                onPress={() => navigateToDetail("test", "Anxiety Test", require("../assets/images/testint.jpg"))}
              />
              <Card 
                image={require("../assets/images/ttt.jpg")}
                title="Social Divide"
                subtitle="8 min"
                onPress={() => navigateToDetail("test", "Social Divide", require("../assets/images/ttt.jpg"))}
              />
              <Card 
                image={require("../assets/images/testt.jpg")}
                title="Personality Test"
                subtitle="10 min"
                onPress={() => navigateToDetail("test", "Personality Test", require("../assets/images/testt.jpg"))}
              />
              <Card 
                image={require("../assets/images/stress.jpg")}
                title="Stress Level"
                subtitle="3 min"
                onPress={() => navigateToDetail("test", "Stress Level", require("../assets/images/stress.jpg"))}
              />
            </Animated.View>
          </ScrollView>
        </View>

        {/* Music Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music for Meditation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ 
              flexDirection: "row",
              transform: [{ translateX }]
            }}>
              <Card 
                image={require("../assets/images/paceful.jpeg")}
                title="Nature Sounds"
                subtitle="Peaceful"
                onPress={() => navigateToDetail("music", "Nature Sounds", require("../assets/images/paceful.jpeg"))}
              />
              <Card 
                image={require("../assets/images/mu.jpeg")}
                title="Lo-Fi Beats"
                subtitle="Focus"
                onPress={() => navigateToDetail("music", "Lo-Fi Beats", require("../assets/images/mu.jpeg"))}
              />
              <Card 
                image={require("../assets/images/mindset.jpeg")}
                title="Meditation"
                subtitle="Mindful"
                onPress={() => navigateToDetail("music", "Meditation", require("../assets/images/mindset.jpeg"))}
              />
              <Card 
                image={require("../assets/images/classique.jpg")}
                title="Classical"
                subtitle="Relaxing"
                onPress={() => navigateToDetail("music", "Classical", require("../assets/images/classique.jpg"))}
              />
              <Card 
                image={require("../assets/images/sp.jpeg")}
                title="Chillout"
                subtitle="Calm"
                onPress={() => navigateToDetail("music", "Chillout", require("../assets/images/sp.jpeg"))}
              />
            </Animated.View>
          </ScrollView>
        </View>

        {/* Quotes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ 
              flexDirection: "row",
              transform: [{ translateX }]
            }}>
              <Card 
                image={require("../assets/images/q.jpeg")}
                title="Mindfulness"
                subtitle="Quote"
                size="small"
                onPress={() => navigateToDetail("quote", "Mindfulness", require("../assets/images/q.jpeg"))}
              />
              <Card 
                image={require("../assets/images/Quotes.jpg")}
                title="Motivation"
                subtitle="Quote"
                size="small"
                onPress={() => navigateToDetail("quote", "Motivation", require("../assets/images/Quotes.jpg"))}
              />
              <Card 
                image={require("../assets/images/aesthetic quotes.jpg")}
                title="Positivity"
                subtitle="Quote"
                size="small"
                onPress={() => navigateToDetail("quote", "Positivity", require("../assets/images/aesthetic quotes.jpg"))}
              />
            </Animated.View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#FFFFFF", 
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: 30,
  },
  dateText: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2f4f4f",
    marginBottom: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  welcomeSubtitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2f4f4f",
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  featuredSection: {
    marginBottom: 30,
  },
  featuredCard: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: 16,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  tagContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  miniTagContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  miniTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  mediumCard: {
    width: width * 0.4,
    height: 180,
  },
  smallCard: {
    width: width * 0.35,
    height: 150,
  },
  largeCard: {
    width: width * 0.6,
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
