interface PrimaryButtonProps {
  title: string;
  handle: () => void;
}

const PrimaryButton = ({ title, handle }: PrimaryButtonProps) => {
  return (
    <button
    onClick={handle}
    className="w-[90px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all"
  >
    {title}
  </button>
  );
};

export default PrimaryButton;