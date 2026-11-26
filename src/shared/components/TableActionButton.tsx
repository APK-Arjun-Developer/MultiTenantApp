import type { ComponentProps } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Icon, { type IconName } from './Icon';

interface TableActionButtonProps {
  label: string;
  icon: IconName;
  color?: ComponentProps<typeof IconButton>['color'];
  onClick: () => void;
}

const TableActionButton = ({ label, icon, color, onClick }: TableActionButtonProps) => (
  <Tooltip title={label}>
    <IconButton size="small" color={color} onClick={onClick}>
      <Icon name={icon} fontSize="small" />
    </IconButton>
  </Tooltip>
);

export { TableActionButton };
