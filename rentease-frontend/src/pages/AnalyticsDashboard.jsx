import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Download, Calendar, RefreshCw } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  AvgRentBySuburb,
  PropertyTypeDistribution,
  ListingsByCity,
  RentRangeDistribution,
  BedroomDistribution,
  RentTrend,
  PriceVsBedrooms,
  VacancyRateByCity,
} from "../components/charts/AnalyticsCharts";

export default function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applied, setApplied] = useState({});

  const params = {
    ...(applied.startDate ? { startDate: applied.startDate } : {}),
    ...(applied.endDate ? { endDate: applied.endDate } : {}),
  };

  // All 8 analytics queries
  const q1 = useQuery({
    queryKey: ["analytics", "avg-rent", params],
    queryFn: () =>
      api.get("/analytics/avg-rent-by-suburb", { params }).then((r) => r.data),
  });
  const q2 = useQuery({
    queryKey: ["analytics", "type-dist", params],
    queryFn: () =>
      api.get("/analytics/property-type-dist", { params }).then((r) => r.data),
  });
  const q3 = useQuery({
    queryKey: ["analytics", "by-city", params],
    queryFn: () =>
      api.get("/analytics/listings-by-city", { params }).then((r) => r.data),
  });
  const q4 = useQuery({
    queryKey: ["analytics", "rent-range", params],
    queryFn: () =>
      api
        .get("/analytics/rent-range-distribution", { params })
        .then((r) => r.data),
  });
  const q5 = useQuery({
    queryKey: ["analytics", "bedrooms", params],
    queryFn: () =>
      api
        .get("/analytics/bedroom-distribution", { params })
        .then((r) => r.data),
  });
  const q6 = useQuery({
    queryKey: ["analytics", "trend", params],
    queryFn: () =>
      api.get("/analytics/rent-trend", { params }).then((r) => r.data),
  });
  const q7 = useQuery({
    queryKey: ["analytics", "scatter", params],
    queryFn: () =>
      api.get("/analytics/price-vs-bedrooms", { params }).then((r) => r.data),
  });
  const q8 = useQuery({
    queryKey: ["analytics", "vacancy", params],
    queryFn: () =>
      api
        .get("/analytics/vacancy-rate-by-city", { params })
        .then((r) => r.data),
  });

  // Platform stats (admin only)
  const statsQ = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => api.get("/analytics/platform-stats").then((r) => r.data),
    enabled: user?.role === "admin",
  });

  const isLoading = q1.isLoading || q2.isLoading || q3.isLoading;

  const handleApplyFilter = () => {
    setApplied({ startDate, endDate });
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setApplied({});
  };

  const handleExportCSV = async () => {
    try {
      const rows = [
        ["Metric", "Value"],
        ["Total Users", statsQ.data?.data?.users || "N/A"],
        ["Total Properties", statsQ.data?.data?.properties || "N/A"],
        ["Total Applications", statsQ.data?.data?.applications || "N/A"],
        ["Total Bookings", statsQ.data?.data?.bookings || "N/A"],
        [],
        ["Suburb", "Avg Weekly Rent (AUD)"],
        ...(q1.data?.data || []).map((d) => [d._id, Math.round(d.avgRent)]),
        [],
        ["Property Type", "Count"],
        ...(q2.data?.data || []).map((d) => [d._id, d.count]),
        [],
        ["City", "Listings"],
        ...(q3.data?.data || []).map((d) => [d._id, d.count]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RentEase_Analytics.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const stats = statsQ.data?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Analytics Dashboard</h1>
          <p className="section-subtitle">
            Data insights from{" "}
            {user?.role === "admin" ? "the entire platform" : "your listings"}.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="secondary" size="sm">
          <Download size={15} className="mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="card p-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Calendar size={16} className="text-primary-800" />
          Date Range Filter
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field text-sm py-1.5 w-36"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field text-sm py-1.5 w-36"
          />
        </div>
        <Button size="sm" onClick={handleApplyFilter}>
          Apply Filter
        </Button>
        {(applied.startDate || applied.endDate) && (
          <button
            onClick={handleClearFilter}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <RefreshCw size={13} /> Clear
          </button>
        )}
        {(applied.startDate || applied.endDate) && (
          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
            Filter active: {applied.startDate || "..."} →{" "}
            {applied.endDate || "..."}
          </span>
        )}
      </div>

      {/* Platform Stats — Admin only */}
      {user?.role === "admin" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.users,
              color: "bg-blue-50   text-blue-800",
            },
            {
              label: "Live Properties",
              value: stats.properties,
              color: "bg-green-50  text-green-800",
            },
            {
              label: "Applications",
              value: stats.applications,
              color: "bg-purple-50 text-purple-800",
            },
            {
              label: "Bookings",
              value: stats.bookings,
              color: "bg-orange-50 text-orange-800",
            },
          ].map((s) => (
            <div key={s.label} className={`card p-4 text-center ${s.color}`}>
              <p className="text-3xl font-bold">{s.value ?? "—"}</p>
              <p className="text-xs font-medium mt-1 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400 mt-3">
            Loading analytics data...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Row 1 — Avg Rent + Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AvgRentBySuburb data={q1.data?.data} />
            <PropertyTypeDistribution data={q2.data?.data} />
          </div>

          {/* Row 2 — Listings by City + Rent Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ListingsByCity data={q3.data?.data} />
            <RentRangeDistribution data={q4.data?.data} />
          </div>

          {/* Row 3 — Bedrooms + Rent Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <BedroomDistribution data={q5.data?.data} />
            <RentTrend data={q6.data?.data} />
          </div>

          {/* Row 4 — Scatter + Vacancy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PriceVsBedrooms data={q7.data?.data} />
            <VacancyRateByCity data={q8.data?.data} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !q1.data?.data?.length && (
        <div className="text-center py-16">
          <BarChart2 size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No analytics data yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Import properties and add listings to see insights here.
          </p>
        </div>
      )}
    </div>
  );
}
