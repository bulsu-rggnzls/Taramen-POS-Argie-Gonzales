import ISelect from "@/components/custom/Select";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { useState } from "react";
import Title from "@/components/custom/Title";
import Button from "@/components/custom/Button";
import { Pencil, Trash, Plus, Power } from "lucide-react";
import StaffModal from "./StaffModal";
import Pagination from "@/components/custom/Pagination";
import { useAllEmployees, useToggleEmployeeStatus } from "@/queries/employeeQueries";

export default function StaffTable() {
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "head-chef", label: "Head Chef" },
    { value: "assistant-chef", label: "Assistant Chef" },
    { value: "sushi-chef", label: "Sushi Chef" },
    { value: "waitress", label: "Waitress" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "on-leave", label: "On Leave" },
  ];

  // Filter staff data based on selected role and status
  const filteredStaff = staffData.filter(staff => {
    const roleMatch = selectedRole === "all" || staff.employee_type?.name?.toLowerCase().replace(" ", "-") === selectedRole;
    const statusMatch = selectedStatus === "all" || (staff.active ? "active" : "on-leave") === selectedStatus;
    return roleMatch && statusMatch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleRoleChange = (option) => {
    setSelectedRole(option?.value ?? "all");
    setCurrentPage(1);
  };

  const handleStatusChange = (option) => {
    setSelectedStatus(option?.value ?? "all");
    setCurrentPage(1);
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

  const selectTriggerClass = "h-10 w-48 rounded-lg border-gray-200 bg-primary px-3 text-sm font-normal text-white [&_svg]:!text-white [&_svg]:!opacity-100";
  const selectContentClass = "[&_svg]:!text-white [&_svg]:!opacity-100";

  return (
    <div className="rounded-2xl p-6 text-sm text-gray-500 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <Title size="2xl" className="text-gray-900">Employee Directory</Title>
        <div className="flex gap-3">
          <ISelect
            useForm={false}
            showAll={false}
            value={selectedRole}
            options={roleOptions}
            onValueChange={handleRoleChange}
            className="w-48"
            triggerClassName={selectTriggerClass}
            contentClassName={selectContentClass}
          />
          <ISelect
            useForm={false}
            showAll={false}
            value={selectedStatus}
            options={statusOptions}
            onValueChange={handleStatusChange}
            className="w-48"
            triggerClassName={selectTriggerClass}
            contentClassName={selectContentClass}
          />
          <Button onClick={handleAdd} variant="outline" className="h-10 w-fit rounded-lg border-gray-200 bg-primary px-3 text-sm font-normal text-white [&_svg]:!text-white [&_svg]:!opacity-100">
            <Plus className="size-4" />
            Add Employee
          </Button>
        </div>
      </div>
      <Table className="border border-gray-100 rounded-md mt-4 text-center overflow-hidden">
        <TableHeader className="bg-primary">
          <TableRow>
            <TableHead className="text-primary-foreground text-center">Name</TableHead>
            <TableHead className="text-primary-foreground text-center">Role</TableHead>
            <TableHead className="text-primary-foreground text-center">Contact Info</TableHead>
            <TableHead className="text-primary-foreground text-center">Status</TableHead>
            <TableHead className="text-primary-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStaff.length > 0 ? (
            paginatedStaff.map((staff, index) => (
              <TableRow key={staff.id} className={index % 2 === 1 ? "bg-gray-200" : ""}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.employee_type?.name || 'N/A'}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <span className={getStatusBadge(staff.active ? 'active' : 'on-leave')}>
                    {formatStatus(staff.active ? 'active' : 'on-leave')}
                  </span>
                </TableCell>
                <TableCell className="flex gap-6 justify-center">
                  <button 
                    onClick={() => handleToggleStatus(staff)} 
                    className="cursor-pointer hover:text-yellow-600"
                    title="Toggle Status"
                  >
                    <Power className="size-4"/>
                  </button>
                  <button 
                    onClick={() => handleEdit(staff)} 
                    className="cursor-pointer hover:text-blue-600"
                    title="Edit"
                  >
                    <Pencil className="size-4"/>
                  </button>
                  <button 
                    onClick={() => handleDelete(staff)} 
                    className="cursor-pointer hover:text-red-600"
                    title="Delete"
                  >
                    <Trash className="size-4"/>
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-gray-500 text-lg">No employees found</p>
                  <p className="text-gray-400 text-sm">
                    {selectedRole !== "all" || selectedStatus !== "all" 
                      ? "Try adjusting your filters" 
                      : "Click 'Add Employee' to get started"
                    }
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {filteredStaff.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <StaffModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          mode={modalMode}
          staffData={selectedStaff}
        />
    </div>
  );
}
