import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Categories() {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState(''); // Stores ID of parent
    const [categories, setCategories] = useState([]);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Function to fetch all categories from the API
    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
            // If we're not editing, clear the parent category selection
            if (!editedCategory) { // Changed this logic slightly
                setParentCategory('');
            }
        });
    }

    // Handles saving a new category or updating an existing one
    async function saveCategory(ev) {
        ev.preventDefault();
        const data = { 
            name, 
            parent: parentCategory === '' ? null : parentCategory 
        };

        if (editedCategory) {
            // If editing, send PUT request with existing category ID
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null); // Clear edited category state
        } else {
            // If creating new, send POST request
            await axios.post('/api/categories', data);
        }

        setName(''); // Clear name input
        setParentCategory(''); // Clear parent selection
        fetchCategories(); // Re-fetch categories to update UI
    }

    // Sets the state to allow editing of a specific category
    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        // Ensure parentCategory is set correctly from the object or ID
        setParentCategory(category.parent?._id || category.parent || ''); 
    }

    // Function to cancel editing
    function cancelEdit() {
        setEditedCategory(null);
        setName('');
        setParentCategory('');
    }

    // Function to delete a category (Placeholder, you'll implement the API call)
    async function deleteCategory(category) {
        if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) { // Use a modal instead of window.confirm in a real app
             // Implement actual API call to delete category
             // await axios.delete(`/api/categories?id=${category._id}`);
             fetchCategories(); // Re-fetch categories after deletion
        }
    }


    return (
        <Layout>
            <h1>Categories</h1>
            <label htmlFor="categoryName" className="text-gray-600 text-sm"> {/* Re-added text-sm here, was in global but sometimes useful to be explicit */}
                {editedCategory 
                    ? `Edit category ${editedCategory.name}` 
                    : 'Create new category'}
            </label>
            {/* The form needs a max-width and better alignment */}
            <form onSubmit={saveCategory} className="flex gap-2 items-center mb-4"> {/* Increased gap, added mb-4 */}
                <input 
                    id="categoryName"
                    className="mb-0 flex-grow max-w-xs" // Added max-w-xs to control input width
                    type="text"
                    placeholder={'Category name'} 
                    onChange={ev => setName(ev.target.value)}
                    value={name} 
                />
                <select 
                    className="mb-0 max-w-xs" // Added max-w-xs to control select width
                    onChange={ev => setParentCategory(ev.target.value)}
                    value={parentCategory}>
                    <option value="">No parent category</option>
                    {categories.length > 0 && categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button 
                    type="submit" 
                    className="btn-primary py-1 px-4 whitespace-nowrap"> {/* Explicit px-4 */}
                    Save
                </button>
                {editedCategory && (
                    <button 
                        type="button" 
                        onClick={cancelEdit} 
                        className="btn-default py-1 px-4 whitespace-nowrap">
                        Cancel
                    </button>
                )}
            </form>

            <table className="basic mt-4"> 
                <thead>
                    <tr>
                        {/* Removed uppercase as per screenshot, added font-bold */}
                        <td className="font-bold">Category name</td> 
                        <td className="font-bold">Parent category</td> 
                        <td></td> {/* For action buttons */}
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>
                                {/* This logic finds the parent category name from the fetched categories array.
                                   It handles both populated parent objects and just the parent ID. */}
                                {category.parent 
                                    ? (categories.find(p => p._id === (category.parent._id || category.parent))?.name || '')
                                    : ''}
                            </td>
                            <td className="flex gap-1 justify-end"> {/* Used justify-end to push buttons to the right */}
                                <button 
                                    onClick={() => editCategory(category)} 
                                    className="btn-default py-1 px-2 text-sm">
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteCategory(category)} // Added onClick for delete
                                    className="btn-red py-1 px-2 text-sm">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
}
