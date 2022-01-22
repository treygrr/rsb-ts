export default function (handlebars: any) {
  // a function that returns numbers formatted with commas
  handlebars.registerHelper("formatNumber", function(value: number) {
    return new handlebars.SafeString(value.toLocaleString());
  });
}