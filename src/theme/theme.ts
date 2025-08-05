import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3', // より明るい青
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#03a9f4', // ライトブルー
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f9ff', // 薄い青の背景
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e', // 濃い青のテキスト
      secondary: '#3949ab',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      color: '#1a237e', // タイトルも青系に
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: '#f5f9ff',
        },
        '& .MuiCard-root': {
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e3f2fd',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.25)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1976d2 30%, #00bcd4 90%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2196f3',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2196f3',
            },
          },
        },
      },
    },
  },
});

export default theme;