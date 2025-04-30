
'use client';
import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Keeping all your original functions exactly the same
  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error');
      }
      setForm({ name: '', description: '', icon: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setEditingId(cat._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  // Only the return/UI part is enhanced
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h1>
          
          {/* Form Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon URL
                </label>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="Enter icon URL (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <FaPlus className="text-sm" />
                  {editingId ? 'Update Category' : 'Add Category'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: '', description: '', icon: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-lg">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found. Add your first category!
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 px-4 rounded-lg transition duration-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                      )}
                      {cat.icon && (
                        <img
                          src={cat.icon}
                          alt={cat.name}
                          className="w-6 h-6 mt-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition duration-200"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition duration-200"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}