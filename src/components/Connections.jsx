import { motion, AnimatePresence } from "framer-motion";
import { PiGithubLogo, PiInstagramLogo, PiLinkedinLogo } from "react-icons/pi";
import { Button } from "./ui/button";

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

    const connectGithub = async () => {
 const encryptedToken = localStorage.getItem('authToken'); // or wherever you store it

window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&scope=repo user&state=${encodeURIComponent(encryptedToken)}`;
};
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
            className="rounded-2xl p-8 bg-white dark:bg-gray-800 border border-gray-700 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-2 text-center">
              Connect Your Accounts
            </h2>

            <p className="text-gray-400 text-sm mb-6 text-center">
              GitHub connection is required to continue.
            </p>

            {/* GitHub */}
            <div className="flex gap-3 items-center justify-center">
              <button
                onClick={connectGithub}
                className="w-20 h-20 rounded-full flex items-center cursor-pointer justify-center px-6 gap-4 bg-black text-white font-semibold hover:opacity-90 transition-all"
              >
                <PiGithubLogo size={30} />
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => (window.location.href = "/api/auth/linkedin")}
                className="w-20  h-20 rounded-full flex items-center cursor-pointer justify-center px-6 gap-4 bg-[#0A66C2] font-semibold text-white hover:opacity-90 transition-all"
              >
                <PiLinkedinLogo size={30} />
              </button>

              {/* Instagram */}
              <button
                onClick={() => (window.location.href = "/api/auth/instagram")}
                className="w-20 h-20 rounded-full flex items-center cursor-pointer justify-center px-6 gap-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all"
              >
                <PiInstagramLogo size={30} />
              </button>
            </div>
            <Button className={"w-full mt-5"} onClick={onClose}>
              May Be Later!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Connections;
