"use client";

import { useState, useEffect } from "react";
import InfoCard from "../../components/Cards/InfoCards/InfoCard";
import GraphCard from "../../components/Cards/GraphCard/GraphCard";
import StatsCard from "../../components/Cards/StatsCards/StatsCard";
import { PageHeader } from "../../components/pageheader/PageHeader";
import TabsComp from "../../components/Tabs/TabComp";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { SidebarTrigger } from "../../components/ui/sidebar";
import "../globals.css";
import { Button } from "@tremor/react";
import { Underline, Network, MapPin } from "lucide-react";
import { MdOutlineLocationOn } from "react-icons/md";
import Link from 'next/link';
import axiosInstance from '../../api/axiosInstance'; 
import axios from "axios";

const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  ENDPOINTS: {
    DASHBOARD: '/admin/dash' 
  }
};

const apiService = {
  async getDashboardData() {
    try {
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD);
      
      const result = response.data;
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }

      return result.data;
    } catch (error: unknown) {
      console.error('API Error:', error);
            if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          throw new Error('Network error: No response from server');
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState({
    clusters: 0,
    venues: 0,
    facilities: 0,
    zones: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        
        // Add debug logging
        console.log('Fetching from:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DASHBOARD}`);
        
        const data = await apiService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a base URL
    if (API_CONFIG.BASE_URL) {
      fetchDashboardData();
    } else {
      setError('API base URL is not configured');
      setLoading(false);
    }
  }, []);

  // Create stats data using API response
  const statsData = [
    { 
      title: "Total Clusters", 
      value: loading ? "..." : dashboardData.clusters, 
      lastMonthValue: "+4", 
      link: "/cluster" 
    },
    { 
      title: "Total Venues", 
      value: loading ? "..." : dashboardData.venues, 
      lastMonthValue: "+4", 
      link: "/venues" 
    },
    { 
      title: "Total Facilities", 
      value: loading ? "..." : dashboardData.facilities, 
      lastMonthValue: "+4", 
      link: "" 
    },
    { 
      title: "Total Zones", 
      value: loading ? "..." : dashboardData.zones, 
      lastMonthValue: "+2", 
      link: "" 
    },
  ];

  // Show error state if API call failed
  if (error) {
    return (
      <div className="space-y-6 bg-[var(--white)] rounded-lg px-4 py-6 mb-5 ml-1">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Error</h2>
          <p className="text-red-500 mb-4">Error loading dashboard data: {error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Retry the API call
                apiService.getDashboardData()
                  .then(setDashboardData)
                  .catch(err => setError(err.message))
                  .finally(() => setLoading(false));
              }} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[var(--white)] rounded-lg px-4 py-6 mb-5 ml-1">
      {/* Page Header */}
      <h1 className="text-[#4d4d4d]">Home</h1>
      <div className="row">
        <div className="col-lg-1 Poppins">
          {/* <SidebarTrigger className="" /> */}

          <div className="col-lg-5">
            <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
              Venue Management
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            link={stat.link}
            lastMonthValue={stat.lastMonthValue}
            icon={<MdOutlineLocationOn className="text-[var(--purple-dark)]" />}
          />
        ))}
      </div>

      {/* Loading indicator for stats */}
      {loading && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Info Cards & Updates */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          title="Create Cluster"
          description="Add new venues and clusters by importing all required details, including venue specification and visual information."
          bgColor="bg-[#F8F4FF]"
          icon=""
          linkText="View"
          link="/cluster"
          linkColor="text-[var(--purple-dark-1)]"
        />

        <InfoCard
          title="Create Venue"
          description="Calculate the number of vehicles required based on the total number of travelers and the type of vehicles."
          bgColor="bg-[#FFF7E5]"
          icon=""
          linkText="View"
          link="/venues"
          linkColor="text-[var(--yellow-light)]"
        />

        {/* Updates Card */}
        <Card className="md:col-span-2 lg:col-span-1 border-none bg-[var(--white)]">
          <CardHeader>
            <CardTitle style={{ color: "black", fontSize: "18px" }}>
              Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "New Admin Access Granted",
                description:
                  "Furqan has been granted admin access to the venue management module.",
              },
              {
                title: "Game Result Submission",
                description:
                  "The result entries for football Match - Team A vs Team B have been submitted.",
              },
              {
                title: "Player Registration Status",
                description:
                  "Player registration for the 2024 Spring Soccer league has been officially closed.",
              },
            ].map((update, index) => (
              <div
                key={index}
                className="space-y-2 border-b border-gray-300 pb-2 last:border-none"
              >
                <h3 className="text-sm font-medium text-black">
                  {update.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {update.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full md:w-[65%] mt-8 p-7 rounded-2xl shadow-lg border border-gray-200 bg-white flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Left Section */}
        <div className="w-full md:w-2/3 text-center md:text-left">
          <CardHeader className="p-0">
            <CardTitle className="text-lg mt-4 font-semibold text-black">
              Create And Manage Module Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <p className="text-[#cccccc] text-sm">
              create and manage users for each module type, ensuring clear
              organization and control.
            </p>
            <Link href="/module-user">
              <Button className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] mt-8 text-[var(--white)] border-none hover:opacity-90 rounded-lg cursor-pointer">
                Manage
              </Button>
            </Link>
          </CardContent>
        </div>

        {/* Right Section (Image) */}
        <div className="w-full md:w-1/3 mt-8 flex justify-center">
          <img
            src="/assets/infoModule.jpg"
            alt="Upload Section"
            className="md:w-full"
          />
        </div>
      </Card>
    </div>
  );
}