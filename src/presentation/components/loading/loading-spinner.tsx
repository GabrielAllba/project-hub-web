export const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex-1 flex items-center justify-center bg-gray-50/30">
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
      </div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
    </div>
  </div>
)
