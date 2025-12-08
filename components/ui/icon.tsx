import { Icon as IconifyIcon, IconProps } from "@iconify/react";

export default function Icon({ icon, ...rest }: IconProps) {
  return <IconifyIcon icon={icon} {...rest} />;
}
