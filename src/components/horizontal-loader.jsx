import { LazyMotion, domAnimation, m } from "framer-motion";

const HorizontalLoader = ({
  progress = 75,
  className = "",
}) => {
  return (
    <LazyMotion features={domAnimation}>
    <div
      className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}
    >
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-[15px] overflow-hidden mb-4">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-[15px]"
          />
        </div>

      </m.div>
    </div>
    </LazyMotion>
  );
};

export default HorizontalLoader;
