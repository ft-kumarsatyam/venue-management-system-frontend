import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { getAdminById } from "../../redux/reducer/admin/action";
import { Button } from "../../components/ui/button";
import { X, User, Mail, Phone, Shield } from "lucide-react";

interface AdminData {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_level: number;
  activated: string;
  created_at: string;
  image_url?: string;
  venue_name?: string;
  cluster_name?: string;
}

interface AdminPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
}

export function AdminPermissionsModal({
  isOpen,
  onClose,
  adminId,
}: AdminPermissionsModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAdmin, adminByIdLoading, adminByIdError } = useSelector(
    (store: RootState) => store?.admins || {}
  );

  const [currentAdmin, setCurrentAdmin] = useState<AdminData | null>(null);

  // Fetch admin data when modal opens and adminId changes
  useEffect(() => {
    if (adminId && isOpen) {
      dispatch(getAdminById(adminId));
    }
  }, [adminId, isOpen, dispatch]);

  // Update current admin when selectedAdmin changes
  useEffect(() => {
    if (selectedAdmin) {
      // Handle both single object and array response
      const adminData = Array.isArray(selectedAdmin) ? selectedAdmin[0] : selectedAdmin;
      setCurrentAdmin(adminData);
    }
  }, [selectedAdmin]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentAdmin(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Admin Permissions
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {adminByIdLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading admin details...</span>
            </div>
          ) : adminByIdError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error loading admin details</div>
              <p className="text-sm text-gray-600">{adminByIdError}</p>
              <Button
                onClick={onClose}
                className="mt-4"
                variant="outline"
              >
                Close
              </Button>
            </div>
          ) : currentAdmin ? (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  {currentAdmin.image_url && currentAdmin.image_url.startsWith('data:image') ? (
                    <img
                      src={currentAdmin.image_url}
                      alt={currentAdmin.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-purple-100"
                      onError={(e) => {
                        // Fallback to default avatar on image error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${currentAdmin.image_url && currentAdmin.image_url.startsWith('data:image') ? 'hidden' : ''}`}>
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Admin Details */}
              <div className="space-y-4">
                {/* ID */}
                {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                    #
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin ID
                    </label>
                    <p className="text-gray-900">{currentAdmin.id}</p>
                  </div>
                </div> */}

                {/* Name */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="text-gray-900">{currentAdmin.name || "N/A"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900 break-all">{currentAdmin.email || "N/A"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <p className="text-gray-900">{currentAdmin.phone || "N/A"}</p>
                  </div>
                </div>

                {/* User Level */}
                {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Level
                    </label>
                    <p className="text-gray-900">
                      Level {currentAdmin.user_level || 0}
                      <span className="ml-2 text-sm text-gray-500">
                        {getUserLevelDescription(currentAdmin.user_level)}
                      </span>
                    </p>
                  </div>
                </div> */}

                {/* Venue Name - Only show if exists */}
                {currentAdmin.venue_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                      🏢
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Venue
                      </label>
                      <p className="text-gray-900">{currentAdmin.venue_name}</p>
                    </div>
                  </div>
                )}

                {/* Cluster Name - Only show if exists */}
                {currentAdmin.cluster_name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                      🏘️
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cluster
                      </label>
                      <p className="text-gray-900">{currentAdmin.cluster_name}</p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        currentAdmin.activated === "1"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="text-gray-900">
                      {currentAdmin.activated === "1" ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                    📅
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {currentAdmin.created_at
                        ? new Date(currentAdmin.created_at).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No admin details available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to describe user levels
function getUserLevelDescription(level: number): string {
  switch (level) {
    case 1:
      return "(Super Admin)";
    case 2:
      return "(Admin)";
    case 3:
      return "(Manager)";
    case 4:
      return "(Supervisor)";
    case 5:
      return "(Operator)";
    case 6:
      return "(User)";
    default:
      return "(Unknown)";
  }
}