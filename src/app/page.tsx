"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  Utensils,
  Award,
  Baby,
  ShieldCheck,
} from "lucide-react";

import { db,  } from "@/config/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";


const categories = [
  {
    id: "recipes",
    name: "Recipes & Meals",
    icon: Utensils,
  },
  {
    id: "newly",
    name: "Newly Diagnosed",
    icon: Heart,
  },
  {
    id: "wellness",
    name: "Lifestyle & Wellness",
    icon: Award,
  },
  {
    id: "family",
    name: "Kids & Family",
    icon: Baby,
  },
  {
    id: "support",
    name: "Celiac Support",
    icon: ShieldCheck,
  },
];

export default function CreatePostPage() {
  const [title, setTitle] = useState(
    "5 things that improved my gut health"
  );

  const [content, setContent] = useState("");

  const [category, setCategory] =
    useState("wellness");

const [tags, setTags] = useState<string[]>([]);
const [tagInput, setTagInput] = useState("");

const [files, setFiles] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);
const [loading, setLoading] = useState(false);
const handleImageChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const selectedFiles = Array.from(e.target.files);

if (files.length + selectedFiles.length > 5) {
  toast.error("You can upload maximum 5 images");
  return;
}

  const updatedFiles = [...files, ...selectedFiles];

  setFiles(updatedFiles);

  const previewUrls = updatedFiles.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviews(previewUrls);
};

const removeImage = (index: number) => {
  const updatedFiles = files.filter(
    (_, i) => i !== index
  );

  const updatedPreviews = previews.filter(
    (_, i) => i !== index
  );

  setFiles(updatedFiles);
  setPreviews(updatedPreviews);
};
const addTag = () => {
  const value = tagInput.trim();

  if (!value) return;

  if (tags.includes(value)) {
    toast.error("Tag already exists");
    return;
  }

  if (tags.length >= 10) {
    toast.error("Maximum 10 tags allowed");
    return;
  }

  setTags([...tags, value]);
  setTagInput("");
};

const removeTag = (tag: string) => {
  setTags(tags.filter((item) => item !== tag));
};
const handleTagKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTag();
  }
};

useEffect(() => {
  return () => {
    previews.forEach((url) =>
      URL.revokeObjectURL(url)
    );
  };
}, [previews]);


const publishPost = async () => {
  try {
    setLoading(true);
    if (tags.length === 0) {
  toast.error("Please add at least one tag");
  return;
}
    const imageUrls = await Promise.all(
  files.map(async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    return data.url;
  })
);

    // Save Firestore Document
    await addDoc(collection(db, "posts"), {
      title,
      content,
      category,
      tags,
      imageUrls,
      createdAt: serverTimestamp(),
    });

    toast.success("Post published successfully");

    setTitle("");
    setContent("");
    setFiles([]);
setPreviews([]);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#faf9f6] p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6">

        {/* LEFT SIDEBAR */}
        <aside className="col-span-3 rounded-2xl border bg-white p-6">
          <div className="mb-8 flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/100"
              alt=""
              className="h-14 w-14 rounded-full"
            />

            <div>
              <h3 className="font-semibold text-black">
                Elena Vance
              </h3>

              <p className="text-sm text-green-600">
                Community Member
              </p>
            </div>
          </div>

          <h2 className="mb-4 font-semibold text-black">
            Post Category
          </h2>

          <div className="space-y-2">
            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setCategory(item.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${
                    category === item.id
                      ? "bg-green-50 text-green-700"
                      : "hover:bg-gray-100 text-black"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-16 rounded-xl bg-green-50 p-5">
            <h3 className="mb-2 text-lg font-semibold text-green-700">
              Together we grow stronger
            </h3>

            <p className="text-sm text-gray-600">
              Your story can help someone feel
              less alone.
            </p>
          </div>
        </aside>

        {/* CENTER */}
        <main className="col-span-6 rounded-2xl border bg-white p-8">
          <h1 className="mb-2 text-3xl font-bold text-black">
            Create a Post
          </h1>

          <p className="mb-8 text-gray-500">
            Share your journey and inspire
            others.
          </p>

          <div className="space-y-6">

            <div>
              <label className="mb-2 block font-medium text-black">
                Post Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-black">
                Write Your Story
              </label>

              <textarea
                rows={8}
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-green-500 text-black"
                placeholder="Share your experience..."
              />
            </div>

<div>
  <div className="mb-2 flex items-center justify-between">
    <label className="font-medium text-black">
      Add Photos (Up to 5)
    </label>

    <span className="text-sm text-green-600">
      {files.length}/5 Images
    </span>
  </div>

  <div className="rounded-xl border-2 border-dashed p-6">
    <label className="flex h-40 cursor-pointer flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-black">
          Click to Upload Images
        </p>

        <p className="mt-2 text-sm text-gray-500">
          JPG, PNG, WEBP • Max 5 Images
        </p>
      </div>

      <input
        hidden
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
    </label>
  </div>

  {previews.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-4">
      {previews.map((preview, index) => (
        <div
          key={index}
          className="relative h-32 w-32 overflow-hidden rounded-xl border"
        >
          <img
            src={preview}
            alt=""
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

<div>
  <label className="mb-3 block font-medium text-black">
    Tags
  </label>

  <div className="flex gap-2">
    <input
      type="text"
      value={tagInput}
      onChange={(e) =>
        setTagInput(e.target.value)
      }
      onKeyDown={handleTagKeyDown}
      placeholder="Add a tag"
      className="flex-1 rounded-xl border p-3 text-black outline-none focus:ring-2 focus:ring-green-500"
    />

    <button
      type="button"
      onClick={addTag}
      className="rounded-xl bg-green-700 px-5 text-white"
    >
      Add
    </button>
  </div>

  <div className="mt-4 flex flex-wrap gap-2">
    {tags.map((tag) => (
      <div
        key={tag}
        className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700"
      >
        <span>{tag}</span>

        <button
          type="button"
          onClick={() => removeTag(tag)}
          className="font-bold"
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

            <div className="flex gap-4 pt-4">
              <button className="rounded-xl border px-6 py-3 font-medium text-black">
                Save Draft
              </button>

              <button className="rounded-xl border px-6 py-3 font-medium text-black">
                Preview Post
              </button>

              <button
                onClick={publishPost}
                disabled={loading}
                className="rounded-xl bg-green-700 px-6 py-3 font-medium text-white disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-3 space-y-6">

          <div className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Post Preview
            </h2>

            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100"
                  className="h-10 w-10 rounded-full"
                />

                <div>
                  <h4 className="font-medium">
                    Elena Vance
                  </h4>

                  <p className="text-xs text-gray-500">
                    Lifestyle & Wellness
                  </p>
                </div>
              </div>

              <h3 className="mb-2 text-lg font-semibold">
                {title}
              </h3>

              <p className="line-clamp-4 text-sm text-gray-600">
                {content ||
                  "Your post preview will appear here."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Community Guidelines
            </h2>

            <ul className="space-y-3 text-sm text-black">
              <li>
                • Be respectful and kind.
              </li>

              <li>
                • No medical advice.
              </li>

              <li>
                • Protect personal information.
              </li>

              <li>
                • Give honest feedback.
              </li>

              <li>
                • Keep it safe for everyone.
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}