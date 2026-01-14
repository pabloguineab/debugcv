"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
    activeTab: string | null;
    setActiveTab: (tab: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
    activeTab: null,
    setActiveTab: () => { },
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<string | null>(null);

    return (
        <BreadcrumbContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    return useContext(BreadcrumbContext);
}
