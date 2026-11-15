
import dotenv from "dotenv";
dotenv.config();
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const boturl = process.env.BOT_URL;

export const sendMessage = async (id, message,hash) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // Define the message data with inline keyboard for the button
    const data = {
        chat_id: id,
        text: escapeMarkdownV2(message),
        parse_mode:'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔗 View Transaction",  // Text on the channel button
                        url: "https://tonviewer.com/transaction/"+hash  // Replace with your channel's URL
                    }
                ],
               
                [
                    {
                        text: "🚀 Start Mining",
                        url: boturl
                    }
                ]
            ]
        }
        
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("Message with button sent successfully!");
        } else {
            console.log("Failed to send message.url->",url);
        }
    } catch (error) {
        console.error("Error sending message with button: ", error);
    }
};




export const sendMessage2 = async (id, message) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // Define the message data with inline keyboard for the button
    const data = {
        chat_id: id,
        text: escapeMarkdownV2(message),
        parse_mode:'Markdown',
        reply_markup: {
            inline_keyboard: [
               
                [
                    {
                        text: "🚀 Start Mining",
                        url: boturl
                    }
                ]
            ]
        }
        
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("Message with button sent successfully!");
        } else {
            console.log("Failed to send message.url->",url);
        }
    } catch (error) {
        console.error("Error sending message with button: ", error);
    }
};



function escapeMarkdownV2(text) {
  // Escape only underscore:
   return text.replace(/_/g, '\\_');
}


export const sendMessage1 = async (id, message,hash) => {
    console.log("sending to channel")
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const data = {
        chat_id: id,
        text: escapeMarkdownV2(message),
        parse_mode:'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔗 View Transaction",  // Text on the channel button
                        url: "https://tonviewer.com/transaction/"+hash  // Replace with your channel's URL
                    }
                ],
               
                [
                    {
                        text: "🚀 Start Mining",
                        url: boturl
                    }
                ]
            ]
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("Message with button sent successfully to channel!");
        } else {
            const err = await response.json();
            console.error("Failed to send message:", err);
        }
    } catch (error) {
        console.error("Error sending message with button: ", error);
    }
};
