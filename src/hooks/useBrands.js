import { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/api/apiClient";

const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);  
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

  return {
    brands,
    loading,
    fetchBrands,
  };
  

export default useBrands;