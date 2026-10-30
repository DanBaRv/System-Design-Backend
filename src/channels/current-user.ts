import type { Request } from 'express'
export class CurrentUser {
  private static instance: CurrentUser 
  private constructor(    
      public readonly id: number = 1, 
      public readonly name: string = 'Роман',
  ) {}

  static getInstance(): CurrentUser {    
      if (!CurrentUser.instance) {
          CurrentUser.instance = new CurrentUser()
      }
      return CurrentUser.instance             
  }
}
export function getCurrentUser(req: Request): number | null {
    return (req.session as any)?.userId ?? null
}

const user = CurrentUser.getInstance()
