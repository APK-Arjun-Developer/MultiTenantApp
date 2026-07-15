import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import { ICON_PATHS } from './Icon.paths';

export type IconName = keyof typeof ICON_PATHS;

export type IconProps = { name: IconName } & Omit<SvgIconProps, 'children'>;

export function Icon({ name, ...props }: IconProps) {
  const paths = ICON_PATHS[name];
  return (
    <SvgIcon {...props}>
      {typeof paths === 'string' ? <path d={paths} /> : paths.map((d, i) => <path key={i} d={d} />)}
    </SvgIcon>
  );
}
