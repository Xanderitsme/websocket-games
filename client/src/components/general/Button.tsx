interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const Button = ({ children, ...props }: Props) => {
  return (
    <button
      className="px-3 py-2 rounded w-fit
        bg-secondary-600 text-secondary-50
        hover:bg-secondary-700 hover:text-white
        transition-colors"
      {...props}
    >
      {children}
    </button>
  )
}
