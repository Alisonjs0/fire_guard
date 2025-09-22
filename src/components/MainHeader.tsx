import { motion } from "framer-motion";

interface MainHeaderProps {
  icon?: React.ReactNode;
  textHeader?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonIcon?: React.ReactNode;
  showButton?: boolean;
  showSecondButton?: boolean;
  secondButtonText?: string;
  onSecondButtonClick?: () => void;
  secondButtonIcon?: React.ReactNode;
  badgeValue?: number;
  badgeClassName?: string;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  icon,
  textHeader,
  subtitle,
  buttonText,
  onButtonClick,
  buttonIcon,
  showButton = false,
  showSecondButton = false,
  secondButtonText,
  onSecondButtonClick,
  secondButtonIcon,
  badgeValue,
  badgeClassName = "h-6 w-6 flex items-center justify-center bg-red-500 text-white text-sm font-bold rounded-full mt-1",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {icon}
            {textHeader}
            {typeof badgeValue === "number" && badgeValue > 0 && (
              <span className={`ml-2 ${badgeClassName}`}>{badgeValue}</span>
            )}
          </h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          {showSecondButton && (
            <button
              onClick={onSecondButtonClick}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {secondButtonIcon}
              {secondButtonText}
            </button>
          )}
          {showButton && (
            <button
              onClick={onButtonClick}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {buttonIcon}
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MainHeader;
