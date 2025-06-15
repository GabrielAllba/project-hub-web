import type { ProjectRole } from "@/constants/constants";

export interface ProjectUserResponseDTO {
    id: string;
    email: string;
    username: string;
    role: ProjectRole;
}
