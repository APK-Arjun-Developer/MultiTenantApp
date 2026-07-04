import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectSelectedTenantId,
  selectSelectedTenantName,
  setSelectedTenant,
  clearSelectedTenant,
} from '@/features/ui/uiSlice';
import { apiSlice } from '@/shared/api/apiSlice';
import { useGetTenantsQuery } from '@/features/tenants/api/tenantsApi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material/Select';

const PLATFORM_VALUE = '__platform__';

export function TenantPicker() {
  const dispatch = useAppDispatch();
  const selectedTenantId = useAppSelector(selectSelectedTenantId);
  const selectedTenantName = useAppSelector(selectSelectedTenantName);
  const { data, isLoading } = useGetTenantsQuery();

  const tenants = data?.items ?? [];

  const handleChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value === PLATFORM_VALUE) {
      dispatch(clearSelectedTenant());
      dispatch(apiSlice.util.resetApiState());
    } else {
      const tenant = tenants.find((t) => t.id === value);
      if (tenant) {
        dispatch(setSelectedTenant({ id: tenant.id, name: tenant.name }));
        dispatch(apiSlice.util.resetApiState());
      }
    }
  };

  if (isLoading) {
    return <CircularProgress size={18} sx={{ mx: 1 }} />;
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <Select
        value={selectedTenantId ?? PLATFORM_VALUE}
        onChange={handleChange}
        displayEmpty
        sx={{
          fontSize: 14,
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          bgcolor: 'background.default',
        }}
        renderValue={(value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value === PLATFORM_VALUE ? 'Platform view' : (selectedTenantName ?? value)}
            </Typography>
          </Box>
        )}
      >
        <MenuItem value={PLATFORM_VALUE}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Platform view (all tenants)
          </Typography>
        </MenuItem>
        {tenants.map((tenant) => (
          <MenuItem key={tenant.id} value={tenant.id}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {tenant.name}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
