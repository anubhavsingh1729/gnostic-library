import { useLocation } from "react-router-dom"
import "../css/compare.css"

const CompareText = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const state = JSON.parse(decodeURIComponent(query.get("state")));
    const { selectedText, semanticMatch }  = state || {};
    
    return (
        <div className="compare-container">
            <h3>{selectedText}</h3>
            <div className="compare-body">
                {semanticMatch.map((text,index)=>(
                    <p>{text}</p>
                ))}
            </div>
        </div>
    );
};

export default CompareText;