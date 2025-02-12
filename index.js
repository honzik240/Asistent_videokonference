import { useState, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Ahoj! Jak ti mohu pomoci s dokumentem?" },
  ]);
  const [input, setInput] = useState("");
  const [documentText, setDocumentText] = useState("");

  useEffect(() => {
    async function loadDocument() {
      try {
        let url = "https://sharepoint.penam.cz/Sdilene%20dokumenty/videokonference.txt";
        let response = await fetch(url);
        if (!response.ok) {
          throw new Error("Chyba při načítání dokumentu");
        }
        let text = await response.text();
        setDocumentText(text);
      } catch (error) {
        console.error("Nepodařilo se načíst dokument:", error);
      }
    }
    loadDocument();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prevMessages => [...prevMessages, { sender: "user", text: input }]);
    setInput("");

    try {
      const aiResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
        method: "POST",
        headers: { "Authorization": "Bearer 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", "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: `Dokument: ${documentText}\n\nOtázka: ${input}` })
      });

      if (!aiResponse.ok) {
        throw new Error("Chyba při volání AI API");
      }

      const aiData = await aiResponse.json();
      let botReply = aiData.length > 0 ? aiData[0].generated_text : "Omlouvám se, ale nemám k tomu informace.";

      setMessages(prevMessages => [...prevMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Chyba při zpracování odpovědi AI:", error);
      setMessages(prevMessages => [...prevMessages, { sender: "bot", text: "Omlouvám se, došlo k chybě při komunikaci s AI." }]);
    }
  };

  return (
    <div>
      <h2>Chatbot</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index} style={{ color: msg.sender === "bot" ? "blue" : "black" }}>{msg.text}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Napiš dotaz..." />
      <button onClick={sendMessage}>Odeslat</button>
    </div>
  );
}
