import apiClient from "@/api/apiClient";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useTheme } from "@/lib/theme-context";

import "../brand/Brand.css"; // shared styles
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit2,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  Sparkles,
  ImageIcon,
  Camera,
  Tag,
} from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";
import Pagination from "@/common/Pagination";
import { useDebouncedSearch } from "@/hooks/useDebounce";
import SearchInput from "@/common/SearchInput";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";
/* ─── Color Themes Configuration ─────────────────────────────────── */
const THEME_CONFIGS = {
  default: {
    primary: "#6366f1", // Indigo
    primaryHover: "#4f46e5",
    secondary: "#8b5cf6", // Purple
    light: "#a78bfa", // Violet
    bgGradient: "from-slate-50 via-indigo-50/30 to-violet-50/20",
    blob1: "#818cf8",
    blob2: "#a78bfa",
    shadow: "rgba(99,102,241,.18)",
    shadowHover: "hover:shadow-indigo-300",
    borderLight: "border-indigo-50",
    borderMedium: "border-indigo-200",
    bgLight: "bg-indigo-50/30",
    textPrimary: "text-indigo-600 hover:text-indigo-800",
    focusRing: "focus:ring-indigo-300 focus:border-indigo-400",
    imgBg: "linear-gradient(135deg, #f8f9ff 0%, #f0f0fb 100%)",
  },
  purple: {
    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    secondary: "#a78bfa",
    light: "#c084fc",
    bgGradient: "from-slate-50 via-purple-50/30 to-fuchsia-50/20",
    blob1: "#a78bfa",
    blob2: "#c084fc",
    shadow: "rgba(139,92,246,.18)",
    shadowHover: "hover:shadow-purple-300",
    borderLight: "border-purple-50",
    borderMedium: "border-purple-200",
    bgLight: "bg-purple-50/30",
    textPrimary: "text-purple-600 hover:text-purple-800",
    focusRing: "focus:ring-purple-300 focus:border-purple-400",
    imgBg: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
  },
  yellow: {
    primary: "#eab308",
    primaryHover: "#ca8a04",
    secondary: "#facc15",
    light: "#fef08a",
    bgGradient: "from-slate-50 via-yellow-50/30 to-amber-50/20",
    blob1: "#facc15",
    blob2: "#fde047",
    shadow: "rgba(234,179,8,.18)",
    shadowHover: "hover:shadow-yellow-300",
    borderLight: "border-yellow-50",
    borderMedium: "border-yellow-200",
    bgLight: "bg-yellow-50/30",
    textPrimary: "text-yellow-600 hover:text-yellow-800",
    focusRing: "focus:ring-yellow-300 focus:border-yellow-400",
    imgBg: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",
  },
  green: {
    primary: "#16a34a",
    primaryHover: "#15803d",
    secondary: "#22c55e",
    light: "#86efac",
    bgGradient: "from-slate-50 via-green-50/30 to-emerald-50/20",
    blob1: "#22c55e",
    blob2: "#86efac",
    shadow: "rgba(22,163,74,.18)",
    shadowHover: "hover:shadow-green-300",
    borderLight: "border-green-50",
    borderMedium: "border-green-200",
    bgLight: "bg-green-50/30",
    textPrimary: "text-green-600 hover:text-green-800",
    focusRing: "focus:ring-green-300 focus:border-green-400",
    imgBg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  },
  teal: {
    primary: "#0d9488",
    primaryHover: "#0f766e",
    secondary: "#14b8a6",
    light: "#5eead4",
    bgGradient: "from-slate-50 via-teal-50/30 to-cyan-50/20",
    blob1: "#14b8a6",
    blob2: "#5eead4",
    shadow: "rgba(13,148,136,.18)",
    shadowHover: "hover:shadow-teal-300",
    borderLight: "border-teal-50",
    borderMedium: "border-teal-200",
    bgLight: "bg-teal-50/30",
    textPrimary: "text-teal-600 hover:text-teal-800",
    focusRing: "focus:ring-teal-300 focus:border-teal-400",
    imgBg: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
  },
  gray: {
    primary: "#4b5563",
    primaryHover: "#374151",
    secondary: "#6b7280",
    light: "#d1d5db",
    bgGradient: "from-slate-50 via-gray-50/30 to-slate-100/20",
    blob1: "#6b7280",
    blob2: "#9ca3af",
    shadow: "rgba(75,85,99,.18)",
    shadowHover: "hover:shadow-gray-300",
    borderLight: "border-gray-100",
    borderMedium: "border-gray-300",
    bgLight: "bg-gray-100/30",
    textPrimary: "text-gray-600 hover:text-gray-800",
    focusRing: "focus:ring-gray-300 focus:border-gray-400",
    imgBg: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
  },
  black: {
    primary: "#0f172a",
    primaryHover: "#020617",
    secondary: "#334155",
    light: "#94a3b8",
    bgGradient: "from-slate-50 via-slate-100/50 to-slate-200/30",
    blob1: "#94a3b8",
    blob2: "#cbd5e1",
    shadow: "rgba(15,23,42,.18)",
    shadowHover: "hover:shadow-slate-300",
    borderLight: "border-slate-200",
    borderMedium: "border-slate-300",
    bgLight: "bg-slate-100/50",
    textPrimary: "text-slate-800 hover:text-slate-950",
    focusRing: "focus:ring-slate-300 focus:border-slate-400",
    imgBg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  },
};
/* ─── Skeleton card ───────────────────────────────────────────────── */

