import { useLocation } from "react-router-dom";
import { useState } from "react"
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

    const handleTextSelection = async () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        if (selectedText) {
            setLoading(true);
            // const range = selection.getRangeAt(0);
            // const rect = range.getBoundingClientRect(); //position of selected text
            // setButtonPosition({ top: rect.top + window.scrollY,left: rect.left + window.scrollX })
            setSelectedText(selectedText)
            const response = await api.get("/search" , {params : {query : selectedText}});
            const result = response.data.result;
            setSemanticMatch(result)
            setLlm(response.data.mistral)
            setLoading(false);
        } else {
            // setButtonPosition(null);
            setSelectedText("");
        }
    };

    // const handleCompare = () => {
    //     const state = { selectedText, semanticMatch };
    //     const stateString = encodeURIComponent(JSON.stringify(state));
    //     window.open(`\compare_text?state=${stateString}`,"_blank");
    //     // navigate("/compare_text", {state : {selectedText,semanticMatch }});
    // };

    return (
        <div className="text-container">
            <div className="book-text" onMouseUp={handleTextSelection}
            style={{cursor:"text"}}
            >
                <h2>{text.title}</h2>
                {text.body.map((verse,index)=>(
                    <p>{verse}</p>
                ))}
            </div>
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

            {!selectedText && (
                <div className="placeholder">
                    <h3>Select text to compare with Canonical Scripture</h3>
                </div>
            )}

            {selectedText && (
                <div className="bible-text">
                    {loading && (
                        <div className="placeholder">
                            <h3>Loading...</h3>
                        </div>
                    )}
                    <h2>Canonical Texts</h2>
                    {semanticMatch.map((t,i)=> (
                        <ul>
                            <li key={i}>{`${t[0]}`}</li>
                            <p>{`similarity ${(t[1]*100).toFixed(0)}%`}</p>
                        </ul>
                    ))}
                    <p>{llm}</p>
                </div>
            )}
        </div>
    )
}

export default BookText;