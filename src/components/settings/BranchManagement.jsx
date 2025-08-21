import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, MapPin, Building, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";
import SettingsCard from "@/components/settings/SettingsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BranchManagement = () => {
  const { settings, addBranch, updateBranch, deleteBranch } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ id: "", name: "", address: "" });

  const branches = settings.branches || [];

  const handleOpenDialog = (branch = null) => {
    if (branch) {
      // Editing an existing branch
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        id: branch.id,
      });
    } else {
      // Adding a new branch
      setEditingBranch(null);
      setFormData({ name: "", address: "", id: "" }); // FIX: Was causing an error before
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // FIX: Added validation for the new ID field
    if (!formData.id.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Branch ID and Branch Name are required.",
        variant: "destructive",
      });
      return;
    }

    if (editingBranch) {
      // Note: We're not allowing ID change on edit, but we pass the whole formData
      updateBranch({ ...formData, id: editingBranch.id });
    } else {
      addBranch(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (branchId) => {
    deleteBranch(branchId);
  };

  return (
    <SettingsCard
      title="Branch Management"
      description="Manage your clinic locations and their information."
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="text-blue-600 h-5 w-5" />
                    {branch.name}
                  </h3>
                  {/* FEATURE: Display the Branch ID on the card */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Hash className="h-3 w-3" />
                    <span>ID: {branch.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(branch)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{branch.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(branch.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {branch.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{branch.address}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>
              No branches configured yet. Add your first branch to get started.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              {/* FIX: Corrected htmlFor and onChange handler */}
              <Label htmlFor="id">Branch Id *</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, id: e.target.value }))
                }
                placeholder="e.g., branch-1"
                required
                // FEATURE: Disable ID editing for existing branches
                disabled={!!editingBranch}
              />
              {editingBranch && (
                <p className="text-xs text-gray-500 mt-1">
                  Branch ID cannot be changed after creation.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Lamel Clinic - Dubai"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="e.g., Dubai Marina, Dubai, UAE"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBranch ? "Update Branch" : "Add Branch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
};

export default BranchManagement;
