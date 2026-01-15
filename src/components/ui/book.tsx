"use client";

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
    image = "https://framerusercontent.com/images/JXL9OqyS9HXAxdkH6ZGIV5PQXQQ.jpg",
    width = 200,
    height = 305
}: BookProps) {
    // Construct the Framer embed URL with parameters
    const params = new URLSearchParams({
        title,
        author,
        image,
    });

    const embedUrl = `https://framer.com/embed/Book-AFRs.js@mxOP9zughWqzCr7yH17p?${params.toString()}`;

    return (
        <iframe
            src={embedUrl}
            width={width}
            height={height}
            style={{
                border: "none",
                overflow: "hidden",
                background: "transparent"
            }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
        />
    );
}
