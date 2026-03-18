import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AccountTypeScreen,
  ForgotPasswordScreen,
  LoginScreen,
  OnboardingScreen,
  RegisterScreen,
  ResetPasswordScreen,
  SplashScreen,
  VerifyOtpScreen
} from "@/features/auth";
import { AuthStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
