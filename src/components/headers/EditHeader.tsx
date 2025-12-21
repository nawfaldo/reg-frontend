import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../buttons/PrimaryButton';
import Skeleton from '../Skeleton';

interface EditHeaderProps {
  title: string;
  userName?: string;
  saveHandle: () => void;
  isPending?: boolean;
  isLoadingUserName?: boolean;
}

const EditHeader = ({ title, userName, saveHandle, isPending = false, isLoadingUserName = false }: EditHeaderProps) => {
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
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <span>{title}:</span>
            {isLoadingUserName ? (
              <Skeleton width={150} height={32} />
            ) : userName ? (
              <span>{userName}</span>
            ) : null}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <PrimaryButton handle={saveHandle} title={isPending ? "Menyimpan..." : "Simpan"} disabled={isPending} />
        </div>
      </div>
    </div>
  );
};

export default EditHeader;