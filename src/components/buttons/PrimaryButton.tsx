interface PrimaryButtonProps {
  title: string;
  handle: () => void;
  disabled?: boolean;
}

const PrimaryButton = ({ title, handle, disabled = false }: PrimaryButtonProps) => {
  return (
    <button
    onClick={handle}
    disabled={disabled}
    className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {title}
  </button>
  );
};

export default PrimaryButton;