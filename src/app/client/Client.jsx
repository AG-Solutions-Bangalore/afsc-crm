import apiClient from "@/api/apiClient";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit2,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Users,
  Sparkles,
  ImageIcon,
  Camera,
} from "lucide-react";

/* ─── Inline styles injected once ─────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .client-page * { font-family: 'Inter', system-ui, sans-serif; }
  /* ── Shimmer skeleton ── */
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #f0f0f5 25%, #e4e4ef 50%, #f0f0f5 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 12px;
  }
  /* ── Card hover lift ── */
  .client-card {
    transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                box-shadow 0.25s cubic-bezier(.22,1,.36,1),
                background 0.3s ease,
                opacity 0.3s ease;
  }
  .client-card:hover {
    transform: translateY(-5px) scale(1.015);
    box-shadow: 0 20px 60px rgba(99,102,241,.18), 0 4px 16px rgba(0,0,0,.06);
  }
  /* ── Image zoom ── */
  .client-img { transition: transform 0.4s cubic-bezier(.22,1,.36,1), filter 0.3s ease; }
  .client-card:hover .client-img { transform: scale(1.08); }
  /* ── Inactive card grayscale ── */
  .client-card-inactive { background: #f4f5f7 !important; }
  .client-card-inactive .client-img { filter: grayscale(80%) opacity(0.6); }
  .client-card-inactive:hover .client-img { filter: grayscale(40%) opacity(0.8); }
  /* ── Status select on card ── */
  .card-status-select [data-radix-select-trigger] { padding: 0 6px; }
  .status-select-active  { color: #059669; background: #ecfdf5; border-color: #a7f3d0; }
  .status-select-inactive { color: #dc2626; background: #fef2f2; border-color: #fecaca; }
  /* ── Gradient text ── */
  .grad-text {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  /* ── Upload zone pulse ── */
  @keyframes border-pulse {
    0%,100% { border-color: #c7d2fe; }
    50%      { border-color: #818cf8; }
  }
  .upload-zone:hover { animation: border-pulse 1.5s ease-in-out infinite; }
  /* ── Page number active ── */
  .page-btn-active {
    background: linear-gradient(135deg,#6366f1,#8b5cf6) !important;
    color: #fff !important;
    box-shadow: 0 4px 14px rgba(99,102,241,.4);
  }
  /* ── Modal strip gradient ── */
  .modal-strip {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%);
  }
  /* ── Search focus glow ── */
  .search-input:focus-within {
    box-shadow: 0 0 0 3px rgba(99,102,241,.18);
  }
  /* ── Fade in ── */
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .fade-in { animation: fadeInUp 0.4s ease both; }
`;

/* ─── Skeleton card ───────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-indigo-50 bg-white shadow-sm">
    <div className="skeleton h-44 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  </div>
);

const Client = () => {
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState(null);
  const [clientStatus, setClientStatus] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Pagination, API Meta & Image URLs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApiClients, setTotalApiClients] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [clientImageUrl, setClientImageUrl] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClients = async (page = 1, search = "") => {
    try {
      setPageLoading(true);
      const response = await apiClient.get(
        `/client?page=${page}&search=${search}`,
      );
      const responseData = response.data.data;
      setClients(responseData.data);
      setCurrentPage(responseData.current_page);
      setTotalPages(responseData.last_page);

      // Capture the global total from the API if available, fallback to length
      setTotalApiClients(responseData.total || responseData.data.length);

      if (response.data.image_url) {
        const clientUrl = response.data.image_url.find(
          (img) => img.image_for === "Client",
        )?.image_url;
        const noImg = response.data.image_url.find(
          (img) => img.image_for === "No Image",
        )?.image_url;
        if (clientUrl) setClientImageUrl(clientUrl);
        if (noImg) setNoImageUrl(noImg);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch clients");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchClients(1, searchTerm);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    fetchClients(1, "");
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchClients(currentPage, searchTerm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (!pageLoading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [clients]);

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
      toast.error("Client name is required");
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
        toast.success("Client updated successfully");
      } else {
        await apiClient.post("/client", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Client created successfully");
      }
      resetForm();
      setIsModalOpen(false);
      fetchClients(currentPage, searchTerm);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
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
      setLogoPreview(`${clientImageUrl}${client.client_image}`);
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
      const fd = new FormData();
      fd.append("client_status", newStatus);

      await apiClient.patch(`/clients/${client.id}/status`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      fetchClients(currentPage, searchTerm); // rollback sync
    }
  };

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i);
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        pages.push("...");
      }
    }
    return pages.filter((v, i, a) => !(v === "..." && a[i - 1] === "..."));
  };

  // ── Sorting Clients Alphabetically ──
  const sortedClients = [...clients].sort((a, b) =>
    a.client_name.localeCompare(b.client_name),
  );

  return (
    <div className="client-page min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 p-6 md:p-8 space-y-8">
      <style>{GLOBAL_STYLES}</style>

      {/* ── Decorative blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 right-0 w-[520px] h-[520px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #818cf8, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #a78bfa, transparent 70%)",
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
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 font-extrabold tracking-tight text-slate-900 leading-none">
              Client <span className="grad-text">Management</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {clients.length > 0
                ? `${clients.length} client${clients.length !== 1 ? "s" : ""} on this page`
                : "Manage all your clients"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="search-input flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm shadow-sm transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search clients…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Create button */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-indigo-300 hover:shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <Plus className="w-4 h-4" />
          Create Client
        </button>
      </div>

      {/* ════════════════════════════════════════
          STATISTICS CARDS
      ════════════════════════════════════════ */}
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Clients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Clients
            </p>
            <p className="text-2xl font-black text-slate-800">
              {totalApiClients}
            </p>
          </div>
        </div>

        {/* Active Clients (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Clients
            </p>
            <p className="text-2xl font-black text-slate-800">
              {clients.filter((c) => String(c.client_status) === "1").length}
            </p>
          </div>
        </div>

        {/* Inactive Clients (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inactive Clients
            </p>
            <p className="text-2xl font-black text-slate-800">
              {clients.filter((c) => String(c.client_status) === "0").length}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MODAL
      ════════════════════════════════════════ */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Gradient strip */}
          <div className="modal-strip px-6 pt-6 pb-5">
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
            <DialogDescription className="text-indigo-200 text-sm m-0">
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Client Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Client Image
              </label>
              <div className="upload-zone border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center transition-colors duration-300 bg-indigo-50/30">
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
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
                        background: "linear-gradient(135deg,#e0e7ff,#ede9fe)",
                      }}
                    >
                      <ImageIcon className="w-5 h-5 text-indigo-500" />
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
                  className="rounded-xl border-slate-200 focus:ring-indigo-300 focus:border-indigo-400 text-sm"
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
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-indigo-300 hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
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
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sortedClients.length === 0 ? (
        /* ── Empty state ── */
        <div className="fade-in flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
            style={{ background: "linear-gradient(135deg,#e0e7ff,#ede9fe)" }}
          >
            <Users className="w-9 h-9 text-indigo-400" />
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
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Client
            </button>
          )}
        </div>
      ) : (
        /* ── Cards grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedClients.map((client, idx) => {
            const isActive =
              client.client_status === 1 || client.client_status === "1";
            return (
              <div
                key={client.id}
                className={`client-card fade-in relative rounded-2xl overflow-hidden border ${
                  isActive
                    ? "bg-white border-slate-100"
                    : "client-card-inactive border-slate-200 border-dashed"
                }`}
                style={{
                  animation: `fadeInUp 0.4s ease ${(idx % 4) * 0.05}s both`,
                }}
              >
                {/* Edit button */}
                <button
                  onClick={() => handleEdit(client)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform duration-150"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
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
                      ? "linear-gradient(135deg, #f8f9ff 0%, #f0f0fb 100%)"
                      : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  }}
                >
                  <img
                    src={
                      client.client_image
                        ? `${clientImageUrl}${client.client_image}`
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
      {totalPages > 1 && (
        <div className="fade-in flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || pageLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPages().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`el-${idx}`}
                    className="w-9 text-center text-slate-400 text-sm select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={pageLoading}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      page === currentPage
                        ? "page-btn-active"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || pageLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-600">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">{totalPages}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Client;
