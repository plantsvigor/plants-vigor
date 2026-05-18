import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  Users as UsersIcon, 
  Search, 
  MoreVertical,
  Mail,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/status`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(data.message);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(data.message);
      setDeleteConfirmId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filteredUsers = users?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage your customers and admin accounts.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          {users?.length} Total Users
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers?.length > 0 ? filteredUsers.map((user: any) => (
                <tr key={user._id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center font-bold text-sm">
                        {user.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-primary transition-colors">{user.name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email || 'No Email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                        <XCircle className="h-4 w-4" />
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatusMutation.mutate(user._id)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold ${
                          user.isActive 
                            ? 'hover:bg-red-50 text-red-600' 
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                      >
                        {user.isActive ? (
                          <><Lock className="h-4 w-4" /> Block</>
                        ) : (
                          <><Unlock className="h-4 w-4" /> Unblock</>
                        )}
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                        
                        {openMenuId === user._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <button 
                              onClick={() => {
                                setOpenMenuId(null);
                                toggleStatusMutation.mutate(user._id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2 transition-colors"
                            >
                              {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              {user.isActive ? 'Block User' : 'Unblock User'}
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button 
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteConfirmId(user._id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Delete User?</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Are you sure you want to delete this user? This action cannot be undone and all user data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 bg-secondary rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteUserMutation.mutate(deleteConfirmId)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
