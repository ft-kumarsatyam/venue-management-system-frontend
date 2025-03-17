"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { DataTable, type Column } from "../../components/ui/data-table";
import Pagination from "../../components/ui/pagination";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { getAdminData, getAdminById } from "../../redux/reducer/admin/action";
import { AdminPermissionsModal } from "./admin-permission_modal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_level: number;
  activated: string;
  created_at: string;
  serialNo?: number;
}

interface AdminTableProps {
  onExportData?: () => void;
  onViewPermissions?: (userId: string) => void;
  onUserAction?: (userId: string) => void;
  onPasswordAction?: (userId: string) => void;
}

export function AdminTable({
  onExportData,
  onViewPermissions,
  onUserAction,
  onPasswordAction,
}: AdminTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { admins = [], loading = false, pagination } = useSelector(
    (store: RootState) => store?.admins || {}
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getAdminData(currentPage, itemsPerPage));
  }, [dispatch, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewPermissions = async (userId: string) => {
    try {
      setSelectedAdminId(userId);
      setIsModalOpen(true);
      // Fetch admin details by ID
      await dispatch(getAdminById(userId));
      // Call the optional prop callback if provided
      onViewPermissions?.(userId);
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdminId("");
  };

  // Add safety checks and fallbacks for data transformation
  const transformedUsers: AdminUser[] = Array.isArray(admins) 
    ? admins
        .filter((admin: any) => admin && (admin.id || admin.id === 0)) // Filter out invalid entries
        .map((admin: any, index: number) => ({
          id: admin.id?.toString() || `admin-${index}`, // Safe toString with fallback
          name: admin.name || "N/A",
          email: admin.email || "N/A",
          phone: admin.phone || "N/A",
          user_level: admin.user_level || 0,
          activated: admin.activated?.toString() || "0",
          created_at: admin.created_at || "",
          serialNo: (currentPage - 1) * itemsPerPage + index + 1,
        }))
    : [];

  const columns: Column<AdminUser>[] = [
    {
      header: "Serial No.",
      accessor: "serialNo",
    },
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone Number",
      accessor: "phone",
    },
    // {
    //   header: "User Level",
    //   accessor: "user_level",
    // },
    {
      header: "Status",
      accessor: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            user.activated === "1"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.activated === "1" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Permissions",
      accessor: (user) => (
        <Button
          variant="link"
          className="text-primary p-0 h-auto font-medium hover:text-primary/80"
          onClick={() => handleViewPermissions(user.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const renderActions = (user: AdminUser) => (
    <div className="flex space-x-2">
      <Button
        size="sm"
        className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1 h-auto"
        onClick={() => onUserAction?.(user.id)}
      >
        User
      </Button>
      <Button
        size="sm"
        className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1 h-auto"
        onClick={() => onPasswordAction?.(user.id)}
      >
        Password
      </Button>
    </div>
  );

  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;
  const hasNextPage = pagination?.hasNextPage || false;
  const hasPrevPage = pagination?.hasPrevPage || false;

  return (
    <div>
      {/* Header */}
      <div className="pb-6 flex justify-between items-center">
        <h2 className="font-bold tracking-tight text-[#2A1647] all-venues-text">
          Module Admin
        </h2>
        {/* <Button
          className="rounded-[12px] text-white hover:bg-[#6A37C4] cursor-pointer"
          style={{
            background: "linear-gradient(to right, #8A2BE2, rgb(49, 2, 83))",
          }}
          onClick={onExportData}
        >
          Export Data
        </Button> */}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex justify-center py-8">Loading admins...</div>
      ) : transformedUsers.length > 0 ? (
        <DataTable
          data={transformedUsers}
          columns={columns}
          keyField="id"
          // actions={renderActions}
        />
      ) : (
        <div className="flex justify-center py-8 text-gray-500">
          No admins found.
        </div>
      )}

      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      )}

      <AdminPermissionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        adminId={selectedAdminId}
      />
    </div>
  );
}