import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type LoadingIndicatorProps = {
  label: string;
};

export const LoadingIndicator = ({ label }: LoadingIndicatorProps) => (
  <Stack
    component="main"
    aria-live="polite"
    sx={{
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    }}
  >
    <CircularProgress color="primary" aria-hidden="true" />
    <Typography component="p" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);
