import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://plants-vigor.onrender.com/api";

export function useBanners() {
  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/banners`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getBannerForSlug = (slug: string) => {
    return banners?.find((b: any) => b.categorySlug === slug)?.image;
  };

  return { banners, isLoading, getBannerForSlug };
}
