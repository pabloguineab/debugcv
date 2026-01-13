"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete: (name: string) => void
}

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!firstName || !lastName) return

        setIsLoading(true)
        setError(null)

        const fullName = `${firstName} ${lastName}`

        try {
            // Save to database
            const res = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName })
            });

            if (!res.ok) {
                const data = await res.json();
                console.error('API error:', data);
                // Continue anyway - we'll update locally
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            // Continue anyway - we'll update locally
        }

        // Always update local state and close modal
        onComplete(fullName)
        onOpenChange(false)
        setIsLoading(false)

        // Refresh router to update server components
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to DebugCV!</DialogTitle>
                    <DialogDescription>
                        Please enter your details to complete your profile setup.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !firstName || !lastName}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Get Started
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
