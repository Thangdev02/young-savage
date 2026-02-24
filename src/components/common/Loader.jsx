export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-2 border-savage-gray-700 border-t-savage-red rounded-full animate-spin`} />
      {text && <p className="text-savage-gray-400 font-mono text-xs tracking-widest uppercase">{text}</p>}
    </div>
  )
}