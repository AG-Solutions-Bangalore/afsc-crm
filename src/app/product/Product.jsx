import React, { useEffect, useState } from "react";
import apiClient from "@/api/apiClient";

const Product = () => {
  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });

  const [imageBase, setImageBase] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");

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

  // ---------------- FETCH ----------------
  const fetchProducts = async (page = 1, searchTerm = "") => {
    try {
      const res = await apiClient.get(
        `/product?page=${page}&search=${searchTerm}`,
      );

      const data = res.data?.data;

      setProducts(data?.data || []);

      setPagination({
        current_page: data?.current_page,
        last_page: data?.last_page,
      });

      setImageBase(res.data?.image_url?.[1]?.image_url || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(1, search);
  }, []);

  // ---------------- SEARCH (debounce) ----------------
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(1, search);
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // ---------------- IMAGE ----------------
  const getImageUrl = (img) => {
    if (!img)
      return "https://afsc.in/afscapi/public/assets/images/no_image.jpg";
    return `${imageBase}${img}`;
  };

  // ---------------- OPEN CREATE ----------------
  const openCreate = () => {
    setForm(initialForm);
    setCreateOpen(true);
  };

  // ---------------- OPEN EDIT ----------------
  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      product_name: product.product_name || "",
      product_brand: product.product_brand || "",
      product_price: product.product_price || "",
      product_size: product.product_size || "",
      product_type: product.product_type || "",
      product_veg: product.product_veg || "",
      product_quantity: product.product_quantity || "",
      product_category: product.product_category || "",
      product_sub_category: product.product_sub_category || "",
      product_specification: product.product_specification || "",
      product_self_life: product.product_self_life || "",
      product_country: product.product_country || "",
      product_status: product.product_status || "1",
      product_image: null,
    });

    setEditOpen(true);
  };

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setForm((prev) => ({
        ...prev,
        product_image: file,
      }));
    }
  };

  // ---------------- FORM DATA ----------------
  const buildFormData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "product_image") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return;
      }

      if (value === "" || value === null || value === undefined) return;

      formData.append(key, value);
    });

    return formData;
  };

  // ---------------- CREATE ----------------
  const createProduct = async () => {
    try {
      const formData = buildFormData(form);

      await apiClient.post("/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCreateOpen(false);
      fetchProducts(pagination.current_page, search);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  // ---------------- UPDATE (FIXED) ----------------
  const updateProduct = async () => {
    try {
      if (!editingProduct?.id) return;

      const formData = buildFormData(form);
      formData.append("_method", "PUT");

      await apiClient.post(`/product/${editingProduct.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditOpen(false);
      fetchProducts(pagination.current_page, search);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-64"
        />

        <button
          onClick={() => setSearch("")}
          className="px-3 py-2 bg-gray-300 rounded"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>

                <td className="p-3">
                  <img
                    src={getImageUrl(p.product_image)}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>

                <td className="p-3">{p.product_name}</td>
                <td className="p-3">{p.product_brand}</td>
                <td className="p-3">₹ {p.product_price || "-"}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.product_status === "1"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.product_status === "1" ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 p-4">
          <button
            disabled={pagination.current_page === 1}
            onClick={() => fetchProducts(pagination.current_page - 1, search)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {pagination.current_page} / {pagination.last_page}
          </span>

          <button
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => fetchProducts(pagination.current_page + 1, search)}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* CREATE MODAL */}
      {createOpen && (
        <Modal
          title="Create Product"
          form={form}
          handleChange={handleChange}
          handleFile={handleFile}
          onClose={() => setCreateOpen(false)}
          onSave={createProduct}
        />
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <Modal
          title="Edit Product"
          form={form}
          handleChange={handleChange}
          handleFile={handleFile}
          onClose={() => setEditOpen(false)}
          onSave={updateProduct}
        />
      )}
    </div>
  );
};

// ---------------- MODAL ----------------
const Modal = ({ title, form, handleChange, handleFile, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[500px] p-5 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>

        {[
          "product_name",
          "product_brand",
          "product_price",
          "product_size",
          "product_type",
          "product_veg",
          "product_quantity",
          "product_category",
          "product_sub_category",
          "product_specification",
          "product_self_life",
          "product_country",
        ].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            className="w-full border p-2 mb-2 rounded"
          />
        ))}

        <input type="file" onChange={handleFile} className="w-full mb-3" />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
