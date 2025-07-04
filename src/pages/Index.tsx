
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { AppSidebar } from '@/components/AppSidebar';
import { EventModal } from '@/components/EventModal';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { events } = useEvents();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user display name (full_name or fallback to email)
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || user?.email;

  const handleTimeSlotClick = (date: Date) => {
    setSelectedTimeSlot(date);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setSelectedTimeSlot(null);
    setIsEventModalOpen(true);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setSelectedTimeSlot(null);
    setIsEventModalOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-black flex w-full">
        <AppSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onCreateEvent={handleCreateEvent}
        />
        
        <SidebarInset className="flex flex-col overflow-hidden min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200 flex-shrink-0" />
            <h1 className="font-bold text-lg sm:text-xl text-black dark:text-white truncate">
              EventBridge Calendar
            </h1>
            <div className="ml-auto text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              Welcome back, {displayName}
            </div>
          </div>
          
          <CalendarHeader 
            currentView={currentView} 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onViewChange={setCurrentView}
          />
          
          <div className="flex-1 overflow-auto p-3 sm:p-6">
            <CalendarGrid 
              view={currentView}
              currentDate={currentDate}
              onTimeSlotClick={handleTimeSlotClick}
              onEditEvent={handleEditEvent}
              events={events}
            />
          </div>
        </SidebarInset>
      </div>

      <Button
        onClick={handleCreateEvent}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50"
        size="icon"
      >
        <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
      </Button>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedTimeSlot(null);
          setEditingEvent(null);
        }}
        selectedTime={selectedTimeSlot}
        editEvent={editingEvent}
      />
    </SidebarProvider>
  );
};

export default Index;
