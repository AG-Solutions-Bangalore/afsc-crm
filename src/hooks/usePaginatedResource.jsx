import { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/api/apiClient";

export const usePaginatedResource = ({
  endpoint,
  resourceName = "items",
  imageKeys = {},
  transformResponse,
}) => {
  const [data, setData] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [total, setTotal] = useState(0);

  const [imageBase, setImageBase] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");

  const fetchData = async (page = 1, search = "") => {
    setPageLoading(true);

    try {
      const res = await apiClient.get(
        `${endpoint}?page=${page}&search=${search}`,
      );

      const responseData = res.data?.data;

      const list = responseData?.data || [];

      setData(list);

      setPagination({
        current_page: responseData?.current_page || 1,
        last_page: responseData?.last_page || 1,
      });

      setTotal(responseData?.total || list.length);

      // optional custom transform (VERY useful for different APIs)
      if (transformResponse) {
        transformResponse(res.data);
      }

      // generic image handling
      if (res.data?.image_url && imageKeys) {
        const main = res.data.image_url.find(
          (i) => i.image_for === imageKeys.main,
        )?.image_url;

        const fallback = res.data.image_url.find(
          (i) => i.image_for === imageKeys.fallback,
        )?.image_url;

        if (main) setImageBase(main);
        if (fallback) setNoImageUrl(fallback);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to fetch ${resourceName}`);
    } finally {
      setPageLoading(false);
    }
  };

  return {
    data,
    setData,
    pageLoading,
    pagination,
    total,
    imageBase,
    noImageUrl,
    fetchData,
  };
};
