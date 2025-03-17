"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import Image from "next/image"
import { X } from 'lucide-react'

interface EditFacilityFormModalProps {
  isOpen: boolean
  onClose: () => void
  facilityName: string
  zones: string[]
}

export default function EditFacilityFormModal({
  isOpen,
  onClose,
  facilityName,
  // amenities,
  zones,
}: EditFacilityFormModalProps) {
  const [activeTab, setActiveTab] = useState("polygon")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden rounded-xl bg-white">
        <DialogHeader className="p-0">
          <div className="relative w-full h-[200px]">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Map"
              fill
              className="object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-white rounded-full h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute top-4 left-0 right-0 text-center">
              <DialogTitle className="text-2xl font-bold text-black bg-white/80 mx-auto w-fit px-4 py-1 rounded-full">
                Edit Facility
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs defaultValue="polygon" className="w-full mb-6">
            <TabsList className="grid w-[240px] grid-cols-2 mx-auto">
              <TabsTrigger
                value="polygon"
                className={activeTab === "polygon" ? "bg-purple-600 text-white" : ""}
                onClick={() => setActiveTab("polygon")}
              >
                Polygon
              </TabsTrigger>
              <TabsTrigger
                value="radius"
                className={activeTab === "radius" ? "bg-purple-600 text-white" : ""}
                onClick={() => setActiveTab("radius")}
              >
                Radius
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Venue Name</label>
              <Input placeholder="Venue Name" defaultValue="Maharana Pratap Stadium" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facility Code</label>
              <Input placeholder="Enter Facility Code" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facility Name</label>
              <Input placeholder="Enter Facility Name" defaultValue={facilityName} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Coordinates</label>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Latitude" />
                <Input placeholder="Latitude" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Radius</label>
              <Input placeholder="Enter Cluster Radius" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facility Capacity</label>
              <Input placeholder="Enter Capacity" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Image</label>
              <Input type="file" className="cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Add Zone</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {zones.map((zone, index) => (
                    <SelectItem key={index} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facility Supervisor Name</label>
              <Input placeholder="Enter Supervisor Name" />
            </div>
          </div>

          {/* <div className="flex justify-center mt-8">
            <Button className="px-8 bg-purple-600 hover:bg-purple-700">
              Save
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