const Client = () => {
  const { theme } = useTheme();
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.default;
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState(null);
  const [clientStatus, setClientStatus] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  // Pagination & Image URLs

  // const fetchClients = async (page = 1, search = "") => {
  //   try {
  //     setPageLoading(true);
  //     const response = await apiClient.get(
  //       `/client?page=${page}&search=${search}`,
  //     );
  //     const responseData = response.data.data;
  //     setClients(responseData.data);
  //     setCurrentPage(responseData.current_page);
  //     setTotalPages(responseData.last_page);
  //     if (response.data.image_url) {
  //       const clientUrl = response.data.image_url.find(
  //         (img) => img.image_for === "Client",
  //       )?.image_url;
  //       const noImg = response.data.image_url.find(
  //         (img) => img.image_for === "No Image",
  //       )?.image_url;
  //       if (clientUrl) setClientImageUrl(clientUrl);
  //       if (noImg) setNoImageUrl(noImg);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to fetch clients", { position: "top-center" });
  //   } finally {
  //     setPageLoading(false);
  //   }
  // };
  // const {
  //   data: clients,
  //   setData: setClients,
  //   pageLoading,
  //   pagination,
  //   total,
  //   imageBase,
  //   noImageUrl,
  //   fetchData: fetchClients,
  // } = usePaginatedResource({
  //   endpoint: "/client",
  //   resourceName: "clients",
  //   imageKeys: {
  //     main: "Client",
  //     fallback: "No Image",
  //   },
  // });
  const {
    data: clients,
    setData: setClients,
    pageLoading,
    pagination,
    total,
    imageBase,
    noImageUrl,
    fetchData: fetchClients,
  } = usePaginatedResource({
    endpoint: "/client",
    resourceName: "clients",
    imageKeys: {
      main: "Client",
      fallback: "No Image",
    },
  });
  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearch,
  } = useDebouncedSearch("", 500);

  // 1. Fetch page 1 whenever search changes (and on initial load)
  useEffect(() => {
    fetchClients(1, debouncedSearch);
  }, [debouncedSearch]);

  // 2. Scroll to top when page changes
  // useEffect(() => {
  //   if (!pageLoading) {
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //   }
  // }, [pagination.current_page, pageLoading]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClientImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Client name is required", { position: "top-center" });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("client_name", clientName);
      formData.append("client_status", String(clientStatus));
      if (clientImage) formData.append("client_image", clientImage);
      if (editingId) {
        formData.append("_method", "PUT");
        await apiClient.post(`/client/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Client updated successfully", {
          position: "top-center",
        });
      } else {
        await apiClient.post("/client", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Client created successfully", {
          position: "top-center",
        });
      }
      resetForm();
      setIsModalOpen(false);
      fetchClients(pagination.current_page, debouncedSearch);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setClientName("");
    setClientImage(null);
    setClientStatus("1");
    setEditingId(null);
    setLogoPreview(null);
  };
  const handleEdit = (client) => {
    setClientName(client.client_name);
    setClientStatus(String(client.client_status));
    setEditingId(client.id);
    if (client.client_image) {
      setLogoPreview(`${imageBase}${client.client_image}`);
    } else {
      setLogoPreview(null);
    }
    setIsModalOpen(true);
  };
  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    if (!loading) {
      resetForm();
      setIsModalOpen(false);
    }
  };
  const updateClientStatus = async (client, newStatus) => {
    const updatedClients = clients.map((c) =>
      c.id === client.id ? { ...c, client_status: newStatus } : c,
    );
    setClients(updatedClients); // instant UI change
    try {
      // const fd = new FormData();
      // fd.append("client_status", newStatus);
      // await apiClient.patch(`/clients/${client.id}/status`, fd, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      await apiClient.patch(`/clients/${client.id}/status`, {
        client_status: String(newStatus),
      });
      toast.success("Status updated", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to update status", { position: "top-center" });
      const updatedClients = clients.map((c) =>
        c.id === client.id ? { ...c, client_status: newStatus } : c,
      );
      setClients(updatedClients);
    }
  };
  return (
    <div
      className={`client-page min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} p-6 md:p-8 space-y-8`}
    >
      {/* ── Decorative blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 right-0 w-[520px] h-[520px] rounded-full opacity-[0.06]"
        style={{
          background: `radial-gradient(circle, ${currentTheme.blob1}, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background: `radial-gradient(circle, ${currentTheme.blob2}, transparent 70%)`,
          transform: "translate(-30%, 30%)",
        }}
      />
      {/* ════════════════════════════════════════
          HEADER
      ════════════════════════════════════════ */}
      <div className="fade-in flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Title block */}

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 font-extrabold tracking-tight text-slate-900 leading-none">
              Client{" "}
              <span
                style={{
                  color: currentTheme.primary,
                }}
              >
                Management
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {clients.length > 0
                ? `${clients.length} client${clients.length !== 1 ? "s" : ""} on this page`
                : "Manage all your clients"}
            </p>
          </div>
        </div>
        {/* Search */}

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm("")}
          placeholder="Search clients..."
        />
        {/* Create button */}
        <button
          onClick={handleOpenCreateModal}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg ${currentTheme.shadowHover} hover:shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0`}
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
          }}
        >
          <Plus className="w-4 h-4" />
          Create Client
        </button>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Brands */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentTheme.bgLight}`}
          >
            <Users
              className="w-6 h-6"
              style={{ color: currentTheme.primary }}
            />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Total Clients
            </p>
            <p className="text-2xl font-black text-slate-800">{total}</p>
          </div>
        </div>

        {/* Active Brands (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Active Clients
            </p>
            <p className="text-2xl font-black text-slate-800">
              {clients.filter((c) => String(c.client_status) === "1").length}
            </p>
          </div>
        </div>

        {/* Inactive Brands (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Inactive Clients
            </p>
            <p className="text-2xl font-black text-slate-800">
              {clients.filter((c) => String(c.client_status) === "0").length}
            </p>
          </div>
        </div>
      </div>
      {/* ═══
      ═════════════════════════════════════
          MODAL
      ════════════════════════════════════════ */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Gradient strip */}
          <div
            className="modal-strip px-6 pt-6 pb-5"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 60%, ${currentTheme.light} 100%)`,
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                {editingId ? (
                  <Edit2 className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-white m-0">
                {editingId ? "Update Client" : "Create New Client"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/80 text-sm m-0">
              {editingId
                ? "Update the client information below"
                : "Fill in the details to add a new client"}
            </DialogDescription>
          </div>
          {/* Form body */}
          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-5 space-y-5 bg-white"
          >
            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Client Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="e.g. Acme Corp..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={loading}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentTheme.focusRing} disabled:bg-slate-50 disabled:text-slate-500 transition-all`}
                />
              </div>
            </div>
            {/* Client Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Client Image
              </label>
              <div
                className={`upload-zone border-2 border-dashed ${currentTheme.borderMedium} rounded-xl p-5 text-center transition-colors duration-300 ${currentTheme.bgLight}`}
              >
                <input
                  id="clientImage"
                  type="file"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="hidden"
                  accept="image/*"
                />
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = noImageUrl || "";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("clientImage").click()
                      }
                      className={`flex items-center gap-1.5 text-xs font-semibold ${currentTheme.textPrimary} transition-colors`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Change Image
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="clientImage"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${currentTheme.primary}22, ${currentTheme.secondary}22)`,
                      }}
                    >
                      <ImageIcon
                        className="w-5 h-5"
                        style={{ color: currentTheme.primary }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click to upload image
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PNG, JPG or GIF (Max. 5 MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={String(clientStatus)}
                onValueChange={setClientStatus}
              >
                <SelectTrigger
                  disabled={loading}
                  className={`rounded-xl border-slate-200 focus:ring-2 ${currentTheme.focusRing} text-sm`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium">Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Inactive</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md ${currentTheme.shadowHover} hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60`}
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? "Processing…"
                  : editingId
                    ? "Update Client"
                    : "Create Client"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* ════════════════════════════════════════
          GRID / EMPTY / LOADING
      ════════════════════════════════════════ */}
      {pageLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} currentTheme={currentTheme} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        /* ── Empty state ── */
        <div className="fade-in flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}22, ${currentTheme.secondary}22)`,
            }}
          >
            <Users
              className="w-9 h-9"
              style={{ color: currentTheme.primary }}
            />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            No Clients Yet
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {searchTerm
              ? `No clients match "${searchTerm}". Try a different search term.`
              : "You haven't added any clients yet. Add your first one to get started."}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Client
            </button>
          )}
        </div>
      ) : (
        /* ── Cards grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {clients.map((client, idx) => {
            const isActive =
              client.client_status === 1 || client.client_status === "1";
            return (
              <div
                key={client.id}
                className={`client-card fade-in fade-in-delay-${(idx % 4) + 1} relative rounded-2xl overflow-hidden border ${
                  isActive
                    ? "bg-white border-slate-100"
                    : "client-card-inactive border-slate-200 border-dashed"
                }`}
                style={{ animationDelay: `${(idx % 4) * 0.05}s` }}
              >
                {/* Edit button */}
                <button
                  onClick={() => handleEdit(client)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform duration-150"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                      : "linear-gradient(135deg,#94a3b8,#64748b)",
                  }}
                  title="Edit client"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {/* Image section */}
                <div
                  className="h-44 w-full overflow-hidden flex items-center justify-center"
                  style={{
                    background: isActive
                      ? currentTheme.imgBg
                      : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  }}
                >
                  <img
                    src={
                      client.client_image
                        ? `${imageBase}${client.client_image}`
                        : noImageUrl
                    }
                    alt={client.client_name}
                    onError={(e) => {
                      e.target.src = noImageUrl;
                    }}
                    className="client-img w-full h-full object-contain p-4"
                  />
                </div>
                {/* Bottom strip */}
                <div
                  className={`px-4 py-3 flex items-center justify-between gap-2 border-t ${
                    isActive
                      ? "border-slate-100"
                      : "border-slate-200 bg-gray-50"
                  }`}
                >
                  <h3
                    className={`font-semibold text-sm truncate flex-1 ${
                      isActive ? "text-slate-800" : "text-slate-400"
                    }`}
                    title={client.client_name}
                  >
                    {client.client_name}
                  </h3>
                  {/* Status select toggle */}
                  <Select
                    value={String(client.client_status)}
                    onValueChange={(val) => updateClientStatus(client, val)}
                  >
                    <SelectTrigger
                      className={`h-7 w-[105px] rounded-lg text-[11px] font-semibold border px-2 py-0 focus:ring-0 focus:ring-offset-0 transition-colors duration-200 ${
                        isActive
                          ? "status-select-active"
                          : "status-select-inactive"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl min-w-[120px]">
                      <SelectItem value="1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="0">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-semibold text-red-600">
                            Inactive
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ════════════════════════════════════════
          PAGINATION
      ════════════════════════════════════════ */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        loading={pageLoading}
        onPageChange={(page) => {
          window.scrollTo({ top: 0, behavior: "auto" });

          fetchClients(page, debouncedSearch);
        }}
      />
    </div>
  );
};
export default Client;
