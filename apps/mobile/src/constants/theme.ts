export const theme = {
  colors: {
    background: '#F1F1F6',
    card: '#FFFFFF',
    primary: '#7C5CFC',
    primaryDark: '#5E3DE0',
    accent: '#FF7A50',
    text: '#1E1B2E',
    muted: '#8B889C',
    border: '#ECEAF4',
    success: '#3DD598',
    danger: '#FF5A5F',
    heart: '#FF5A7A',
  },
  gradients: {
    primary: ['#8A63F8', '#6647E0'] as const,
    accent: ['#FF9466', '#FF6B4A'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
} as const;
