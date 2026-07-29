import type { IconProps } from "../types";
export const InfoIcon = ({
  size = 24,
  ...props
}: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} {...props}><circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={2} /><path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="M12 11v6" /><circle cx={12} cy={7.5} r={1.25} fill="currentColor" /></svg>;