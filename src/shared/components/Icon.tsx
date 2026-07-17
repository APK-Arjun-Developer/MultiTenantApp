import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

import { ICON_PATHS } from './Icon.paths';

type IconName = keyof typeof ICON_PATHS;

type IconProps = { name: IconName } & Omit<SvgIconProps, 'children'>;

const Icon = ({ name, ...props }: IconProps) => {
  const paths = ICON_PATHS[name];
  return (
    <SvgIcon {...props}>
      {typeof paths === 'string' ? <path d={paths} /> : paths.map((d, i) => <path key={i} d={d} />)}
    </SvgIcon>
  );
};
export default Icon;

export { type IconName, type IconProps };
