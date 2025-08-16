import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ProductForm({
  _id,
  title:existingTitle,
  description:existingDescription,
  price:existingPrice,
}) {
  const [title,setTitle] = useState(existingTitle || '');
  const [description,setDescription] = useState(existingDescription || '');
  const [price,setPrice] = useState(existingPrice || '');
  const [goToProducts, setGoToProducts] = useState(false);
  const router = useRouter();
    /*
     * Handles the form submit for creating a new product.
     * @param {React.FormEvent<HTMLFormElement>} ev - The form submission event.
     */
    async function saveProduct(ev) {
        ev.preventDefault();
        const data = { title, description, price };
        if (_id) {
          //update
          await axios.put('/api/products', {...data, _id})
        }
        else{
          //create
          await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if (goToProducts){
        router.push('/products');
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