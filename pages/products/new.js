import Layout from "@/components/Layout";
import axios from "axios";
import { useState } from "react";

export default function NewProduct() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    /**
     * Handles the form submit for creating a new product.
     * @param {React.FormEvent<HTMLFormElement>} ev - The form submission event.
     */
    async function createProduct(ev) {
        ev.preventDefault();
        const data = { title, description, price };
        await axios.post('/api/products', data);
    }

    return (
        <Layout>
            <form onSubmit={createProduct}>
                <h1>New Product</h1>

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
        </Layout>
    );
}
