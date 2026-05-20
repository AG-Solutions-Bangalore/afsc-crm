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
} from "lucide-react";

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [brandStatus, setBrandStatus] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Pagination & Image URLs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [brandImageUrl, setBrandImageUrl] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");

  // =========================
  // FETCH BRANDS
  // =========================
  const fetchBrands = async (page = 1) => {
    try {
      setPageLoading(true);
      const response = await apiClient.get(`/brand?page=${page}`);
      const responseData = response.data.data;

      setBrands(responseData.data);
      setCurrentPage(responseData.current_page);
      setTotalPages(responseData.last_page);

      // Extract image URLs
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

      console.log("Brands loaded:", responseData.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch brands");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(1);
  }, []);

  // =========================
  // HANDLE PAGE CHANGE
  // =========================
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBrands(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =========================
  // HANDLE LOGO CHANGE
  // =========================
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrandLogo(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================
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

      if (brandLogo) {
        formData.append("brand_logo", brandLogo);
      }

      if (editingId) {
        // IMPORTANT FIX FOR YOUR BACKEND
        formData.append("_method", "PUT");

        await apiClient.post(`/brand/${editingId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Brand updated successfully");
      } else {
        await apiClient.post("/brand", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Brand created successfully");
      }

      resetForm();
      setIsModalOpen(false);
      fetchBrands(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setBrandName("");
    setBrandLogo(null);
    setBrandStatus("1"); // Always reset to string "1"
    setEditingId(null);
    setLogoPreview(null); // Clear any existing preview
  };

  // =========================
  // OPEN MODAL FOR EDIT
  // =========================
  const handleEdit = (brand) => {
    setBrandName(brand.brand_name);
    // Ensure status is always a string (API might return number)
    setBrandStatus(String(brand.brand_status));
    setEditingId(brand.id);
    // Set logo preview for edit mode
    if (brand.brand_logo) {
      setLogoPreview(`${brandImageUrl}${brand.brand_logo}`);
    } else {
      // Clear preview if no logo exists
      setLogoPreview(null);
    }
    setIsModalOpen(true);
  };

  // =========================
  // OPEN MODAL FOR CREATE
  // =========================
  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleCloseModal = () => {
    if (!loading) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  // =========================
  // CHANGE STATUS
  // =========================
  const handleStatusChange = async (brand) => {
    try {
      const formData = new FormData();
      // Ensure we're comparing and setting as strings
      const newStatus = String(brand.brand_status) === "1" ? "0" : "1";
      formData.append("brand_status", newStatus);

      await apiClient.patch(`/brands/${brand.id}/status`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Status updated");
      fetchBrands(currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your product brands
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Brand
        </Button>
      </div>

      {/* MODAL DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingId ? "Update Brand" : "Create New Brand"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the brand information below"
                : "Fill in the details to create a new brand"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BRAND NAME */}
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-sm font-medium">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brandName"
                placeholder="Enter brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={loading}
                className="border-gray-200"
              />
            </div>

            {/* BRAND LOGO */}
            <div className="space-y-2">
              <Label htmlFor="brandLogo" className="text-sm font-medium">
                Brand Logo
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
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
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        // Fallback if preview URL fails to load
                        e.target.src = noImageUrl || "";
                      }}
                    />
                    <label htmlFor="brandLogo">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("brandLogo").click()
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Change Logo
                      </button>
                    </label>
                  </div>
                ) : (
                  <label htmlFor="brandLogo" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or GIF (Max. 5MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* BRAND STATUS */}
            <div className="space-y-2">
              <Label htmlFor="brandStatus" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(brandStatus)}
                onValueChange={setBrandStatus}
              >
                <SelectTrigger id="brandStatus" disabled={loading}>
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

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading
                ? "Processing..."
                : editingId
                  ? "Update Brand"
                  : "Create Brand"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* BRANDS GRID */}
      {brands.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No brands created yet
              </p>
              <Button
                onClick={handleOpenCreateModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="hover:shadow-lg transition-all border border-gray-200 overflow-hidden group relative"
            >
              {/* EDIT BUTTON - TOP RIGHT */}
              <Button
                onClick={() => handleEdit(brand)}
                className="absolute top-2 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-9 w-9 shadow-lg"
                variant="ghost"
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              <CardContent className="p-0">
                {/* Logo Section */}
                <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden">
                  {brand.brand_logo ? (
                    <img
                      src={`${brandImageUrl}${brand.brand_logo}`}
                      alt={brand.brand_name}
                      onError={(e) => {
                        e.target.src = noImageUrl;
                      }}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={noImageUrl}
                      alt="No Logo"
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 flex-1">
                      {brand.brand_name}
                    </h3>
                    {brand.brand_status === "1" ? (
                      <div className="flex items-center gap-0.5 whitespace-nowrap">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 whitespace-nowrap">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || pageLoading}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isNearCurrent =
                pageNum === currentPage || Math.abs(pageNum - currentPage) <= 1;
              const showEllipsis =
                i > 0 && pageNum === currentPage - 2 && currentPage > 2;

              if (pageNum > totalPages - 2 && currentPage <= totalPages - 3) {
                if (pageNum === totalPages - 2) {
                  return (
                    <span key={`ellipsis-1`} className="text-muted-foreground">
                      ...
                    </span>
                  );
                }
              }

              if (isNearCurrent || pageNum === 1 || pageNum === totalPages) {
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={pageLoading}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className={
                      pageNum === currentPage
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                  >
                    {pageNum}
                  </Button>
                );
              } else if (showEllipsis) {
                return (
                  <span key={`ellipsis-${i}`} className="text-muted-foreground">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || pageLoading}
            variant="outline"
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* PAGE INFO */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};

export default Brand;
