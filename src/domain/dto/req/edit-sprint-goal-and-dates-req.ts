export interface EditSprintGoalAndDatesRequestDTO {
    sprintId: string;
    sprintGoal?: string ;
    startDate: string | null;
    endDate: string | null;
}
