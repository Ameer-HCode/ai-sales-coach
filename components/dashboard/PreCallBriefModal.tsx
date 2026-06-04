"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCallId } from "@/actions/create-call";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

interface PreCallBriefModalProps {
    isOpen: boolean;
    onClose: () => void;
    isForLater?: boolean;
    onCreatedForLater?: (link: string) => void;
}

export function PreCallBriefModal({ isOpen, onClose, isForLater, onCreatedForLater }: PreCallBriefModalProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    
    const [topic, setTopic] = useState("");
    const [problem, setProblem] = useState("");
    const [solution, setSolution] = useState("");
    const [handlingStyle, setHandlingStyle] = useState("");
    const [bottomLine, setBottomLine] = useState("");
    const [previousContext, setPreviousContext] = useState("");

    const handleStart = async () => {
        setIsCreating(true);
        try {
            const id = await createCallId({
                topic,
                problem,
                solution,
                handlingStyle: handlingStyle + (bottomLine ? ` | ABSOLUTE BOTTOM LINE PRICE: $${bottomLine}. DO NOT GO BELOW THIS.` : ""),
                previousContext
            });
            
            if (isForLater && onCreatedForLater) {
                const originUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                onCreatedForLater(`${originUrl}/call/${id}`);
                onClose();
            } else {
                router.push(`/call/${id}`);
            }
        } catch (error) {
            console.error("Failed to create call", error);
            toast.error("Failed to create meeting");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-indigo-600" />
                        AI Pre-Call Briefing
                    </DialogTitle>
                    <DialogDescription>
                        Give your AI Sales Coach a quick heads-up about this meeting so it can provide tailored, hyper-specific closing strategies.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Meeting Topic</label>
                        <Input 
                            placeholder="e.g. Property Viewing Negotiation" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Customer's Main Problem</label>
                        <Input 
                            placeholder="e.g. Needs more bedrooms but budget is tight" 
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Our Proposed Solution</label>
                        <Input 
                            placeholder="e.g. The $100k suburban property with 2 extra bedrooms" 
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Objection Handling Style</label>
                        <Input 
                            placeholder="e.g. ROI focus on property appreciation, or Consultative" 
                            value={handlingStyle}
                            onChange={(e) => setHandlingStyle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-red-600">Bottom Line Price (Optional)</label>
                        <Input 
                            placeholder="e.g. 200000" 
                            type="number"
                            value={bottomLine}
                            onChange={(e) => setBottomLine(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">Previous Context (Optional)</label>
                        <Textarea 
                            placeholder="e.g. We previously discussed the $50k downtown condo, but they rejected it." 
                            value={previousContext}
                            onChange={(e: any) => setPreviousContext(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCreating}>Cancel</Button>
                    <Button onClick={handleStart} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isForLater ? "Generate Link" : "Start Meeting Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
