import { Reorder, useDragControls } from "framer-motion";
import { ResumeExperience } from "@/types/resume";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanyLogoInput } from "@/components/resume-builder/form/company-logo-input";

interface ExperienceItemProps {
    item: ResumeExperience;
    onUpdate: (updates: Partial<ResumeExperience>) => void;
    onRemove: () => void;
}

export function ExperienceItem({ item, onUpdate, onRemove }: ExperienceItemProps) {
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
                        {item.title || "New Position"}
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
                            value={item.company}
                            onChange={(e) => onUpdate({ company: e.target.value })}
                            placeholder="Company name"
                            className="h-8 text-xs bg-background"
                        />
                        <Input
                            value={item.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            placeholder="Job title"
                            className="h-8 text-xs bg-background"
                        />
                    </div>
                    <div className="pt-0.5">
                        <CompanyLogoInput
                            type="company"
                            companyName={item.company}
                            website={item.companyUrl}
                            value={item.logoUrl}
                            onChange={(url) => onUpdate({ logoUrl: url })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        value={item.startDate}
                        onChange={(e) => onUpdate({ startDate: e.target.value })}
                        placeholder="Start date"
                        className="h-8 text-xs bg-background"
                    />
                    <Input
                        value={item.current ? "Present" : item.endDate}
                        onChange={(e) => onUpdate({ endDate: e.target.value })}
                        placeholder="End date"
                        className="h-8 text-xs bg-background"
                        disabled={item.current}
                    />
                </div>

                {/* Bullet Points */}
                <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">Achievements / Responsibilities</Label>
                    <div className="space-y-1 mt-1">
                        {(item.bullets || []).map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="flex items-start gap-1">
                                <span className="text-xs text-muted-foreground mt-2">•</span>
                                <Textarea
                                    value={bullet}
                                    onChange={(e) => {
                                        const newBullets = [...(item.bullets || [])];
                                        newBullets[bulletIndex] = e.target.value;
                                        onUpdate({ bullets: newBullets });
                                    }}
                                    placeholder="Describe your achievement..."
                                    className="h-16 text-xs resize-none flex-1 bg-background"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                                    onClick={() => {
                                        const newBullets = (item.bullets || []).filter((_, i) => i !== bulletIndex);
                                        onUpdate({ bullets: newBullets });
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const newBullets = [...(item.bullets || []), ""];
                                onUpdate({ bullets: newBullets });
                            }}
                            className="w-full h-7 text-xs border-dashed border mt-1"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add bullet point
                        </Button>
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
}
