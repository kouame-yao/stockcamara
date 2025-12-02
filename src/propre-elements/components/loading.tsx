export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-700 font-medium">Chargement en cours...</p>
      </div>
    </div>
  );
}
