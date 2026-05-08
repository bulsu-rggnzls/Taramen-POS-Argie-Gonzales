import { useState } from "react";
import Title from "@/components/custom/Title";
import { Pencil, Trash, Plus, Power } from "lucide-react";
import StaffModal from "./StaffModal";
import DataTable from "@/components/custom/Datatable";
import { useAllEmployees, useToggleEmployeeStatus } from "@/queries/employeeQueries";

export default function StaffTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { data: staffData = [] } = useAllEmployees();
  const toggleStatusMutation = useToggleEmployeeStatus();

  const handleToggleStatus = async (staff) => {
    try {
      await toggleStatusMutation.mutateAsync({ 
        id: staff.id, 
        name: staff.name 
      });
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff) => {
    setModalMode('edit');
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = (staff) => {
    setModalMode('delete');
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return "inline-flex items-center rounded-xl bg-green-200 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20";
      case "on-leave":
        return "inline-flex items-center rounded-xl bg-yellow-200 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20";
      default:
        return "inline-flex items-center rounded-xl bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20";
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const roleOptions = [
    // { value: "all", label: "All Roles" },
    { value: "head-chef", label: "Head Chef" },
    { value: "assistant-chef", label: "Assistant Chef" },
    { value: "sushi-chef", label: "Sushi Chef" },
    { value: "waitress", label: "Waitress" },
  ];

  const statusOptions = [
    // { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "on-leave", label: "On Leave" },
  ];

  const columns = [
    {
      key: "name",
      title: "Name",
      sortable: true,
    },
    {
      key: "employee_type.name",
      title: "Role",
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: "email",
      title: "Contact Info",
      sortable: true,
    },
    {
      key: "active",
      title: "Status",
      sortable: true,
      render: (active) => (
        <span className={getStatusBadge(active ? 'active' : 'on-leave')}>
          {formatStatus(active ? 'active' : 'on-leave')}
        </span>
      )
    },
  ];

  const actions = [
    {
      label: "Toggle Status",
      icon: Power,
      action: handleToggleStatus,
      className: "text-yellow-600 hover:text-yellow-700"
    },
    {
      label: "Edit",
      icon: Pencil,
      action: handleEdit,
      className: "text-blue-600 hover:text-blue-700"
    },
    {
      label: "Delete",
      icon: Trash,
      action: handleDelete,
      className: "text-red-600 hover:text-red-700"
    },
  ];

  const filters = [
    {
      key: "role",
      label: "Role",
      type: "select",
      options: roleOptions,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const actionButtons = [
    {
      label: "Add Employee",
      icon: Plus,
      variant: "default",
      onClick: handleAdd,
      className: "bg-primary text-white hover:bg-primary/90"
    },
  ];

  return (
    <div className="rounded-2xl p-6 text-sm text-gray-500 rounded-xl">
      <DataTable
        title="Employee Directory"
        tableData={staffData}
        columns={columns}
        actions={actions}
        filters={filters}
        actionButtons={actionButtons}
        serverSide={false}
        paginated={true}
        initialPageSize={10}
        searchable={false}
        filterable={true}
        emptyMessage="No employees found. Click 'Add Employee' to get started."
        isActionEllipsis={true}
        // Custom filtering logic
        onMount={(data) => {
          // DataTable will handle filtering internally based on the filters provided
        }}
      />
      <StaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
        staffData={selectedStaff}
      />
    </div>
  );
}
