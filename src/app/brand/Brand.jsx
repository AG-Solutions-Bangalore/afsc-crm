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

  const [search, setSearch] = useState("");

  // Pagination & Image URLs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [brandImageUrl, setBrandImageUrl] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");

  // =========================
  // FETCH BRANDS (WITH SEARCH)
  // =========================
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

  // initial load
  useEffect(() => {
    fetchBrands(1, search);
  }, []);

  // debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBrands(1, search);
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // =========================
  // PAGE CHANGE
  // =========================
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBrands(newPage, search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =========================
  // LOGO
  // =========================
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrandLogo(file);

      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // =========================
  // SUBMIT
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
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setBrandName("");
    setBrandLogo(null);
    setBrandStatus("1");
    setEditingId(null);
    setLogoPreview(null);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (brand) => {
    setBrandName(brand.brand_name);
    setBrandStatus(String(brand.brand_status));
    setEditingId(brand.id);

    if (brand.brand_logo) {
      setLogoPreview(`${brandImageUrl}${brand.brand_logo}`);
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

  // =========================
  // STATUS CHANGE
  // =========================
  const handleStatusChange = async (brand) => {
    try {
      const formData = new FormData();
      const newStatus = String(brand.brand_status) === "1" ? "0" : "1";

      formData.append("brand_status", newStatus);

      await apiClient.patch(`/brands/${brand.id}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Status updated");
      fetchBrands(currentPage, search);
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
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your product brands
          </p>
        </div>

        <Button onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Brand
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-3">
        <Input
          placeholder="Search brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Button variant="outline" onClick={() => setSearch("")}>
          Clear
        </Button>
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Update Brand" : "Create Brand"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <input type="file" onChange={handleLogoChange} />

            <Select value={brandStatus} onValueChange={setBrandStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* GRID */}
      <div className="grid grid-cols-4 gap-4">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardContent className="p-4">
              <img
                src={
                  brand.brand_logo
                    ? `${brandImageUrl}${brand.brand_logo}`
                    : noImageUrl
                }
                className="h-24 w-full object-contain"
              />

              <h3 className="mt-2 font-semibold">{brand.brand_name}</h3>

              <Button
                size="sm"
                onClick={() => handleEdit(brand)}
                className="mt-2"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>

        <span className="px-3 py-2">
          {currentPage} / {totalPages}
        </span>

        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Brand;
