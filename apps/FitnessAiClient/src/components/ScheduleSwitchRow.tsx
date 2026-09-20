import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type ScheduleSwitchRowProps = {
  label: string;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  disabled?: boolean;
};

const ScheduleSwitchRow: React.FC<ScheduleSwitchRowProps> = ({
  label,
  isActive,
  onToggle,
  disabled = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.label,
          {
            color: disabled
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
          },
        ]}
      >
        {label}
      </Text>
      <Switch
        value={isActive}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{
          false: theme.palette.divider,
          true: theme.palette.primary.main,
        }}
        thumbColor={theme.palette.background.paper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 16, flexShrink: 1, paddingRight: 12 },
});

export default ScheduleSwitchRow;
