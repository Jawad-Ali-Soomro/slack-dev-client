import { motion, AnimatePresence } from "framer-motion";
import { PiGithubLogo, PiGithubLogoDuotone, PiInstagramLogo, PiLinkedinLogo } from "react-icons/pi";
import { Button } from "./ui/button";
import { connectGithub } from "@/hooks/useGithubRepos";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 40,
    transition: { duration: 0.2 },
  },
};

const Connections = ({ onClose, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-8 bg-white dark:bg-gray-800 border border-gray-700 shadow-2xl max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
              Connect GitHub
            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
              Link your GitHub account to view repositories and create tasks from
              your repos.
            </p>

            <div className="flex gap-3 items-center justify-center">
              <button
                type="button"
                onClick={connectGithub}
                className="w-full h-20 rounded-[20px] gap-5 flex items-center cursor-pointer justify-center bg-black text-white font-semibold hover:opacity-90 transition-all"
                title="Connect GitHub"
              >
                <PiGithubLogoDuotone size={30} />
                Let's Connect
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full mt-5"
              onClick={onClose}
            >
              Maybe later
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Connections;
