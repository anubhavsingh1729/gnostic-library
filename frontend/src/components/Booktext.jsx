import { useLocation } from "react-router-dom";
import { useState } from "react"
import "../css/home.css"

const BookText = () => {

    const location = useLocation();
    const { text, book } = location.state || {};

    const [buttonPosition,setButtonPosition] = useState(null);
    const [semanticMatch, setSemanticMatch] = useState([]);
    const [selectedText, setSelectedText] = useState("");

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
    };

    return (
        <div className="book">
            <div className="book-text" onMouseUp={handleTextSelection}
            style={{cursor:"text"}}
            >
                <h2>{text.title}</h2>
                {text.body.map((verse,index)=>(
                    <p>{verse}</p>
                ))}
            </div>
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

export default BookText;