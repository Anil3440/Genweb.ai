import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { Code2, MessageSquare, Monitor, Rocket, ScatterChart, Send, X } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import Editor from '@monaco-editor/react';

const WebsiteEditor = () => {
  const { id } = useParams();
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const iframeRef = useRef(null);
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [showCode,setShowCode] = useState(false);
  const[showFullPreview,setShowFullPreview] = useState(false);
  const[showChat,setShowChat] = useState(false);
  const thinkingSteps = [
    "Understanding your request…",
    "Planning layout changes…",
    "Improving responsiveness…",
    "Applying animations…",
    "Finalizing update…",
  ];

  // Update Website Logic
  const handleUpdate = async () => {
    if(prompt==="") return;
    setLoading(true);
    const text = prompt;
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setPrompt("");
    try {
      const res = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        { prompt: text},
        { withCredentials: true },
      );
      console.log(res);
      setMessages((m) => [...m, { role: "ai", content: res.data.message }]);
      setCode(res.data.code);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDeploy = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/website/deploy/${website._id}`, {
          withCredentials: true,
        });
        window.open(`${res.data.url}`, "_blank");
      } catch (error) {
        console.log(error);
      }
    };

  // Thinking Steps Logic
  useEffect(() => {
    if(!loading) return;
    const i = setInterval(()=>{
        setThinkingIdx((i)=>(i+1)%thinkingSteps.length)
    },1200);
    return ()=> clearInterval(i);
  }, [loading]);

  // Get Website Details Logic
  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          { withCredentials: true },
        );
        setWebsite(res.data);
        setCode(res.data.latestCode);
        setMessages(res.data.conversation);
      } catch (error) {
        console.log(`error fetching website ${error}`);
        setError(error.response.data.message);
      }
    };
    handleGetWebsite();
  }, [id]);

  // Website Preview Logic
  useEffect(() => {
    if (!iframeRef.current || !code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [code]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }
  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      {/* SideBar */}
      <aside className="hidden lg:flex w-95 flex-col border-r border-white/10 bg-black/80">
        {/* Header Component */}
        <Header
          title={website.title}
        />
        {/* Chat Component */}
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`
                            max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}
                        `}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-zinc-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && 
            <div className="max-w-[85%] mr-auto">
                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIdx]}</div>
            </div>
            }
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                placeholder="Describe Changes..."
                className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none"
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
              ></input>
              <button
                className="px-4 py-3 rounded-2xl bg-white text-black"
                onClick={handleUpdate}
                disabled = {loading}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      </aside>
      {/* Main Content Section */}
      <div className="flex-1 flex flex-col">
        {/* Nav Bar */}
        <div className="h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">
          <span className="text-xs text-zinc-400">Live Preview</span>
          <div className="flex gap-2">
            {!website.deployed && 
              <button 
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition cursor-pointer"
                onClick={async ()=>{
                  await handleDeploy();
                  setWebsite((prev)=>({...prev,deployed: true}));
                }
                }
              >
                <Rocket size={14} /> Deploy
              </button>
            }

            <button className="p-2 lg:hidden" onClick={()=>setShowChat(true)}>
              <MessageSquare size={18} />
            </button>

            <button className="p-2 hover:scale-105 transition cursor-pointer" onClick={()=>setShowCode(true)}>
              <Code2 size={18} />
            </button>
            <button className="p-2 hover:scale-105 transition cursor-pointer" onClick={()=>setShowFullPreview(true)}>
              <Monitor size={18} />
            </button>
          </div>
        </div>
        {/* Website Preview */}
        <iframe ref={iframeRef} className="flex-1 w-full bg-white" sandbox='allow-scripts allow-same-origin allow-forms' />
      </div>
      {/* Chat In Small Devices */}
      <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="fixed inset-0 z-9999 bg-black flex flex-col"
              >
                <Header 
                  title={website.title}
                  onclose={()=>setShowChat(false)}
                />
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`
                                    max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}
                                `}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            m.role === "user"
                              ? "bg-white text-black"
                              : "bg-white/5 border border-white/10 text-zinc-200"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {loading && 
                    <div className="max-w-[85%] mr-auto">
                        <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIdx]}</div>
                    </div>
                    }
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        placeholder="Describe Changes..."
                        className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none"
                        onChange={(e) => setPrompt(e.target.value)}
                        value={prompt}
                      ></input>
                      <button
                        className="px-4 py-3 rounded-2xl bg-white text-black"
                        onClick={handleUpdate}
                        disabled = {loading}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </>
              </motion.div>
            )}
      </AnimatePresence>
      {/* Code preview */}
      <AnimatePresence>
            {showCode && (
                <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-9999 bg-[#1e1e1e] flex flex-col"
                >
                  <div className='h-12 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                  <span className='text-sm font-medium'>index.html</span>
                  <button onClick={() => setShowCode(false)}><X size={18} /></button>
                  </div>
                  <Editor
                  theme="vs-dark"
                  value={code}
                  language="html"
                  onChange={(c)=>setCode(c)}
                  />
                </motion.div>
            )}
      </AnimatePresence>
      {/* Full Screen Preview */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div className="fixed inset-0 z-9999 bg-black">
            <iframe className="w-full h-full bg-white" srcDoc={code} sandbox='allow-scripts allow-same-origin allow-forms'/>
            <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
          </motion.div>
          
        )}
      </AnimatePresence>
    </div>
  );
};
function Header({title,onclose}) {
  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
      <span className="font-semibold truncate">{title}</span>
      {onclose && <button onClick={onclose}><X size={18} color="white"/></button>}
      
    </div>
  );
}

export default WebsiteEditor;
