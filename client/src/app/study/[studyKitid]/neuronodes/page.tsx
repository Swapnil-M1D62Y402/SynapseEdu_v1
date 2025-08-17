import React from 'react'
import Neuronodes from "@/components/NeuroNodes";

const NeuronodesPage = ({ params }: { params: { studyKitId: string } }) => {
  return (
    <div>
        <Neuronodes studyKitId={params.studyKitId} />
    </div>
  )
}

export default NeuronodesPage
