import React, { useEffect } from "react";
import { DASHBOARD_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, LandPlot, Boxes, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const StatCard = ({ title, count, icon: Icon, color, link, onClick }) => (
  <Card
    className="cursor-pointer hover:shadow-md transition-all border-l-4 overflow-hidden group"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold">{count}</h3>
        </div>
        <div
          className={`p-3 rounded-xl bg-opacity-10`}
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="w-8 h-8" style={{ color: color }} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
        <span>View Details</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </CardContent>
  </Card>
);

function Dashboard() {
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ["dashboard-data"],
  });

  const dashboardData = response?.data || {};

  useEffect(() => {
    if (response) {
      console.log("Dashboard Data:", response);
    }
  }, [response]);

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  const stats = [
    {
      title: "Brand ",
      count: dashboardData.brand_count || 0,
      icon: Users,
      color: "#3b82f6", // Blue
      link: "/brand",
    },
    {
      title: "Client",
      count: dashboardData.client_count || 0,
      icon: LandPlot,
      color: "#10b981", // Emerald
      link: "/client",
    },
    {
      title: "Product",
      count: dashboardData.product_count || 0,
      icon: Boxes,
      color: "#f59e0b", // Amber
      link: "/product",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} onClick={() => navigate(stat.link)} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
