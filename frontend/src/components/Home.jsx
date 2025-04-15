import { useState, useEffect } from "react";
import api from "../api"

const Home = () => {
    const [booklist, setBookList] = useState([]);
    const [loading,setLoading] = useState(false);

    const getBooks = async () => {
        setBookList([]);
        setLoading(true);
        try {
            const response = await api.get("/home");
            setBookList(response.data.files);
        } catch(error) {
            alert("error fetching book list")
        } finally {
            setLoading(false);
        }
    }

    useEffect (() => {
        getBooks();
    }, []);

    return (
        <div>
            {booklist.map((book,index)=>(
                <ul>
                    <li key={index}>{book}</li>
                </ul>
            ))}
        </div>
    )
}

export default Home;