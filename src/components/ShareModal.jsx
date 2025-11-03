import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Twitter, Facebook, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { BsWhatsapp } from 'react-icons/bs';

const ShareModal = ({ isOpen, onClose, postId, postTitle, postDescription }) => {
  const [postUrl, setPostUrl] = useState('');

  useEffect(() => {
    if (isOpen && postId) {
      const url = `${window.location.origin}/post/${postId}`;
      setPostUrl(url);
    }
  }, [isOpen, postId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link.'));
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${postTitle || 'Check out this post!'}: ${postDescription || ''}`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
  };

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(`${postTitle || 'Check out this post!'}: ${postDescription || ''} ${postUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this post: ${postTitle || ''}`);
    const body = encodeURIComponent(`${postDescription || ''}\n\nRead more here: ${postUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-[10px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl  text-gray-900 dark:text-white">Share Post</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
              
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={postUrl}
                    readOnly
                    className="flex-1 h-12 rounded-[10px]"
                  />
                  <Button onClick={handleCopyLink} className="h-12 rounded-[10px] w-12">
                    <Link className="w-4 h-4 icon " />
                    {/* Copy */}
                  </Button>
                </div>
              </div>

              <div>
              
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={shareOnTwitter} className="h-12 rounded-[10px] flex items-center justify-center gap-2">
                    <Twitter className="w-5 h-5 icon text-blue-400" />
                    Twitter
                  </Button>
                  <Button variant="outline" onClick={shareOnFacebook} className="h-12 rounded-[10px] flex items-center justify-center gap-2">
                    <Facebook className="w-5 h-5 icon text-blue-600" />
                    Facebook
                  </Button>
                  <Button variant="outline" onClick={shareOnWhatsapp} className="h-12 rounded-[10px] flex items-center justify-center gap-2">
                    <BsWhatsapp className="w-5 h-5 icon text-green-500" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={shareViaEmail} className="h-12 rounded-[10px] flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5 icon text-gray-500" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;


