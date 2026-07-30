export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
