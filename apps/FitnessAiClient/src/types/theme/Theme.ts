export type Theme = {
  palette: {
    primary: {
      main: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    error: {
      main: string;
    };
    divider: string;
    action: {
      hover: string;
      selected: string;
    };
  };
  shape: {
    borderRadius: number;
  };
  typography: {
    fontFamily: string;
  };
};
