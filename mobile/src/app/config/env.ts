import Constants from "expo-constants";
import { Platform } from "react-native";

const fallbackApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:4000/api/v1" : "http://localhost:5001/api/v1";

export const env = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    Constants.expoConfig?.extra?.apiUrl ??
    fallbackApiUrl
};

