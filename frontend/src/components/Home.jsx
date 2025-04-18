import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api"
import "../css/home.css"

const Home = () => {
    const [booklist, setBookList] = useState([]);
    const [loading,setLoading] = useState(false);
    const [text, setText] = useState("");
    const [selectedBook, setSelectedBook] = useState("");
    const [semanticMatch, setSemanticMatch] = useState([]);
    const [selectedText, setSelectedText] = useState("");
    const [buttonPosition,setButtonPosition] = useState(null);
    const navigate = useNavigate();

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
    };

    const getBookText = async (book) => {
        setLoading(true);
        setSelectedBook(book);
        try {
            const response = await api.get("/get_text" , {params : {file : book}});
            setText(response.data);

            navigate("/view_text", {state : {text : response.data, book }});
        } catch (error) {
            alert(selectedBook);
        } finally {
            setLoading(false);
        };
    };


    useEffect (() => {
        getBooks();
    }, []);

    return (
        <div className="books">
            {loading ? (
                <p>loading</p>
            ) : (
                <ul className="book-list">
                    {booklist.map((book,index)=>(
                        <li onClick={() => getBookText(book)} style={{cursor:"pointer"}}>
                            {book}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Home;