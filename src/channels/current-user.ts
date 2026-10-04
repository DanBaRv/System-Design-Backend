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

const user = CurrentUser.getInstance()
