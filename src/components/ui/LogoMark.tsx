import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  color?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 24,
  className = '',
  color = '#5CC8BE',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mountain Ridge Line */}
      <path
        d="M4 22L12 9L18 17L22 11L28 22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* River Water Line */}
      <path
        d="M5 26C8 24 11 27 15 25C19 23 22 26 27 24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
