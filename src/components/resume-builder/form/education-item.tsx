import { Reorder, useDragControls } from "framer-motion";
import { ResumeEducation } from "@/types/resume";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyLogoInput } from "@/components/resume-builder/form/company-logo-input";

interface EducationItemProps {
    item: ResumeEducation;
    onUpdate: (updates: Partial<ResumeEducation>) => void;
    onRemove: () => void;
}

export function EducationItem({ item, onUpdate, onRemove }: EducationItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            className="border rounded-lg p-3 bg-muted/30 select-none"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <GripVertical
                        className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
                        onPointerDown={(e) => controls.start(e)}
                    />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.degree || "New Education"}
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
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <Input
                            value={item.institution}
                            onChange={(e) => onUpdate({ institution: e.target.value })}
                            placeholder="Institution name"
                            className="h-8 text-xs bg-background"
                        />
                        <Input
                            value={item.degree}
                            onChange={(e) => onUpdate({ degree: e.target.value })}
                            placeholder="Degree (e.g., B.Sc.)"
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                    <div className="pt-0.5">
                        <CompanyLogoInput
                            type="institution"
                            companyName={item.institution}
                            website={item.website}
                            value={item.logoUrl}
                            onChange={(url) => onUpdate({ logoUrl: url })}
                        />
                    </div>
                </div>
                <Input
                    value={item.field}
                    onChange={(e) => onUpdate({ field: e.target.value })}
                    placeholder="Field of study"
                    className="h-8 text-xs bg-background"
                />
            </div>
        </Reorder.Item>
    );
}

