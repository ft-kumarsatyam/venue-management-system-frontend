"use client"

import { Dialog, DialogContent } from "../../components/ui/dialog"
import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export interface ClusterData {
  id?: string
  name?: string
  venuesCount?: number
  image?: string
  supervisor?: {
    name?: string
    email?: string
    contactNo?: string
  }
}

interface ClusterDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  clusterData: ClusterData | null
}

export default function ClusterDetailsModal({ isOpen, onClose, clusterData }: ClusterDetailsModalProps) {
  if (!clusterData) return null

  const name = clusterData.name || "Dehradun, Uttrakhand"
  const venuesCount = clusterData.venuesCount || 15
  const supervisorName = clusterData.supervisor?.name || "Kunal Phalaswal"
  const supervisorEmail = clusterData.supervisor?.email || "kunalphalaswal@gmail.com"
  const supervisorContact = clusterData.supervisor?.contactNo || "9876543210"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl p-0 overflow-hidden rounded-lg border-0">
        <div className="relative bg-white rounded-lg overflow-hidden">
          {/* Header with close button */} 
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">{name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cluster Image */}
          <div className="w-full h-[150px] bg-gray-200 relative">
            <Image
              src={clusterData.image || "/placeholder.svg?height=300&width=600"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-5">
            {/* Basic Info */}
            <div className="mb-6">
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">
                Cluster
              </span>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-gray-600">Venues: {venuesCount}</p>
            </div>

            {/* Supervisor Details */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              {/* <h3 className="font-semibold mb-2">Cluster Supervisor Details</h3> */}
              <div className="space-y-1">
                <div>
                  <span className="text-gray-500">Name:</span> <span>{supervisorName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email ID:</span> <span>{supervisorEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">Contact No:</span> <span>{supervisorContact}</span>
                </div>
              </div>
            </div>

            {/* View Full Details Link */}
            <div className="flex justify-end">
              <Link
                href={`/clusters/${clusterData.id}`}
                className="text-purple-600 hover:text-purple-800 font-medium"
                onClick={onClose}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

