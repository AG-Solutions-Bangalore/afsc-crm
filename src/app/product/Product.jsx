import React, { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";
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
} from "lucide-react";

import LoadingBars from "@/components/loader/loading-bar";

/* -------------------------------------------------
   Reusable form helpers – defined outside the component
   ------------------------------------------------- */
export const InputField = ({
  label,
  name,
  type = "text",
  value = "",
  required = false,
  onChange,
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="border-gray-200"
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
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border rounded-md"
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
   Main Product component – styled like Client page
   ------------------------------------------------- */
const Product = () => {
  /* -------------------- STATE -------------------- */
  const [products, setProducts] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [imageBase, setImageBase] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Image handling (mirrors Client component)
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
  }, []);

  // ---------- Search (debounce) ----------
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(1, searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ---------- Pagination ----------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchProducts(newPage, searchTerm);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      await apiClient.post("/product", fd);
      toast.success("Product created");
      setIsModalOpen(false);
      fetchProducts(pagination.current_page, searchTerm);
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
      await apiClient.post(`/product/${editingProduct.id}`, fd);
      toast.success("Product updated");
      setIsModalOpen(false);
      fetchProducts(pagination.current_page, searchTerm);
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
    if (product.product_image) {
      setLogoPreview(`${imageBase}${product.product_image}`);
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

  // ---------- Toggle status ----------
  const toggleStatus = async (product) => {
    const newStatus = String(product.product_status) === "1" ? "0" : "1";
    try {
      const fd = new FormData();
      fd.append("product_status", newStatus);
      await apiClient.patch(`/products/${product.id}/status`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Status updated");
      fetchProducts(pagination.current_page, searchTerm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-1/2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage all your products</p>
        </div>
        {/* Search bar */}
        <div className="flex w-full lg:w-auto items-center gap-2 ml-20">
          <Input
            placeholder="Search products ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md border-gray-200"
          />
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="gap-2"
            >
              Clear
            </Button>
          )}
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Product
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? "Update Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product information below"
                : "Fill in the details to create a new product"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingProduct ? updateProduct() : createProduct();
            }}
            className="space-y-4"
          >
            {/* Form fields */}
            <InputField
              label="Product Name"
              name="product_name"
              required
              value={form.product_name}
              onChange={handleChange}
            />
            <InputField
              label="Brand"
              name="product_brand"
              value={form.product_brand}
              onChange={handleChange}
            />
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
            <InputField
              label="Specification"
              name="product_specification"
              value={form.product_specification}
              onChange={handleChange}
            />
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

            {/* Image upload – preview similar to Client */}
            <div className="space-y-2">
              <Label htmlFor="product_image" className="text-sm font-medium">
                Product Image
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
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
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.target.src = noImageUrl || "";
                      }}
                    />
                    <label htmlFor="product_image" className="cursor-pointer">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("product_image").click()
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Change Image
                      </button>
                    </label>
                  </div>
                ) : (
                  <label htmlFor="product_image" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or GIF (Max. 5MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="product_status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={form.product_status}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, product_status: v }))
                }
                disabled={loading}
              >
                <SelectTrigger id="product_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                onClick={closeModal}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Grid */}
      {pageLoading ? (
        <LoadingBars />
      ) : products.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No products created yet
            </p>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="relative hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden group"
            >
              {/* Edit button – top‑right */}
              <Button
                onClick={() => openEditModal(product)}
                className="absolute top-2 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-9 w-9 shadow-lg"
                variant="ghost"
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              <CardContent className="p-0">
                {/* Image */}
                <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden">
                  {product.product_image ? (
                    <img
                      src={`${imageBase}${
                        typeof product.product_image === "object"
                          ? product.product_image.url || ""
                          : product.product_image
                      }`}
                      alt={product.product_name}
                      onError={(e) => {
                        e.target.src = noImageUrl;
                      }}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={noImageUrl}
                      alt="No image"
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {product.product_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.product_brand}
                  </p>
                  <p className="mt-1 text-primary font-medium">
                    ₹ {product.product_price}
                  </p>

                  {/* Status badge – click toggles */}
                  <div
                    className="mt-2 flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleStatus(product)}
                  >
                    {String(product.product_status) === "1" ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1 || pageLoading}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.last_page }).map((_, i) => {
              const pageNum = i + 1;
              const isNear =
                pageNum === pagination.current_page ||
                Math.abs(pageNum - pagination.current_page) <= 1;
              const showEllipsis =
                i > 0 &&
                pageNum === pagination.current_page - 2 &&
                pagination.current_page > 2;

              // ellipsis near the end
              if (
                pageNum > pagination.last_page - 2 &&
                pagination.current_page <= pagination.last_page - 3
              ) {
                if (pageNum === pagination.last_page - 2) {
                  return (
                    <span key="ellipsis-end" className="text-muted-foreground">
                      …
                    </span>
                  );
                }
              }

              if (isNear || pageNum === 1 || pageNum === pagination.last_page) {
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={pageLoading}
                    variant={
                      pageNum === pagination.current_page
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className={
                      pageNum === pagination.current_page
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                  >
                    {pageNum}
                  </Button>
                );
              } else if (showEllipsis) {
                return (
                  <span key="ellipsis-mid" className="text-muted-foreground">
                    …
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={
              pagination.current_page === pagination.last_page || pageLoading
            }
            variant="outline"
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Page info */}
      {pagination.last_page > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {pagination.current_page} of {pagination.last_page}
        </div>
      )}
    </div>
  );
};

export default Product;
