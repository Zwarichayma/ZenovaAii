import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { Platform } from "react-native"

export const debugGoogleConfiguration = async () => {
  console.log("🔍 === Google Sign-In Debug Information ===")

  try {
    // Platform information
    console.log("📱 Platform:", Platform.OS)
    console.log("📱 Platform Version:", Platform.Version)

    // Check if Google Sign-In is configured
    console.log("⚙️ Configuring Google Sign-In...")

    GoogleSignin.configure({
      webClientId: "306365346326-8kcdevto58mnqq81eu3audolnc62j4rq.apps.googleusercontent.com",
    })

    console.log("✅ Google Sign-In configured")

    // Check Play Services
    console.log("🔍 Checking Google Play Services...")
    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    })
    console.log("✅ Play Services available:", hasPlayServices)

    // Check if already signed in
    const isSignedIn = await GoogleSignin.isSignedIn()
    console.log("👤 Already signed in:", isSignedIn)

    if (isSignedIn) {
      try {
        const currentUser = await GoogleSignin.getCurrentUser()
        console.log("👤 Current user email:", currentUser?.user?.email)
      } catch (userError) {
        console.log("⚠️ Could not get current user:", userError)
      }
    }

    console.log("🎯 Configuration appears to be working")
    return true
  } catch (error: any) {
    console.error("❌ Configuration error:", error)
    console.error("❌ Error code:", error.code)
    console.error("❌ Error message:", error.message)

    if (error.code === 10) {
      console.error(`
🚨 DEVELOPER_ERROR (Code 10) - Configuration Issues:

Possible causes:
1. Package name mismatch between app and Google Console
2. SHA-1 fingerprint not added or incorrect
3. Wrong OAuth client type (should be Android, not Web)
4. google-services.json not updated or in wrong location
5. App not rebuilt after configuration changes

Next steps:
1. Verify package name in build.gradle matches Google Console exactly
2. Verify SHA-1 fingerprint from 'gradlew signingReport' is added to Google Console
3. Download fresh google-services.json and place in android/app/
4. Clean build: gradlew clean && react-native run-android
      `)
    }

    return false
  }
}

// Test function to try sign-in with detailed logging
export const testGoogleSignIn = async () => {
  try {
    console.log("🧪 Testing Google Sign-In...")

    // First run debug
    const configOk = await debugGoogleConfiguration()
    if (!configOk) {
      throw new Error("Configuration check failed")
    }

    // Try to sign out first
    try {
      await GoogleSignin.signOut()
      console.log("🔄 Signed out successfully")
    } catch (signOutError) {
      console.log("ℹ️ Sign out error (can be ignored):", signOutError)
    }

    // Attempt sign in
    console.log("🔐 Attempting Google Sign-In...")
    const userInfo = await GoogleSignin.signIn()

    console.log("✅ Google Sign-In successful!")
    console.log("👤 User:", userInfo.user.email)

    return userInfo
  } catch (error: any) {
    console.error("❌ Test failed:", error)
    throw error
  }
}
