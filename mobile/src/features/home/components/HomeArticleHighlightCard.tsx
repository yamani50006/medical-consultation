import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { PostEntity } from "@/domain/entities/Post";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation, listLayoutAnimation } from "@/shared/animations/presets";

export function HomeArticleHighlightCard({
  post,
  onPress
}: {
  post: PostEntity;
  onPress?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);

  const content = (
    <PatientSurface style={expanded ? styles.cardExpanded : styles.card}>
      {post.coverImageUrl ? (
        <ImageBackground
          source={{ uri: post.coverImageUrl }}
          style={styles.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <>
          <LinearGradient
            colors={["#C8E3D8", "#7FA19D", "#223236"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.absoluteFill}
          />
          <View style={styles.backgroundOrb} />
          <View style={styles.backgroundStripe} />
        </>
      )}
      <LinearGradient
        colors={["rgba(4,10,20,0.08)", "rgba(4,10,20,0.84)"]}
        style={styles.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>نصيحة طبية</Text>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {post.title}
        </Text>

        <Text numberOfLines={expanded ? undefined : 2} style={styles.description}>
          {post.content}
        </Text>

        <Pressable onPress={() => setExpanded((current) => !current)} style={styles.expandButton}>
          <Text style={styles.expandLabel}>{expanded ? "عرض أقل" : "عرض المزيد"}</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9AF5E5"
          />
        </Pressable>
      </View>
    </PatientSurface>
  );

  return (
    <Animated.View entering={entranceAnimation} layout={listLayoutAnimation}>
      {onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}
    </Animated.View>
  );
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    card: {
      minHeight: 196,
      overflow: "hidden",
      padding: 0
    },
    cardExpanded: {
      overflow: "hidden",
      padding: 0,
      minHeight: 248
    },
    absoluteFill: {
      position: "absolute",
      inset: 0
    },
    backgroundOrb: {
      position: "absolute",
      right: -12,
      top: -26,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.08)"
    },
    backgroundStripe: {
      position: "absolute",
      right: 56,
      top: -12,
      width: 10,
      height: 200,
      borderRadius: 999,
      transform: [{ rotate: "22deg" }],
      backgroundColor: "rgba(255,255,255,0.25)"
    },
    content: {
      flex: 1,
      justifyContent: "flex-end",
      padding: 18,
      gap: 10
    },
    badge: {
      alignSelf: "flex-end",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: `${patientPalette.primary}2E`,
      borderWidth: 1,
      borderColor: `${patientPalette.primary}47`
    },
    badgeLabel: {
      color: "#D8FFFB",
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    title: {
      color: "#FFFFFF",
      fontFamily: "Cairo_700Bold",
      fontSize: 28,
      lineHeight: 38,
      textAlign: "right"
    },
    description: {
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Cairo_500Medium",
      lineHeight: 22,
      textAlign: "right"
    },
    expandButton: {
      alignSelf: "flex-start",
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      paddingVertical: 2
    },
    expandLabel: {
      color: "#9AF5E5",
      fontFamily: "Cairo_700Bold",
      fontSize: 15
    }
  });
}
