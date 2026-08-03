import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import {
  useGetTenantConfigByAdminQuery,
  useUpdateTenantConfigByAdminMutation,
} from '@/features/tenants/api/tenantsApi';
import {
  useGetTenantConfigQuery,
  useUpdateTenantConfigMutation,
} from '@/features/tenantSettings/api/tenantSettingsApi';
import {
  selectSelectedTenantId,
  selectThemeColor,
  selectThemeMode,
  setThemeColor,
  setThemeMode,
} from '@/features/ui/uiSlice';
import { Icon, LoadingButton } from '@/shared/components';
import { useUrlTabs } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { THEME_PRESETS, type ThemeColor, type ThemeMode } from '@/shared/theme';
import type { ApiError, TenantConfigDto } from '@/types/api';

import {
  colorSwatchCheckSx,
  colorSwatchSx,
  modeCardSx,
  modeCheckIconSx,
  modeIconBoxSx,
  modeLabelSx,
  styles,
} from './SettingsPage.styles';

const SETTINGS_TABS = ['appearance', 'configuration'] as const;

const COLOR_ORDER: ThemeColor[] = ['violet', 'blue', 'green', 'rose', 'amber', 'teal'];

const MODES: { value: ThemeMode; label: string; icon: 'Brightness7' | 'Brightness4' }[] = [
  { value: 'light', label: 'Light', icon: 'Brightness7' },
  { value: 'dark', label: 'Dark', icon: 'Brightness4' },
];

// ---------------------------------------------------------------------------
// Appearance tab
// ---------------------------------------------------------------------------

