"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the Framer Book component from the CDN
const FramerBook = dynamic(
    () => import("https://framer.com/m/Book-AFRs.js@mxOP9zughWqzCr7yH17p").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div
                className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg"
                style={{ width: 200, height: 305 }}
            />
        )
    }
);

interface BookProps {
    title?: string;
    author?: string;
    image?: string;
    width?: number;
    height?: number;
}

export function Book({
    title = "My Resume",
    author = "Pablo Guinea",
    image,
    width = 200,
    height = 305
}: BookProps) {
    return (
        <Suspense fallback={
            <div
                className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg"
                style={{ width, height }}
            />
        }>
            <FramerBook
                title={title}
                author={author}
                image={image}
                style={{ width, height }}
            />
        </Suspense>
    );
}
