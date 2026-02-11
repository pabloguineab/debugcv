import { Reorder, useDragControls } from "framer-motion";
import { ResumeCertification } from "@/types/resume";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CertificationItemProps {
    item: ResumeCertification;
    onUpdate: (updates: Partial<ResumeCertification>) => void;
    onRemove: () => void;
}

export function CertificationItem({ item, onUpdate, onRemove }: CertificationItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            className="border rounded-lg p-3 bg-white dark:bg-zinc-900 select-none"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <GripVertical
                        className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
                        onPointerDown={(e) => controls.start(e)}
                    />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.name || "New Certification"}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={onRemove}
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
            <div className="space-y-2">
                <Input
                    value={item.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Certification name"
                    className="h-8 text-xs bg-background"
                />
                <Input
                    value={item.issuer}
                    onChange={(e) => onUpdate({ issuer: e.target.value })}
                    placeholder="Issuing organization"
                    className="h-8 text-xs bg-background"
                />
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        value={item.issueDate}
                        onChange={(e) => onUpdate({ issueDate: e.target.value })}
                        placeholder="Issue date"
                        className="h-8 text-xs bg-background"
                    />
                    <Input
                        value={item.expiryDate || ""}
                        onChange={(e) => onUpdate({ expiryDate: e.target.value })}
                        placeholder="Expiry (optional)"
                        className="h-8 text-xs bg-background"
                    />
                </div>
                <Input
                    value={item.credentialId || ""}
                    onChange={(e) => onUpdate({ credentialId: e.target.value })}
                    placeholder="Credential ID (optional)"
                    className="h-8 text-xs bg-background"
                />
            </div>
        </Reorder.Item>
    );
}
