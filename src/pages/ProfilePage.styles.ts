import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

export const styles = {
  // Page root container
  root: {
    maxWidth: 600,
  } as Sx,

  // Page header row (icon + title)
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 3,
  } as Sx,

  // Page title text
  pageTitle: {
    fontWeight: 600,
  } as Sx,

  // Avatar + identity summary row
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
  } as Sx,

  // User name text inside avatar row
  userName: {
    fontWeight: 600,
    lineHeight: 1.3,
  } as Sx,

  // System role caption
  systemRole: {
    fontWeight: 500,
  } as Sx,

  // Tabbed paper card
  tabsPaper: {
    borderRadius: 2,
  } as Sx,

  // Tabs strip
  tabs: {
    borderBottom: 1,
    borderColor: 'divider',
    px: 1,
  } as Sx,

  // Inner padding for tab panels
  tabPanel: {
    p: 3,
  } as Sx,

  // Divider inside tab panels
  divider: {
    mb: 2,
  } as Sx,

  // FormBuilder inline (no card chrome)
  inlineForm: {
    boxShadow: 'none',
    p: 0,
    bgcolor: 'transparent',
  } as Sx,

  // Company logo row (avatar + label)
  companyLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
  } as Sx,

  // Divider below company logo row
  companyDivider: {
    mb: 3,
  } as Sx,

  // Company logo label text
  companyLogoLabel: {
    fontWeight: 600,
  } as Sx,

  // Sign-out action row
  actionRow: {
    mt: 3,
    display: 'flex',
    justifyContent: 'flex-end',
  } as Sx,

  // Email LabelValue bottom margin
  emailLabelValue: {
    mb: 2,
  } as Sx,

  // Loading spinner wrapper
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 8,
  } as Sx,
} as const;
