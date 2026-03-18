import "react-native-gesture-handler";
import "@/shared/localization/i18n";

import { StatusBar } from "expo-status-bar";

import { AppBootstrap } from "@/app/bootstrap/AppBootstrap";

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppBootstrap />
    </>
  );
}

