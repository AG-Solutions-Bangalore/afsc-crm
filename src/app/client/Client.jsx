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
import LoadingBars from "@/components/loader/loading-bar";
const Client = () => {
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState(null);
  const [clientStatus, setClientStatus] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  // Pagination & Image URLs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  // const handlePageChange = (newPage) => {
  //   if (newPage >= 1 && newPage <= totalPages) {

  //   }
  // };
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
  // ---------- Update client status via dropdown ----------
  // const updateClientStatus = async (client, newStatus) => {
  //   try {
  //     const fd = new FormData();
  //     fd.append("client_status", newStatus);
  //     // Use full external URL as requested
  //     await apiClient.patch(`/client/${client.id}/status`, fd, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     toast.success("Status updated");
  //     fetchClients(currentPage, searchTerm);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to update status");
  //   }
  // };
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
  // Debounce search
  // useEffect(() => {
  //   const timer = setTimeout(() => fetchClients(1, searchTerm), 300);
  //   return () => clearTimeout(timer);
  // }, [searchTerm]);
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-1/2">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage all your clients</p>
        </div>
        <div className="flex w-full lg:w-full items-center gap-2 ml-20">
          <Input
            type="text"
            placeholder="Search clients ..."
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
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Client
        </Button>
      </div>
      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingId ? "Update Client" : "Create New Client"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the client information below"
                : "Fill in the details to create a new client"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={loading}
                className="border-gray-200"
              />
            </div>
            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="clientImage" className="text-sm font-medium">
                Client Image
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
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
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.target.src = noImageUrl || "";
                      }}
                    />
                    <label htmlFor="clientImage">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("clientImage").click()
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Change Image
                      </button>
                    </label>
                  </div>
                ) : (
                  <label htmlFor="clientImage" className="cursor-pointer">
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
              <Label htmlFor="clientStatus" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(clientStatus)}
                onValueChange={setClientStatus}
                disabled={loading}
              >
                <SelectTrigger id="clientStatus">
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading
                ? "Processing..."
                : editingId
                  ? "Update Client"
                  : "Create Client"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Grid */}
      {pageLoading ? (
        <LoadingBars />
      ) : clients.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No clients created yet</p>
            <Button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client) => (
            <Card
              key={client.id}
              className={`hover:shadow-lg transition-all overflow-hidden group relative ${
                String(client.client_status) === "0"
                  ? "bg-gray-100 border-gray-300 opacity-70"
                  : "bg-white border-gray-200"
              }`}
            >
              <Button
                onClick={() => handleEdit(client)}
                className="absolute top-2 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 h-9 w-9 shadow-lg"
                variant="ghost"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <CardContent className="p-0">
                <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden">
                  {client.client_image ? (
                    <img
                      src={`${clientImageUrl}${client.client_image}`}
                      alt={client.client_name}
                      onError={(e) => {
                        e.target.src = noImageUrl;
                      }}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={noImageUrl}
                      alt="No Image"
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {client.client_name}
                    </h3>
                    {/* Status dropdown */}
                    <Select
                      value={String(client.client_status)}
                      onValueChange={async (v) => {
                        await updateClientStatus(client, v);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className="w-[120px]"
                        id={`status-${client.id}`}
                      >
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Pagination */}
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
              const isNear =
                pageNum === currentPage || Math.abs(pageNum - currentPage) <= 1;
              const showEllipsis =
                i > 0 && pageNum === currentPage - 2 && currentPage > 2;
              if (pageNum > totalPages - 2 && currentPage <= totalPages - 3) {
                if (pageNum === totalPages - 2) {
                  return (
                    <span key="ellipsis-end" className="text-muted-foreground">
                      ...
                    </span>
                  );
                }
              }
              if (isNear || pageNum === 1 || pageNum === totalPages) {
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
                  <span key="ellipsis-mid" className="text-muted-foreground">
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
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};
export default Client;
