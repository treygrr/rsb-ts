import Handlebars from 'handlebars';
import { skillList } from '../../runescapeData/skillList.js'

export default Handlebars.registerHelper("getSkillName", function(value: string) {
  console.log(skillList);
  
  var result = "<b>" + Handlebars.escapeExpression(value) + "</b>";
  return new Handlebars.SafeString(result);
});
