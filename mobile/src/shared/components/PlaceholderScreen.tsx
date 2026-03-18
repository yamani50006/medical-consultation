import { RouteProp, useRoute } from "@react-navigation/native";
import { Text } from "react-native";

import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Params = { title: string; description: string };

export function PlaceholderScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { theme } = useAppTheme();

  return (
    <Screen>
      <Badge label="Scaffold Ready" />
      <Card>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 24 }}>{route.params?.title}</Text>
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", lineHeight: 24 }}>{route.params?.description}</Text>
      </Card>
    </Screen>
  );
}

