import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

type JsonValue = Record<string, unknown>;

export const secureStorage = {
  async setSecureItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  },
  async getSecureItem(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async deleteSecureItem(key: string) {
    await SecureStore.deleteItemAsync(key);
  },
  async setJson(key: string, value: JsonValue) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async getJson<T extends JsonValue>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
};

