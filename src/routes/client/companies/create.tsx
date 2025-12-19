import { createFileRoute, useNavigate } from '@tanstack/react-router'
import CreateHeader from '../../../component/headers/CreateHeader'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Home, Camera } from 'lucide-react'
import { server } from '../../../lib/api'
import { queryKeys } from '../../../lib/query-keys'

export const Route = createFileRoute('/client/companies/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setImage(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; image?: string }) => {
      const { data: response, error } = await server.api.company.post(data);
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company.companies });
      navigate({ to: '/client/companies' });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCreate = () => {
    setError(null);

    // Validate name
    if (!name || name.trim().length === 0) {
      setError('Nama perusahaan tidak boleh kosong');
      return;
    }

    // Create company with optional image
    const createData: { name: string; image?: string } = { name: name.trim() };
    if (image && image.trim().length > 0) {
      createData.image = image;
    }
    
    createMutation.mutate(createData);
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <CreateHeader
        title="Buat Perusahaan" 
        createHandle={handleCreate} 
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-black mb-3">
            Gambar
          </label>
          <div className="relative">
            <div 
              onClick={handleImageClick}
              className="w-[100px] h-[100px] rounded-[25px] overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative group"
            >
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Home className="w-12 h-12 text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-3">
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            className={`w-full max-w-md px-3 py-2 border focus:outline-none text-sm ${
              error && (!name || name.trim().length === 0)
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-gray-900'
            }`}
          />
          {error && (!name || name.trim().length === 0) && (
            <p className="mt-1 text-xs text-red-600">Nama wajib diisi</p>
          )}
        </div>
      </div>

    </div>
  )
}
