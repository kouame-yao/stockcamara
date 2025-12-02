import { ReactNode } from "react";

// Typage Input
export interface ProposInput {
  type?: string;
  placeholder?: string;
  classeName?: string;
}

export type TypeTableauHeadTab = TypeTableauHeadObject[];

export interface TypeTableauHeadObject {
  id: ReactNode;
  head1: string;
  head2: string;
  head3: string;
  head4: string;
  head5: string;
  head6: string;
  head7: string;
}

export type TypeTableauHeadTabF = TypeTableauHeadObjectF[];

export interface TypeTableauHeadObjectF {
  id: ReactNode;
  head1: string;
  head2: string;
  head3: string;
  head4: string;
  head5: string;
  head6: string;
  head7: string;
  head8: string;
  head9: string;
  head10: string;
}

export type TypeBodyTableTabF = TypeBodyTableObjectF[];

export interface TypeBodyTableObjectF {
  id: number;
  body1: ReactNode;
  body2: ReactNode;
  body3: ReactNode;
  body4: ReactNode;
  body5: ReactNode;
}

export type TypeBodyTableTab = TypeBodyTableObject[];

export interface TypeBodyTableObject {
  id: ReactNode;
  body1: ReactNode;
  body2: ReactNode;
  body3: ReactNode;
  body4: ReactNode;
  body5: ReactNode;
}

export const UserID = "AhLld09WZ5WfHYwxdqIN";
