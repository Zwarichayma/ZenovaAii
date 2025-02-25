import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useRef } from "react";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const translateX = useRef(new Animated.Value(100)).current;
  Animated.timing(translateX, {
    toValue: 0,
    duration: 500,
    useNativeDriver: true,
  }).start();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
  const renderCard = (imageSource: any) => (
    <TouchableOpacity style={styles.card1}>
      <Image source={imageSource} style={styles.cardImage1} />
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/images/33.png")} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.dateText}>{currentDate}</Text>
                    <Text style={styles.moodTitle}>Start Your Mindfulness Journey</Text>
    
                    <View style={styles.section}>

<ScrollView>
    <View style={styles.categoriesGrid}>
        <TouchableOpacity  style={styles.categoryCard}>
          <Image source={require("../assets/images/yooga.jpg")} style={styles.categoryImage} />
          <View style={styles.categoryOverlay}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Exercise full</Text>
            </View>
            <Text style={styles.categoryTitle}>body yoga</Text>
            <Text style={styles.categoryPhotos}></Text>
          </View>
        </TouchableOpacity>
    </View>
    </ScrollView>
    </View>
    <View style={styles.section}>
    <ScrollView>
    <View style={styles.categoriesGrid}>
        <TouchableOpacity  style={styles.categoryCard}>
          <Image source={require("../assets/images/rain.jpg")} style={styles.categoryImage} />
          <View style={styles.categoryOverlay}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>listening </Text>
              </View>
              <Text style={styles.categoryTitle}>sound of the rain</Text>
            </View>
            
        </TouchableOpacity>
    </View>
    </ScrollView>

    </View>
    <View style={styles.section}>
    <ScrollView>
    <View style={styles.categoriesGrid}>
        <TouchableOpacity  style={styles.categoryCard}>
          <Image source={require("../assets/images/amb.jpg")} style={styles.categoryImage} />
          <View style={styles.categoryOverlay}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Relaxation </Text>
              </View>
              <Text style={styles.categoryTitle}>sound of the Music</Text>
            </View>
            
        </TouchableOpacity>
    </View>
    </ScrollView>

    </View>
        <View style={styles.section}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  </ScrollView>
</View>
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Test</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <Animated.View style={{ flexDirection: "row" }}>
      {[
        { image: require("../assets/images/testint.jpg"), text: "Anxiety Test" },
        { image: require("../assets/images/ttt.jpg"), text: "Social divide" },
        { image: require("../assets/images/testt.jpg"), text: " Test of Personality" },
        { image: require("../assets/images/stress.jpg"), text: "Test" },
      ].map((item, index) => (
        <View key={index} >
          {renderCard(item.image)}
          <View style={styles.categoryOverlay}>
            <Text style={styles.ratingText}>{item.text}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  </ScrollView>
</View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Music</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <Animated.View style={{ flexDirection: "row" }}>
      {[
        { image: require("../assets/images/paceful.jpeg"), text: "Nature Sounds" },
        { image: require("../assets/images/mu.jpeg"), text: "Lo-Fi " },
        { image: require("../assets/images/mindset.jpeg"), text: " Meditation" },
        { image: require("../assets/images/classique.jpg"), text: "Classical Relaxing" },
        { image: require("../assets/images/sp.jpeg"), text: "Chillout " },
        { image: require("../assets/images/ambient.jpg"), text: "Ambient " },

      ].map((item, index) => (
        <View key={index} >
          {renderCard(item.image)}
          <View style={styles.categoryOverlay}>
            <Text style={styles.ratingText}>{item.text}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  </ScrollView>
        </View>

        <View style={styles.section}>
                          <Text style={styles.sectionTitle}> Quotes</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Animated.View style={{ flexDirection: "row" }}>
                      {[
                        { image: require("../assets/images/q.jpeg")},
                        { image: require("../assets/images/Quotes.jpg")},
                        { image: require("../assets/images/aesthetic quotes.jpg")},
                        
                      ].map((item, index) => (
                        <View key={index} >
                          {renderCard(item.image)}
                          
                        </View>
                      ))}
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
    paddingHorizontal: 0, 
    paddingVertical: 17, 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: width * 0.05,
    paddingTop: 10,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerLogo: {
    width: width * 0.13,
    height: height * 0.031,
    resizeMode: "contain",
  },
  categoryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 1,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryCard: {
    width: "100%",
    aspectRatio: 5,
    marginBottom:70,
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryImage: {
    width: 500,
    height:140,
  },
  categoryPhotos: {
    color: "#fff",
    fontSize: 1,
  },
  content: {
    flexGrow: 1,
    padding: width * 0.04,
    paddingTop: height * 0.06 ,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: height * 0.019,
    fontWeight: "500",
    marginBottom: height * 0.02,
  },
  card1: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,  
    width: width * 0.4,
    marginRight: width * 0.04,
    alignItems: "center",
  },
  cardImage1: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,  
  },
  card3: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 0,
    alignItems: "center",
  },
  cardImage3: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,  
  },
  musicSection: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 10,
    fontFamily:'Fantasy',
    textAlign: 'center',
  },
  moodTitle: {
    fontSize: 38,
    fontWeight: "600",
    fontFamily:'fantasy',
    color: "#2f4f4f",
    marginBottom: 19,
    textAlign: 'center',

  },
  musicPlayer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,  
    padding: 2,
    marginBottom: 19,
    alignItems: "center",
  },
  musicThumbnail: {
    width: 170,
    height: 120,
    borderRadius: 12,  
    marginRight: 20,
  },
  playerControls: {
    flexGrow: 1,
    marginRight: 20,
    padding: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  ratingText: {
    fontSize: 22, 
    color: "#fff", 
    fontWeight: "bold",
    fontFamily:'serif',
  },
 
  masterTitle: {
    fontSize: 20,
    fontFamily:'EuphemiaUCAS-Bold',
    fontWeight: "600",
    marginBottom: 12,
  },
});
