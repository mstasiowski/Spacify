import { DurationType } from '../../enums/durationType.enum';

export interface BlockUserRequest {
  durationValue: number;
  durationType: DurationType;
}
