import { useState } from 'react';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { FieldConfig } from 'mui-schema-form-builder';
import { Box, Typography } from '@mui/material';

export const PASSWORD_FIELD = 'password';

interface Props {
  fieldConfig: FieldConfig;
  control: Control;
}

export function PasswordField({ fieldConfig, control }: Props) {
  const [show, setShow] = useState(false);

  const { field, fieldState } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.defaultValue ?? '',
  });

  return (
    <>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
        {fieldConfig.label ?? 'Password'}
        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
          *
        </Box>
      </Typography>
      <TextField
        {...field}
        type={show ? 'text' : 'password'}
        fullWidth={fieldConfig.fullWidth ?? true}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        placeholder={fieldConfig.placeholder}
        size={fieldConfig.size}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        autoComplete={String(fieldConfig.muiProps?.autoComplete ?? 'current-password')}
        autoFocus={Boolean(fieldConfig.muiProps?.autoFocus)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  edge="end"
                  tabIndex={-1}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
}
