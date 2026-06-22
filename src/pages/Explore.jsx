import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ShoppingCart,
  Eye,
  Tag,
  DollarSign,
  User,
  Grid,
  List,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  FileArchive,
} from "lucide-react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { exploreService } from "../services/exploreService";
import { useAuth } from "../contexts/AuthContext";
import { getAvatarProps } from "../utils/avatarUtils";
import { Compass } from "lucide-react";
import { IoPricetagsSharp } from "react-icons/io5";
import { PiCheck, PiCheckDuotone, PiX } from "react-icons/pi";
import HorizontalLoader from "@/components/HorizontalLoader";
import { BiCalendar, BiCategory, BiStore } from "react-icons/bi";
import { Skeleton } from "@/components/ui/skeleton";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const formatAmountForDisplay = (amountInMinorUnits, currency = "usd") => {
  if (typeof amountInMinorUnits !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInMinorUnits / 100);
};

const Explore = () => {
  document.title = "Explore - Discover Projects";

  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    tags: "",
    zipFile: null,
    previewImages: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0,
  });
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null);
  const [checkoutProject, setCheckoutProject] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(null);
  const [checkoutCurrency, setCheckoutCurrency] = useState("usd");
  const isAdmin = user?.role === "superadmin";
  const [statusTab, setStatusTab] = useState("active");
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

  const getCurrentUserId = () => user?.id || user?._id;

  const isProjectCreatedByUser = (project) => {
    if (!project || !project.createdBy) return false;
    const creatorId = project.createdBy.id || project.createdBy._id;
    const currentUserId = getCurrentUserId();
    return creatorId && currentUserId && creatorId === currentUserId;
  };

  const isSelectedProjectCreator = selectedProject
    ? isProjectCreatedByUser(selectedProject)
    : false;
  const isPrivileged = user?.role === "superadmin";

  const canSelectedProjectDownload = selectedProject
    ? selectedProject.hasPurchased ||
      isSelectedProjectCreator ||
      (isPrivileged && !selectedProject.isActive) // 👈 key
    : false;

  const renderPreviewGallery = (images = []) => {
    if (!images.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No preview images provided
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <img
            src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${images[0]}`}
            alt={`${selectedProject.title} preview`}
            className="w-full object-cover"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="flex flex-col gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <img
                src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${img}`}
                alt={`${selectedProject.title} preview ${idx + 1}`}
                className="w-full h-55 object-cover"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <img
              src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${img}`}
              alt={`${selectedProject.title} preview ${idx + 1}`}
              className="w-full h-55 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-[15px]">
              #{idx + 1}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await exploreService.getPublicProjects({
        category: category !== "all" ? category : undefined,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder: "desc",
        status: isAdmin ? statusTab : undefined,
      });
      const list = response?.projects ?? response?.data?.projects;
      setProjects(Array.isArray(list) ? list : []);
      const pag = response?.pagination ?? response?.data?.pagination;
      if (pag) setPagination((prev) => ({ ...prev, ...pag }));
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await exploreService.getCategories();
      const list = response?.categories ?? response?.data?.categories;
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [category, searchTerm, sortBy, pagination.page, statusTab]);

  useEffect(() => {
    loadCategories();
  }, []);

  const resetCheckoutState = () => {
    setCheckoutClientSecret(null);
    setCheckoutProject(null);
    setCheckoutAmount(null);
    setCheckoutCurrency("usd");
    setShowCheckoutModal(false);
  };

  const handleStartCheckout = async (project) => {
    if (!stripePromise) {
      toast.error(
        "Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.",
      );
      return;
    }
    try {
      setIsPreparingCheckout(true);
      const response = await exploreService.createPaymentIntent(
        project._id || project.id,
      );
      setCheckoutProject(project);
      setCheckoutClientSecret(response.clientSecret);
      setCheckoutAmount(response.amount);
      setCheckoutCurrency(response.currency || "usd");
      setShowCheckoutModal(true);
    } catch (error) {
      toast.error(error.message || "Unable to start payment");
    } finally {
      setIsPreparingCheckout(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    if (!checkoutProject) return;
    try {
      await exploreService.purchaseProject({
        projectId: checkoutProject._id || checkoutProject.id,
        paymentIntentId: paymentIntent.id,
      });
      toast.success("Project purchased successfully!");
      resetCheckoutState();
      setShowProjectModal(false);
      loadProjects();
    } catch (error) {
      toast.error(error.message || "Failed to finalize purchase");
    }
  };

  const handleCloseCheckout = () => {
    resetCheckoutState();
  };

  const handleViewProject = async (project) => {
    try {
      const response = await exploreService.getPublicProject(
        project._id || project.id,
      );
      setSelectedProject(response.project);
      setShowProjectModal(true);
    } catch (error) {
      toast.error("Failed to load project details");
    }
  };

  const handleFileChange = (e, type) => {
    if (type === "zipFile") {
      const file = e.target.files?.[0];
      if (file) {
        if (
          !file.name.toLowerCase().endsWith(".zip") &&
          file.type !== "application/zip" &&
          file.type !== "application/x-zip-compressed"
        ) {
          toast.error("Please select a valid ZIP file");
          e.target.value = "";
          return;
        }
        setUploadForm({ ...uploadForm, zipFile: file });
      }
    } else if (type === "previewImages") {
      const files = Array.from(e.target.files || []);
      if (files.length > 4) {
        toast.error("Maximum 4 preview images allowed");
        e.target.value = "";
        return;
      }

      const validFiles = files.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length !== files.length) {
        toast.error("Please select only image files");
        e.target.value = "";
        return;
      }
      setUploadForm({ ...uploadForm, previewImages: validFiles });
    }
  };

  const handleUploadProject = async (e) => {
    e.preventDefault();

    if (!uploadForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!uploadForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!uploadForm.price || parseFloat(uploadForm.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!uploadForm.category) {
      toast.error("Category is required");
      return;
    }
    if (!uploadForm.zipFile) {
      toast.error("ZIP file is required");
      return;
    }

    try {
      setUploading(true);
      await exploreService.createPublicProject(uploadForm);
      toast.success("Project uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        price: "",
        category: "",
        tags: "",
        zipFile: null,
        previewImages: [],
      });
      loadProjects();
      loadCategories();
    } catch (error) {
      toast.error(error.message || "Failed to upload project");
    } finally {
      setUploading(false);
    }
  };

  console.log(projects);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="pt-10">
      <motion.div className="mx-auto relative">
        {/* Header */}
        <div className="flex py-6 gap-3 items-center justify-between fixed z-10 md:-top-3 -top-30 z-10">
          <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
              <Compass size={15} />
            </div>
            <h1 className="text-2xl font-bold">Explore Projects</h1>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="h-14 text-white font-bold dark:text-black md:w-[200px] w-full"
          >
            <Plus className="w-4 h-4 icon mr-2" />
            Upload Project
          </Button>
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 icon" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:w-[500px] w-full pl-10 pr-4 py-3 border border-gray-200 h-13 dark:border-gray-700 bg-white dark:bg-[black] text-black dark:text-white"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="md:w-[180px] w-full px-5 h-13 bg-white cursor-pointer dark:bg-[black] dark:text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[black] border-gray-200 dark:border-gray-700">
                  <SelectItem className="cursor-pointer h-10 px-5" value="all">
                    All Categories
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      className="cursor-pointer h-10 px-5 capitalize"
                      value={cat}
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="md:w-[180px] w-full px-5 h-13 bg-white cursor-pointer dark:bg-[black] dark:text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[black] border-gray-200 dark:border-gray-700">
                  <SelectItem
                    className="cursor-pointer h-10 px-5"
                    value="createdAt"
                  >
                    Newest
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer h-10 px-5"
                    value="price"
                  >
                    Price
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer h-10 px-5"
                    value="purchaseCount"
                  >
                    Popular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="grid grid-cols-2 gap-3 mb-4 md:w-[400px]">
                <Button
                  variant={statusTab === "active" ? "default" : "outline"}
                  onClick={() => setStatusTab("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusTab === "inactive" ? "default" : "outline"}
                  onClick={() => setStatusTab("inactive")}
                >
                  Inactive
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[67vh] overflow-scroll pb-20">
            {[1,2,3,4,5,6].map(() => {
              return <Skeleton className={'w-full h-[310px]'} />
            })}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols- md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[68vh] overflow-scroll"
          >
            {projects.map((project, index) => {
              const isCreator = isProjectCreatedByUser(project);
              return (
                <motion.div
                  key={project._id || project.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.15 }}
                  className="group relative bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[15px] overflow-hidden border dark:border-none shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleViewProject(project)}
                >
                  {/* Preview Image */}
                  {project.previewImages && project.previewImages.length > 0 ? (
                    <div className="relative w-full border border-gray-300 dark:border-gray-700 rounded-[15px] h-[315px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={(() => {
                          const base = (
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:4000"
                          ).replace(/\/$/, "");
                          const path = project.previewImages[0];
                          return path
                            ? `${base}${path.startsWith("/") ? path : `/${path}`}`
                            : "";
                        })()}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Price Badge - Top Right */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/70 text-white border-none backdrop-blur-sm text-xs">
                          <IoPricetagsSharp className="w-3 h-3 mr-1" />$
                          {project.price}
                        </Badge>
                      </div>
                      {/* Title - Bottom Left (shown on hover) */}
                      <div className="absolute bottom-0 left-0 right-0 h-full flex items-end bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-bold text-white line-clamp-1">
                          {project.title}
                        </h3>
                      </div>
                      {/* Creator Badge - Top Left (if creator) */}
                      {isCreator && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-500/80 text-white border-none backdrop-blur-sm">
                            Your Project
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">
                        No Image
                      </span>
                      {/* Price Badge - Top Right */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/70 text-white border-none backdrop-blur-sm">
                          <IoPricetagsSharp className="w-3 h-3 mr-1" />$
                          {project.price}
                        </Badge>
                      </div>
                      {/* Title - Bottom Left (shown on hover) */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-bold text-white line-clamp-1">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

          </motion.div>
        )}
     

        {/* Pagination */}
      </motion.div>
      {pagination.pages > 1 && (
          <div className="flex items-center absolute right-5 -bottom-0 justify-end w-full col-span-3 gap-2 mt-8 mb-10">
            {/* Previous */}
            <Button
              className={"w-10 h-10 bg-white hover:bg-white text-black"}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((page) => {
                  if (pagination.pages <= 9) return true;

                  return (
                    page === 1 ||
                    page === pagination.pages ||
                    Math.abs(page - pagination.page) <= 1
                  );
                })
                .map((page, index, arr) => {
                  const prevPage = arr[index - 1];

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {prevPage && page - prevPage > 1 && (
                        <span className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )}

                      <Button
                        
                        size="sm"
                        className={`w-10 h-10 font-bold bg-[#ff914b] hover:bg-[#ff914b] ${pagination.page === page ? "bg-[#ff914b] dark:text-white hover:bg-[#ff914b]" : "bg-white text-black hover:bg-gray-100"}`}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                      >
                        {page < 10 ? `0${page}` : page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            {/* Next */}
            <Button
              className={"w-10 h-10 bg-white hover:bg-white text-black"}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      {/* Project Detail Modal */}
      {showProjectModal && selectedProject && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm icon flex items-center justify-center p-4 z-50"
          onClick={() => setShowProjectModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-[15px] p-6 md:p-8 max-w-6xl w-full flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex  gap-4  pb-2">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {selectedProject.title}
                  </h2>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Added {new Date(selectedProject.createdAt || selectedProject.updatedAt || Date.now()).toLocaleDateString()}</p> */}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gray-50 border border-grary-300 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-[15px] text-xs font-semibold">
                  {selectedProject.category || "General"}
                </Badge>
                {isSelectedProjectCreator && (
                  <Badge className="bg-blue-500 text-white px-3 py-1 rounded-[15px] text-xs font-semibold">
                    Your project
                  </Badge>
                )}
                {selectedProject.hasPurchased && !isSelectedProjectCreator && (
                  <Badge className="bg-green-500 text-white px-3 py-1 rounded-[15px] text-xs font-semibold">
                    Purchased
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex text-justify max-w-[70%] line-clamp-2 icon">
              <p className="line-clamp-2 text-sm icon max-w-5xl">{selectedProject.description}</p>
            </div>
            <div className="flex-1 overflow-hidden mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
                  {/* Gallery */}
                  {renderPreviewGallery(selectedProject.previewImages)}

                  {/* Tags */}
                </div>

                {/* Sidebar */}
                <div className="space-y-5 h-full overflow-auto">
                  <div className="rounded-3xl border border-gray-100 bg-gray-100 dark:bg-[rgba(255,255,255,.1)] dark:border-gray-800 shadow-sm p-3 px-5">
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">Price</p> */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-gray-900 dark:text-white">
                        ${selectedProject.price}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-white">
                      <div className="flex items-center justify-between p-2 pr-5 bg-white dark:bg-[rgba(255,255,255,.05)] rounded-[15px]">
                        <div className="flex p-3 bg-white dark:text-black border dark:border-none text-lg rounded-[15px]">
                          <BiCategory />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedProject.category || "General"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 pr-5 bg-white dark:bg-[rgba(255,255,255,.05)] rounded-[15px]">
                        <div className="flex p-3 bg-white dark:text-black border dark:border-none text-lg rounded-[15px]">
                          <BiStore />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.purchaseCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 pr-5 bg-white dark:bg-[rgba(255,255,255,.05)] rounded-[15px]">
                        <div className="flex p-3 bg-white dark:text-black border dark:border-none text-lg rounded-[15px]">
                          <BiCalendar />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(
                            selectedProject.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-[#eee] dark:bg-[rgba(255,255,255,.1)] shadow-sm p-3">
                    {/* <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Creator</h4> */}
                    <div className="flex items-center gap-3">
                      {selectedProject.createdBy?.avatar ? (
                        <img
                          {...getAvatarProps(
                            selectedProject.createdBy.avatar,
                            selectedProject.createdBy.username,
                          )}
                          alt={selectedProject.createdBy.username}
                          className="w-12 h-12 rounded-[15px] border border-gray-200 dark:border-gray-700 p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-[15px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-semibold text-gray-500">
                          {selectedProject.createdBy?.username?.[0]?.toUpperCase() ||
                            "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.createdBy?.username ||
                            "Unknown creator"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedProject.createdBy?.email || "Private email"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    {selectedProject.tags &&
                      selectedProject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              className="rounded-[15px] px-3 py-1 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="space-y-3">
                    {canSelectedProjectDownload ? (
                      <Button
                        onClick={async () => {
                          try {
                            await exploreService.downloadProject(
                              selectedProject._id || selectedProject.id,
                            );
                            toast.success("Download started!");
                          } catch (error) {
                            toast.error("Failed to download project");
                          }
                        }}
                        className="w-full h-12 text-base font-semibold syne"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download project
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartCheckout(selectedProject)}
                        className="w-full h-12 text-base font-semibold syne"
                        disabled={isPreparingCheckout}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isPreparingCheckout
                          ? "Preparing checkout..."
                          : `Purchase $${selectedProject.price}`}
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {isPrivileged && !selectedProject.isActive && (
                        <Button
                          onClick={async () => {
                            try {
                              await exploreService.approveProject(
                                selectedProject._id || selectedProject.id,
                              );
                              toast.success("Project approved");
                              setShowProjectModal(false);
                              loadProjects();
                            } catch (error) {
                              toast.error("Failed to approve project");
                            }
                          }}
                          className="h-12 text-base font-semibold bg-green-600 hover:bg-green-600"
                        >
                          <PiCheck />
                        </Button>
                      )}

                      {isPrivileged && !selectedProject.isActive && (
                        <Button
                          onClick={async () => {
                            try {
                              await exploreService.rejectProject(
                                selectedProject._id || selectedProject.id,
                              );
                              toast.success("Project Rejected");
                              setShowProjectModal(false);
                              loadProjects();
                            } catch (error) {
                              toast.error("Failed to approve project");
                            }
                          }}
                          className="h-12 text-base font-semibold bg-red-600 text-white hover:bg-red-600 text-[20px]"
                        >
                          <PiX />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showCheckoutModal &&
        checkoutClientSecret &&
        checkoutProject &&
        stripePromise && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm icon flex items-center justify-center p-4 z-50"
            onClick={handleCloseCheckout}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-[28px] p-6 md:p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Secure Checkout
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {checkoutProject?.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAmountForDisplay(
                      checkoutAmount || 0,
                      checkoutCurrency,
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseCheckout}>
                  <X className="w-4 h-4 icon" />
                </Button>
              </div>
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: checkoutClientSecret }}
              >
                <CheckoutForm
                  amount={checkoutAmount}
                  currency={checkoutCurrency}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCloseCheckout}
                />
              </Elements>
            </motion.div>
          </div>
        )}

      {/* Upload Project Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-black border rounded-[15px] p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleUploadProject} className="space-y-4">
              <div>
                <Input
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your project..."
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={uploadForm.price}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, price: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) =>
                      setUploadForm({ ...uploadForm, category: value })
                    }
                    required
                    
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className={"px-5"} value="web development">
                        Web Development
                      </SelectItem>
                      <SelectItem className={"px-5"} value="mobile development">
                        Mobile App
                      </SelectItem>
                      <SelectItem className={"px-5"} value="web design">
                        UI/UX Design
                      </SelectItem>
                      <SelectItem className={"px-5"} value="game development">
                        Game Development
                      </SelectItem>
                      <SelectItem className={"px-5"} value="other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Input
                  value={uploadForm.tags}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, tags: e.target.value })
                  }
                  placeholder="react, javascript, ui"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[15px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {uploadForm.previewImages.length > 0
                          ? `${uploadForm.previewImages.length} image(s) selected`
                          : "Click to select images"}
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "previewImages")}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadForm.previewImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadForm.previewImages.map((file, idx) => (
                      <Badge
                        key={idx}
                        variant="default"
                        className="flex px-5 py-2 bg-violet-500 items-center gap-1"
                      >
                        {file.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => {
                            const newImages = uploadForm.previewImages.filter(
                              (_, i) => i !== idx,
                            );
                            setUploadForm({
                              ...uploadForm,
                              previewImages: newImages,
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[15px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <FileArchive className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {uploadForm.zipFile
                          ? uploadForm.zipFile.name
                          : "Click to select ZIP file"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      onChange={(e) => handleFileChange(e, "zipFile")}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                {uploadForm.zipFile && (
                  <div className="mt-2">
                    <Badge
                      variant="default"
                      className="flex px-5 py-2 bg-violet-500 items-center gap-1"
                    >
                      {uploadForm.zipFile.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() =>
                          setUploadForm({ ...uploadForm, zipFile: null })
                        }
                      />
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                
                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 icon mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 icon mr-2" />
                      Upload Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Explore;

const CheckoutForm = ({ amount, currency, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent);
    } else {
      toast.error("Payment could not be completed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4 icon">
      <div className="rounded-2xl icon border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-4">
        <PaymentElement />
      </div>
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full h-12 text-base font-semibold"
      >
        {submitting
          ? "Processing..."
          : `Pay ${formatAmountForDisplay(amount || 0, currency)}`}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-full"
      >
        Cancel
      </Button>
    </form>
  );
};
