import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from 'react-sweetalert2';


function Categories({swal}) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState(''); // Stores ID of parent
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);

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
            parent: parentCategory === '' ? null : parentCategory,
            properties
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
        swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete!",
            cancelButtonText: "cancel",
            confirmButtonColor: '#d55',
            reverseButtons: true,

        }).then(async result => {
            if (result.isConfirmed) {
                const {_id} = category;
                await axios.delete('/api/categories?_id='+_id);
                fetchCategories();
            }
        });
    }
    function addProperty() {
        setProperties(prev => {
            return [...prev, {name:'', values:''}];
        })
    }
    function handlePropertyNameChange(index, property, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
    }
        function handlePropertyValuesChange(index, property, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
    }
    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
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
            <form onSubmit={saveCategory}>
                <div className="flex gap-2">
                    <input 
                    id="categoryName"
                    type="text"
                    placeholder={'Category name'} 
                    onChange={ev => setName(ev.target.value)}
                    value={name} 
                />
                <select 
                    onChange={ev => setParentCategory(ev.target.value)}
                    value={parentCategory}>
                    <option value="">No parent category</option>
                    {categories.length > 0 && categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button onClick={addProperty} type="button" 
                    className="btn-default text-sm mb-2">Add new property</button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div className="flex gap-1 mb-2">
                            <input type="text" 
                            value={property.name}
                            className="mb-0"
                            onChange={ev => handlePropertyNameChange(index, property, ev.target.value)} 
                            placeholder="property name (example: color)"/>
                            <input type="text" 
                            value={property.values}
                            className="mb-0"
                            onChange={ev => handlePropertyValuesChange(index, property, ev.target.value)}
                            placeholder="values, comma separated"/>

                            <button onClick={() => removeProperty(index)}
                                type="button"
                                className="btn-default">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                {editedCategory &&  (
                    <button onClick={() => {setEditedCategory(null);
                        setName('');
                        setParentCategory('');
                    }}
                        type="button"
                        className="btn-default">
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    className="btn-primary py-1 px-4 whitespace-nowrap"> {/* Explicit px-4 */}
                    Save
                </button>
                </div>
            </form>
                {/* {editedCategory && (
                    <button 
                        type="button" 
                        onClick={cancelEdit} 
                        className="btn-default py-1 px-4 whitespace-nowrap">
                        Cancel
                    </button>
                )} */}
            {!editedCategory && (
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
            )}
        </Layout>
    );
}

export default withSwal(({swal, ref}) => (
    <Categories swal={swal} />
));
