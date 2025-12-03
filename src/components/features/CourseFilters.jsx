"use client";

import { Search } from "lucide-react";
import Input from "@/components/ui/Input";

export default function CourseFilters({ filters, setFilters }) {
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }));
  };

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search courses..."
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filters Row */}
      <div className="flex gap-3">
        {/* Category Select */}
        <select
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
          <option value="Marketing">Marketing</option>
        </select>

        {/* Sort Select */}
        <select
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none"
          value={filters.sort}
          onChange={handleSortChange}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
