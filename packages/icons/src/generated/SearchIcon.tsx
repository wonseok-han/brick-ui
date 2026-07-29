import type { IconProps } from "../types";
export const SearchIcon = ({
  size = 24,
  ...props
}: IconProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} {...props}><circle cx={11} cy={11} r={6.5} stroke="currentColor" strokeWidth={2} /><path stroke="currentColor" strokeLinecap="round" strokeWidth={2} d="m16 16 4.5 4.5" /></svg>;