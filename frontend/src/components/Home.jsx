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
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect(); //position of selected text
            setButtonPosition({ top: rect.top + window.scrollY,left: rect.left + window.scrollX })
            setSelectedText(selectedText)
            const response = await api.get("/search" , {params : {query : selectedText}});
            const result = response.data.result;
            //alert(result);
            setSemanticMatch(response.data.result)
        } else {
            setButtonPosition(null);
            setSelectedText("");
        }
    };


    const handleCompare = () => {
        const state = { selectedText, semanticMatch };
        const stateString = encodeURIComponent(JSON.stringify(state));
        window.open(`\compare_text?state=${stateString}`,"_blank");
        // navigate("/compare_text", {state : {selectedText,semanticMatch }});
    }

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

            {text && (
                <div className="book-text" onMouseUp={handleTextSelection}
                style={{cursor:"text"}}
                >
                    <h2>{text.title}</h2>
                    <h3>{text.translator}</h3>
                    <p>{text.body}</p>
                </div>
            )}

            {buttonPosition && (
                <button
                    style={{
                        position:"absolute",
                        top:buttonPosition.top,
                        left:buttonPosition.left,
                        zIndex:1000,
                    }}
                    onClick={handleCompare}
                    >view</button>
            )}
        </div>
    )
}

export default Home;