// pages/categories.js
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from 'react-sweetalert2';
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { mongooseConnect } from "@/lib/mongoose"; 
import { Category } from "@/models/Category"; 
import { useTranslation } from "@/lib/Translation";
import { Setting } from "@/models/Setting";


export async function getServerSideProps(context) {
    
    const session = await getServerSession(context.req, context.res, authOptions);


    if (!session || !session.user.isAdmin) {
        return {
            redirect: {
                destination: '/access-denied', 
                permanent: false, 
            },
        };
    }
    

    await mongooseConnect();
    const languageSetting = await Setting.findOne({ userId: session.user.id, name: 'language' });
    const initialLanguage = languageSetting?.value || 'en';

    const categories = await Category.find().populate('parent'); 

    return {
        props: {
            // Pass the session to the Layout component
            session: JSON.parse(JSON.stringify(session)), 
            // Pass the fetched categories data as props to the component.
            initialCategories: JSON.parse(JSON.stringify(categories)), 
            initialLanguage,
        },
    };
}

function Categories({swal, session, initialCategories}) { 
    // Initialize categories state with data from getServerSideProps
    const [categories, setCategories] = useState(initialCategories || []); 
    const {t} = useTranslation();
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState(''); 
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        // This useEffect will now only run on client-side and re-fetch after initial server render.
        
        // or for fresh data after a form submission on the same page.
        fetchCategories(); 
    }, []);

    // Function to fetch all categories from the API (for client-side updates after mutations)
    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
            if (!editedCategory) { 
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
            properties:properties.map(p => ({
                name:p.name,
                values:p.values.split(',').map(s => s.trim()), 
            })),
        };

        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data);
        }
        setName(''); 
        setParentCategory('');
        setProperties([]);
        fetchCategories(); 
    }

    // Sets the state to allow editing of a specific category
    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id || category.parent || '');
        setProperties(category.properties.map(({name,values}) =>({
            name,
            values:values.join(',')
        }))); 
    }

    // Function to cancel editing
    function cancelEdit() {
        setEditedCategory(null);
        setName('');
        setParentCategory('');
        setProperties([]); 
    }

    // Function to delete a category using sweetalert2 for confirmation
    async function deleteCategory(category) {
        swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete!",
            cancelButtonText: "Cancel",
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
        <> {/* Pass session to Layout */}
            <h1>{t.Categories}</h1>
            <label htmlFor="categoryName" className="text-gray-600 text-sm">
                {editedCategory 
                    ? `Edit category ${editedCategory.name}` 
                    : 'Create new category'}
            </label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-2">
                    <input 
                    id="categoryName"
                    type="text"
                    placeholder={t.CategoryName} 
                    onChange={ev => setName(ev.target.value)}
                    value={name} 
                    />
                    <select 
                        onChange={ev => setParentCategory(ev.target.value)}
                        value={parentCategory}>
                        <option value="">{t.NoParentCategory}</option>
                        {categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block">{t.Properties}</label>
                    <button onClick={addProperty} type="button" 
                    className="btn-default text-sm mb-2">{t.AddNewProperty}</button>
                    {properties.length > 0 && properties.map((property, index) => (
                        <div key={index} className="flex gap-1 mb-2"> 
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
                                className="btn-red">
                                {t.Remove}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-1">
                {editedCategory && (
                    <button onClick={cancelEdit} 
                        type="button"
                        className="btn-red">
                        {t.Cancel}
                    </button>
                )}
                <button 
                    type="submit" 
                    className="btn-primary py-1 px-4 whitespace-nowrap">
                    {t.Save}
                </button>
                </div>
            </form>
            
            {!editedCategory && (
                <table className="basic mt-4"> 
                    <thead>
                        <tr>
                            <td className="font-bold">{t.CategoryName}</td> 
                            <td className="font-bold">{t.ParentCategory}</td> 
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4 text-gray-500">{t.NoCategoriesFound}</td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>
                                        {category.parent 
                                            ? (categories.find(p => p._id === (category.parent._id || category.parent))?.name || '')
                                            : ''}
                                    </td>
                                    <td className="flex gap-1 justify-end">
                                        <button 
                                            onClick={() => editCategory(category)} 
                                            className="btn-default py-1 px-2 text-sm">
                                            {t.Edit}
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category)} 
                                            className="btn-red py-1 px-2 text-sm">
                                            {t.Delete}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
}
export default withSwal(({swal, ref}) => (
    <Categories swal={swal} />
));
