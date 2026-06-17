import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PageTransition } from '@/shared/components/PageTransition';
import { useGetReportsSummaryQuery } from '../api/reportsApi';

export function ReportsPage() {
  const { data, isLoading, isError } = useGetReportsSummaryQuery();

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <PageTransition>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Summary metrics from the API
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && <Typography color="error">Failed to load report data.</Typography>}

      {data && !isLoading && (
        <Card>
          <CardContent>
            {Object.keys(data).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No report data available.
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {Object.entries(data).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {renderValue(value)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
