import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import PrimaryButton from '../buttons/PrimaryButton';
import Skeleton from '../Skeleton';

interface DetailHeaderProps {
  title: string;
  userName?: string;
  handleDelete?: () => void;
  handleEdit?: () => void;
  isLoading?: boolean;
  isLoadingUserName?: boolean;
}

const DetailHeader = ({ title, userName, handleDelete, handleEdit, isLoading = false, isLoadingUserName = false }: DetailHeaderProps) => {
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
          {isLoading ? (
            <>
              <Skeleton width={90} height={36} borderRadius={4} />
              <Skeleton width={90} height={36} borderRadius={4} />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailHeader;