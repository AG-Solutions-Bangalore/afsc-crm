import apiClient from "@/api/apiClient";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "@/lib/theme-context";
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
  Search,
  X,
  Package,
  Sparkles,
  ImageIcon,
  Camera,
} from "lucide-react";
import "../brand/Brand.css";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";
import Pagination from "@/common/Pagination";
import { useDebouncedSearch } from "@/hooks/useDebounce";

import SkeletonCard from "@/components/SkeletonCard";
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

export const InputField = ({
  label,
  name,
  type = "text",
  value = "",
  required = false,
  onChange,
}) => {
  const { theme } = useTheme();
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.default;
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-all shadow-sm h-auto`}
      />
    </div>
  );
};

export const SelectField = ({
  label,
  name,
  value = "",
  options = [],
  required = false,
  onChange,
}) => {
  const { theme } = useTheme();
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.default;
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 ${currentTheme.focusRing} transition-all shadow-sm`}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

/* -------------------------------------------------
   Main Product component
   ------------------------------------------------- */
const Product = () => {
  const { theme } = useTheme();
  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.default;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Image handling
  const [productImage, setProductImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const initialForm = {
    product_name: "",
    product_brand: "",
    product_price: "",
    product_size: "",
    product_type: "",
    product_veg: "",
    product_quantity: "",
    product_category: "",
    product_sub_category: "",
    product_specification: "",
    product_self_life: "",
    product_country: "",
    product_status: "1",
    product_image: null,
  };
  const [form, setForm] = useState(initialForm);
  const [brands, setBrands] = useState([]);

  const fetchActiveBrands = async () => {
    try {
      const res = await apiClient.get("/activeBrands"); // adjust endpoint if needed
      setBrands(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brands");
    }
  };

  const {
    data: products,
    setData: setProducts,
    pageLoading,
    pagination,
    total,
    imageBase,
    noImageUrl,
    fetchData: fetchProducts,
  } = usePaginatedResource({
    endpoint: "/product",
    resourceName: "products",
    imageKeys: {
      main: "Product",
      fallback: "No Image",
    },
  });
  useEffect(() => {
    // fetchProducts(1, "");
    fetchActiveBrands();
  }, []);

  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearch,
  } = useDebouncedSearch("", 500);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pagination.current_page]);

  // ---------- Search (debounce) ---------

  // ---------- Pagination ----------
  // const handlePageChange = async (newPage) => {
  //   if (newPage >= 1 && newPage <= pagination.last_page) {
  //     await fetchProducts(newPage, searchTerm);
  //   }
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  useEffect(() => {
    fetchProducts(1, debouncedSearch);
  }, [debouncedSearch]);
  // ---------- Form helpers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const buildFormData = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "product_image") {
        if (productImage instanceof File) fd.append(k, productImage);
      } else if (v !== "" && v != null) {
        fd.append(k, v);
      }
    });
    return fd;
  };

  // ---------- Create ----------
  const createProduct = async () => {
    if (!form.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }
    setLoading(true);
    try {
      const fd = buildFormData(form);

      await apiClient.post("/product", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product created successfully");
      setIsModalOpen(false);
      await fetchProducts(pagination.current_page, searchTerm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Update ----------
  const updateProduct = async () => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      const fd = buildFormData(form);
      fd.append("_method", "PUT");
      await apiClient.post(`/product/${editingProduct.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully");
      setIsModalOpen(false);
      await fetchProducts(pagination.current_page, searchTerm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };
  // ---------- Open / Close modal ----------
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(initialForm);
    setProductImage(null);
    setLogoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      product_name: product.product_name ?? "",
      product_brand: product.product_brand ?? "",
      product_price: product.product_price ?? "",
      product_size: product.product_size ?? "",
      product_type: product.product_type ?? "",
      product_veg: product.product_veg ?? "",
      product_quantity: product.product_quantity ?? "",
      product_category: product.product_category ?? "",
      product_sub_category: product.product_sub_category ?? "",
      product_specification: product.product_specification ?? "",
      product_self_life: product.product_self_life ?? "",
      product_country: product.product_country ?? "",
      product_status: String(product.product_status ?? "1"),
      product_image: null,
    });
    // Set preview if image exists
    if (product.product_image) {
      setLogoPreview(
        `${imageBase}${
          typeof product.product_image === "object"
            ? product.product_image.url || ""
            : product.product_image
        }`,
      );
    } else {
      setLogoPreview(null);
    }
    setProductImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!loading) {
      setForm(initialForm);
      setEditingProduct(null);
      setProductImage(null);
      setLogoPreview(null);
      setIsModalOpen(false);
    }
  };

  // ---------- Status Update ----------
  const updateProductStatus = async (product, newStatus) => {
    // Optimistic UI update
    const updatedProducts = products.map((p) =>
      p.id === product.id ? { ...p, product_status: newStatus } : p,
    );
    setProducts(updatedProducts);

    try {
      const fd = new FormData();
      fd.append("product_status", newStatus);
      // await apiClient.patch(`/products/${product.id}/status`, fd, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      await apiClient.patch(`/products/${product.id}/status`, {
        product_status: String(newStatus),
      });
      toast.success(
        `Product marked ${newStatus === "1" ? "Active" : "Inactive"}`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
      await fetchProducts(pagination.current_page, searchTerm); // rollback
    }
  };

  // ── Sorting Products Alphabetically ──
  const sortedProducts = [...products].sort((a, b) =>
    a.product_name.localeCompare(b.product_name),
  );

  /* -------------------- UI -------------------- */
  return (
    <div
      className={`product-page min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} p-6 md:p-8 space-y-8`}
    >
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
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            }}
          >
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 font-extrabold tracking-tight text-slate-900 leading-none">
              Product{" "}
              <span
                style={{
                  color: currentTheme.primary,
                }}
              >
                Management
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {products.length > 0
                ? `${products.length} product${products.length !== 1 ? "s" : ""} on this page`
                : "Manage all your products"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="search-input flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm shadow-sm transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search products…"
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
          onClick={openCreateModal}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg ${currentTheme.shadowHover} hover:shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0`}
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
          }}
        >
          <Plus className="w-4 h-4" />
          Create Product
        </button>
      </div>

      {/* ════════════════════════════════════════
          STATISTICS CARDS
      ════════════════════════════════════════ */}
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentTheme.bgLight}`}
          >
            <Package
              className="w-6 h-6"
              style={{ color: currentTheme.primary }}
            />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Total Products
            </p>
            <p className="text-2xl font-black text-slate-800">{total}</p>
          </div>
        </div>

        {/* Active Products (Current View) */}
        <div
          id="stats-cards"
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Active Products
            </p>
            <p className="text-2xl font-black text-slate-800">
              {products.filter((p) => String(p.product_status) === "1").length}
            </p>
          </div>
        </div>

        {/* Inactive Products (Current View) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: currentTheme.secondary }}
            >
              Inactive Products
            </p>
            <p className="text-2xl font-black text-slate-800">
              {products.filter((p) => String(p.product_status) === "0").length}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MODAL
      ════════════════════════════════════════ */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="w-full max-w-4xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {/* Gradient strip */}
          <div
            className="modal-strip px-5 pt-8 pb-5 sticky top-0 z-10 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 60%, ${currentTheme.light} 100%)`,
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                {editingProduct ? (
                  <Edit2 className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-white m-0">
                {editingProduct ? "Update Product" : "Create New Product"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-indigo-200 text-sm m-0">
              {editingProduct
                ? "Update the product information below"
                : "Fill in the details to create a new product"}
            </DialogDescription>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingProduct ? updateProduct() : createProduct();
            }}
            className="px-6 pb-6 pt-5 space-y-5 bg-white"
          >
            {/* Form fields */}
            <InputField
              label="Product Name"
              name="product_name"
              required
              value={form.product_name}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Brand <span className="text-red-500">*</span>
                </Label>
                <select
                  name="product_brand"
                  value={form.product_brand}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.brand_name}>
                      {b.brand_name}
                    </option>
                  ))}
                </select>
              </div>
              <InputField
                label="Price"
                name="product_price"
                type="number"
                value={form.product_price}
                onChange={handleChange}
              />
              <InputField
                label="Size"
                name="product_size"
                value={form.product_size}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Product Type"
                name="product_type"
                value={form.product_type}
                options={["Dairy", "Dry", "Frozen"]}
                onChange={handleChange}
              />
              <SelectField
                label="Veg / Non Veg"
                name="product_veg"
                value={form.product_veg}
                options={["Veg", "Non Veg"]}
                onChange={handleChange}
              />
              <InputField
                label="Quantity"
                name="product_quantity"
                value={form.product_quantity}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Category"
                name="product_category"
                value={form.product_category}
                onChange={handleChange}
              />
              <InputField
                label="Sub Category"
                name="product_sub_category"
                value={form.product_sub_category}
                onChange={handleChange}
              />
            </div>

            <InputField
              label="Specification"
              name="product_specification"
              value={form.product_specification}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Self Life"
                name="product_self_life"
                value={form.product_self_life}
                onChange={handleChange}
              />
              <InputField
                label="Country"
                name="product_country"
                value={form.product_country}
                onChange={handleChange}
              />
            </div>

            {/* Image upload */}
            <div className="space-y-1.5">
              <Label
                htmlFor="product_image"
                className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Product Image
              </Label>
              <div className="upload-zone border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center transition-colors duration-300 bg-indigo-50/30">
                <input
                  id="product_image"
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
                        document.getElementById("product_image").click()
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Change Image
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="product_image"
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
            {editingProduct && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.product_status}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, product_status: v }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-300 focus:border-indigo-400 text-sm h-11 shadow-sm">
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
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
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
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
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
      ) : sortedProducts.length === 0 ? (
        /* ── Empty state ── */
        <div className="fade-in flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-xl"
            style={{ background: "linear-gradient(135deg,#e0e7ff,#ede9fe)" }}
          >
            <Package className="w-9 h-9 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            No Products Yet
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {searchTerm
              ? `No products match "${searchTerm}". Try a different search term.`
              : "You haven't added any products yet. Add your first one to get started."}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Product
            </button>
          )}
        </div>
      ) : (
        /* ── Cards grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedProducts.map((product, idx) => {
            const isActive =
              product.product_status === 1 || product.product_status === "1";
            return (
              <div
                key={product.id}
                className={`product-card fade-in relative rounded-2xl overflow-hidden border ${
                  isActive
                    ? "bg-white border-slate-100"
                    : "product-card-inactive border-slate-200 border-dashed"
                }`}
                style={{
                  animation: `fadeInUp 0.4s ease ${(idx % 4) * 0.05}s both`,
                }}
              >
                {/* Edit button */}
                <button
                  onClick={() => openEditModal(product)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform duration-150"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                      : "linear-gradient(135deg,#94a3b8,#64748b)",
                  }}
                  title="Edit product"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Product Type Badge */}
                {product.product_type && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg text-white shadow-sm"
                      style={{
                        background: "linear-gradient(135deg,#10b981,#059669)",
                      }}
                    >
                      {product.product_type}
                    </span>
                  </div>
                )}

                {/* Image section */}
                <div
                  className="h-44 w-full overflow-hidden flex items-center justify-center relative"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #f8f9ff 0%, #f0f0fb 100%)"
                      : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  }}
                >
                  <img
                    src={
                      product.product_image
                        ? `${imageBase}${
                            typeof product.product_image === "object"
                              ? product.product_image.url || ""
                              : product.product_image
                          }`
                        : noImageUrl
                    }
                    alt={product.product_name}
                    onError={(e) => {
                      e.target.src = noImageUrl;
                    }}
                    className="product-img w-full h-full object-contain p-4"
                  />
                </div>

                {/* Info strip */}
                <div className="px-4 pt-3 pb-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-bold text-sm truncate flex-1 ${
                        isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                      title={product.product_name}
                    >
                      {product.product_name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        product.product_veg === "Veg"
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-red-700 bg-red-50 border-red-200"
                      }`}
                    >
                      {product.product_veg}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
                    {product.product_brand || "No Brand"}
                  </p>
                </div>

                {/* Bottom strip with toggle */}
                <div
                  className={`px-4 py-3 flex items-center justify-between gap-2 border-t mt-2 ${
                    isActive
                      ? "border-slate-100"
                      : "border-slate-200 bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-700">
                    {product.product_price
                      ? `₹${product.product_price}`
                      : "N/A"}
                  </div>

                  {/* Status select toggle */}
                  <Select
                    value={String(product.product_status)}
                    onValueChange={(val) => updateProductStatus(product, val)}
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

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        loading={pageLoading}
        onPageChange={(page) => {
          window.scrollTo({ top: 0, behavior: "auto" });

          setTimeout(() => {
            fetchProducts(page, debouncedSearch);
          }, 0);
        }}
      />
    </div>
  );
};

export default Product;
