import type { IconProps } from "../types";
export const ExternalLinkIcon = ({
  size = 24,
  ...props
}: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4h6v6" /><path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="m20 4-9 9" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;