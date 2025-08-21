import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import {ReactSortable} from "react-sortablejs";

export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
    properties:assignedProperties,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [description,setDescription] = useState(existingDescription || '');
    const [productProperties,setProductProperties] = useState(assignedProperties || {});
    // Initialize category with assignedCategory or an empty string for "Uncategorized"
    const [category, setCategory] = useState(assignedCategory || ''); 
    const [price,setPrice] = useState(existingPrice || '');
    const [images,setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        // Fetch categories when the component mounts
        // Ensure your /api/categories endpoint populates the 'properties' field
        // and optionally the 'parent' field to get properties from parent categories.
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, []);

    /*
     * Handles the form submit for creating a new product.
     * @param {React.FormEvent<HTMLFormElement>} ev - The form submission event.
     */
    async function saveProduct(ev) {
        ev.preventDefault();

        const data = { 
            title, 
            description, 
            price,
            images,
            // If category is an empty string (Uncategorized), send null
            category: category === '' ? null : category,
            properties: productProperties
        };

        if (_id) {
            // Update existing product
            await axios.put('/api/products', {...data, _id})
        }
        else{
            // Create new product
            await axios.post('/api/products', data);
        }
        setGoToProducts(true); // Redirect to products page after save
    }

    // Redirect logic
    if (goToProducts){
        router.push('/products');
    }

    // Handles image uploads
    async function uploadImages(ev) {
        const files =ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }

    // Updates image order for ReactSortable
    function updateImagesOrder(images) {
        setImages(images);
    }

    // Handles setting product properties
    function setProductProp(propName,value) {
        setProductProperties(prev =>{
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps
        });
    }

    const propertiesToFill = [];
    // Only proceed if a category is selected AND categories data has been loaded
    if (category && categories.length > 0) {
        // Find the selected category's info
        let catInfo = categories.find(c => c._id === category);

        // Crucial: Check if catInfo was actually found AND if it has properties
        if (catInfo && catInfo.properties) {
            propertiesToFill.push(...catInfo.properties); // Add properties from the current category

            // Traverse parent categories to inherit properties
            while(catInfo?.parent?._id) {
                // Find the parent category
                const parentCat = categories.find(c => c._id === catInfo.parent._id);
                // Crucial: Check if parentCat was found AND if it has properties
                if (parentCat && parentCat.properties) {
                    propertiesToFill.push(...parentCat.properties); // Add properties from parent
                }
                catInfo = parentCat; // Move up to the parent for the next iteration
                // Add a safety break to prevent infinite loops in case of malformed data (e.g., circular parent references)
                if (!catInfo) break; 
            }
        }
    }

    return (
        <form onSubmit={saveProduct}>
            <label>Product Name</label>
            <input
                type="text"
                placeholder="Product name"
                value={title}
                /**
                 * @param {React.ChangeEvent<HTMLInputElement>} ev
                 */
                onChange={ev => setTitle(ev.target.value)}
            />
            <label>Category</label>
            <select value={category} onChange={ev => setCategory(ev.target.value)}>
                <option value="">Uncategorized</option>
                {/* Ensure categories array has data before mapping */}
                {categories.length > 0 && categories.map(c => (
                    <option key={c._id} value={c._id}>
                        {c.name}
                    </option>
                ))}
            </select>
            
            {/* Render properties if there are any to fill */}
            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div key={p.name} className="flex gap-1 items-center"> {/* Added key and items-center */}
                    <div>{p.name}:</div> {/* Added colon for better readability */}
                    <select 
                        value={productProperties[p.name] || ''} // Ensure value is empty string if undefined for controlled component
                        onChange={ev => setProductProp(p.name,ev.target.value)}>
                        <option value="">Select a value</option> {/* Default option for properties */}
                        {p.values.map(v => (
                            <option key={v} value={v}>{v}</option> 
                        ))}
                    </select>
                </div>
            ))}

            <label>
                Photos
            </label>

            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable
                    list={images}
                    className="flex flex-wrap gap-1"
                    setList={updateImagesOrder}>
                    {!!images?.length && images.map(link =>(
                        <div key={link} className="h-24">
                            <img src={link} alt="" className="rounded-lg"/>
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner/>
                    </div>
                )}
                <label className="w-24 h-24 cursor-pointer text-center flex flex-col
                items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200"> {/* Corrected 'tsext-gray-500' */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>
                        Upload
                    </div>
                    <input type="file" onChange={uploadImages} className="hidden"/>
                    
                </label>
            </div>
            <label>Description</label>
            <textarea
                placeholder="Description"
                value={description}
                /**
                 * @param {React.ChangeEvent<HTMLTextAreaElement>} ev
                 */
                onChange={ev => setDescription(ev.target.value)}
            />

            <label>Price</label>
            <input
                type="number"
                placeholder="Price"
                value={price}
                /**
                 * @param {React.ChangeEvent<HTMLInputElement>} ev
                 */
                onChange={ev => setPrice(ev.target.value)}
            />

            <button
                type="submit"
                className="btn-primary"
            >
                Save
            </button>
        </form>
    );
}
