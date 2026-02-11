import { Reorder, useDragControls } from "framer-motion";
import { ResumeProject } from "@/types/resume";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectItemProps {
    item: ResumeProject;
    onUpdate: (updates: Partial<ResumeProject>) => void;
    onRemove: () => void;
}

export function ProjectItem({ item, onUpdate, onRemove }: ProjectItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            whileDrag={{ scale: 1.02, zIndex: 999, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
            className="border rounded-lg p-3 bg-white dark:bg-zinc-900 select-none relative"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <GripVertical
                        className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
                        onPointerDown={(e) => controls.start(e)}
                    />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                        {item.name || "New Project"}
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
                    placeholder="Project name"
                    className="h-8 text-xs bg-background"
                />
                <Textarea
                    value={item.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Brief description..."
                    className="h-16 text-xs resize-none bg-background"
                />
                <Input
                    value={item.url || ""}
                    onChange={(e) => onUpdate({ url: e.target.value })}
                    placeholder="Project URL (optional)"
                    className="h-8 text-xs bg-background"
                />
                <div>
                    <Label className="text-xs text-muted-foreground">Technologies</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(item.technologies || []).map((tech, techIndex) => (
                            <span
                                key={techIndex}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]"
                            >
                                {tech}
                                <button
                                    onClick={() => {
                                        const newTechs = (item.technologies || []).filter((_, i) => i !== techIndex);
                                        onUpdate({ technologies: newTechs });
                                    }}
                                    className="hover:text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <Input
                        placeholder="Add technology (Press Enter)..."
                        className="h-7 text-xs mt-1 bg-background"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value) {
                                e.preventDefault();
                                onUpdate({
                                    technologies: [...(item.technologies || []), e.currentTarget.value]
                                });
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                </div>
            </div>
        </Reorder.Item>
    );
}
