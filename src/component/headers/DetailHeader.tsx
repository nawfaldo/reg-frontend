import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../buttons/PrimaryButton';

interface DetailHeaderProps {
  title: string;
  handleDelete?: () => void;
  handleEdit?: () => void;
}

const DetailHeader = ({ title, handleDelete, handleEdit }: DetailHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '..' });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-black hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-black">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {handleEdit && (
            <div className="flex items-center gap-3">
              <PrimaryButton handle={handleEdit} title="Ubah"/>
            </div>
          )}
          {handleDelete && (
            <div className="flex items-center gap-3">
              <PrimaryButton handle={handleDelete} title="Hapus"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailHeader;