import apiClient from "@/api/apiClient";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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
  Tag,
  Sparkles,
  ImageIcon,
  Camera,
} from "lucide-react";
import "./Brand.css";
/* ─── Inline styles injected once ─────────────────────────────────── */

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

/* ─── Main component ──────────────────────────────────────────────── */
const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [brandStatus, setBrandStatus] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [search, setSearch] = useState("");

  // Pagination & Statistics
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApiBrands, setTotalApiBrands] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  // Image URLs
  // const[brand,]
  const [brandImageUrl, setBrandImageUrl] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");
  /* ── Fetch ── */
  const fetchBrands = async (page = 1, searchTerm = "") => {
    try {
      setPageLoading(true);
      const response = await apiClient.get(
        `/brand?page=${page}&search=${searchTerm}`,
      );
      const responseData = response.data.data;
      setBrands(responseData.data);
      setCurrentPage(responseData.current_page);
      setTotalPages(responseData.last_page);

      // Capture the global total from the API if available, fallback to length
      setTotalApiBrands(responseData.total || responseData.data.length);

      if (response.data.image_url) {
        const brandUrl = response.data.image_url.find(
          (img) => img.image_for === "Brand",
        )?.image_url;
        const noImage = response.data.image_url.find(
          (img) => img.image_for === "No Image",
        )?.image_url;
        if (brandUrl) setBrandImageUrl(brandUrl);
        if (noImage) setNoImageUrl(noImage);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch brands");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBrands(currentPage, search);
    }, 500);

    return () => clearTimeout(delay);
  }, [currentPage, search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  /* ── Page change ── */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  /* ── Logo ── */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrandLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("brand_name", brandName);
      formData.append("brand_status", String(brandStatus));
      if (brandLogo) formData.append("brand_logo", brandLogo);

      if (editingId) {
        formData.append("_method", "PUT");
        await apiClient.post(`/brand/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand updated successfully");
      } else {
        await apiClient.post("/brand", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Brand created successfully");
      }
      resetForm();
      setIsModalOpen(false);
      fetchBrands(currentPage, search);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ── Reset ── */
  const resetForm = () => {
    setBrandName("");
    setBrandLogo(null);
    setBrandStatus("1");
    setEditingId(null);
    setLogoPreview(null);
  };

  /* ── Edit ── */
  const handleEdit = (brand) => {
    setBrandName(brand.brand_name);
    setBrandStatus(String(brand.brand_status));
    setEditingId(brand.id);
    setLogoPreview(
      brand.brand_logo ? `${brandImageUrl}${brand.brand_logo}` : null,
    );
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

  /* ── Status change ── */
  const handleStatusChange = async (brand, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("brand_status", String(newStatus));
      const brandId = String(brand.id);
      // await apiClient.patch(`/brands/${brandId}/status`, formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      await apiClient.patch(`/brands/${brandId}/status`, {
        brand_status: String(newStatus),
      });
      toast.success(
        `Brand marked ${newStatus === "1" ? "Active" : "Inactive"}`,
      );
      await fetchBrands(currentPage, search);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  /* ── Pagination pages array ── */
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
    // Deduplicate consecutive ellipsis
    return pages.filter((v, i, a) => !(v === "..." && a[i - 1] === "..."));
  };

  // ── Sorting Brands Alphabetically ──
  // const sortedBrands = [...brands].sort((a, b) =>
  //   a.brand_name.localeCompare(b.brand_name),
  // );

  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => a.brand_name.localeCompare(b.brand_name));
  }, [brands]);
  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="brand-page min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 p-6 md:p-8 space-y-8">
      {/* <style>{GLOBAL_STYLES}</style> */}

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
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 font-extrabold tracking-tight text-slate-900 leading-none">
              Brand <span className="grad-text">Management</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {brands.length > 0
                ? `${brands.length} brand${brands.length !== 1 ? "s" : ""} on this page`
                : "Manage all your product brands"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="search-input flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm shadow-sm transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search brands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
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
          Create Brand
        </button>
      </div>

      {/* ════════════════════════════════════════
          STATISTICS CARDS
      ════════════════════════════════════════ */}
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Brands */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50">
            <Tag className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Brands
            </p>
            <p className="text-2xl font-black text-slate-800">
              {totalApiBrands}
            </p>
          </div>
        </div>

        {/* Active Brands (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Brands
            </p>
            <p className="text-2xl font-black text-slate-800">
              {brands.filter((b) => String(b.brand_status) === "1").length}
            </p>
          </div>
        </div>

        {/* Inactive Brands (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inactive Brands
            </p>
            <p className="text-2xl font-black text-slate-800">
              {brands.filter((b) => String(b.brand_status) === "0").length}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MODAL
      ════════════════════════════════════════ */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open && !loading) {
            handleCloseModal();
          } else if (open) {
            setIsModalOpen(true);
          }
        }}
      >
        {" "}
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
                {editingId ? "Update Brand" : "Create New Brand"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-indigo-200 text-sm m-0">
              {editingId
                ? "Update the brand information below"
                : "Fill in the details to add a new brand"}
            </DialogDescription>
          </div>

          {/* Form body */}
          <form
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-5 space-y-5 bg-white"
          >
            {/* Brand Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="e.g. Hershey's, Monin…"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={!!editingId}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                />
              </div>
            </div>

            {/* Brand Logo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Brand Logo
              </label>
              <div className="upload-zone border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center transition-colors duration-300 bg-indigo-50/30">
                <input
                  id="brandLogo"
                  type="file"
                  onChange={handleLogoChange}
                  disabled={loading}
                  className="hidden"
                  accept="image/*"
                />
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <img
                        loading="lazy"
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = noImageUrl || "";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("brandLogo").click()
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="brandLogo"
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
                        Click to upload logo
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
                value={String(brandStatus)}
                onValueChange={setBrandStatus}
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
                    ? "Update Brand"
                    : "Create Brand"}
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
      ) : sortedBrands.length === 0 ? (
        /* ── Empty state ── */
        <div className="fade-in flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
            style={{ background: "linear-gradient(135deg,#e0e7ff,#ede9fe)" }}
          >
            <Tag className="w-9 h-9 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            No Brands Yet
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {search
              ? `No brands match "${search}". Try a different search term.`
              : "You haven't created any brands yet. Add your first one to get started."}
          </p>
          {!search && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Brand
            </button>
          )}
        </div>
      ) : (
        /* ── Cards grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedBrands.map((brand, idx) => {
            const isActive =
              brand.brand_status === 1 || brand.brand_status === "1";
            return (
              <div
                key={brand.id}
                className={`brand-card fade-in fade-in-delay-${(idx % 4) + 1} relative rounded-2xl overflow-hidden border ${
                  isActive
                    ? "bg-white border-slate-100"
                    : "brand-card-inactive border-slate-200 border-dashed"
                }`}
                style={{ animationDelay: `${(idx % 4) * 0.05}s` }}
              >
                {/* Edit button */}
                <button
                  onClick={() => handleEdit(brand)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform duration-150"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                      : "linear-gradient(135deg,#94a3b8,#64748b)",
                  }}
                  title="Edit brand"
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
                    loading="lazy"
                    src={
                      brand.brand_logo
                        ? `${brandImageUrl}${brand.brand_logo}`
                        : noImageUrl
                    }
                    alt={brand.brand_name}
                    onError={(e) => {
                      e.target.src = noImageUrl;
                    }}
                    className="brand-img w-full h-full object-contain p-4"
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
                    title={brand.brand_name}
                  >
                    {brand.brand_name}
                  </h3>

                  {/* Status select toggle */}
                  <Select
                    value={String(brand.brand_status)}
                    onValueChange={(val) => handleStatusChange(brand, val)}
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

export default Brand;
