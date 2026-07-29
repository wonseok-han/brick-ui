import type { IconProps } from "../types";
export const CloseIcon = ({
  size = 24,
  ...props
}: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} {...props}><path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="m6 6 12 12m0-12L6 18" /></svg>;