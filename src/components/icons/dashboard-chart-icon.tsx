export function DashboardChartIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Bar 1 - animates up */}
            <path
                d="M3 3v18h18"
                className="group-hover/icon-hover:animate-[bar-chart-base_0.6s_ease-in-out]"
            />
            <path
                d="M18 17V9"
                className="group-hover/icon-hover:animate-[bar-chart-1_0.6s_ease-in-out]"
            />
            {/* Bar 2 - animates down */}
            <path
                d="M13 17V5"
                className="group-hover/icon-hover:animate-[bar-chart-2_0.6s_ease-in-out]"
            />
            {/* Bar 3 - animates up */}
            <path
                d="M8 17v-3"
                className="group-hover/icon-hover:animate-[bar-chart-3_0.6s_ease-in-out]"
            />
        </svg>
    );
}
