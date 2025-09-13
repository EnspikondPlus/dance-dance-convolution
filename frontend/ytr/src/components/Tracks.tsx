import { useEffect, useState } from "react";
import { sendLinkFlask, sendProcessing } from "../services/api";

export default function Tracks() {
    const [link, setLink] = useState("");
    const [feed, setFeed] = useState<any>(null);
    const [thumbnail, setThumbnail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [perror, setPError] = useState(false);
    const [ploading, setPLoading] = useState(false);
    const [pfeed, setPFeed] = useState<any>(null);
    const [track, setTrack] = useState<any>(null);

    const sendLink = async () => {
        setFeed(null);
        setThumbnail(null);
        setLoading(true);
        setError(false);
        try {
            const response = await sendLinkFlask(link);
            setFeed(response);
            try {
                setThumbnail(response.thumbnail)
            } catch (err) {
                console.error(err);
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        }
        setLoading(false);
    };

    const startProcessing = async () => {
        setPError(false);
        setPLoading(true);
        setPFeed(null);
        try{
            const response = await sendProcessing(link);
            setPFeed(response);
            setTrack(response.track);
        }
        catch(err){
            console.error(err);
            setError(true);
        }
        setPLoading(false);
    }

    return (
        <div id="section2" className="first-block">
            <h2>Grab A Track</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                sendLink();
            }}>
                <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Enter a Youtube link..."
                ></input>
                <button onClick={sendLink} type="submit">Grab Video!</button>
            </form>
            <div>
                {loading && (<div className="error"><p className="spinner"></p></div>)}
                {error && <p>Not a valid URL!</p>}
                {feed && (
                    <div>
                        <h4><b>Video Information:</b> </h4>
                        <p><b>Title:</b> {feed.title}</p>
                        {thumbnail && (
                            <div>
                                <p><b>Thumbnail:</b> {thumbnail}</p>
                                <img src={thumbnail}></img>
                            </div>
                        )}
                        <button onClick={startProcessing} type="button">Looks Good!</button>
                        {ploading && (
                            <div className="error">
                                <p className="spinner"></p>
                                <p>This may take a while...</p>
                            </div>
                        )}
                        {perror && <p>Processing failed!</p>}
                        {pfeed && (
                            <div>
                                <p>{pfeed.message}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
