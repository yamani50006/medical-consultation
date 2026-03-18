import { FadeInDown, FadeInRight, FadeOut, LinearTransition } from "react-native-reanimated";

export const entranceAnimation = FadeInDown.springify().damping(18);
export const sideEntranceAnimation = FadeInRight.springify().damping(18);
export const exitAnimation = FadeOut.duration(180);
export const listLayoutAnimation = LinearTransition.springify().damping(16);

