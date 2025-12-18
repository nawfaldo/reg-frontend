import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/api'
import { User, Camera } from 'lucide-react'
import EditHeader from '../../../component/headers/EditHeader'

export const Route = createFileRoute('/client/profile/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch(`https://reg-backend-psi.vercel.app/api/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      return data;
    },
  })

  useEffect(() => {
    if (userData?.user && !isInitialized) {
      setName(userData.user.name || '')
      setImage(userData.user.image || '')
      setIsInitialized(true)
    }
  }, [userData, isInitialized])

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

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; image?: string }) => {
      const { data: response, error } = await api.api.me.put(data)
      if (error) throw error
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate({ to: '/client/profile' })
    },
  })

  const handleSave = () => {
    const updateData: { name?: string; image?: string } = {}
    
    if (name !== userData?.user?.name) {
      updateData.name = name
    }
    
    if (image !== userData?.user?.image) {
      updateData.image = image
    }

    if (Object.keys(updateData).length > 0) {
      updateMutation.mutate(updateData)
    } else {
      navigate({ to: '/client/profile' })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 h-full bg-white">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData?.user) {
    return (
      <div className="p-6 h-full bg-white">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    )
  }


  return (
    <div className="px-6 pt-1 h-full bg-white">
      <EditHeader
        title="Ubah Profil" 
        saveHandle={handleSave} 
      />
      
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
                <User className="w-12 h-12 text-gray-400" />
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
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
