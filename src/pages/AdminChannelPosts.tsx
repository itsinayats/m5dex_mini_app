import React, { useState } from "react";
import axios from "axios";
import {
  Send,
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface ChannelButton {
  text: string;
  url: string;
}

interface ChannelImage {
  file: File;
  dataUrl: string;
  fileName: string;
  fileSize: number;
  type: string;
}

const AdminChannelPosts: React.FC = () => {
  const { adminToken } = useAppContext();

  const CHAT_ID = import.meta.env.VITE_CHAT_ID;
  const BOT_URL = import.meta.env.VITE_BOT_URL;
  console.log("CHAT_ID:", CHAT_ID);
  console.log("BOT_URL:", BOT_URL);

  const [channelPostTarget, setChannelPostTarget] =
    useState(CHAT_ID || "");

  const [channelPostMessage, setChannelPostMessage] =
    useState("");

  const [channelPostParseMode, setChannelPostParseMode] =
    useState<"Markdown" | "MarkdownV2" | "HTML" | "none">(
      "HTML"
    );

  const [channelPostButtons, setChannelPostButtons] =
    useState<ChannelButton[]>([
      {
        text: "🚀 Start Now",
        url: BOT_URL,
      },
    ]);

  const [channelPostImage, setChannelPostImage] =
    useState<ChannelImage | null>(null);

  const [channelPostSending, setChannelPostSending] =
    useState(false);

  const [channelPostSuccess, setChannelPostSuccess] =
    useState<string | null>(null);

  const [apiError, setApiError] =
    useState<string | null>(null);

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleChannelPostImage = (file: File | null) => {
    setApiError(null);

    if (!file) {
      setChannelPostImage(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setApiError(
        "Only JPG, PNG and WebP images are allowed."
      );
      return;
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      setApiError(
        "Image size must be less than 8MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setApiError(
          "Unable to preview the selected image."
        );
        return;
      }

      // IMPORTANT:
      // Keep the REAL File object.
      setChannelPostImage({
        file,
        dataUrl: reader.result,
        fileName: file.name,
        fileSize: file.size,
        type: file.type,
      });
    };

    reader.onerror = () => {
      setApiError(
        "Failed to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // BUTTONS
  // ============================================================

  const addButton = () => {
    setChannelPostButtons((prev) => [
      ...prev,
      {
        text: "",
        url: "",
      },
    ]);
  };

  const removeButton = (index: number) => {
    setChannelPostButtons((prev) => {
      if (prev.length === 1) {
        return [
          {
            text: "",
            url: "",
          },
        ];
      }

      return prev.filter(
        (_, idx) => idx !== index
      );
    });
  };

  const updateButton = (
    index: number,
    field: keyof ChannelButton,
    value: string
  ) => {
    setChannelPostButtons((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ============================================================
  // SEND CHANNEL POST
  // ============================================================

  const handleSendChannelPost = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!adminToken) {
      setApiError(
        "Admin authentication token is missing."
      );
      return;
    }

    if (!channelPostTarget.trim()) {
      setApiError(
        "Please enter a Telegram channel ID or username."
      );
      return;
    }

    if (!channelPostMessage.trim()) {
      setApiError(
        "Please enter a message."
      );
      return;
    }

    setChannelPostSending(true);
    setChannelPostSuccess(null);
    setApiError(null);

    try {
      const formData = new FormData();

      // ========================================================
      // TEXT FIELDS
      // ========================================================

      formData.append(
        "channelId",
        channelPostTarget.trim()
      );

      formData.append(
        "message",
        channelPostMessage
      );

      if (channelPostParseMode !== "none") {
        formData.append(
          "parseMode",
          channelPostParseMode
        );
      }

      // ========================================================
      // BUTTONS
      // ========================================================

      const validButtons =
        channelPostButtons.filter(
          (button) =>
            button.text.trim() &&
            button.url.trim()
        );

      formData.append(
        "buttons",
        JSON.stringify(validButtons)
      );

      // ========================================================
      // IMAGE
      // ========================================================

      if (channelPostImage?.file) {
        console.log(
          "Sending image:",
          {
            name:
              channelPostImage.file.name,
            type:
              channelPostImage.file.type,
            size:
              channelPostImage.file.size,
          }
        );

        // IMPORTANT:
        // Send the actual File object.
        formData.append(
          "image",
          channelPostImage.file,
          channelPostImage.file.name
        );
      }

      // ========================================================
      // DEBUG FORMDATA
      // ========================================================

      console.log(
        "Channel post payload:"
      );

      for (const [
        key,
        value,
      ] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else {
          console.log(key, value);
        }
      }

      // ========================================================
      // API REQUEST
      // ========================================================

      const response = await axios.post(
        "/api/admin/telegram/channel-message",
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${adminToken}`,
          },

          // Do NOT manually specify:
          // Content-Type: multipart/form-data
          //
          // Axios/browser will add the correct
          // multipart boundary automatically.
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error ||
            "Telegram rejected the channel message."
        );
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      setChannelPostSuccess(
        "Channel message sent successfully."
      );

      setChannelPostMessage("");

      setChannelPostImage(null);

      setChannelPostButtons([
        {
          text: "",
          url: "",
        },
      ]);

      setTimeout(() => {
        setChannelPostSuccess(null);
      }, 4000);
    } catch (error: any) {
      console.error(
        "Channel message failed:",
        error
      );

      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send channel message.";

      setApiError(message);
    } finally {
      setChannelPostSending(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setChannelPostTarget(
      CHAT_ID || ""
    );

    setChannelPostMessage("");

    setChannelPostParseMode(
      "HTML"
    );

    setChannelPostButtons([
      {
        text: "",
        url: "",
      },
    ]);

    setChannelPostImage(null);

    setChannelPostSuccess(null);

    setApiError(null);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const activeButtons =
    channelPostButtons.filter(
      (button) =>
        button.text.trim() &&
        button.url.trim()
    );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#101318] text-neutral-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8 border-b border-neutral-800 pb-6">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#ffe000]/10 border border-[#ffe000]/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#ffe000]" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Channel Posts
                </h1>

                <p className="text-xs text-neutral-500 mt-1">
                  Publish messages directly to your Telegram channel.
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={channelPostSending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-700 bg-[#1b2028] hover:bg-[#252b34] text-neutral-400 hover:text-white text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

        </div>

        {/* SUCCESS */}

        {channelPostSuccess && (
          <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">

            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

            <div>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                Success
              </p>

              <p className="text-xs text-emerald-300/80 mt-1">
                {channelPostSuccess}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setChannelPostSuccess(null)
              }
              className="ml-auto text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* ERROR */}

        {apiError && (
          <div className="mb-6 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">

            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />

            <div>
              <p className="text-xs font-black text-rose-400 uppercase tracking-wide">
                Error
              </p>

              <p className="text-xs text-rose-300/80 mt-1">
                {apiError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setApiError(null)
              }
              className="ml-auto text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSendChannelPost}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >

          {/* LEFT */}

          <div className="xl:col-span-2 space-y-6">

            {/* MESSAGE CONFIGURATION */}

            <div className="bg-[#1b2028] border border-neutral-800 rounded-xl p-5 md:p-6 shadow-2xl">

              <div className="flex items-center gap-2 mb-5">

                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-brand-400" />
                </div>

                <h2 className="text-sm font-black text-white uppercase tracking-tight">
                  Message Configuration
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* CHANNEL */}

                <div>

                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-2">
                    Channel / Chat ID
                  </label>

                  <input
                    type="text"
                    value={channelPostTarget}
                    onChange={(e) =>
                      setChannelPostTarget(
                        e.target.value
                      )
                    }
                    placeholder="@channel_username or -100123456789"
                    disabled={channelPostSending}
                    className="w-full bg-[#101318] border border-neutral-700 text-white p-3 rounded-lg text-xs font-semibold placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#ffe000]/40 focus:border-[#ffe000] transition-all disabled:opacity-50"
                    required
                  />

                  <p className="text-[9px] text-neutral-600 mt-2">
                    Bot must be an administrator in the channel.
                  </p>

                </div>

                {/* PARSE MODE */}

                <div>

                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-2">
                    Markup Mode
                  </label>

                  <select
                    value={channelPostParseMode}
                    onChange={(e) =>
                      setChannelPostParseMode(
                        e.target.value as
                          | "Markdown"
                          | "MarkdownV2"
                          | "HTML"
                          | "none"
                      )
                    }
                    disabled={channelPostSending}
                    className="w-full bg-[#101318] border border-neutral-700 text-white p-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ffe000]/40 focus:border-[#ffe000] transition-all disabled:opacity-50"
                  >
                    <option value="HTML">
                      HTML
                    </option>

                    <option value="Markdown">
                      Markdown
                    </option>

                    <option value="MarkdownV2">
                      MarkdownV2
                    </option>

                    <option value="none">
                      No Markup
                    </option>
                  </select>

                  <p className="text-[9px] text-neutral-600 mt-2">
                    Choose how Telegram should parse your message.
                  </p>

                </div>

              </div>

              {/* MESSAGE */}

              <div className="mt-5">

                <div className="flex items-center justify-between mb-2">

                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Message
                  </label>

                  <span className="text-[9px] text-neutral-600 font-mono">
                    {channelPostMessage.length} characters
                  </span>

                </div>

                <textarea
                  value={channelPostMessage}
                  onChange={(e) =>
                    setChannelPostMessage(
                      e.target.value
                    )
                  }
                  placeholder={
                    channelPostParseMode ===
                    "HTML"
                      ? "<b>Welcome!</b>\n\nWrite your Telegram channel message here..."
                      : "Write your Telegram channel message here..."
                  }
                  rows={12}
                  disabled={channelPostSending}
                  className="w-full bg-[#101318] border border-neutral-700 text-white p-4 rounded-xl text-sm font-medium placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#ffe000]/40 focus:border-[#ffe000] transition-all resize-y disabled:opacity-50"
                  required
                />

                <p className="text-[9px] text-neutral-600 mt-2">
                  Telegram formatting is controlled by the selected markup mode.
                </p>

              </div>

            </div>

            {/* INLINE BUTTONS */}

            <div className="bg-[#1b2028] border border-neutral-800 rounded-xl p-5 md:p-6 shadow-2xl">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-sm font-black text-white uppercase tracking-tight">
                    Inline Buttons
                  </h2>

                  <p className="text-[9px] text-neutral-600 mt-1">
                    Add clickable buttons below the Telegram post.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={addButton}
                  disabled={channelPostSending}
                  className="inline-flex items-center gap-1.5 bg-[#ffe000]/10 hover:bg-[#ffe000]/20 border border-[#ffe000]/20 text-[#ffe000] px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wide transition disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                  Add Button
                </button>

              </div>

              <div className="space-y-3">

                {channelPostButtons.map(
                  (button, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_auto] gap-2"
                    >

                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) =>
                          updateButton(
                            index,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Button text"
                        disabled={channelPostSending}
                        className="bg-[#101318] border border-neutral-700 text-white p-3 rounded-lg text-xs font-semibold placeholder:text-neutral-700 focus:outline-none focus:border-[#ffe000] transition-all"
                      />

                      <input
                        type="text"
                        value={button.url}
                        onChange={(e) =>
                          updateButton(
                            index,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://example.com or tg://..."
                        disabled={channelPostSending}
                        className="bg-[#101318] border border-neutral-700 text-white p-3 rounded-lg text-xs font-semibold placeholder:text-neutral-700 focus:outline-none focus:border-[#ffe000] transition-all"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeButton(index)
                        }
                        disabled={channelPostSending}
                        className="min-h-[44px] px-3 rounded-lg border border-neutral-700 text-neutral-600 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition disabled:opacity-50"
                        aria-label="Remove button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  )
                )}

              </div>

              {activeButtons.length > 0 && (
                <div className="mt-5 pt-5 border-t border-neutral-800">

                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-3">
                    Active Buttons
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {activeButtons.map(
                      (button, index) => (
                        <div
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[9px] font-bold"
                        >
                          {button.text}
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* IMAGE */}

            <div className="bg-[#1b2028] border border-neutral-800 rounded-xl p-5 shadow-2xl">

              <div className="flex items-center gap-2 mb-1">

                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
                </div>

                <h2 className="text-sm font-black text-white uppercase tracking-tight">
                  Picture
                </h2>

              </div>

              <p className="text-[9px] text-neutral-600 mb-5">
                Optional image attached to your Telegram post.
              </p>

              {!channelPostImage ? (
                <label className="border border-dashed border-neutral-700 hover:border-[#ffe000]/50 bg-[#101318] rounded-xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all">

                  <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-3">
                    <ImageIcon className="w-5 h-5 text-neutral-600" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Upload Picture
                  </span>

                  <span className="text-[9px] text-neutral-600 mt-2">
                    JPG, PNG, WebP
                  </span>

                  <span className="text-[8px] text-neutral-700 mt-1">
                    Maximum 8MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      handleChannelPostImage(
                        e.target.files?.[0] ||
                          null
                      );

                      // Allows selecting the same
                      // file again after removing it.
                      e.currentTarget.value = "";
                    }}
                    className="hidden"
                  />

                </label>
              ) : (
                <div className="space-y-3">

                  <div className="relative overflow-hidden rounded-xl border border-neutral-700 bg-[#101318]">

                    <img
                      src={
                        channelPostImage.dataUrl
                      }
                      alt="Channel post preview"
                      className="w-full max-h-64 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setChannelPostImage(
                          null
                        )
                      }
                      disabled={
                        channelPostSending
                      }
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="bg-[#101318] border border-neutral-800 rounded-lg p-3">

                    <p className="text-[10px] font-bold text-neutral-300 truncate">
                      {
                        channelPostImage.fileName
                      }
                    </p>

                    <p className="text-[9px] text-neutral-600 mt-1">
                      {formatFileSize(
                        channelPostImage.fileSize
                      )}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setChannelPostImage(
                        null
                      )
                    }
                    disabled={
                      channelPostSending
                    }
                    className="w-full border border-neutral-700 hover:border-rose-500/30 hover:text-rose-400 text-neutral-500 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition"
                  >
                    Remove Picture
                  </button>

                </div>
              )}

            </div>

            {/* SUMMARY */}

            <div className="bg-[#1b2028] border border-neutral-800 rounded-xl p-5 shadow-2xl">

              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">
                Post Summary
              </h3>

              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Target
                  </span>

                  <span className="text-xs text-neutral-300 font-mono max-w-[180px] truncate">
                    {channelPostTarget ||
                      "Not set"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Markup
                  </span>

                  <span className="text-xs text-brand-400 font-bold">
                    {channelPostParseMode ===
                    "none"
                      ? "None"
                      : channelPostParseMode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Message
                  </span>

                  <span className="text-xs text-neutral-300 font-mono">
                    {
                      channelPostMessage.length
                    }{" "}
                    chars
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Picture
                  </span>

                  <span
                    className={`text-xs font-bold ${
                      channelPostImage
                        ? "text-emerald-400"
                        : "text-neutral-600"
                    }`}
                  >
                    {channelPostImage
                      ? "Attached"
                      : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Buttons
                  </span>

                  <span className="text-xs text-neutral-300 font-bold">
                    {
                      activeButtons.length
                    }
                  </span>
                </div>

              </div>

            </div>

            {/* SEND */}

            <div className="bg-[#ffe000]/10 border border-[#ffe000]/20 rounded-xl p-5 shadow-2xl">

              <div className="flex items-center gap-2 mb-2">

                <div className="w-8 h-8 rounded-lg bg-[#ffe000] flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>

                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Publish Post
                </h3>

              </div>

              <p className="text-[9px] text-neutral-500 leading-relaxed mb-5">
                The message will be sent immediately to the selected Telegram channel.
              </p>

              <button
                type="submit"
                disabled={
                  channelPostSending
                }
                className="w-full bg-[#ffe000] hover:bg-[#ffe65b] disabled:bg-neutral-800 disabled:text-neutral-600 text-white py-3.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ffe000]/10"
              >
                {channelPostSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Channel Message
                  </>
                )}
              </button>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AdminChannelPosts;
