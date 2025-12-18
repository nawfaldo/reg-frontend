import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../buttons/PrimaryButton';

interface EditHeaderProps {
  title: string;
  saveHandle: () => void;
}

const EditHeader = ({ title, saveHandle }: EditHeaderProps) => {
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
          <PrimaryButton handle={saveHandle} title="Simpan"/>
        </div>
      </div>
    </div>
  );
};

export default EditHeader;