interface Props {
  className?: string
}

export const GithubIcon = ({ className }: Props) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      className={className}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
      ></path>
    </svg>
  )
}
