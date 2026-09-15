/**
 * Pill — small chip-style label + value pair used in the My Team top bar.
 * E.g. "Value £98.4m", "ITB £1.6m".
 */
import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

const EMPHASIS_CLASS = {
  default: "border-border bg-surface-raised",
  positive: "border-accent-muted bg-accent-primary/10",
  warning: "border-status-warning/30 bg-status-warning/10",
  danger: "border-status-danger/30 bg-status-danger/10",
};

const VALUE_CLASS = {
  default: "text-text-primary",
  positive: "text-accent-primary",
  warning: "text-status-warning",
  danger: "text-status-danger",
};

export const Pill = ({
  label,
  value,
  emphasis = "default"
}) => {
  return <View className={`rounded-xl px-3 py-2 border min-w-[70px] gap-0.5 ${EMPHASIS_CLASS[emphasis]}`}>
      <Text className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</Text>
      <Text className={`text-sm font-bold ${VALUE_CLASS[emphasis]}`}>{value}</Text>
    </View>;
};
