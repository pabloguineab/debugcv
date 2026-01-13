"use client";

import { Player } from '@lordicon/react';
import { useRef, useEffect, useState } from 'react';

interface LordIconProps {
    src: string;
    size?: number;
    trigger?: 'hover' | 'click' | 'loop' | 'morph';
    colors?: string;
}

export function LordIcon({
    src,
    size = 18,
    trigger = 'hover',
    colors
}: LordIconProps) {
    const playerRef = useRef<Player>(null);
    const [iconData, setIconData] = useState<any>(null);

    // Load icon JSON from URL
    useEffect(() => {
        fetch(src)
            .then(res => res.json())
            .then(data => setIconData(data))
            .catch(err => console.error('Failed to load icon:', err));
    }, [src]);

    const handleMouseEnter = () => {
        if (trigger === 'hover' && playerRef.current) {
            playerRef.current.playFromBeginning();
        }
    };

    const handleClick = () => {
        if (trigger === 'click' && playerRef.current) {
            playerRef.current.playFromBeginning();
        }
    };

    if (!iconData) {
        return <div style={{ width: size, height: size }} />;
    }

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Player
                ref={playerRef}
                icon={iconData}
                size={size}
                colors={colors}
            />
        </div>
    );
}
