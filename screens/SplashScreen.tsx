import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/1.png')} // Replace with your logo path
        style={styles.headerLogo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 200,  // Set your desired width
    height: 200, // Set your desired height
  },
});
