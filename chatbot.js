import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(prevMessages => [...prevMessages, { sender: "user", text: input }]);
    setInput("");

    try {
      const aiResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
        method: "POST",
        headers: { "Authorization": "Bearer hf_xxxTvojeAPIxxx", "Content-Type": "application/json" },
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
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className={`p-2 rounded-lg ${msg.sender === "bot" ? "bg-gray-200" : "bg-blue-500 text-white"}`}>{msg.text}</div>
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-2 mt-4">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Napiš dotaz..." />
        <Button onClick={sendMessage}>Odeslat</Button>
      </div>
    </div>
  );
}
