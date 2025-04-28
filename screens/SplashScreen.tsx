import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/1.png')} 
        style={styles.headerLogo}
        resizeMode="contain"
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
    width: 200,
    height: 200,
  },
});
