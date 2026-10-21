// Backkapp
export interface BackButtonProps {
  label?: string;
  to?: string;
  onClick?: () => void;
}

// Visningsknappen
export interface SlotButtonProps {
  auditoriumName: string;
  time: string;
  onClick: () => void;

}
// Biljettknapp
export interface TicketButtonProps {
  to: string;          
  label?: string;      
  onClick?: () => void;
}

