import { useState, useEffect, useRef } from "react";
import { Paperclip, ArrowUp, Globe, Bot } from "lucide-react";
import logo from "../../public/logo.webp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";

function Promt() {
  const [input, setInput] = useState("");
  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { chatId: paramChatId } = useParams();
  const [chatId, setChatId] = useState(paramChatId || null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSendPrompt();
      }
    }
  };

  // Load existing chat on page load (when chatId changes)
  useEffect(() => {
    const loadChat = async () => {
      if (!paramChatId) return;

      setPromt([]); // Clear current chat

      try {
        const res = await axiosClient.get(`/chat/${paramChatId}`);

        if (res.data.success) {
          const fetchedChat = res.data.chat;

          const formattedMessages = fetchedChat.messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.parts?.[0]?.text || "",
          }));

          setPromt(formattedMessages);
          setChatId(paramChatId);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        setPromt([
          {
            role: "model",
            content: "⚠️ Failed to load this chat.",
          },
        ]);
      }
    };

    loadChat();
  }, [paramChatId]);

  const handleSendPrompt = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg = { role: "user", content: trimmedInput };
    setPromt((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const endpoint = chatId ? `/chat/${chatId}` : "/chat";
      const res = await axiosClient.post(endpoint, { msg: trimmedInput });

      const aiText =
        res.data?.message?.model?.parts?.[0]?.text || "⚠️ No response from AI.";
      const aiMsg = { role: "model", content: aiText };
      setPromt((prev) => [...prev, aiMsg]);

      // If no chatId yet, set it and navigate
      if (!chatId && res.data?.chatId) {
        setChatId(res.data.chatId);
        navigate(`/chat/${res.data.chatId}`);
      }
    } catch (error) {
      setPromt((prev) => [
        ...prev,
        { role: "model", content: "⚠️ Failed to fetch response." },
      ]);
      console.error("Chat error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-between flex-1 ${
        promt.length == 0 ? "" : "h-full"
      } w-full px-4 pb-4`}
    >
      {/* Greeting Section */}
      <div
        className={` text-center ${promt.length == 0 ? "" : "hidden"} ${chatId ? "hidden" : ""} mb-10`}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold text-white mb-2">
            <img src={logo} alt="DeepSeek Logo" className="h-8 rounded-lg" />
            Hi, I'm NexAi.
          </div>
        </div>
        <p className="text-gray-400 text-base md:text-sm mt-2">
          💬 How can I help you today?
        </p>
      </div>

      {/* Chat Section */}
      <div
        className={`w-full max-w-3xl ml-3 flex-1 overflow-y-auto ${
          promt.length == 0 ? "" : "pt-6 pb-25"
        }  space-y-4 max-h-[79vh]  px-1`}
      >
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* model response */}
            {msg.role === "model" ? (
              <div className="w-full  text-white rounded-xl py-3 text-[16px] whitespace-pre-wrap">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1 py-0.5 rounded"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              // User message - at top-right
              <div className="max-w-[60%] bg-blue-600 text-white rounded-xl p-3 text-sm whitespace-pre-wrap self-start">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <span className="loading loading-dots  bg-white loading-lg"></span>
        )}

        <div ref={promtEndRef} />
      </div>

      {/* Input Box */}
      <div
        className={`max-w-3xl mt-auto ${
          chatId ? "fixed bottom-5 mr-1" : ""
        } w-[96%] md:w-[100%]`}
      >
        <div
          className={`bg-[#2f2f2f]  rounded-[2rem] px-4 py-6 md:py-4 shadow-md`}
        >
          <textarea
            type="text"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message NexAi"
            className="flex-1 bg-transparent w-full text-white placeholder-gray-400 text-base md:text-lg outline-none resize-none overflow-y-auto max-h-40 p-2"
            onKeyDown={handleKeyDown}
          />

          <div className="flex flex-row sm:flex-row sm:items-center justify-between gap-4">
            {/* Functional Buttons */}
            <div className="flex gap-2 flex-wrap ">
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm px-3 py-1.5 rounded-full hover:bg-gray-600 transition cursor-pointer">
                <Bot className="w-4 h-4" />
                DeepThink (R1)
              </button>
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm  px-3 py-1.5 rounded-full hover:bg-gray-600 transition cursor-pointer">
                <Globe className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Send Button */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="text-gray-400 hover:text-white transition cursor-pointer">
                <Paperclip className="w-5 h-5" />
              </button>
              <button
              onClick={handleSendPrompt}
                disabled={loading || input.trim().length === 0}
                className={`p-2 rounded-full text-white transition 
                ${
                  loading || input.trim().length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-500 hover:bg-blue-600 cursor-pointer"
                }`}
              >
                <ArrowUp className="w-4 h-4 " />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;
