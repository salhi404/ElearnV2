export function parsegrade(grade:number):string{
    switch (grade) {
        case 1: return 'primary';
        case 7: return '7ème';
        case 8: return '8ème';
        case 9: return '9ème';
        case 11: return '5ème science';
        case 12: return '5ème lettre';
        case 13: return '1 bac science ';
        case 14: return '1 bac lettre';
        case 15: return '2 bac science';
        case 16: return '2 bac lettre';
        case 17: return 'other';
    }
    return '';
}
export function parseroles(roles:string[]):string[]{
return roles.map(rl=>{switch (rl) {
    case "ROLE_USER":
      return 'Student';
    case "ROLE_MODERATOR":
      return 'Moderator';
    case "ROLE_ADMIN":
      return 'Admin';
  }
  return '';
});
}
export function getmainrole(roles:string[]):string{
    return roles.includes('Admin')?'Admin':roles.includes('Moderator')?'Moderator':'Student';
}
export function getmainrolecode(roles:string[]):number{
    return roles.includes('ROLE_ADMIN')?1:roles.includes('ROLE_MODERATOR')?2:3;
}