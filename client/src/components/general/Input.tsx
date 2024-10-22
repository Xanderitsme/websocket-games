export const Input = ({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className="outline-none rounded px-3 py-2 border
        bg-zinc-800 text-zinc-300 border-zinc-700
        focus:text-secondary-100 hover:border-secondary-800 focus:border-zinc-400"
      {...props}
    />
  )
}
