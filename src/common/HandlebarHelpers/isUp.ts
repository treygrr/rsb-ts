export default function (handlebars: any) {
  handlebars.registerHelper("isUp", function(value: string) {
    // if first letter in string is + then return green
    if (!value) return;
    value = value.toString()
    if (value?.charAt(0) === '+') {
      return 'green';
    }
    if (value?.charAt(0) === '-') {
      return 'red';
    }
    return 'black';
  });
}