const AppearanceTab = memo(() => {
  const dispatch = useAppDispatch();
  const themeColor = useAppSelector(selectThemeColor);
  const themeMode = useAppSelector(selectThemeMode);

  return (
    <Box>
      <Typography variant="h6" sx={styles.sectionTitle}>
        Appearance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={styles.sectionSubtitle}>
        Customize how the application looks on your device.
      </Typography>

      <Typography variant="subtitle2" sx={styles.subsectionLabel}>
        Color Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={styles.subsectionHint}>
        Choose an accent color for the interface.
      </Typography>

      <Box sx={styles.colorGrid}>
        {COLOR_ORDER.map((color) => {
          const preset = THEME_PRESETS[color];
          const isSelected = themeColor === color;
          return (
            <Tooltip key={color} title={preset.label} placement="top">
              <Box
                component="button"
                onClick={() => dispatch(setThemeColor(color))}
                aria-label={preset.label}
                aria-pressed={isSelected}
                sx={colorSwatchSx(preset.primary.main, isSelected)}
              >
                {isSelected && <Icon name="Check" sx={colorSwatchCheckSx} />}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Divider sx={styles.divider} />

      <Typography variant="subtitle2" sx={styles.subsectionLabel}>
        Display Mode
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={styles.subsectionHint}>
        Choose between light and dark interface.
      </Typography>

      <Box sx={styles.modeGrid}>
        {MODES.map(({ value, label, icon }) => {
          const isActive = themeMode === value;
          return (
            <Box
              key={value}
              component="button"
              onClick={() => dispatch(setThemeMode(value))}
              aria-label={`${label} mode`}
              aria-pressed={isActive}
              sx={modeCardSx(isActive)}
            >
              <Box sx={modeIconBoxSx(isActive)}>
                <Icon name={icon} />
              </Box>
              <Typography variant="body2" sx={modeLabelSx(isActive)}>
                {label}
              </Typography>
              {isActive && <Icon name="Check" sx={modeCheckIconSx} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// Config form (draft state + Save button — no per-toggle API calls)
// ---------------------------------------------------------------------------

interface ConfigDraft {
  loginEnabled: boolean;
  welcomeEmailEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const toDraft = (c: TenantConfigDto): ConfigDraft => ({
  loginEnabled: c.loginEnabled,
  welcomeEmailEnabled: c.welcomeEmailEnabled,
  maintenanceMode: c.maintenanceMode,
  maintenanceMessage: c.maintenanceMessage ?? '',
});

interface ConfigRowProps {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}

const ConfigRow = memo(({ title, description, checked, disabled, onChange }: ConfigRowProps) => (
  <Box sx={styles.configRow}>
    <Box sx={styles.configLabel}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    </Box>
    <Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
  </Box>
));

interface TenantConfigFormProps {
  config: TenantConfigDto;
  showMaintenance: boolean;
  isSaving: boolean;
  onSave: (draft: ConfigDraft) => void;
}

const TenantConfigForm = memo(
  ({ config, showMaintenance, isSaving, onSave }: TenantConfigFormProps) => {
    const [draft, setDraft] = useState<ConfigDraft>(() => toDraft(config));

    // Resync when the underlying config changes (after save refetch / tenant switch).
    useEffect(() => {
      setDraft(toDraft(config));
    }, [config]);

    const dirty = useMemo(() => {
      const base = toDraft(config);
      return (
        base.loginEnabled !== draft.loginEnabled ||
        base.welcomeEmailEnabled !== draft.welcomeEmailEnabled ||
        base.maintenanceMode !== draft.maintenanceMode ||
        base.maintenanceMessage !== draft.maintenanceMessage
      );
    }, [config, draft]);

    const patch = useCallback(
      <K extends keyof ConfigDraft>(key: K, value: ConfigDraft[K]) =>
        setDraft((d) => ({ ...d, [key]: value })),
      [],
    );

    return (
      <Box>
        <Typography variant="subtitle1" sx={styles.configSectionTitle}>
          Login &amp; Access
        </Typography>

        <ConfigRow
          title="Login enabled"
          description="Allow users to log in to this tenant. Disabling this immediately revokes all active sessions."
          checked={draft.loginEnabled}
          disabled={isSaving}
          onChange={(v) => patch('loginEnabled', v)}
        />

        <Divider sx={styles.configDivider} />
        <Typography variant="subtitle1" sx={styles.configSectionTitle}>
          Notifications
        </Typography>

        <ConfigRow
          title="Welcome email"
          description="Send a welcome email to users after they complete account setup."
          checked={draft.welcomeEmailEnabled}
          disabled={isSaving}
          onChange={(v) => patch('welcomeEmailEnabled', v)}
        />

        {showMaintenance && (
          <>
            <Divider sx={styles.configDivider} />
            <Typography variant="subtitle1" sx={styles.configSectionTitle}>
              Maintenance
            </Typography>

            <ConfigRow
              title="Maintenance mode"
              description="Shows the maintenance message to users when they try to log in."
              checked={draft.maintenanceMode}
              disabled={isSaving}
              onChange={(v) => patch('maintenanceMode', v)}
            />

            {draft.maintenanceMode && (
              <Box sx={styles.configMaintenanceMsg}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Maintenance message"
                  value={draft.maintenanceMessage}
                  disabled={isSaving}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  onChange={(e) => patch('maintenanceMessage', e.target.value)}
                  helperText="Shown to users at login when maintenance mode is on."
                />
              </Box>
            )}
          </>
        )}

        <Box sx={styles.saveRow}>
          <LoadingButton
            variant="contained"
            loading={isSaving}
            disabled={!dirty}
            onClick={() => onSave(draft)}
          >
            Save changes
          </LoadingButton>
        </Box>
      </Box>
    );
  },
);

// ---------------------------------------------------------------------------
// TenantAdmin config — own tenant, no maintenance
// ---------------------------------------------------------------------------

const TenantAdminConfig = memo(() => {
  const snackbar = useSnackbar();
  const { data: config, isLoading } = useGetTenantConfigQuery();
  const [updateConfig, { isLoading: isSaving }] = useUpdateTenantConfigMutation();

  const handleSave = useCallback(
    async (draft: ConfigDraft) => {
      try {
        await updateConfig({
          loginEnabled: draft.loginEnabled,
          welcomeEmailEnabled: draft.welcomeEmailEnabled,
        }).unwrap();
        snackbar.success('Configuration saved.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to save configuration.');
      }
    },
    [updateConfig, snackbar],
  );

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return config ? (
    <TenantConfigForm
      key={config.tenantId}
      config={config}
      showMaintenance={false}
      isSaving={isSaving}
      onSave={handleSave}
    />
  ) : null;
});

// ---------------------------------------------------------------------------
// SystemAdmin config — selected tenant, includes maintenance
// ---------------------------------------------------------------------------

const SystemAdminConfig = memo(() => {
  const snackbar = useSnackbar();
  const selectedTenantId = useAppSelector(selectSelectedTenantId);
  const { data: config, isLoading } = useGetTenantConfigByAdminQuery(selectedTenantId ?? '', {
    skip: !selectedTenantId,
  });
  const [updateConfig, { isLoading: isSaving }] = useUpdateTenantConfigByAdminMutation();

  const handleSave = useCallback(
    async (draft: ConfigDraft) => {
      if (!selectedTenantId) return;
      try {
        await updateConfig({
          tenantId: selectedTenantId,
          loginEnabled: draft.loginEnabled,
          welcomeEmailEnabled: draft.welcomeEmailEnabled,
          maintenanceMode: draft.maintenanceMode,
          maintenanceMessage: draft.maintenanceMessage || null,
        }).unwrap();
        snackbar.success('Configuration saved.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to save configuration.');
      }
    },
    [selectedTenantId, updateConfig, snackbar],
  );

  if (!selectedTenantId) {
    return (
      <Box sx={styles.configHint}>
        <Typography variant="body2" color="text.secondary">
          Select a tenant from the picker in the top bar to manage its configuration.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return config ? (
    <TenantConfigForm
      key={config.tenantId}
      config={config}
      showMaintenance
      isSaving={isSaving}
      onSave={handleSave}
    />
  ) : null;
});

const ConfigurationTab = memo(({ isSystemAdmin }: { isSystemAdmin: boolean }) => (
  <Box>
    <Typography variant="h6" sx={styles.sectionTitle}>
      Configuration
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={styles.sectionSubtitle}>
      {isSystemAdmin
        ? 'Manage login, notifications, and maintenance for the selected tenant.'
        : 'Manage login and notification behavior for your organization.'}
    </Typography>
    {isSystemAdmin ? <SystemAdminConfig /> : <TenantAdminConfig />}
  </Box>
));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const SettingsPage = memo(() => {
  const user = useAppSelector(selectCurrentUser);
  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const isAdmin = isSystemAdmin || user?.systemRole === 'TenantAdmin';

  const { tab, handleTabChange } = useUrlTabs(SETTINGS_TABS);
  // Non-admins have no Configuration tab (index 1) — clamp to Appearance.
  const activeTab = !isAdmin && tab === 1 ? 0 : tab;

  return (
    <Box sx={styles.root}>
      <Paper variant="outlined" sx={styles.tabsPaper}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={styles.tabs}>
          <Tab
            label="Appearance"
            icon={<Icon name="Palette" fontSize="small" />}
            iconPosition="start"
          />
          {isAdmin && (
            <Tab
              label="Configuration"
              icon={<Icon name="Security" fontSize="small" />}
              iconPosition="start"
            />
          )}
        </Tabs>

        <Box sx={styles.tabPanel}>
          {activeTab === 0 && <AppearanceTab />}
          {activeTab === 1 && isAdmin && <ConfigurationTab isSystemAdmin={isSystemAdmin} />}
        </Box>
      </Paper>
    </Box>
  );
});

export default SettingsPage;
