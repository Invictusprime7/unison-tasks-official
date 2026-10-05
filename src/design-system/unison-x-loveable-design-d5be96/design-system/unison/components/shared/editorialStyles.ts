import type { CSSProperties } from 'react';
import type { ThemeTokens } from '../../types';
import { hsl } from '../../themeUtils';

export const editorialCardStyle = (theme: ThemeTokens): CSSProperties => ({
  border: `1px solid ${hsl(theme.colors.border)}`,
  borderRadius: theme.radius,
  background: hsl(theme.colors.card),
  color: hsl(theme.colors.cardForeground),
});
