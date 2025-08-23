import React from 'react'

export default function CollapsableChat({isOpen}: {isOpen: boolean}) {
  return (
    <div>
      {isOpen ? (
          <div className="absolute top-0 right-0 h-full w-1/3 min-w-[400px] bg-background border-l border-border shadow-large z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Askly</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatbotOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Chatbot
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setChatbotOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-study-blue hover:bg-study-blue/90 text-study-blue-foreground shadow-large"
            size="sm"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
    </div>
  )
}

