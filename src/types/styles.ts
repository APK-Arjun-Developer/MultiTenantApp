import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

type StyleSheet = Record<string, Sx>;

export type { Sx, StyleSheet };
