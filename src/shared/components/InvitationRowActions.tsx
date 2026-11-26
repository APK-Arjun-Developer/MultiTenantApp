import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

import Icon, { type IconName } from './Icon';

interface InvitationRowActionsProps {
  inv: { isRevoked: boolean; isAccepted: boolean; isExpired: boolean };
  canResend: boolean;
  canRevoke: boolean;
  isResending: boolean;
  onResend: () => void;
  onRevoke: () => void;
  resendIcon: IconName;
  revokeIcon: IconName;
  sx: SxProps<Theme>;
}

const InvitationRowActions = ({
  inv,
  canResend,
  canRevoke,
  isResending,
  onResend,
  onRevoke,
  resendIcon,
  revokeIcon,
  sx,
}: InvitationRowActionsProps) => {
  const isPending = !inv.isRevoked && !inv.isAccepted && !inv.isExpired;
  const canRevokeRow = canRevoke && isPending;
  const canResendRow = canResend && isPending;
  if (!canRevokeRow && !canResendRow) return null;
  return (
    <Box sx={sx}>
      {canResendRow && (
        <Tooltip title="Resend invitation">
          <span>
            <IconButton
              aria-label="Resend invitation"
              size="small"
              color="info"
              disabled={isResending}
              onClick={onResend}
            >
              {isResending ? (
                <CircularProgress size={14} />
              ) : (
                <Icon name={resendIcon} fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
      {canRevokeRow && (
        <Tooltip title="Revoke invitation">
          <IconButton size="small" color="error" onClick={onRevoke}>
            <Icon name={revokeIcon} fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export { InvitationRowActions };
