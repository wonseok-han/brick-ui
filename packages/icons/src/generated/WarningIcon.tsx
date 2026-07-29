import type { IconProps } from "../types";
export const WarningIcon = ({
  size = 24,
  ...props
}: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} {...props}><path stroke="currentColor" strokeLinejoin="round" strokeWidth={2} d="M12 3.5 21.5 20h-19z" /><path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M12 10v4" /><circle cx={12} cy={17} r={1.1} fill="currentColor" /></svg>;