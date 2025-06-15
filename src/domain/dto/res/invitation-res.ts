export interface InvitationResponseDTO {
  id: string
  acceptedAt: string
  role: string
  invitationId: string;
  projectId: string;
  inviteeId: string;
  inviterId: string;
  invitedAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED"; 
}
