"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EquipmentCategories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch equipment categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      setError(null);
      
      if (!formData.name.trim()) {
        setError('Category name is required');
        return;
      }

      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      await fetchCategories();
      setIsDialogOpen(false);
      setFormData({ name: '' });
      setEditingCategory(null);
    } catch (err) {
      setError(err.message);
      console.error('Error saving category:', err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      await fetchCategories();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting category:', err);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Equipment Categories</h1>
          
          {/* Search and New Button */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 text-gray-800 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">
                    {editingCategory ? 'Edit Category' : 'New Equipment Category'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    {editingCategory ? 'Update the category name' : 'Define a new equipment category'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({name: e.target.value})}
                      placeholder="e.g., CNC Machines, Computers, Vehicles"
                      className="mt-2 bg-white border-gray-200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)} 
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveCategory} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading categories...</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Name</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Created</th>
                    <th className="text-left text-gray-600 font-medium px-6 py-4 text-sm">Last Updated</th>
                    <th className="text-right text-gray-600 font-medium px-6 py-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-gray-500">
                        {searchQuery ? 'No categories found matching your search' : 'No categories defined yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category, index) => (
                      <tr 
                        key={category.id}
                        className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${
                          index === filteredCategories.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{category.name}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(category.createdAt)}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(category.updatedAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(category)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}