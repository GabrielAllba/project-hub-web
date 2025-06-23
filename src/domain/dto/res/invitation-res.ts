export interface InvitationResponseDTO {
  id: string
  acceptedAt: string
  role: string
  invitationId: string;
  projectId: string;
  projectName: string;
  inviteeId: string;
  inviterId: string;
  inviterUsername: string;
  invitedAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}
