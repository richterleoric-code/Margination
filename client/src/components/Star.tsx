type StarProps = {
  size?: number;
  className?: string;
};

export function Star({ size = 28, className }: StarProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        d="M32 4c2.2 14 9 21 23 23-14 2.2-20.8 9-23 23-2.2-14-9-20.8-23-23C23 25 29.8 18 32 4z"
        fill="#2F9E62"
      />
      <path
        d="M32 20c1.2 7 4.6 10.4 11.6 11.6C36.6 32.8 33.2 36.2 32 43.2 30.8 36.2 27.4 32.8 20.4 31.6 27.4 30.4 30.8 27 32 20z"
        fill="#FF8FB3"
      />
    </svg>
  );
}
