import { useState, useEffect } from "react";
import api from "../api"

const Home = () => {
    const [booklist, setBookList] = useState([]);
    const [loading,setLoading] = useState(false);
    const [text, setText] = useState("");
    const [selectedBook, setSelectedBook] = useState("");
    const [semanticMatch, setSemanticMatch] = useState([]);

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
        } catch (error) {
            alert(selectedBook);
        } finally {
            setLoading(false);
        };

    };

    const handleTextSelection = async () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            const response = await api.get("/search" , {params : {query : selectedText}});
            setSemanticMatch(response.data.result)
        }

        alert(semanticMatch)
    };

    useEffect (() => {
        getBooks();
    }, []);

    return (
        <div className="books">
            {loading ? (
                <p>loading</p>
            ) : (
                <div className="book-list">
                <ul>
                    {booklist.map((book,index)=>(
                        <li onClick={() => getBookText(book)} style={{cursor:"pointer"}}>
                            {book}
                        </li>
                    ))}
                </ul>
                </div>
            )}

            {text && (
                <div className="book-text" onMouseUp={handleTextSelection}
                style={{whiteSpace: "pre-wrap", cursor:"text"}}
                >
                    {text}
                </div>
            )}
        </div>
    )
}

export default Home;