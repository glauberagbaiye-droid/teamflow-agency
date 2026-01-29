
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendInvitationNotification = (eventTitle: string) => {
  if (Notification.permission === 'granted') {
    new Notification('TeamFlow: Nuovo Invito', {
      body: `Sei stato invitato all'evento: ${eventTitle}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/2907/2907150.png'
    });
  }
};

export const sendEventCancelledNotification = (eventTitle: string) => {
  if (Notification.permission === 'granted') {
    new Notification('TeamFlow: Evento Annullato', {
      body: `L'evento "${eventTitle}" è stato rimosso dal calendario.`,
      icon: 'https://cdn-icons-png.flaticon.com/512/2907/2907150.png'
    });
  }
};
