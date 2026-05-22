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
  Package,
  Sparkles,
  ImageIcon,
  Camera,
} from "lucide-react";

/* ─── Inline styles injected once ─────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  .product-page * { font-family: 'Inter', system-ui, sans-serif; }
  
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
  
  /* ── Pulse dot ── */
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .pulse-ring::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    animation: pulse-ring 1.6s ease-out infinite;
  }
  .pulse-active::after  { background: #22c55e; }
  .pulse-inactive::after { background: #ef4444; }
  
  /* ── Card hover lift ── */
  .product-card {
    transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                box-shadow 0.25s cubic-bezier(.22,1,.36,1),
                background 0.3s ease,
                opacity 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-5px) scale(1.015);
    box-shadow: 0 20px 60px rgba(99,102,241,.18), 0 4px 16px rgba(0,0,0,.06);
  }
  
  /* ── Image zoom ── */
  .product-img { transition: transform 0.4s cubic-bezier(.22,1,.36,1), filter 0.3s ease; }
  .product-card:hover .product-img { transform: scale(1.08); }
  
  /* ── Inactive card grayscale ── */
  .product-card-inactive { background: #f4f5f7 !important; }
  .product-card-inactive .product-img { filter: grayscale(80%) opacity(0.6); }
  .product-card-inactive:hover .product-img { filter: grayscale(40%) opacity(0.8); }
  
  /* ── Status select on card ── */
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

/* -------------------------------------------------
   Reusable form helpers
   ------------------------------------------------- */
export const InputField = ({
  label,
  name,
  type = "text",
  value = "",
  required = false,
  onChange,
}) => (
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
      className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm h-auto"
    />
  </div>
);

export const SelectField = ({
  label,
  name,
  value = "",
  options = [],
  required = false,
  onChange,
}) => (
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
      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
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

/* -------------------------------------------------
   Main Product component
   ------------------------------------------------- */
const Product = () => {
  /* -------------------- STATE -------------------- */
  const [products, setProducts] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [totalApiProducts, setTotalApiProducts] = useState(0);

  const [imageBase, setImageBase] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  /* -------------------- FETCH -------------------- */
  const fetchProducts = async (page = 1, term = "") => {
    setPageLoading(true);
    try {
      const res = await apiClient.get(`/product?page=${page}&search=${term}`);
      const data = res.data?.data;
      setProducts(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
      });

      // Capture total from API if available
      setTotalApiProducts(data?.total || (data?.data || []).length);

      // Image base URLs (product & fallback)
      if (res.data?.image_url) {
        const prodUrl = res.data.image_url.find(
          (i) => i.image_for === "Product",
        )?.image_url;
        const noImg = res.data.image_url.find(
          (i) => i.image_for === "No Image",
        )?.image_url;
        if (prodUrl) setImageBase(prodUrl);
        if (noImg) setNoImageUrl(noImg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, "");
    fetchActiveBrands();
  }, []);

  // ---------- Search (debounce) ----------
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1, searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ---------- Pagination ----------
  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
   

      await fetchProducts(newPage, searchTerm);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      await apiClient.patch(`/products/${product.id}/status`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
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

  /* ── Pagination pages array ── */
  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= pagination.last_page; i++) {
      if (
        i === 1 ||
        i === pagination.last_page ||
        Math.abs(i - pagination.current_page) <= 1
      ) {
        pages.push(i);
      } else if (
        (i === pagination.current_page - 2 && pagination.current_page > 3) ||
        (i === pagination.current_page + 2 &&
          pagination.current_page < pagination.last_page - 2)
      ) {
        pages.push("...");
      }
    }
    return pages.filter((v, i, a) => !(v === "..." && a[i - 1] === "..."));
  };

  // ── Sorting Products Alphabetically ──
  const sortedProducts = [...products].sort((a, b) =>
    a.product_name.localeCompare(b.product_name),
  );

  /* -------------------- UI -------------------- */
  return (
    <div className="product-page min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 p-6 md:p-8 space-y-8">
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
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 font-extrabold tracking-tight text-slate-900 leading-none">
              Product <span className="grad-text">Management</span>
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-indigo-300 hover:shadow-xl transition-all duration-200 active:scale-95 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </p>
            <p className="text-2xl font-black text-slate-800">
              {totalApiProducts}
            </p>
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
          {/* Gradient strip */}
          <div className="modal-strip px-6 pt-6 pb-5 sticky top-0 z-10 shadow-sm">
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
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
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

      {/* ════════════════════════════════════════
          PAGINATION
      ════════════════════════════════════════ */}
      {pagination.last_page > 1 && (
        <div className="fade-in flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || pageLoading}
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
                      page === pagination.current_page
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
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={
                pagination.current_page === pagination.last_page || pageLoading
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-600">
              {pagination.current_page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {pagination.last_page}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Product;
