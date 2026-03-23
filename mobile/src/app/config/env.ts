import Constants from "expo-constants";
import { Platform } from "react-native";

const fallbackApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:5001/api/v1" : "http://localhost:5001/api/v1";

function normalizeApiUrl(value?: string | null) {
  if (!value) {
    return fallbackApiUrl;
  }

  if (Platform.OS === "android") {
    return value.replace("://localhost", "://10.0.2.2").replace("://127.0.0.1", "://10.0.2.2");
  }

  return value;
}

export const env = {
  apiUrl: normalizeApiUrl(
    process.env.EXPO_PUBLIC_API_URL ??
      Constants.expoConfig?.extra?.apiUrl ??
      fallbackApiUrl
  )
};
