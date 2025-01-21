"use client";
import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import GenericTable from "../../../components/Table/TableComp";
import { fetchClusters } from "../../../redux/reducer/cluster/action";
import { AppDispatch, RootState } from "../../../redux/store";
import Pagination from "../../../components/ui/pagination";
import StatsCard from "../../../components/Cards/StatsCards/StatsCard";
import { MdOutlineLocationOn } from "react-icons/md";
import CreateButton from "../../../components/ui/createbutton";
import { ClusterModal } from "./diloug-box";
import { Button } from "@tremor/react";
import { Input } from "../../../components/ui/input";
import { BreadcrumbNav } from "../../../components/ui/breadcrumb-nav";
import { EditClusterModal } from "./edit/[id]/editcluster";
import DeleteConfirmationModal from "../../../components/modals/delete-confirmation-modal";
import axiosInstance from "../../../api/axiosInstance";
import { DELETE_CLUSTER } from "../../../api/api_endpoints";
import { DELETE_CLUSTER as DELETE_CLUSTER_ACTION } from "../../../redux/reducer/cluster/actionTypes";
import { fetchVenues } from "@/redux/reducer/venue/action";

export default function ClustersPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { clusters = [], loading } = useSelector(
    (store: RootState) => store?.cluster
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [open, setOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    null
  );
  const [selectedcluster_name, setSelectedcluster_name] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchClusters(1000));
  }, [dispatch]);

  const deleteCluster = async (id: string) => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete(DELETE_CLUSTER(Number(id)));
      dispatch({
        type: DELETE_CLUSTER_ACTION,
        payload: id,
      });
      return true;
    } catch (error) {
      console.error("Error deleting cluster:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (id?: string) => {
    if (id) {
      setSelectedClusterId(id);
      setEditModalOpen(true);
    }
  };

  const openDeleteModal = (id?: string) => {
    if (id) {
      const cluster = clusters.find(
        (c: any) => c.id.toString() === id.toString()
      );
      if (cluster) {
        setSelectedClusterId(id);
        setSelectedcluster_name(cluster.name || "");
        setDeleteModalOpen(true);
      }
    }
  };

  const handleViewCluster = (id?: string) => {
    if (id) {
      console.log("cluster id", id);
      router.push(`/cluster/${id}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClusterId) return;
    const success = await deleteCluster(selectedClusterId);
    if (success) {
      setDeleteModalOpen(false);
      setSelectedClusterId(null);
      setSelectedcluster_name("");
    }
  };

  const handlePageChange = (page: number) => {
    console.log("page", page);
    setCurrentPage(page);
  };

  const [clusterId, setClusterId] = useState<string | null>(null);

  const handleViewVenues = (clusterId: number) => {
    router.push(`/venues?cluster=${clusterId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    dispatch(fetchClusters());
  };

  const filteredClusters = clusters.filter(
    (cluster: any) =>
      cluster.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.id?.toString().includes(searchTerm) ||
      (cluster.supervisor_name &&
        cluster.supervisor_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  console.log("Filtered Clusters");
  console.log(filteredClusters);

  const totalItems = filteredClusters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Get paginated data for the current page
  const paginatedData = filteredClusters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: "serialNo",
      label: "Serial No",
      render: (_row: any, index?: number) =>
        (currentPage - 1) * itemsPerPage + (index ?? 0) + 1,
    },
    { key: "cluster_code", label: "Cluster Code" },
    { key: "name", label: "Cluster Name" },
    { key: "supervisor_name", label: "Cluster Supervisor" },
    {
      key: "venue",
      label: "Venue",
      render: (row: any) => (
        <button
          onClick={() => handleViewVenues(row.id)}
          className="text-purple-600 underline decoration-solid"
        >
          View
        </button>
      ),
    },
    { key: "capacity", label: "Radius" },
  ];

  const actions = [
    {
      icon: Eye,
      title: "View",
      onClick: handleViewCluster,
    },
    {
      icon: Edit,
      title: "Edit",
      onClick: openEditModal,
    },
    {
      icon: Trash2,
      title: "Delete",
      onClick: openDeleteModal,
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Clusters", active: true },
  ];

  console.log("Current Page", currentPage);
  console.log("Total Pages", totalPages);
  console.log("Next page", hasNextPage);

  return (
    <>
      {/* Main Content Container with conditional blur */}
      <div className={`space-y-6 bg-[var(--white)] rounded-lg px-5 py-7 mr-5 mb-5 transition-all duration-300 ${
        open || isEditModalOpen || isDeleteModalOpen ? 'blur-sm' : ''
      }`}>
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} />
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647]">
            Clusters
          </h1>
          <p className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">
            View and Manage all clusters.
          </p>
        </div>
        {/* Stats and Create Button */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          <StatsCard
            title="Total Cluster"
            value={totalItems}
            lastMonthValue="+5"
            icon={<MdOutlineLocationOn className="text-[var(--purple-dark)]" />}
            link=""
          />
          <CreateButton label="Create Clusters" onClick={() => setOpen(true)} />
          <div className="ml-auto">
            {/* <RefreshCw
              size={20}
              className="text-muted-foreground cursor-pointer hover:text-purple-600"
              onClick={handleRefresh}
            /> */}
          </div>
        </div>
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="pb-8">
            <h1 className="font-bold tracking-tight text-[#2A1647] all-venues-text">
              All Clusters
            </h1>
          </div>
          <div className="pb-6 px-1 flex justify-between gap-2">
            <Input
              className="border-[var(--background)] p-2 placeholder-[var(--foreground)] w-100 pt-[1.1vw] pb-[1.1vw]"
              placeholder="Search Cluster by Name"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          {/* Table & Pagination */}
          <div>
            {loading ? (
              <div className="flex justify-center py-8">
                Loading clusters...
              </div>
            ) : paginatedData.length > 0 ? (
              <GenericTable
                columns={columns}
                data={paginatedData}
                actions={actions}
              />
            ) : (
              <div className="flex justify-center py-8 text-gray-500">
                No clusters found matching your search.
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
          </div>
        </div>
      </div>



      {/* Modals */}
      <ClusterModal setOpen={setOpen} open={open} />
      <EditClusterModal
        setEditOpen={(val: boolean) => {
          setEditModalOpen(val);
          if (!val) {
            dispatch(fetchClusters(1000));
          }
        }}
        editOpen={isEditModalOpen}
        clusterId={selectedClusterId}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="Cluster"
        itemName={selectedcluster_name}
        isDeleting={isDeleting}
      />
    </>
  );
}

function setShowVenueModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}