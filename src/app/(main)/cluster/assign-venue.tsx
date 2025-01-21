"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Label } from "../../../components/ui/label"
import Link from "next/link"

export function AssignVenueModal({ clusterId }: { clusterId?: string }) {
  const [open, setOpen] = useState(true)

  const handleAssign = () => {
    // Handle venue assignment
    console.log(`Venue assigned to cluster ${clusterId || ""}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-[#7942D1] text-white">
          Add Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 rounded-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Assign Venue</DialogTitle>
            <Link href="/create-venue" className="text-sm text-[#7942D1] hover:underline">
              Create Venue ↗
            </Link>
          </div>
          <p className="text-sm text-gray-500">Select venue to assign into cluster.</p>
        </DialogHeader>

        {/* Select Venue */}
        <div className="mt-4">
          <Label htmlFor="venue">Select Venue</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Venue" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="venue-1">Venue 1</SelectItem>
              <SelectItem value="venue-2">Venue 2</SelectItem>
              <SelectItem value="venue-3">Venue 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" className="bg-gray-400 text-white hover:bg-gray-500" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-[#7942D1] text-white px-6 py-2" onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

