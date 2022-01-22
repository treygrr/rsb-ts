import { skillList } from '../../common/runescapeData/skillList.js';

export default function (handlebars: any) {
  handlebars.registerHelper("getSkillName", function(value: string) {
    const skillName:string = skillList[value];
    return new handlebars.SafeString(skillName);
  });
}