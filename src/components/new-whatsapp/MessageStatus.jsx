import React from 'react'
import { Check, CheckCheck } from 'lucide-react'

const MessageStatus = ({ ack }) => {

    if (ack == null || ack < 1){
        return null
    }

    if (ack >= 3) {
        return <CheckCheck className='w-4 h-4 text-blue-600'/>
    } 

    if (ack >= 2){
        return <CheckCheck className='w-4 h-4 text-gray-500'/>
    }

    if (ack >= 1){
        return <Check className='w-4 h-4 text-gray-500'/>
    }

  return null
}

export default MessageStatus