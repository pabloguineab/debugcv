"use client";

import { useEffect, useRef } from 'react';

interface LordIconProps {
    src: string;
    trigger?: 'hover' | 'click' | 'loop' | 'morph';
    colors?: string;
    size?: number;
    className?: string;
}

export function LordIcon({
    src,
    trigger = 'hover',
    colors = 'primary:#121331',
    size = 18,
    className = ''
}: LordIconProps) {
    const iconRef = useRef<any>(null);

    useEffect(() => {
        // Dynamically import lordicon element
        import('@lordicon/element');
    }, []);

    return (
        <lord-icon
            ref={iconRef}
            src={src}
            trigger={trigger}
            colors={colors}
            style={{ width: `${size}px`, height: `${size}px` }}
            className={className}
        />
    );
}
