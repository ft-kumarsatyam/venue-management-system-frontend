"use client";
import { BreadcrumbNav } from "../../../components/ui/breadcrumb-nav";
import { CollapsibleSection } from "../../../components/ui/collapsible-section";
import {
  CreateAdminForm,
  type AdminFormData,
} from "../../../components/module-admin/create-admin-form";
import { AdminTable } from "../../../components/module-admin/admin-table";
import { Suspense, useEffect } from "react";
import { getAdminData } from "@/redux/reducer/admin/action";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";

export default function ModuleAdminPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Sample data
  const { admins: users } = useSelector(
    (state: RootState) => state.admins || []
  );
  console.log(users);

  const handleCreateAdmin = (data: AdminFormData) => {
    console.log("Creating admin with data:", data);
  };

  const handleAddPermissions = () => {
    console.log("Adding permissions");
  };

  const handleExportData = () => {
    console.log("Exporting data");
  };

  const handleViewPermissions = (userId: string) => {
    console.log("Viewing permissions for user:", userId);
  };

  const handleUserAction = (userId: string) => {
    console.log("User action for:", userId);
  };

  const handlePasswordAction = (userId: string) => {
    console.log("Password action for:", userId);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Module Admin (Venue Manager)", active: true },
  ];

  // Fixed useEffect - dispatch the action with parameters
  useEffect(() => {
    dispatch(getAdminData(1, 10)); // page 1, 10 items per page
  }, [dispatch]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mb-5">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} />

        {/* Main Heading */}
        <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
          Module Admin (Venue Manager)
        </h1>

        {/* Create Admin Section */}
        <CollapsibleSection
          title="Create Module Admin"
          description="Create users for each module and assign them specific permissions based on their roles."
          defaultOpen={true}
        >
          <CreateAdminForm
            onSubmit={handleCreateAdmin}
            onAddPermissions={handleAddPermissions}
          />
        </CollapsibleSection>

        {/* Admin Table Section */}
        <AdminTable
          onExportData={handleExportData}
          onViewPermissions={handleViewPermissions}
          onUserAction={handleUserAction}
          onPasswordAction={handlePasswordAction}
        />
      </div>
    </Suspense>
  );
}