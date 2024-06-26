import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";

export function LoadingShade({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }
  return null;
}