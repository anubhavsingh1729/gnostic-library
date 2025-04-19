import { useLocation } from "react-router-dom";
import { use, useState } from "react"
import "../css/booktext.css"

import api from "../api"

const BookText = () => {

    const location = useLocation();
    const { text, book } = location.state || {};

    // const [buttonPosition,setButtonPosition] = useState(null);
    const [semanticMatch, setSemanticMatch] = useState([]);
    const [selectedText, setSelectedText] = useState("");
    const [loading, setLoading] = useState();
    const [llm, setLlm] = useState([]);
    const [compare, setCompare] = useState([]);
    const [popup, setPopup] = useState(false)

    // const handleTextSelection = async () => {
    //     const selection = window.getSelection();
    //     const selectedText = selection.toString();
    //     if (selectedText) {
    //         setLoading(true);
    //         setSemanticMatch([]);
    //         setLlm([]);
    //         // const range = selection.getRangeAt(0);
    //         // const rect = range.getBoundingClientRect(); //position of selected text
    //         // setButtonPosition({ top: rect.top + window.scrollY,left: rect.left + window.scrollX })
    //         setSelectedText(selectedText)
    //         const response = await api.get("/search" , {params : {query : selectedText,book:book}});
    //         const result = response.data.result;
    //         setSemanticMatch(result)
    //         setLlm(response.data.llm)
    //         setLoading(false);
    //     } else {
    //         // setButtonPosition(null);
    //         setSelectedText("");
    //     }
    // };

    // const handleCompare = () => {
    //     const state = { selectedText, semanticMatch };
    //     const stateString = encodeURIComponent(JSON.stringify(state));
    //     window.open(`\compare_text?state=${stateString}`,"_blank");
    //     // navigate("/compare_text", {state : {selectedText,semanticMatch }});
    // };

    const handleCompare = async () => {
        setLoading(true);
        setCompare([]);
        try {
            const response = await api.get("/compare", {params : {gnostic: text, book: book}});
            setCompare(response.data.result);
            setPopup(true);
        } catch(error) {
            alert(error);
        } finally {
            setLoading(false);
        };
    }

    const closePopup = () => {
        setPopup(false);
    }

    return (
        <div className="text-container">

            <div className="left-bar">
                <div className="compare">
                    <button onClick={handleCompare} disabled={loading}>
                        {loading ? "loading...": "Compare with Canon"}
                    </button>
                </div>
            </div>

            <div className="book-text">
                <h2>{text.title}</h2>
                {text.body.map((verse,index)=>(
                    <p>{verse}</p>
                ))}
            </div>

            {popup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Comparision with Canonical Scriptures</h3>
                        {compare.map((c,i)=>(
                            <p key={i}>{c}</p>
                        ))}
                        <button onClick={closePopup}>close</button>
                    </div>
                </div>
            )}

            {/* {buttonPosition && (
                <button
                    style={{
                        position:"absolute",
                        top:buttonPosition.top,
                        left:buttonPosition.left,
                        zIndex:1000,
                    }}
                    onClick={handleCompare}
                    >compare</button>
            )} */}
{/* 
            {!selectedText && (
                <div className="placeholder">
                    <h3>Select text to compare with Canonical Scripture</h3>
                </div>
            )}

            {selectedText && (
                <div className="bible-text">
                    <h2>Canonical Texts</h2>
                    {loading && (
                        <div className="placeholder">
                            <h3>Loading...</h3>
                        </div>
                    )}
                    {semanticMatch.map((t,i)=> (
                        <ul>
                            <li key={i}>{`${t[0]}`}</li>
                            <p>{`similarity ${(t[1]*100).toFixed(0)}%`}</p>
                        </ul>
                    ))}
                    {llm.map((l,i)=>(
                        <ul>
                            <li key = {i}>{l}</li>
                        </ul>
                    ))}
                </div>
            )} */}
        </div>
    )
}

export default BookText;