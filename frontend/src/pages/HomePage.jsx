import { useEffect, useState } from "react";
import api from "../lib/axios.js";
import NoteCard from "../components/NoteCard.jsx";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI.jsx";
import NoteNotFound from "../components/NoteNotFound.jsx";
import toast from "react-hot-toast";

const HomePage = () => {
  const [rateLimited, setRateLimit] = useState(false);
  const [notes, Setnotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_notes = async () => {
      try {
        const res = await api.get("/notes");

        Setnotes(res.data && res.data.notes ? res.data.notes : []);
        setRateLimit(false);
      } catch (err) {
        console.log("Error", err);
        if (err.response && err.response.status === 429) {
          setRateLimit(true);
        } else {
          toast.error("Failed to load Tasks");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch_notes();
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      {rateLimited && <RateLimitedUI />}

      <div className="max-w-71 mx-auto p-4 mt-6">
        {loading && (
          <div className="text-xl text-center text-primary py-10">
            Loading Notes..
          </div>
        )}

        {notes.length === 0 && !rateLimited && <NoteNotFound />}

        {notes.length > 0 && !rateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} Setnotes={Setnotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
