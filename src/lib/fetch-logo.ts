import { getCompanyDomain, getInstitutionDomain } from "@/lib/logo-utils";

/**
 * Attempts to fetch a logo for a given company or institution name.
 * Returns a Base64 encoded PNG string on success, or null on failure.
 * Prioritizes direct browser fetch (Clearbit, Brandfetch, Google) to avoid server-side DNS issues.
 * Ensures the result is always a formatted PNG Data URI compatible with React-PDF.
 */
export async function fetchLogoAndReturnBase64(
    name: string,
    website: string | undefined,
    type: "company" | "institution"
): Promise<string | null> {
    if (!name) return null;

    try {
        const domain = type === "company"
            ? getCompanyDomain(name, website)
            : getInstitutionDomain(name, website);

        if (!domain) return null;

        // Helper to process response and return base64 PNG using generic Canvas
        // Note: This must run in a browser environment (window/document must exist)
        const processResponse = async (res: Response): Promise<string> => {
            const blob = await res.blob();
            if (blob.size < 50) throw new Error("Image too small");

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Canvas context failed"));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    const pngBase64 = canvas.toDataURL("image/png");
                    resolve(pngBase64);
                };
                img.onerror = () => reject(new Error("Image load failed"));
                img.src = URL.createObjectURL(blob);
            });
        };

        const strategies = [
            `https://logo.clearbit.com/${domain}`,
            `https://cdn.brandfetch.io/${domain}/w/400/h/400`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        ];

        for (const url of strategies) {
            try {
                // console.log("Attempting fetch:", url);
                const res = await fetch(url, { mode: 'cors' });
                if (res.ok) {
                    const base64 = await processResponse(res);
                    return base64; // Success!
                }
            } catch (e) {
                // console.warn(`Failed to fetch ${url}`, e);
            }
        }

        return null;

    } catch (error) {
        console.error("All logo fetch strategies failed:", error);
        return null;
    }
}
